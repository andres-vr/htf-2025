class SerperClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = '646676cc8646b0de1251d4329b3b5d0141dbc88c';
    this.baseUrl = 'https://google.serper.dev';
  }

  async searchHotelRatings(query: string): Promise<any> {
    if (!query) {
      throw new Error('Query parameter is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serper API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching hotel ratings from Serper:', error);
      throw error;
    }
  }

  async batchSearch(queries: string[]): Promise<any> {
    if (!queries || queries.length === 0) {
      throw new Error('At least one query is required');
    }

    try {
      const batchPayload = queries.map((q) => ({ q }));
      
      console.log(`[SerperClient] Sending batch request with ${queries.length} queries to /places`);
      
      const response = await fetch(`${this.baseUrl}/places`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Serper batch API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Log the response structure to help debug
      console.log('[SerperClient] Batch response structure:', JSON.stringify(data, null, 2).substring(0, 5000));
      
      return data;
    } catch (error) {
      console.error('Error performing batch search with Serper:', error);
      throw error;
    }
  }
}

export default new SerperClient();