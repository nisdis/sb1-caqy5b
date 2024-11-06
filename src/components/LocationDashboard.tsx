import React from 'react';
import { Compass, Navigation2, Mountain } from 'lucide-react';
import type { LocationData } from '../hooks/useLocationTracking';

interface LocationDashboardProps {
  locationData: LocationData | null;
}

export function LocationDashboard({ locationData }: LocationDashboardProps) {
  if (!locationData) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
      <div className="flex items-center justify-between md:justify-center md:gap-6">
        <div className="flex items-center gap-2">
          <Navigation2 className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Speed</div>
            <div className="text-lg font-semibold">
              {locationData.speed ? `${Math.round(locationData.speed * 3.6)} km/h` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Compass 
            className="w-5 h-5 text-blue-600"
            style={{ transform: `rotate(${locationData.heading || 0}deg)` }}
          />
          <div>
            <div className="text-sm font-medium text-gray-600">Heading</div>
            <div className="text-lg font-semibold">
              {locationData.heading ? `${Math.round(locationData.heading)}°` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Altitude</div>
            <div className="text-lg font-semibold">
              {locationData.altitude ? `${Math.round(locationData.altitude)}m` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}