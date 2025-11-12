/**
 * Scheduled Job Service
 *
 * Manages background jobs and periodic tasks for the diving application.
 * This service starts recurring timers that update fish sightings and temperature
 * sensor readings at configurable intervals.
 */

import {updateFishSightings} from "./fishSightingService";
import {FishRarity} from '../generated/prisma';
import {
    COMMON_FISH_SIGHTING_UPDATE_RATE,
    EPIC_FISH_SIGHTING_UPDATE_RATE,
    RARE_FISH_SIGHTING_UPDATE_RATE,
    TEMPERATURE_UPDATE_RATE
} from "../globals";
import {updateTemperatureReadings} from "./temperatureReadingService";

/**
 * Starts periodic fish sighting updates for all rarity levels.
 *
 * Creates three separate interval timers, one for each fish rarity:
 * - COMMON: Updates most frequently
 * - RARE: Updates less frequently
 * - EPIC: Updates least frequently
 *
 * Each timer runs independently and continuously until the application stops.
 * Update rates are configured via global constants (in minutes) and converted
 * to milliseconds for setInterval.
 */
export const startFishSightingUpdates = () => {
    // Start COMMON fish sighting updates
    // Converts minutes to milliseconds (minutes * 60 seconds * 1000 ms)
    setInterval(() => updateFishSightings(FishRarity.COMMON), COMMON_FISH_SIGHTING_UPDATE_RATE * 60 * 1000);

    // Start RARE fish sighting updates
    setInterval(() => updateFishSightings(FishRarity.RARE), RARE_FISH_SIGHTING_UPDATE_RATE * 60 * 1000);

    // Start EPIC fish sighting updates
    setInterval(() => updateFishSightings(FishRarity.EPIC), EPIC_FISH_SIGHTING_UPDATE_RATE * 60 * 1000);

    console.log(`🐟 Fish sighting updates started. Settings: COMMON: ${COMMON_FISH_SIGHTING_UPDATE_RATE} minutes, RARE: ${RARE_FISH_SIGHTING_UPDATE_RATE} minutes , EPIC: ${EPIC_FISH_SIGHTING_UPDATE_RATE} minutes.`);
};

/**
 * Starts periodic temperature sensor reading updates.
 *
 * Creates an interval timer that updates temperature readings from all sensors
 * at a configurable rate. The timer runs continuously until the application stops.
 *
 * Update rate is configured via global constant (in minutes) and converted
 * to milliseconds for setInterval.
 */
export const startTemperatureSensorUpdates = () => {
    // Start temperature sensor updates
    // Converts minutes to milliseconds (minutes * 60 seconds * 1000 ms)
    setInterval(() => updateTemperatureReadings(), TEMPERATURE_UPDATE_RATE * 60 * 1000);
    console.log(`🌡️ Temperature updates started. Settings: ${TEMPERATURE_UPDATE_RATE} minutes.`);
};