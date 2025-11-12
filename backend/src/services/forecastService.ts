import { callOpenAI } from '../clients/ai';
import { getTemperatureReadingsForSensorId } from './temperatureReadingService';

type Point = { temperature: number; timestamp: string };

/**
 * Fallback linear extrapolation: take last two points and continue by the same delta.
 */
function linearExtrapolate(points: Point[], count: number, stepMinutes: number) {
  if (!points || points.length === 0) return [];
  if (points.length === 1) {
    // repeat same temp
    const base = points[0];
    const out: Point[] = [];
    const baseTs = new Date(base.timestamp).getTime();
    for (let i = 1; i <= count; i++) {
      out.push({ temperature: base.temperature, timestamp: new Date(baseTs + i * stepMinutes * 60000).toISOString() });
    }
    return out;
  }

  const a = points[points.length - 2];
  const b = points[points.length - 1];
  const dt = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  const dtemp = b.temperature - a.temperature;
  const slopePerMs = dtemp / Math.max(1, dt);

  const out: Point[] = [];
  let lastTs = new Date(b.timestamp).getTime();
  let lastTemp = b.temperature;
  for (let i = 1; i <= count; i++) {
    lastTs = lastTs + stepMinutes * 60000;
    lastTemp = lastTemp + slopePerMs * (stepMinutes * 60000);
    out.push({ temperature: Math.round(lastTemp * 100) / 100, timestamp: new Date(lastTs).toISOString() });
  }
  return out;
}

/**
 * Ask AI to continue the temperature pattern. If OPENAI_API_KEY is not set,
 * we fall back to linear extrapolation.
 */
export async function getForecastForSensor(sensorId: string, points = 12, stepMinutes = 5) {
  const sensor = await getTemperatureReadingsForSensorId(sensorId);
  if (!sensor) throw new Error('Sensor not found');

  const readings: Point[] = (sensor.readings || []).map((r: any) => ({ temperature: Number(r.temperature), timestamp: new Date(r.timestamp).toISOString() }));
  // determine stepMinutes from historical readings if possible (median delta in minutes)
  if (readings.length >= 2) {
    const deltas: number[] = [];
    for (let i = 1; i < readings.length; i++) {
      const dt = new Date(readings[i].timestamp).getTime() - new Date(readings[i - 1].timestamp).getTime();
      deltas.push(dt / 60000);
    }
    if (deltas.length > 0) {
      // median
      deltas.sort((a, b) => a - b);
      const mid = Math.floor(deltas.length / 2);
      const med = deltas.length % 2 === 1 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
      stepMinutes = Math.max(1, Math.round(med));
    }
  }

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (hasOpenAI && readings.length >= 3) {
    // Build a concise prompt
    const historyLines = readings.map(r => `${r.timestamp} => ${r.temperature.toFixed(2)}`).join('\n');
    const prompt = `I have a sequence of water temperature readings (ISO8601 timestamp => temp in °C). Continue the pattern and provide the next ${points} readings spaced ${stepMinutes} minutes apart. Respond with JSON array of objects [{"timestamp":"ISO","temperature":number}, ...] only.` +
      `\nHistory:\n${historyLines}`;

    try {
      const aiText = await callOpenAI(prompt, 400);
      const firstJsonStart = aiText.indexOf('[');
      const jsonText = firstJsonStart >= 0 ? aiText.slice(firstJsonStart) : aiText;
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        return parsed.map((p: any) => ({ timestamp: new Date(p.timestamp).toISOString(), temperature: Number(p.temperature) }));
      }
    } catch (err) {
      console.warn('AI forecast failed, falling back to model extrapolation', err);
    }
  }

  // Use Holt's linear method (double exponential smoothing) for better trend capture
  // parameters
  const alpha = 0.4; // level smoothing
  const beta = 0.1; // trend smoothing

  if (readings.length === 0) return [];

  // sort by timestamp asc
  const r = readings.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // initialize level and trend
  let level = r[0].temperature;
  let trend = (r.length >= 2) ? (r[1].temperature - r[0].temperature) : 0;

  for (let i = 1; i < r.length; i++) {
    const value = r[i].temperature;
    const lastLevel = level;
    level = alpha * value + (1 - alpha) * (level + trend);
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
  }

  // forecast points
  const lastTs = new Date(r[r.length - 1].timestamp).getTime();
  const out: Point[] = [];
  for (let i = 1; i <= points; i++) {
    const forecastTemp = level + trend * i;
    const ts = new Date(lastTs + i * stepMinutes * 60000).toISOString();
    out.push({ temperature: Math.round(forecastTemp * 100) / 100, timestamp: ts });
  }

  return out;
}
