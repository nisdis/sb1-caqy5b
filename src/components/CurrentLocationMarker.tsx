import React from 'react';
import { Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { LocationData } from '../hooks/useLocationTracking';

interface CurrentLocationMarkerProps {
  locationData: LocationData;
}

const createLocationIcon = () => {
  return L.divIcon({
    className: 'custom-location-marker',
    html: `
      <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative">
        <div class="absolute -inset-1 bg-blue-500/20 rounded-full animate-ping"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

export function CurrentLocationMarker({ locationData }: CurrentLocationMarkerProps) {
  return (
    <>
      <Circle
        center={locationData.position}
        radius={locationData.accuracy}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 1,
        }}
      />
      <Marker
        position={locationData.position}
        icon={createLocationIcon()}
      />
    </>
  );
}