import { LatLngTuple } from 'leaflet';
import { getCachedResults, cacheResults } from './cacheService';

export interface SearchResult {
  id: number;
  name: string;
  displayName: string;
  location: LatLngTuple;
  type: string;
  importance: number;
}

interface NominatimResponse {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  name?: string;
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  // Check cache first
  const cachedResults = await getCachedResults(query);
  if (cachedResults) {
    return cachedResults;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data: NominatimResponse[] = await response.json();
    
    const results = data.map((item) => ({
      id: item.place_id,
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      location: [parseFloat(item.lat), parseFloat(item.lon)] as LatLngTuple,
      type: item.type,
      importance: item.importance,
    }));

    // Cache the results
    await cacheResults(query, results);

    return results;
  } catch (error) {
    console.error('Search failed:', error);
    
    // If offline and no cached results, return empty array
    if (!navigator.onLine) {
      console.log('Device is offline, returning empty results');
      return [];
    }
    
    throw error;
  }
}