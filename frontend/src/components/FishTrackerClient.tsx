"use client";

import { Fish } from "@/types/fish";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import FishDetails from "./FishDetails";
import FishList from "./FishList";
import Map from "./Map";
import WeatherInfo from "./WeatherInfo";

interface FishTrackerClientProps {
  fishes: Fish[];
  sortedFishes: Fish[];
  selectedFish?: Fish | null;
  onFishSelect?: (fish: Fish | null) => void;
}

export default function FishTrackerClient({
  fishes,
  sortedFishes,
  selectedFish: parentSelectedFish,
  onFishSelect: parentOnFishSelect,
}: FishTrackerClientProps) {
  const [hoveredFishId, setHoveredFishId] = useState<string | null>(null);
  const [localSelectedFish, setLocalSelectedFish] = useState<Fish | null>(null);
  
  // Use parent's selectedFish if provided, otherwise use local state
  const selectedFish = parentSelectedFish ?? localSelectedFish;
  const setSelectedFish = parentOnFishSelect ?? setLocalSelectedFish;

  return (
    <PanelGroup
      direction="horizontal"
      className="flex-1"
      autoSaveId="fish-tracker-client"
    >
      {/* Left Panel - Map and Fish List */}
      <Panel defaultSize={70} minSize={30}>
        <PanelGroup direction="vertical" autoSaveId="fish-tracker-left">
          {/* Map Panel */}
          <Panel defaultSize={65} minSize={30}>
            <div className="w-full h-full relative shadow-[--shadow-map-panel]">
              <Map 
                fishes={fishes} 
                hoveredFishId={hoveredFishId}
                onFishSelect={setSelectedFish}
                selectedFish={selectedFish}
              />
              {/* Show live weather for the selected fish's latest sighting (if available) */}
              {selectedFish?.latestSighting && (
                <div className="absolute top-4 right-4 z-20">
                  <WeatherInfo
                    lat={selectedFish.latestSighting.latitude}
                    lon={selectedFish.latestSighting.longitude}
                    units="metric"
                    // poll every 60s by default; override if needed
                  />
                </div>
              )}
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="h-1 bg-panel-border hover:bg-sonar-green transition-colors duration-200 cursor-row-resize relative group">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-sonar-green opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-panel-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-sonar-green rounded-full" />
              </div>
            </div>
          </PanelResizeHandle>

          {/* Fish List Panel */}
          <Panel defaultSize={35} minSize={20}>
            <FishList 
              fishes={sortedFishes} 
              onFishHover={setHoveredFishId}
              onFishSelect={setSelectedFish}
            />
          </Panel>
        </PanelGroup>
      </Panel>

      {/* Resize Handle between left and right panels */}
      <PanelResizeHandle className="w-1 bg-panel-border hover:bg-sonar-green transition-colors duration-200 cursor-col-resize relative group">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-sonar-green opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </PanelResizeHandle>

      {/* Right Panel - Fish Details */}
      <Panel defaultSize={30} minSize={20} className="bg-[color-mix(in_srgb,var(--color-dark-navy)_95%,transparent)]">
        <FishDetails fish={selectedFish} />
      </Panel>
    </PanelGroup>
  );
}
