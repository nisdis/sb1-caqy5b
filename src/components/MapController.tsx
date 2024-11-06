import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

interface MapControllerProps {
  onZoomChange: (zoom: number) => void;
  center?: LatLngTuple;
  zoom?: number;
}

export function MapController({ onZoomChange, center, zoom }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on('zoom', handleZoom);
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map, onZoomChange]);

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1,
      });
    }
  }, [map, center, zoom]);

  return null;
}