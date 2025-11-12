/**
 * FishyDex API Server
 *
 * Main entry point for the diving application API.
 * Provides REST endpoints for accessing diving centers, fish species,
 * fish sightings, and temperature sensor data. Also manages background
 * jobs for updating sightings and temperature readings.
 */

import cors from "cors";
import express from "express";
import { getAllDivingCenters } from "./services/divingCenterService";
import { getAllFish, getFishById, getFishByRarity } from "./services/fishService";
import { startFishSightingUpdates, startTemperatureSensorUpdates, } from "./services/scheduledJobService";
import { fetchFishData } from "./services/serperService";
import { getAllTemperatureReadings, getTemperatureReadingsForSensorId } from "./services/temperatureReadingService";

// Initialize Express application
const app = express();

// Enable CORS for cross-origin requests (allows frontend to connect)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Log any requests under /api/fish/serper for diagnostics
app.use('/api/fish/serper', (req, _res, next) => {
  console.log(`🔍 [serper] ${req.method} ${req.originalUrl}`);
  next();
});

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
 * GET /api/fish/rarity/:rarity
 * Retrieves fish by rarity (EPIC, RARE, COMMON, ALL).
 * Returns 404 if no fish of that rarity are found.
 */
app.get("/api/fish/rarity/:rarity", async (req, res) => {
  try {
    const fishes = await getFishByRarity(req.params.rarity);
    if (!fishes || fishes.length === 0) {
      res.status(404).json({ error: "Fish not found" });
      return;
    }
    res.json(fishes);
  } catch (error) {
    console.error("Error fetching fish by rarity:", error);
    res.status(500).json({ error: "Failed to fetch fish" });
  }
});

/**
 * GET /api/fish/enrich/:id
 * Fetches enrichment data for a fish species using the Serper service.
 * Returns the enrichment payload (description, link, scientificName) or 404 if fish not found.
 */
app.get("/api/fish/enrich/:id", async (req, res) => {
  try {
    const fish = await getFishById(req.params.id);
    if (!fish) {
      res.status(404).json({ error: "Fish not found" });
      return;
    }
    // Use species name as query to Serper
    const query = fish.name;
    const enrichment = await fetchFishData(query);
    if (!enrichment) {
      res.status(502).json({ error: "Failed to fetch enrichment data" });
      return;
    }

    res.json({ fishId: fish.id, enrichment });
  } catch (error) {
    console.error("Error enriching fish:", error);
    res.status(500).json({ error: "Failed to enrich fish" });
  }
});

/**
 * GET /api/fish/serper/:query
 * Proxy to Serper service: return enrichment for the provided query string.
 */
app.get('/api/fish/serper/:query', async (req, res) => {
  try {
    const q = req.params.query;
    if (!q) {
      res.status(400).json({ error: 'Missing query' });
      return;
    }
    const enrichment = await fetchFishData(q);
    if (!enrichment) {
      res.status(502).json({ error: 'Failed to fetch enrichment from Serper' });
      return;
    }
    res.json({ query: q, enrichment });
  } catch (err) {
    console.error('Error in /api/fish/serper/:query', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Also accept query via querystring: /api/fish/serper?q=...
app.get('/api/fish/serper', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q) {
      res.status(400).json({ error: 'Missing query parameter q' });
      return;
    }
    const enrichment = await fetchFishData(q);
    if (!enrichment) {
      res.status(502).json({ error: 'Failed to fetch enrichment from Serper' });
      return;
    }
    res.json({ query: q, enrichment });
  } catch (err) {
    console.error('Error in /api/fish/serper (query)', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/fish/serper/:query
 * Minimal receiver for enrichment payloads coming from serperService.fetchAndSendFishData.
 * This will log the incoming payload and return 200. In the future we could persist
 * the enrichment to the DB or associate it with the fish record.
 */
app.post('/api/fish/serper/:query', async (req, res) => {
  try {
    console.log('📥 /api/fish/serper payload:', req.body);
    const data = await fetchFishData(req.params.query);
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error receiving serper payload', error);
    res.status(500).json({ error: 'Failed to receive enrichment' });
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
