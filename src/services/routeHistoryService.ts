import type { SearchResult } from './searchService';

export interface RouteHistoryItem {
  id: string;
  origin: SearchResult;
  destination: SearchResult;
  timestamp: number;
  route?: any; // Cache of the actual route data
}

const HISTORY_KEY = 'map_route_history';
const ROUTE_CACHE_KEY = 'map_route_cache';
const MAX_HISTORY_ITEMS = 20;

export function saveRouteToHistory(origin: SearchResult, destination: SearchResult, route?: any): void {
  const history = getRouteHistory();
  const newRoute: RouteHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    origin,
    destination,
    timestamp: Date.now(),
    route
  };

  // Add to beginning of array and limit size
  history.unshift(newRoute);
  if (history.length > MAX_HISTORY_ITEMS) {
    history.pop();
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  
  if (route) {
    const cacheKey = generateRouteCacheKey(origin, destination);
    localStorage.setItem(`${ROUTE_CACHE_KEY}_${cacheKey}`, JSON.stringify({
      route,
      timestamp: Date.now()
    }));
  }
}

export function getRouteHistory(): RouteHistoryItem[] {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to parse route history:', error);
    return [];
  }
}

export function clearRouteHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
  
  // Clear route cache
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(ROUTE_CACHE_KEY)) {
      localStorage.removeItem(key);
    }
  });
}

export function getCachedRoute(origin: SearchResult, destination: SearchResult): any | null {
  try {
    const cacheKey = generateRouteCacheKey(origin, destination);
    const cached = localStorage.getItem(`${ROUTE_CACHE_KEY}_${cacheKey}`);
    
    if (!cached) return null;
    
    const { route, timestamp } = JSON.parse(cached);
    
    // Cache expires after 7 days
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`${ROUTE_CACHE_KEY}_${cacheKey}`);
      return null;
    }
    
    return route;
  } catch (error) {
    console.error('Failed to get cached route:', error);
    return null;
  }
}

function generateRouteCacheKey(origin: SearchResult, destination: SearchResult): string {
  return `${origin.location.join(',')}_${destination.location.join(',')}`;
}