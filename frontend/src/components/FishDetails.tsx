import { Fish } from "@/types/fish";
import { getRarityBadgeClass, getRarityColorClass } from "@/utils/rarity";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from 'react';
import LiveTemperature from "./LiveTemperature";
import TemperatureGraph from "./TemperatureGraph";

type TempSensor = {
  id: string;
  latitude: number;
  longitude: number;
};

interface FishDetailsProps {
  fish: Fish | null;
}

export default function FishDetails({ fish }: FishDetailsProps) {
  const [nearestSensorId, setNearestSensorId] = useState<string | undefined>(undefined);
  const [serperData, setSerperData] = useState<{ description: string | null; descriptionLink: string | null; scientificName: string | null } | null>(null);
  const [serperLoading, setSerperLoading] = useState(false);

  useEffect(() => {
    if (!fish) return;

    const findNearest = async () => {
      try {
        const res = await fetch('http://localhost:5555/api/temperatures');
        if (!res.ok) return;
        const sensors: TempSensor[] = await res.json();
        if (!sensors || sensors.length === 0) return;

        // simple haversine distance
        const toRad = (v: number) => (v * Math.PI) / 180;
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // km
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        }

        let best: TempSensor | null = null;
        let bestDist = Infinity;
        for (const s of sensors) {
          // some sensors returned may have lastReading and other keys; ensure lat/lon present
          const lat = (s as any).latitude ?? (s as any).lat ?? null;
          const lon = (s as any).longitude ?? (s as any).lon ?? null;
          if (lat == null || lon == null) continue;
          const d = haversine(fish.latestSighting.latitude, fish.latestSighting.longitude, lat, lon);
          if (d < bestDist) {
            bestDist = d;
            best = s;
          }
        }
        if (best) setNearestSensorId(best.id);
      } catch (err) {
        console.error('Failed to get temperature sensors', err);
      }
    }

    findNearest();
    
    // fetch enrichment from backend serper proxy
    const fetchSerper = async () => {
      try {
        setSerperLoading(true);
        setSerperData(null);
        const q = encodeURIComponent(fish.name);
        const res = await fetch(`http://localhost:5555/api/fish/serper/${q}`);
        if (!res.ok) {
          console.warn('Serper fetch failed', await res.text());
          setSerperData(null);
          return;
        }
        const payload = await res.json();
        console.log(payload);
        setSerperData(payload?.enrichment ?? null);
      } catch (err) {
        console.error('Failed to fetch serper enrichment', err);
        setSerperData(null);
      } finally {
        setSerperLoading(false);
      }
    };

    fetchSerper();
  }, [fish]);
  if (!fish) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        <div className="text-center">
          <div className="text-sm font-mono">SELECT A FISH TO VIEW DETAILS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 border-l border-panel-border overflow-y-auto">
      {/* Fish Image */}
      <div className="mb-4 rounded-lg overflow-hidden border border-panel-border shadow-[--shadow-cockpit-border] h-64 shrink-0">
        <img 
          src={fish.image} 
          alt={fish.name} 
          className="w-full h-full object-cover"
        />
      </div>

       {/* Fish Name & Scientific Name */}
      <div className="mb-4 flex flex-row">
        <div className="flex flex-col">
          <div className="text-xs text-text-secondary font-mono mb-1">SPECIES</div>
          <div className={`text-lg font-bold ${getRarityColorClass(fish.rarity)}`}>{fish.name}</div>
        </div>
        <div className="flex flex-col ml-6">
        <div className="text-xs text-text-secondary font-mono mt-3 mb-1">SCIENTIFIC NAME</div>
        <div className="text-sm">{serperLoading ? 'Loading…' : (serperData?.scientificName ?? '—')}</div>
      </div>
      <div className="flex flex-col ml-6">
        <div className="text-xs text-text-secondary font-mono mt-3 mb-1">LEARN MORE</div>
        <a className="text-sm text-blue-600 hover:text-shadow-blue-400
        " href={serperData?.descriptionLink ?? '#'} target="_blank" rel="noopener noreferrer">Wikipedia</a>
        </div>
      </div>

      {/* Rarity & Description Side-by-Side */}
      <div className="mb-4 flex flex-row gap-4">
        <div className="flex flex-col">
           <div className="text-xs text-text-secondary font-mono mb-1">RARITY</div>
            <div className={`text-base inline-block px-6 py-2 rounded text-[10px] font-bold ${getRarityBadgeClass(fish.rarity)}`}>
          {fish.rarity}
           </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-xs text-text-secondary font-mono mb-1">DESCRIPTION</div>
          <div className="text-sm">
          {serperLoading && <span>Loading description…</span>}
          {!serperLoading && serperData?.description && (
            <div className="text-sm text-text-primary">
              {serperData.description}
            </div>
          )}
          {!serperLoading && !serperData?.description && <div className="text-sm text-text-secondary">No description available.</div>}
        </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-4">
        <div className="text-xs text-text-secondary font-mono mb-2">LAST SIGHTING LOCATION</div>
        {fish.latestSighting ? (
          <div className="bg-[color-mix(in_srgb,var(--color-deep-ocean)_80%,transparent)] border border-panel-border rounded p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Latitude:</span>
              <span className="text-sm font-mono text-sonar-green">
                {fish.latestSighting.latitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Longitude:</span>
              <span className="text-sm font-mono text-sonar-green">
                {fish.latestSighting.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[color-mix(in_srgb,var(--color-deep-ocean)_80%,transparent)] border border-panel-border rounded p-3">
            <span className="text-xs text-text-secondary">No sightings recorded</span>
          </div>
        )}
      </div>
  <LiveTemperature sensorId={nearestSensorId} pollIntervalMs={1000} />
  <TemperatureGraph sensorId={nearestSensorId} rarity={fish.rarity} />
      {/* Last Seen */}
      {fish.latestSighting && (
        <div>
          <div className="text-xs text-text-secondary font-mono mb-1">LAST SEEN</div>
          <div className="text-sm text-sonar-green">
            {formatDistanceToNow(new Date(fish.latestSighting.timestamp), { 
              addSuffix: true 
            })}
          </div>
          <div className="text-xs text-text-secondary font-mono mt-2">
            {new Date(fish.latestSighting.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
