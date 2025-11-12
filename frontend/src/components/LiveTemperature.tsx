import React, { useEffect, useRef, useState } from 'react';

type Props = {
  sensorId?: string;
  pollIntervalMs?: number;
  // temperature difference threshold to trigger a notification
  threshold?: number;
};

type Toast = { id: string; text: string };

const LiveTemperature: React.FC<Props> = ({ sensorId, pollIntervalMs = 1000, threshold = 0.001 }) => {
  const prevTempRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Helper to push a toast
  const pushToast = (text: string) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    setToasts(t => [...t, { id, text }]);
    // auto remove after 5s
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  };

  // Try to show native notification (if permission granted)
  const notifyNative = (title: string, body?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (e) {
        console.warn('Notification failed', e);
      }
    } else if (Notification.permission === 'default') {
      // ask once
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          try { new Notification(title, { body }); } catch (e) { /* noop */ }
        }
      });
    }
  };

  useEffect(() => {
    if (!sensorId) return;

    let mounted = true;

    const fetchLatest = async () => {
      try {
        const res = await fetch(`http://localhost:5555/api/temperatures/${sensorId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.readings || !Array.isArray(data.readings)) return;
        // find latest by timestamp
        const latest = data.readings.reduce((best: any | null, cur: any) => {
          if (!cur || !cur.timestamp) return best;
          if (!best) return cur;
          return new Date(cur.timestamp).getTime() > new Date(best.timestamp).getTime() ? cur : best;
        }, null);
        if (!latest) return;
        const temp = Number(latest.temperature);
        const prev = prevTempRef.current;
        if (prev == null) {
          prevTempRef.current = temp;
          return;
        }
        // trigger if changed more than threshold
        if (Math.abs(temp - prev) >= threshold) {
          const text = `Temperature changed: ${prev.toFixed(2)} → ${temp.toFixed(2)} °C`;
          pushToast(text);
          notifyNative('Temperature update', text);
          prevTempRef.current = temp;
        }
      } catch (err) {
        console.error('LiveTemperature fetch error', err);
      }
    };

    // initial fetch
    fetchLatest();
    // set interval
    intervalRef.current = window.setInterval(fetchLatest, pollIntervalMs) as unknown as number;

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
      }
    };
  }, [sensorId, pollIntervalMs, threshold]);

  if (!sensorId) return null;

  return (
    <div aria-live="polite">
      {/* Toast container */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: 'white', padding: '8px 12px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: 8, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: '#0f172a' }}>{t.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTemperature;
