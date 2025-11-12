import { Fish } from "@/types/fish";
import FishCard from "./FishCard";
import { useState } from "react";

interface FishListProps {
  fishes: Fish[];
  onFishHover: (fishId: string | null) => void;
  onFishSelect?: (fish: Fish | null) => void;
}

export default function FishList({ fishes, onFishHover, onFishSelect }: FishListProps) {
  const [rarityFilter, setRarityFilter] = useState<"ALL" | "COMMON" | "RARE" | "EPIC">("ALL");

  // Filter fishes based on selected rarity
  const filteredFishes = rarityFilter === "ALL" 
    ? fishes 
    : fishes.filter(f => f.rarity.toUpperCase() === rarityFilter);

  const rarities: Array<"ALL" | "COMMON" | "RARE" | "EPIC"> = ["ALL", "COMMON", "RARE", "EPIC"];

  return (
    <div className="w-full h-full bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] overflow-hidden flex flex-col">
      {/* Section Header */}
      <div className="px-6 py-3 border-b border-panel-border flex items-center justify-between">
        <div className="text-sm font-bold text-sonar-green text-shadow-[--shadow-glow-text] font-mono">
          DETECTED TARGETS
        </div>
        
        {/* Rarity Filter Buttons */}
        <div className="flex gap-2 text-xs font-mono">
          {rarities.map((rarity) => {
            const isActive = rarityFilter === rarity;
            let bgColor = "bg-sonar-green";
            let glowClass = "shadow-[--shadow-glow-common]";
            
            if (rarity === "RARE") {
              bgColor = "bg-warning-amber";
              glowClass = "shadow-[--shadow-glow-rare]";
            } else if (rarity === "EPIC") {
              bgColor = "bg-danger-red";
              glowClass = "shadow-[--shadow-glow-epic]";
            }

            return (
              <button
                key={rarity}
                onClick={() => setRarityFilter(rarity)}
                className={`px-2 py-1 rounded border transition-all duration-200 ${
                  isActive
                    ? `border-${rarity === "RARE" ? "warning-amber" : rarity === "EPIC" ? "danger-red" : "sonar-green"} bg-[color-mix(in_srgb,var(--color-sonar-green)_10%,transparent)]`
                    : "border-panel-border hover:border-sonar-green"
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${bgColor} ${isActive ? glowClass : ""}`}></div>
                  <span className={isActive ? "text-sonar-green" : "text-text-secondary"}>
                    {rarity === "ALL" ? "ALL" : rarity}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Fish Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredFishes.length > 0 ? (
            filteredFishes.map((fish) => (
              <div key={fish.id} onClick={() => onFishSelect?.(fish)}>
                <FishCard fish={fish} onHover={onFishHover} />
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center py-8 text-text-secondary">
              <div className="text-sm font-mono">No {rarityFilter === "ALL" ? "" : rarityFilter.toLowerCase()} fish detected</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
