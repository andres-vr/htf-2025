/**
 * Temperature Reading Service
 *
 * Manages temperature sensor data and readings for the diving area.
 * This service handles retrieving sensor information and generating realistic
 * temperature readings with natural variation over time.
 */

import {PrismaClient} from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * Retrieves all temperature sensors with their readings.
 *
 * Returns complete sensor information including location (latitude/longitude)
 * and the latest temperature reading with timestamps.
 */
export const getAllTemperatureReadings = async () => {
    const sensors = await prisma.temperatureSensor.findMany({
        include: {
            readings: {
                orderBy: {
                    timestamp: 'desc'
                },
                take: 1
            }
        }
    });

    return sensors.map(({readings, ...s}) => {
        // Extract the single reading (if it exists)
        const reading = readings[0];

        // Return sensor data with latestReading instead of readings array
        // This provides a more intuitive API structure for clients
        return {
            ...s,
            lastReading: reading ? {
                temperature: reading.temperature,
                timestamp: reading.timestamp,
            } : null  // null if sesnor has no reading
        };
    });
};
/**
 * Retrieves a specific temperature sensor by ID with all its readings.
 *
 * This function fetches a single temperature sensor along with ALL of its readings
 * (unlike getAllTemperatureReadings which only returns the latest reading). Reading data
 * is filtered to only include temperature and timestamp information.
 */
export const getTemperatureReadingsForSensorId = async (id: string) => {
    // Fetch the specific temperature sensor with all of its readings
    const sensor = await prisma.temperatureSensor.findUnique({
        where: {
            id
        },
        include: {
            readings: true
        }
    });

    // Return null if temperature sensor doesn't exist
    if (!sensor) {
        return null;
    }

    // Transform sensor data to only include relevant fields
    // This filters out internal database fields
    // and provides a clean API response with only what clients need
    return {
        ...sensor,
        readings: sensor.readings.map(reading => ({
            temperature: reading.temperature,
            timestamp: reading.timestamp
        }))
    };

};

/**
 * Updates temperature readings for all sensors with realistic variations.
 *
 * This function simulates realistic temperature sensor behavior by:
 * 1. Generating new readings based on previous values with small random variations
 * 2. Maintaining temperatures within a realistic range (28-30°C for diving conditions)
 * 3. Keeping a rolling window of the 10 most recent readings per sensor
 *
 * Temperature changes are gradual (±0.3°C max per update) to simulate real-world
 * water temperature stability. Initial readings start randomly within the valid range.
 */
export const updateTemperatureReadings = async () => {
    // Fetch all sensors with their readings, ordered newest to oldest
    // This ordering allows easy access to both the most recent (index 0)
    // and oldest (last index) readings
    const sensors = await prisma.temperatureSensor.findMany({
        include: {
            readings: {
                orderBy: {
                    timestamp: 'desc'
                }
            }
        }
    });

    // Arrays to batch database operations for efficiency
    const newReadings = [];
    const readingsToDelete = [];

    // Process each sensor to generate new temperature readings
    for (const sensor of sensors) {
        let newTemperature: number;

        if (sensor.readings.length > 0) {
            // Sensor has previous readings - generate next reading based on last value
            // This creates realistic gradual temperature changes over time
            const lastReading = sensor.readings[0];
            const lastTemp = Number(lastReading.temperature);

            // Generate small random variation to simulate natural temperature fluctuation
            // Range: -0.3°C to +0.3°C (Math.random() - 0.5 gives -0.5 to +0.5, times 0.6)
            const variation = (Math.random() - 0.5) * 0.6;
            newTemperature = lastTemp + variation;

            // Clamp temperature to realistic diving water range (28-30°C)
            // Prevents temperature from drifting outside valid bounds over time
            newTemperature = Math.max(28, Math.min(30, newTemperature));

            // Maintain rolling window of 10 readings per sensor
            // Mark oldest reading for deletion if at capacity
            // (oldest is at end of array due to 'desc' ordering)
            if (sensor.readings.length === 10) {
                const oldestReading = sensor.readings[sensor.readings.length - 1];
                readingsToDelete.push(oldestReading.id);
            }

        } else {
            // First reading for this sensor - generate random initial temperature
            // Range: 28-30°C (28 + random value between 0 and 2)
            newTemperature = 28 + Math.random() * 2;
        }

        // Round to 2 decimal places for realistic sensor precision
        // (e.g., 29.156 becomes 29.16)
        newTemperature = Math.round(newTemperature * 100) / 100;

        // Add new reading to batch
        newReadings.push({
            temperatureSensorId: sensor.id,
            temperature: newTemperature,
            timestamp: new Date()
        });
    }

    // Batch delete oldest readings to maintain 10-reading limit
    // Delete before creating new ones to avoid constraint violations
    if (readingsToDelete.length > 0) {
        await prisma.temperatureReading.deleteMany({
            where: {
                id: {
                    in: readingsToDelete
                }
            }
        });
    }

    // Batch create all new readings in a single database operation
    await prisma.temperatureReading.createMany({
        data: newReadings
    });

    // Log update for monitoring and debugging
    console.log(`Updated temperature readings at ${new Date().toISOString()}`);
}

