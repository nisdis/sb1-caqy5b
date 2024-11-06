import { useState, useEffect } from 'react';
import type { LatLngTuple } from 'leaflet';

export interface LocationData {
  position: LatLngTuple;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  accuracy: number;
  timestamp: number;
}

export function useLocationTracking() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocationData({
          position: [position.coords.latitude, position.coords.longitude],
          speed: position.coords.speed,
          heading: position.coords.heading,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { locationData, error };
}