/**
 * Fish Service
 *
 * Manages fish data and sighting information for the diving application.
 * This service handles retrieving fish species information and transforming
 * sighting data for client consumption.
 */

import {PrismaClient} from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * Retrieves all fish species with their most recent sighting.
 *
 * This function fetches all fish from the database and includes only the
 * latest sighting for each fish. The response is transformed to provide
 * a clean API structure with the most recent location data.
 */
export const getAllFish = async () => {
    // Fetch all fish with only their most recent sighting
    // Sightings are ordered newest first, and limited to 1 result
    const fish = await prisma.fish.findMany({
        include: {
            sightings: {
                orderBy: {
                    timestamp: 'desc'
                },
                take: 1
            }
        }
    });

    // Transform the data structure for cleaner API response
    // Destructure to separate sightings array from rest of fish data
    return fish.map(({sightings, ...f}) => {
        // Extract the single sighting (if it exists)
        const sighting = sightings[0];

        // Return fish data with latestSighting instead of sightings array
        // This provides a more intuitive API structure for clients
        return {
            ...f,
            latestSighting: sighting ? {
                latitude: sighting.latitude,
                longitude: sighting.longitude,
                timestamp: sighting.timestamp
            } : null  // null if fish has never been sighted
        };
    });
};

/**
 * Retrieves a specific fish by ID with all its sightings.
 *
 * This function fetches a single fish along with ALL of its sightings
 * (unlike getAllFish which only returns the latest sighting). Sighting data
 * is filtered to only include location and timestamp information.
 */
export const getFishById = async (id: string) => {
    // Fetch the specific fish with all of its sightings
    const fish = await prisma.fish.findUnique({
        where: {
            id
        },
        include: {
            sightings: true
        }
    });

    // Return null if fish doesn't exist
    if (!fish) {
        return null;
    }

    // Transform sightings to only include relevant location data
    // This filters out internal database fields (like sighting ID, fishId, etc.)
    // and provides a clean API response with only what clients need
    return {
        ...fish,
        sightings: fish.sightings.map(sighting => ({
            latitude: sighting.latitude,
            longitude: sighting.longitude,
            timestamp: sighting.timestamp
        }))
    };
};
