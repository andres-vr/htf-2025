import SerperClient from "../clients/serper";

interface SerperFishData {
  description: string | null;
  descriptionLink: string | null;
  scientificName: string | null;
}

/**
 * Fetch enrichment data from Serper for a query but do not POST it back.
 * Returns the same SerperFishData shape or null on error.
 */
export async function fetchFishData(query: string): Promise<SerperFishData | null> {
  console.log('🐟 [FishSerper] fetchFishData for:', query);
  try {
    const data = await SerperClient.searchFish(query);
    const knowledgeGraph = data?.knowledgeGraph;

    const serperData: SerperFishData = {
      description: knowledgeGraph?.description || null,
      descriptionLink: knowledgeGraph?.descriptionLink || null,
      scientificName: knowledgeGraph?.attributes?.["Scientific name"] || null,
    };

    return serperData;
  } catch (error) {
    console.error('❌ [FishSerper] fetchFishData error:', error);
    return null;
  }
}