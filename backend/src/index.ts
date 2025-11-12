/**
 * FishyDex API Server
 *
 * Main entry point for the diving application API.
 * Provides REST endpoints for accessing diving centers, fish species,
 * fish sightings, and temperature sensor data. Also manages background
 * jobs for updating sightings and temperature readings.
 */

import express from "express";
import cors from "cors";
import {getAllDivingCenters} from "./services/divingCenterService";
import {getAllFish, getFishById} from "./services/fishService";
import {getAllTemperatureReadings, getTemperatureReadingsForSensorId} from "./services/temperatureReadingService";
import {startFishSightingUpdates, startTemperatureSensorUpdates,} from "./services/scheduledJobService";

// Initialize Express application
const app = express();

// Enable CORS for cross-origin requests (allows frontend to connect)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

/**
 * GET /api/diving-centers
 * Retrieves all diving centers in the system.
 * Returns an array of diving center objects with locations and details.
 */
app.get("/api/diving-centers", async (req, res) => {
  try {
    const divingCenters = await getAllDivingCenters();
    res.json(divingCenters);
  } catch (error) {
    console.error("Error fetching diving centers:", error);
    res.status(500).json({ error: "Failed to fetch diving centers" });
  }
});

/**
 * GET /api/fish
 * Retrieves all fish species with their latest sighting.
 * Each fish object includes its most recent sighting location and timestamp,
 * or null if the fish has never been sighted.
 */
app.get("/api/fish", async (req, res) => {
  try {
    const fish = await getAllFish();
    res.json(fish);
  } catch (error) {
    console.error("Error fetching fish:", error);
    res.status(500).json({ error: "Failed to fetch fish" });
  }
});

/**
 * GET /api/fish/:id
 * Retrieves a specific fish by ID with all of its sightings.
 * Returns 404 if the fish doesn't exist.
 * Unlike the /api/fish endpoint, this returns ALL sightings for the fish,
 * not just the most recent one.
 */
app.get("/api/fish/:id", async (req, res) => {
  try {
    const fish = await getFishById(req.params.id);
    if (!fish) {
      res.status(404).json({ error: "Fish not found" });
      return;
    }
    res.json(fish);
  } catch (error) {
    console.error("Error fetching fish by id:", error);
    res.status(500).json({ error: "Failed to fetch fish" });
  }
});

/**
 * GET /api/temperatures
 * Retrieves all temperature sensors with their readings.
 * Returns sensor locations and their associated temperature readings
 * with timestamps.
 */
app.get("/api/temperatures", async (req, res) => {
  try {
    const temperatures = await getAllTemperatureReadings();
    res.json(temperatures);
  } catch (error) {
    console.error("Error fetching temperatures:", error);
    res.status(500).json({ error: "Failed to fetch temperatures" });
  }
});
/**
 * GET /api/temperatures/:id
 * Retrieves a specific temperature sensor by ID with all of its readings.
 * Returns 404 if the temperature sensor doesn't exist.
 * Unlike the /api/temperatures endpoint, this returns ALL readings for the temperature sensor,
 * not just the most recent one.
 */
app.get("/api/temperatures/:id", async (req, res) => {
  try {
    const temperatureSensor = await getTemperatureReadingsForSensorId(req.params.id);
    if (!temperatureSensor) {
      res.status(404).json({error: "Temperature sensor not found"});
      return;
    }
    res.json(temperatureSensor);
  } catch (error) {
    console.error("Error fetching temperature sensor by id:", error);
    res.status(500).json({error: "Failed to fetch temperature sensor"});
  }
});

/**
 * Start the Express server and initialize background jobs.
 *
 * The server listens on port 5555 and starts two background jobs:
 * 1. Fish sighting updates - Periodically updates fish locations
 * 2. Temperature sensor updates - Periodically generates new temperature readings
 *
 * Both jobs run continuously in the background while the server is running.
 */
const server = app.listen(5555, () => {
  console.log("🤿 FishyDex available at http://localhost:5555");

  // Start background job to update fish sightings for all rarity levels
  startFishSightingUpdates();

  // Start background job to update temperature sensor readings
  startTemperatureSensorUpdates();
});
