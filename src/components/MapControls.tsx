import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download, Trash2 } from 'lucide-react';
import { cacheTileRegion, clearTileCache } from '../services/tileService';
import { useMap } from 'react-leaflet';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onResetView }: MapControlsProps) {
  const [isCaching, setIsCaching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const map = useMap();

  const handleCacheTiles = async () => {
    if (!map || isCaching) return;
    
    setIsCaching(true);
    try {
      const bounds = map.getBounds();
      await cacheTileRegion(bounds);
      alert('Map area cached successfully for offline use');
    } catch (error) {
      console.error('Failed to cache map area:', error);
      alert('Failed to cache map area');
    } finally {
      setIsCaching(false);
    }
  };

  const handleClearCache = async () => {
    if (isClearing) return;
    
    if (window.confirm('Are you sure you want to clear the offline map cache?')) {
      setIsClearing(true);
      try {
        await clearTileCache();
        alert('Map cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear map cache:', error);
        alert('Failed to clear map cache');
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={onResetView}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Reset view"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
        <div className="w-full h-px bg-gray-200 my-1" />
        <button
          onClick={handleCacheTiles}
          disabled={isCaching}
          className={`p-2 hover:bg-gray-100 rounded transition-colors ${
            isCaching ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Cache current map area"
        >
          <Download className={`w-5 h-5 text-blue-600 ${isCaching ? 'animate-pulse' : ''}`} />
        </button>
        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className={`p-2 hover:bg-gray-100 rounded transition-colors ${
            isClearing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Clear map cache"
        >
          <Trash2 className={`w-5 h-5 text-red-600 ${isClearing ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </div>
  );
}