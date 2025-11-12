import { TemperatureEntry } from '@/types/fish';
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
};

const TemperatureGraph: React.FC<Props> = ({ sensorId, initialReadings = [], pollIntervalMs = 60000, heightPx = 200 }) => {
    const [readings, setReadings] = useState<TemperatureEntry[]>(() => {
        // defensively convert initial readings to array
        return Array.isArray(initialReadings) ? initialReadings : [];
    });

    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Fetch function for a sensorId
    const fetchForSensor = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5555/api/temperatures/${id}`);
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
        } catch (err) {
            console.error('Error fetching sensor readings', err);
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

    const data = {
        labels,
        datasets: [
            {
                data: dataPoints,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34,197,94,0.08)',
                pointBackgroundColor: 'rgb(34,197,94)',
                tension: 0.2,
            },
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
