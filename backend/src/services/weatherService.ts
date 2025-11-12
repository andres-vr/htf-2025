import { fetchCurrentWeather } from '../clients/weather';

type CacheEntry = { ts: number; data: any };

const cache = new Map<string, CacheEntry>();
const TTL_MS = 60 * 1000; // 60s cache

function cacheKey(lat: number, lon: number, units: string) {
  return `${lat.toFixed(4)}:${lon.toFixed(4)}:${units}`;
}

export async function getCurrentWeather(lat: number, lon: number, units: 'metric' | 'imperial' | 'standard' = 'metric') {
  const key = cacheKey(lat, lon, units);
  const now = Date.now();
  const existing = cache.get(key);
  if (existing && now - existing.ts < TTL_MS) return existing.data;

  const raw: any = await fetchCurrentWeather(lat, lon, units);

  // Normalize OpenWeatherMap response to the minimal shape frontend expects
  const normalized = {
    dt: Number(raw?.dt ?? Date.now() / 1000),
    timezone: Number(raw?.timezone ?? 0),
    name: raw?.name ?? undefined,
    coord: raw?.coord ? { lon: Number(raw.coord.lon), lat: Number(raw.coord.lat) } : { lon, lat },
    main: {
      temp: raw?.main?.temp != null ? Number(raw.main.temp) : null,
      feels_like: raw?.main?.feels_like != null ? Number(raw.main.feels_like) : null,
      humidity: raw?.main?.humidity != null ? Number(raw.main.humidity) : null,
      pressure: raw?.main?.pressure != null ? Number(raw.main.pressure) : undefined,
    },
    wind: raw?.wind ? { speed: Number(raw.wind.speed), deg: raw.wind.deg != null ? Number(raw.wind.deg) : undefined } : undefined,
    weather: Array.isArray(raw?.weather) ? raw.weather.map((w: any) => ({ id: Number(w.id), main: w.main, description: w.description, icon: w.icon })) : [],
    sys: raw?.sys ? { sunrise: raw.sys.sunrise != null ? Number(raw.sys.sunrise) : undefined, sunset: raw.sys.sunset != null ? Number(raw.sys.sunset) : undefined, country: raw.sys.country } : undefined,
  };

  cache.set(key, { ts: now, data: normalized });
  return normalized;
}

export function clearWeatherCache() {
  cache.clear();
}
