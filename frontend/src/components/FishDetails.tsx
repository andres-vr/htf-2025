import { Fish } from "@/types/fish";
import { getRarityBadgeClass, getRarityColorClass } from "@/utils/rarity";
import { formatDistanceToNow } from "date-fns";

interface FishDetailsProps {
  fish: Fish | null;
}

export default function FishDetails({ fish }: FishDetailsProps) {
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
      <div className="mb-4 rounded-lg overflow-hidden border border-panel-border shadow-[--shadow-cockpit-border]">
        <img 
          src={fish.image} 
          alt={fish.name} 
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Fish Name */}
      <div className="mb-4">
        <div className="text-xs text-text-secondary font-mono mb-1">SPECIES</div>
        <div className={`text-lg font-bold ${getRarityColorClass(fish.rarity)}`}>{fish.name}</div>
      </div>

      {/* Rarity */}
      <div className="mb-4">
        <div className="text-xs text-text-secondary font-mono mb-1">RARITY</div>
        <div className={`text-base inline-block px-6 py-2 rounded text-[10px] font-bold ${getRarityBadgeClass(fish.rarity)}`}>
          {fish.rarity}
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
