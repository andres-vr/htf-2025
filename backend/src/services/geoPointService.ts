/**
 * Geo Point Service
 *
 * Provides geospatial utilities for generating random coordinates within defined areas.
 * Uses Turf.js library for accurate geodesic calculations on Earth's surface.
 */

import {DIVING_AREA_LAT, DIVING_AREA_LON, DIVING_AREA_RADIUS} from "../globals";
import {point} from "@turf/helpers";
import destination from "@turf/destination";

/**
 * Generates a random geographic point within a circular diving area.
 *
 * This function uses polar coordinates (bearing + distance) to generate uniformly
 * distributed random points within a circle. The use of sqrt(random()) for distance
 * ensures uniform distribution across the area (not just along the radius).
 *
 * The center and radius are defined by global constants:
 * - Center: (DIVING_AREA_LAT, DIVING_AREA_LON)
 * - Radius: DIVING_AREA_RADIUS in kilometers
 */
export function randomPointInCircle() {
    // Generate random bearing (direction) from 0 to 360 degrees
    // This determines the angle from the center point
    const bearing = Math.random() * 360;

    // Generate random distance from center using sqrt for uniform distribution
    // Using sqrt(random()) instead of just random() ensures points are evenly
    // distributed across the circular area, not concentrated at the center
    const distanceKm = DIVING_AREA_RADIUS * Math.sqrt(Math.random());

    // Create a Turf.js point for the diving area center
    // Note: Turf uses [longitude, latitude] order (GeoJSON standard)
    const centerPt = point([DIVING_AREA_LON, DIVING_AREA_LAT]);

    // Calculate the destination point using geodesic calculation
    // This accounts for Earth's curvature for accurate positioning
    const dest = destination(centerPt, distanceKm, bearing, {units: 'kilometers'});

    // Extract coordinates from the result
    // Turf returns [longitude, latitude], so we destructure in that order
    const [lon, lat] = dest.geometry.coordinates;

    // Return in {lat, lon} format for consistency with application conventions
    return {lat, lon};
}