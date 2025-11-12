/**
 * Diving Center Service
 *
 * Manages diving center data and operations.
 * This service provides access to information about all diving centers
 * in the system, including their locations and details.
 */

import {PrismaClient} from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * Retrieves all diving centers from the database.
 *
 * Fetches complete information for all registered diving centers,
 * including their names, locations, and any other associated metadata.
 * This is typically used to populate maps or provide users with a list
 * of available diving locations.
 */
export const getAllDivingCenters = async () => {
    // Retrieve all diving centers without any filtering
    // Returns complete records with all fields
    return prisma.divingCenter.findMany();
};