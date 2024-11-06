import localforage from 'localforage';
import type { TileEvent } from 'leaflet';

const TILE_CACHE = 'map-tiles-cache';
const MAX_ZOOM = 18;
const MIN_ZOOM = 10;

// Initialize localforage instance for tiles
const tileStore = localforage.createInstance({
  name: TILE_CACHE,
  storeName: 'tiles'
});

export async function cacheTileRegion(bounds: L.LatLngBounds): Promise<void> {
  const urls: string[] = [];
  
  // Calculate tile URLs for the visible area
  for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    
    const tileBounds = {
      minX: Math.floor((southWest.lng + 180) / 360 * Math.pow(2, z)),
      maxX: Math.floor((northEast.lng + 180) / 360 * Math.pow(2, z)),
      minY: Math.floor((1 - Math.log(Math.tan(northEast.lat * Math.PI / 180) + 1 / Math.cos(northEast.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z)),
      maxY: Math.floor((1 - Math.log(Math.tan(southWest.lat * Math.PI / 180) + 1 / Math.cos(southWest.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z))
    };
    
    for (let x = tileBounds.minX; x <= tileBounds.maxX; x++) {
      for (let y = tileBounds.minY; y <= tileBounds.maxY; y++) {
        const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        urls.push(url);
      }
    }
  }

  // Cache all tiles
  try {
    const cache = await caches.open('map-tiles');
    await Promise.all(
      urls.map(async url => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.error(`Failed to cache tile: ${url}`, error);
        }
      })
    );
  } catch (error) {
    console.error('Failed to cache tiles:', error);
  }
}

export async function clearTileCache(): Promise<void> {
  try {
    await tileStore.clear();
    const cache = await caches.open('map-tiles');
    await cache.keys().then(keys => {
      keys.forEach(key => {
        cache.delete(key);
      });
    });
  } catch (error) {
    console.error('Failed to clear tile cache:', error);
  }
}

export function createOfflineTileLayer(): L.TileLayer {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: MAX_ZOOM,
    attribution: '© OpenStreetMap contributors',
    crossOrigin: true,
    className: 'map-tiles'
  });
}