import { formatDistanceToNow } from "date-fns";
import { Fish } from "@/types/fish";
import { getRarityColorClass, getRarityHoverClass } from "@/utils/rarity";

interface FishCardProps {
  fish: Fish;
  onHover?: (fishId: string | null) => void;
}

export default function FishCard({ fish, onHover }: FishCardProps) {
  return (
    <div
      className={`border border-panel-border shadow-[--shadow-cockpit-border] rounded-lg p-3 ${getRarityHoverClass(fish.rarity)} transition-all duration-300 cursor-pointer group`}
      onMouseEnter={() => onHover?.(fish.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <img src={fish.image} alt={`photo of ${fish.name}`} className="h-70"/>
          <div className={`text-sm font-bold ${getRarityColorClass(fish.rarity)} transition-colors mb-1`}>
            {fish.name}
          </div>
        </div>
      </div>
    </div>
  );
}
