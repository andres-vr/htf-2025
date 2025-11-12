import SerperClient from "../clients/serper";

interface SerperFishData {
  description: string | null;
  descriptionLink: string | null;
  scientificName: string | null;
}

export async function fetchAndSendFishData(query: string): Promise<SerperFishData | null> {
  console.log('🐟 [FishSerper] Fetching data for:', query);

  try {
    const data = await SerperClient.searchHotelRatings(query);
    const knowledgeGraph = data?.knowledgeGraph;

    const serperData: SerperFishData = {
      description: knowledgeGraph?.description || null,
      descriptionLink: knowledgeGraph?.descriptionLink || null,
      scientificName: knowledgeGraph?.attributes?.["Scientific name"] || null,
    };

    // Send to backend
    console.log('📤 [FishSerper] Sending data to backend...');
    const backendResponse = await fetch('http://localhost:5555/api/fish/serper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...serperData })
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend returned ${backendResponse.status}`);
    }

    console.log('✅ [FishSerper] Successfully sent data to backend');
    return serperData;

  } catch (error) {
    console.error('❌ [FishSerper] Error:', error);
    return null;
  }
}

/**
 * Fetch enrichment data from Serper for a query but do not POST it back.
 * Returns the same SerperFishData shape or null on error.
 */
export async function fetchFishData(query: string): Promise<SerperFishData | null> {
  console.log('🐟 [FishSerper] fetchFishData for:', query);
  try {
    const data = await SerperClient.searchHotelRatings(query);
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