/**
 * Simple OpenWeatherMap client for backend usage.
 * Keeps the API key server-side. Uses global fetch (Node 18+/20+).
 */
export async function fetchCurrentWeather(lat: number, lon: number, units: 'metric' | 'imperial' | 'standard' = 'metric') {
  const apiKey = process.env.OPENWEATHERMAP_KEY ?? '3c0d9c64cc70bba7bbded1f5ed495d6b';
  if (!apiKey) throw new Error('OpenWeatherMap API key is not configured');

  const q = new URLSearchParams({ lat: String(lat), lon: String(lon), units, appid: apiKey });
  const url = `https://api.openweathermap.org/data/2.5/weather?${q.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenWeatherMap failed: ${res.status} ${res.statusText} ${text}`);
  }

  const payload = await res.json();
  return payload;
}

export async function fetchCurrentWeatherByCoords(coords: { lat: number; lon: number }, units?: 'metric' | 'imperial' | 'standard') {
  return fetchCurrentWeather(coords.lat, coords.lon, units);
}
