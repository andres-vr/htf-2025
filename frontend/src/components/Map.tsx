"use client";

import { useRef, useEffect, useState } from "react";
import Map, { MapRef, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Fish } from "@/types/fish";
import FishMarker from "./FishMarker";

interface MapComponentProps {
  fishes: Fish[];
  hoveredFishId: string | null;
  onFishSelect?: (fish: Fish) => void;
  selectedFish?: Fish | null;
}

const calculateMapCenter = (fishes: Fish[]) => {
  if (fishes.length === 0) {
    return { latitude: 10.095, longitude: 99.805 };
  }

  const totalLat = fishes.reduce(
    (sum, fish) => sum + (fish.latestSighting?.latitude || 0),
    0
  );
  const totalLon = fishes.reduce(
    (sum, fish) => sum + (fish.latestSighting?.longitude || 0),
    0
  );

  return {
    latitude: totalLat / fishes.length,
    longitude: totalLon / fishes.length,
  };
};

export default function MapComponent({
  fishes,
  hoveredFishId,
  onFishSelect,
  selectedFish,
}: MapComponentProps) {
  const mapRef = useRef<MapRef>(null);
  const { latitude, longitude } = calculateMapCenter(fishes);
  const [trajectoryGeoJson, setTrajectoryGeoJson] = useState<any | null>(null);
  
  const rarityToHex = (r?: string) => {
    if (!r) return "#ffa500"; // default amber
    const up = r.toString().toUpperCase();
    if (up === "EPIC") return "#ff4757"; // danger red
    if (up === "RARE") return "#ffa500"; // amber
    return "#14ffec"; // common / default sonar-green
  };
  useEffect(() => {
    let mounted = true;
    const fetchTrajectory = async () => {
      if (!selectedFish) {
        setTrajectoryGeoJson(null);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5555/api/fish/${selectedFish.id}`);
        if (!res.ok) {
          setTrajectoryGeoJson(null);
          return;
        }
        const payload = await res.json();
        // payload.sightings expected: array with { latitude, longitude, timestamp }
        const sightings = Array.isArray(payload.sightings) ? payload.sightings : [];
        if (sightings.length === 0) {
          setTrajectoryGeoJson(null);
          return;
        }

        // Sort oldest -> newest
        sightings.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // Only keep the last N sightings (newest ones). Show the path for those points.
        const N = 5;
        const recent = sightings.slice(Math.max(0, sightings.length - N));

        // Build GeoJSON FeatureCollection with LineString and Point features for recent sightings
        const coords = recent.map((s: any) => [s.longitude, s.latitude]);

        const features: any[] = [];

        // Line feature connecting the recent points (oldest -> newest)
        features.push({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
        });

        // Point features for each recent sighting - mark latest
        recent.forEach((s: any, i: number) => {
          features.push({
            type: "Feature",
            properties: { timestamp: s.timestamp, isLatest: i === recent.length - 1 },
            geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
          });
        });

        const geojson = { type: "FeatureCollection", features };
        if (mounted) setTrajectoryGeoJson(geojson);
      } catch (err) {
        console.error("Failed to fetch trajectory", err);
        if (mounted) setTrajectoryGeoJson(null);
      }
    };

    fetchTrajectory();

    return () => {
      mounted = false;
    };
  }, [selectedFish]);

  const isAnyHovered = hoveredFishId !== null;

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapStyle={"https://tiles.openfreemap.org/styles/liberty"}
        initialViewState={{
          longitude,
          latitude,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {fishes.map((fish) => (
          <FishMarker
            key={fish.id}
            fish={fish}
            isHovered={fish.id === hoveredFishId}
            isAnyHovered={isAnyHovered}
            onSelect={() => onFishSelect?.(fish)}
          />
        ))}

        {/* Render trajectory for the selected fish as a GeoJSON Source + Layers */}
        {trajectoryGeoJson && (
          // determine color based on selected fish rarity
          (() => {
            const pathColor = rarityToHex(selectedFish?.rarity);
            return (
              <Source id="fish-trajectory" type="geojson" data={trajectoryGeoJson}>
                <Layer
                  id="trajectory-line"
                  type="line"
                  paint={{
                    // use rarity color for the recent path
                    "line-color": pathColor,
                    "line-width": 4,
                    "line-opacity": 0.95,
                  }}
                />

                <Layer
                  id="trajectory-points"
                  type="circle"
                  paint={{
                    "circle-radius": 4,
                    // keep points same rarity color so the path reads as a unit
                    "circle-color": pathColor,
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#0a1628",
                  }}
                />

                <Layer
                  id="trajectory-latest"
                  type="circle"
                  filter={["==", ["get", "isLatest"], true]}
                  paint={{
                    "circle-radius": 8,
                    "circle-color": "#ffffff",
                    "circle-stroke-width": 2,
                    // use rarity color around white core for visibility
                    "circle-stroke-color": pathColor,
                  }}
                />
              </Source>
            );
          })()
        )}
        
      </Map>

      {/* Coordinate display overlay */}
      <div className="absolute top-4 left-4 bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] px-4 py-2 rounded text-xs font-mono">
        <div className="text-sonar-green font-bold mb-1">SONAR TRACKING</div>
        <div className="text-text-secondary">
          Active Targets: {fishes.length}
        </div>
      </div>
    </div>
  );
}
