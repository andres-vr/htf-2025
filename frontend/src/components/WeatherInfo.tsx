import { format } from 'date-fns';
import { useEffect, useState } from 'react';

type OWMain = {
	temp: number;
	feels_like: number;
	humidity: number;
	pressure?: number;
};

type OWWind = {
	speed: number;
	deg?: number;
};

type OWWeather = {
	id: number;
	main: string;
	description: string;
	icon: string; // e.g. "04d"
};

export type OpenWeatherData = {
	dt: number; // unix
	timezone?: number;
	name?: string;
	coord?: { lon: number; lat: number };
	main: OWMain;
	wind?: OWWind;
	weather: OWWeather[];
	sys?: { sunrise?: number; sunset?: number; country?: string };
};

type Props = {
	lat?: number;
	lon?: number;
	data?: OpenWeatherData | null;
	open?: boolean;
	onClose?: () => void;
	units?: 'metric' | 'imperial' | 'standard';
	// If true (default) the component will poll the backend for live updates every pollIntervalMs
	live?: boolean;
	// Poll interval in milliseconds when live=true
	pollIntervalMs?: number;
	className?: string;
};

function degToDir(deg?: number) {
	if (deg == null) return '—';
	const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
	const ix = Math.round(((deg % 360) / 45)) % 8;
	return dirs[ix];
}

export default function WeatherInfo({ lat, lon, data: initialData, open = false, onClose, units = 'metric', live = true, pollIntervalMs = 60000, className = '' }: Props) {
	const [data, setData] = useState<OpenWeatherData | null>(initialData ?? null);
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState<string | null>(null);

		useEffect(() => {
			// hydrate from prop updates
			setData(initialData ?? null);
		}, [initialData]);

		useEffect(() => {
			if (lat == null || lon == null) return;

			let cancelled = false;
			let timer: number | null = null;

			async function fetchWeatherFromBackend() {
				try {
					setLoading(true);
					setError(null);
					const q = new URLSearchParams({ lat: String(lat), lon: String(lon), units });
					const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '') || 'http://localhost:5555';
					const url = `${base.replace(/\/$/, '')}/api/weather?${q.toString()}`;
					const res = await fetch(url);
					if (!res.ok) throw new Error(`HTTP ${res.status}`);
					const wrapper = await res.json();
					// backend returns { lat, lon, units, payload }
					const payload = wrapper?.payload ?? wrapper;
					if (!cancelled) setData(payload as OpenWeatherData);
				} catch (err: any) {
					console.error('Weather fetch failed', err);
					if (!cancelled) setError(err?.message ?? String(err));
				} finally {
					if (!cancelled) setLoading(false);
				}
			}

			// initial fetch
			fetchWeatherFromBackend();

			// start polling if live
			if (live) {
				timer = window.setInterval(() => {
					fetchWeatherFromBackend();
				}, pollIntervalMs);
			}

			return () => {
				cancelled = true;
				if (timer) clearInterval(timer);
			};
			// pollIntervalMs intentionally not in deps to avoid resetting timer often
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [lat, lon, units]);

	const summary = data ? data.weather?.[0] : undefined;
	const iconUrl = summary ? `https://openweathermap.org/img/wn/${summary.icon}@2x.png` : undefined;

	return (
		<div className={`inline-block ${className}`}>
			{/* summary card */}
					<div className="flex items-center space-x-3 p-2 rounded-md bg-white/80 dark:bg-gray-800/80 shadow-sm">
						<div className="shrink-0">
					{iconUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={iconUrl} alt={summary?.description ?? 'weather'} className="w-10 h-10" />
					) : (
						<div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded" />
					)}
				</div>
				<div className="flex flex-col text-sm">
					<div className="font-medium">
						{data ? `${Math.round(data.main.temp)}°${units === 'metric' ? 'C' : units === 'imperial' ? 'F' : 'K'}` : (loading ? 'Loading…' : 'No data')}
						{data?.name ? ` — ${data.name}` : ''}
					</div>
					<div className="text-xs text-slate-600 dark:text-slate-300">{summary?.description ?? (error ? 'Error' : '—')}</div>
				</div>
			</div>

			{/* popup / modal */}
			{open && (
				<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/40" onClick={onClose} />
					<div className="relative z-10 max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
						<div className="p-4">
							<div className="flex items-start justify-between">
												<div className="flex items-center space-x-3">
													{iconUrl && (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={iconUrl} alt={summary?.description ?? 'weather'} className="w-12 h-12" />
									)}
									<div>
										<div className="text-lg font-semibold">{summary?.main ?? 'Weather'}</div>
										<div className="text-sm text-slate-600 dark:text-slate-400">{summary?.description}</div>
									</div>
								</div>
								<button aria-label="close" onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">✕</button>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
								<div>
									<div className="text-xs text-slate-500">Temperature</div>
									<div className="font-medium">{data ? `${data.main.temp}°` : '—'}</div>
								</div>
								<div>
									<div className="text-xs text-slate-500">Feels like</div>
									<div className="font-medium">{data ? `${data.main.feels_like}°` : '—'}</div>
								</div>
								<div>
									<div className="text-xs text-slate-500">Humidity</div>
									<div className="font-medium">{data ? `${data.main.humidity}%` : '—'}</div>
								</div>
								<div>
									<div className="text-xs text-slate-500">Wind</div>
									<div className="font-medium">{data?.wind ? `${data.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'} ${degToDir(data.wind.deg)}` : '—'}</div>
								</div>
								<div>
									<div className="text-xs text-slate-500">Sunrise</div>
									<div className="font-medium">{data?.sys?.sunrise ? format(new Date((data.sys.sunrise + (data.timezone ?? 0)) * 1000), 'HH:mm') : '—'}</div>
								</div>
								<div>
									<div className="text-xs text-slate-500">Sunset</div>
									<div className="font-medium">{data?.sys?.sunset ? format(new Date((data.sys.sunset + (data.timezone ?? 0)) * 1000), 'HH:mm') : '—'}</div>
								</div>
							</div>

							<div className="mt-4 text-xs text-slate-500">
								<div>Last update: {data ? format(new Date((data.dt + (data.timezone ?? 0)) * 1000), 'yyyy-MM-dd HH:mm') : (loading ? 'Fetching…' : '—')}</div>
								{error && <div className="mt-2 text-sm text-red-600">{error}</div>}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
