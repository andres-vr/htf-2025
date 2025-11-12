"use client";

import { Marker } from "react-map-gl/maplibre";
import { Fish } from "@/types/fish";
import { getRarityPulseClass } from "@/utils/rarity";

interface FishMarkerProps {
  fish: Fish;
  isHovered: boolean;
  isAnyHovered: boolean;
}

export default function FishMarker({
  fish,
  isHovered,
  isAnyHovered,
}: FishMarkerProps) {
  const pulseClass = getRarityPulseClass(fish.rarity);

  // Determine if this marker should be dimmed
  const isDimmed = isAnyHovered && !isHovered;

  // Show tooltip if this specific fish is hovered from the list
  const showTooltip = isHovered;

  // Get rarity-specific classes
  const rarity = fish.rarity.toUpperCase();
  const rarityColorClass =
    rarity === "RARE"
      ? "bg-warning-amber text-warning-amber"
      : rarity === "EPIC"
        ? "bg-danger-red text-danger-red"
        : "bg-sonar-green text-sonar-green";

  return (
    <Marker
      longitude={fish.latestSighting.longitude}
      latitude={fish.latestSighting.latitude}
    >
      <div
        className={`relative group cursor-pointer hover:z-[9999] transition-opacity duration-200 ${isDimmed ? "opacity-20" : "opacity-100"} ${isHovered ? "z-[9999]" : "z-auto"}`}
        title={fish.name}
      >
        {/* Pulsing ring effect - only animate if not dimmed */}
        <div
          className={`absolute -inset-[6px] w-5 h-5 rounded-full opacity-75 ${rarityColorClass.split(" ")[0]} ${isDimmed ? "" : pulseClass}`}
        />
        {/* Fish marker */}
        <div
          className={`w-2 h-2 rounded-full border-2 border-deep-ocean transition-all duration-300 group-hover:w-3 group-hover:h-3 shadow-[--shadow-marker] ${rarityColorClass.split(" ")[0]} ${rarityColorClass.split(" ")[1]} ${isHovered ? "scale-150" : "scale-100"}`}
        />
        {/* Tooltip - show on hover OR when hovered from list */}
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-navy border border-panel-border rounded text-xs whitespace-nowrap transition-opacity duration-200 pointer-events-none ${
            showTooltip ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className={`font-bold ${rarityColorClass.split(" ")[1]}`}>
            {fish.name}
          </div>
          <div className="text-text-secondary text-[10px]">{fish.rarity}</div>
        </div>
      </div>
    </Marker>
  );
}
