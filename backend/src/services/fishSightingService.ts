/**
 * Fish Sighting Service
 *
 * Manages the creation and maintenance of fish sightings in the system.
 * This service handles updating sighting locations and maintaining a rolling window
 * of recent sightings for each fish species.
 */

import {FishRarity, PrismaClient} from '../generated/prisma';
import {randomPointInCircle} from './geoPointService';

const prisma = new PrismaClient();

/**
 * Updates fish sightings for a specific rarity level.
 *
 * This function creates new sightings for a random selection of fish and maintains
 * a maximum of 10 sightings per fish by removing the oldest sighting when necessary.
 *
 * Behavior by rarity:
 * - COMMON: Updates 1 to all fish (at least 1 guaranteed)
 * - Other rarities: Updates 0 to 1 fish (may not update any)
 */
export const updateFishSightings = async (rarity: FishRarity) => {
    // Fetch all fish of the specified rarity with their sightings
    // Sightings are ordered newest to oldest (desc) for easy access to oldest sighting
    const allFish = await prisma.fish.findMany({
        where: {rarity},
        include: {
            sightings: {
                orderBy: {
                    timestamp: 'desc'
                }
            }
        }
    });

    // Determine how many fish to update based on rarity
    // COMMON fish: Always update at least 1, up to all of them
    // Other rarities: May update 0 or 1 fish (making them more unpredictable)
    const minToUpdate = rarity === FishRarity.COMMON ? 1 : 0;
    const maxToUpdate = rarity === FishRarity.COMMON ? allFish.length : 1;
    const numToUpdate = Math.floor(Math.random() * (maxToUpdate - minToUpdate + 1)) + minToUpdate;

    // Randomly shuffle the fish array and select the number to update
    // This ensures random selection without bias toward any particular fish
    const shuffled = [...allFish].sort(() => Math.random() - 0.5);
    const fishToUpdate = shuffled.slice(0, numToUpdate);

    // Arrays to batch database operations for efficiency
    const sightingsToDelete = [];
    const newSightings = [];

    // Process each selected fish
    for (const fish of fishToUpdate) {
        // Maintain a rolling window of max 10 sightings per fish
        // If at capacity, mark the oldest sighting for deletion
        // (oldest is at end of array due to 'desc' ordering)
        if (fish.sightings.length === 10) {
            const oldestSighting = fish.sightings[fish.sightings.length - 1];
            sightingsToDelete.push(oldestSighting.id);
        }

        // Generate a new sighting with a random location within the search area
        // Each sighting gets the current timestamp to track when it was created
        const location = randomPointInCircle();
        newSightings.push({
            fishId: fish.id,
            latitude: location.lat,
            longitude: location.lon,
            timestamp: new Date()
        });
    }

    // Batch delete oldest sightings to maintain the 10-sighting limit
    // Only execute if there are sightings to delete
    if (sightingsToDelete.length > 0) {
        await prisma.fishSighting.deleteMany({
            where: {
                id: {
                    in: sightingsToDelete
                }
            }
        });
    }

    // Batch create all new sightings in a single database operation
    await prisma.fishSighting.createMany({
        data: newSightings
    });

    console.log(`Updated sightings for ${fishToUpdate.length} out of ${allFish.length} ${rarity} fish at ${new Date().toISOString()}`);
};