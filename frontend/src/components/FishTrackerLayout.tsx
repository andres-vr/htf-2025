"use client";

import { UserInfo } from "./AuthProvider";
import FishTrackerClient from "./FishTrackerClient";
import { Fish } from "@/types/fish";

interface FishTrackerLayoutProps {
  fishes: Fish[];
  sortedFishes: Fish[];
}

export default function FishTrackerLayout({ fishes, sortedFishes }: FishTrackerLayoutProps) {
  return (
    <div className="w-full h-screen flex flex-col relative overflow-hidden">
      {/* Scanline effect */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--color-sonar-green)_10%,transparent)] to-transparent animate-scanline pointer-events-none z-[9999]"></div>

      {/* Header */}
      <div className="bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] px-6 py-3 border-b-2 border-panel-border flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold [text-shadow:--shadow-glow-text] text-sonar-green">
            FISH TRACKER
          </div>
          <div className="text-xs text-text-secondary font-mono">
            GLOBAL MARINE MONITORING SYSTEM
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
            <span className="text-sonar-green">STATUS:</span>
            <span className="text-sonar-green ml-2 font-bold">OPERATIONAL</span>
          </div>
          <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
            <span className="text-text-secondary">TARGETS:</span>
            <span className="text-sonar-green ml-2 font-bold">
              {fishes.length}
            </span>
          </div>
          <div className="border border-panel-border shadow-[--shadow-cockpit-border] px-3 py-1 rounded">
            <UserInfo />
          </div>
        </div>
      </div>

      {/* Map and Fish List with shared hover state */}
      <FishTrackerClient fishes={fishes} sortedFishes={sortedFishes} />
    </div>
  );
}
