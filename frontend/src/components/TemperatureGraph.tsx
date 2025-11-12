import { TemperatureEntry } from '@/types/fish';
import { getRarityColor } from '@/utils/rarity';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

type Props = {
    // Either provide a sensorId to fetch readings from the backend
    // or provide an initial set of readings to display.
    sensorId?: string;
    initialReadings?: TemperatureEntry[];
    // Poll interval in milliseconds (default: 60s)
    pollIntervalMs?: number;
    // height in pixels for the chart container (default: 200)
    heightPx?: number;
    rarity?: string;
};

const TemperatureGraph: React.FC<Props> = ({ sensorId, initialReadings = [], pollIntervalMs = 60000, heightPx = 200, rarity = 'COMMON' }) => {
    const [readings, setReadings] = useState<TemperatureEntry[]>(() => {
        // defensively convert initial readings to array
        return Array.isArray(initialReadings) ? initialReadings : [];
    });

    const mountedRef = useRef(true);
    const [forecast, setForecast] = useState<TemperatureEntry[]>([]);
    const [lastFetchAt, setLastFetchAt] = useState<number>(0);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Fetch function for a sensorId
    const fetchForSensor = async (id: string) => {
        try {
            const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '') || 'http://localhost:5555';
            const url = `${base.replace(/\/$/, '')}/api/temperatures/${id}`;
            const res = await fetch(url);
            if (!res.ok) {
                console.error('Failed to fetch temperature sensor:', await res.text());
                return;
            }
            const data = await res.json();
            // data.readings expected to be { temperature, timestamp }[]
            if (!data || !Array.isArray(data.readings)) return;
            // Normalize timestamps to ISO strings
            const normalized: TemperatureEntry[] = data.readings.map((r: any, idx: number) => ({
                id: String(idx),
                sensorId: id,
                temperature: Number(r.temperature),
                timestamp: new Date(r.timestamp).toISOString(),
            }));
            if (!mountedRef.current) return;
            setReadings(normalized.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
            // fetch forecast for this sensor (non-blocking)
            fetchForecast(id);
        } catch (err) {
            console.error('Error fetching sensor readings', err);
        }
    };

    const fetchForecast = async (id: string, points = 12): Promise<TemperatureEntry[]> => {
        try {
            const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '') || 'http://localhost:5555';
            const url = `${base.replace(/\/$/, '')}/api/temperatures/${id}/forecast?points=${points}`;
            const res = await fetch(url);
            if (!res.ok) {
                console.warn('Failed to fetch forecast:', await res.text());
                return [];
            }
            const data = await res.json();
            if (!data || !Array.isArray(data.forecast)) return [];
            const normalized: TemperatureEntry[] = data.forecast.map((r: any, idx: number) => ({
                id: `f-${idx}`,
                sensorId: id,
                temperature: Number(r.temperature),
                timestamp: new Date(r.timestamp).toISOString(),
            }));
            if (!mountedRef.current) return [];
            setForecast(normalized);
            setLastFetchAt(Date.now());
            return normalized;
        } catch (err) {
            console.error('Error fetching forecast', err);
            return [];
        }
    };

    // Initial load + polling when sensorId changes
    useEffect(() => {
        if (!sensorId) return;
        // initial fetch
        fetchForSensor(sensorId);
        // set up interval
        const handle = setInterval(() => fetchForSensor(sensorId), pollIntervalMs);
        return () => clearInterval(handle);
    }, [sensorId, pollIntervalMs]);

    // whenever new readings arrive, reconcile forecast: remove overlapped forecast points and extend
    useEffect(() => {
        if (!sensorId) return;
        if (!forecast || forecast.length === 0) return;
        if (!readings || readings.length === 0) return;

        const lastRealTs = new Date(readings[readings.length - 1].timestamp).getTime();
        const overlapped = forecast.filter(f => new Date(f.timestamp).getTime() <= lastRealTs);
        if (overlapped.length === 0) return;

        // remove overlapped points
        const remaining = forecast.filter(f => new Date(f.timestamp).getTime() > lastRealTs);
        setForecast(remaining);

        // request extension for the number of removed points (at least 1)
        const toFetch = Math.max(1, overlapped.length);
        fetchForecast(sensorId, toFetch).then(newPoints => {
            // append new points (backend will base on real readings)
            if (!mountedRef.current) return;
            setForecast(prev => [...(prev || []), ...newPoints]);
        }).catch(err => console.warn('Failed to extend forecast', err));
    }, [readings]);

    // If no sensorId and no readings, show placeholder
    if (!sensorId && readings.length === 0) {
        return (
            <div className="w-full p-4 bg-white rounded-lg flex items-center justify-center text-text-secondary" style={{ height: `${heightPx}px` }}>
                <div>No temperature sensor selected</div>
            </div>
        );
    }

    const labels = readings.map(r => new Date(r.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }));
    const dataPoints = readings.map(r => r.temperature);
    const forecastLabels = forecast.map(r => new Date(r.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }));
    const forecastPoints = forecast.map(r => r.temperature);
    const combinedLabels = [...labels, ...forecastLabels];

    const rarityColor = getRarityColor(rarity ?? 'COMMON');

    // Resolve CSS variable colors (e.g. "var(--warning-amber)") to a concrete
    // color string that the canvas can use. If resolution isn't possible (SSR
    // or variable missing), fall back to a small hard-coded palette.
    let resolvedRarityColor = rarityColor;
    try {
        if (typeof window !== 'undefined' && typeof document !== 'undefined' && rarityColor && rarityColor.trim().startsWith('var(')) {
            // extract the variable name from var(--name)
            const inner = rarityColor.trim().slice(4, -1).split(',')[0].trim();
            // inner may be like --warning-amber
            const computed = getComputedStyle(document.documentElement).getPropertyValue(inner).trim();
            if (computed) resolvedRarityColor = computed;
        }
    } catch (e) {
        // ignore and fall back to mapping below
    }

    // Fallback mapping (hex) for when CSS variables aren't available.
    if (!resolvedRarityColor || resolvedRarityColor.startsWith('var(')) {
        switch ((rarity || 'COMMON').toUpperCase()) {
            case 'RARE':
                resolvedRarityColor = '#f59e0b'; // amber
                break;
            case 'EPIC':
                resolvedRarityColor = '#ef4444'; // red
                break;
            case 'COMMON':
                resolvedRarityColor = '#14b8a6'; // teal
                break;
            default:
                resolvedRarityColor = '#14b8a6'; // teal (common)
        }
    }

    const data = {
        labels: combinedLabels,
        datasets: [
            {
                data: [...dataPoints, ...Array(forecastPoints.length).fill(null)],
                borderColor: resolvedRarityColor,
                backgroundColor: 'rgba(0,0,0,0)',
                pointBackgroundColor: resolvedRarityColor,
                tension: 0.2,
            },
            // forecast dataset (dashed)
            {
                data: [...Array(dataPoints.length).fill(null), ...forecastPoints],
                borderColor: '#5b21b6', // dark purple for forecast
                backgroundColor: 'rgba(0,0,0,0)',
                borderDash: [6, 4],
                pointBackgroundColor: '#5b21b6',
                tension: 0.2,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: (items: any) => {
                        const idx = items?.[0]?.dataIndex;
                        if (idx == null) return '';
                        const ts = readings[idx]?.timestamp;
                        if (!ts) return labels?.[idx] ?? '';
                        return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
                    },
                    label: (item: any) => `Temp: ${item.formattedValue} °C`,
                },
            },
        },
        scales: {
            x: {
                ticks: { autoSkip: true }
            },
            y: {
                ticks: { maxTicksLimit: 6 },
                beginAtZero: false,
            },
        },
    };

    return (
        <div className="w-full p-4 bg-white rounded-lg" style={{ height: `${heightPx}px` }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default TemperatureGraph;
