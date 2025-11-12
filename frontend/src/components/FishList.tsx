import { Fish } from "@/types/fish";
import FishCard from "./FishCard";

interface FishListProps {
  fishes: Fish[];
  onFishHover: (fishId: string | null) => void;
}

export default function FishList({ fishes, onFishHover }: FishListProps) {
  return (
    <div className="w-full h-full bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] overflow-hidden flex flex-col">
      {/* Section Header */}
      <div className="px-6 py-3 border-b border-panel-border flex items-center justify-between">
        <div className="text-sm font-bold text-sonar-green [text-shadow:--shadow-glow-text] font-mono">
          DETECTED TARGETS
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-sonar-green shadow-[--shadow-glow-common]"></div>
            <span className="text-text-secondary">COMMON</span>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <div className="w-2 h-2 rounded-full bg-warning-amber shadow-[--shadow-glow-rare]"></div>
            <span className="text-text-secondary">RARE</span>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <div className="w-2 h-2 rounded-full bg-danger-red shadow-[--shadow-glow-epic]"></div>
            <span className="text-text-secondary">EPIC</span>
          </div>
        </div>
      </div>

      {/* Scrollable Fish Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {fishes.map((fish) => (
            <FishCard key={fish.id} fish={fish} onHover={onFishHover} />
          ))}
        </div>
      </div>
    </div>
  );
}
