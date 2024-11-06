import React, { useEffect, useState } from "react";
import { Navigation, X, Loader2, Crosshair } from "lucide-react";
import type { SearchResult } from "../services/searchService";
import { searchPlaces } from "../services/searchService";
import { debounce } from "../utils/debounce";

interface DirectionsPanelProps {
  origin: SearchResult | null;
  destination: SearchResult | null;
  onSelectOrigin: (result: SearchResult) => void;
  onSelectDestination: (result: SearchResult) => void;
  onClearDirections: () => void;
  isVisible: boolean;
  handleToggleDirections: () => void;
}

export function DirectionsPanel({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  onClearDirections,
  isVisible,
  handleToggleDirections,
}: DirectionsPanelProps) {
  const [originInput, setOriginInput] = useState<string>(
    (origin?.name || "").toString()
  );
  const [destinationInput, setDestinationInput] = useState<string>(
    (destination?.name || "").toString()
  );
  const [originResults, setOriginResults] = useState<SearchResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<SearchResult[]>(
    []
  );
  const [isLoadingOrigin, setIsLoadingOrigin] = useState(false);
  const [isLoadingDestination, setIsLoadingDestination] = useState(false);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestinationResults, setShowDestinationResults] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (origin && destination) {
      setOriginInput(origin?.displayName);
      setDestinationInput(destination?.name);
    }
  }, [origin, destination]);

  const searchOrigin = debounce(async (query: string) => {
    if (!query.trim()) {
      setOriginResults([]);
      return;
    }
    setIsLoadingOrigin(true);
    try {
      const results = await searchPlaces(query);
      setOriginResults(results);
    } catch (error) {
      console.error("Failed to search origin:", error);
    } finally {
      setIsLoadingOrigin(false);
    }
  }, 300);

  const searchDestination = debounce(async (query: string) => {
    if (!query.trim()) {
      setDestinationResults([]);
      return;
    }
    setIsLoadingDestination(true);
    try {
      const results = await searchPlaces(query);
      setDestinationResults(results);
    } catch (error) {
      console.error("Failed to search destination:", error);
    } finally {
      setIsLoadingDestination(false);
    }
  }, 300);

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOriginInput(value);
    searchOrigin(value);
    setShowOriginResults(true);
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    searchDestination(value);
    setShowDestinationResults(true);
  };

  const handleSelectOriginResult = (result: SearchResult) => {
    onSelectOrigin(result);
    setOriginInput(result.name);
    setShowOriginResults(false);
    setOriginResults([]);
  };

  const handleSelectDestinationResult = (result: SearchResult) => {
    onSelectDestination(result);
    setDestinationInput(result.name);
    setShowDestinationResults(false);
    setDestinationResults([]);
  };

  const handleClear = () => {
    setOriginInput("");
    setDestinationInput("");
    setOriginResults([]);
    setDestinationResults([]);
    setShowOriginResults(false);
    setShowDestinationResults(false);
    onClearDirections();
  };

  const handleUseCurrentLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const results = await searchPlaces(
            `${position.coords.latitude},${position.coords.longitude}`
          );
          if (results.length > 0) {
            const currentLocation: SearchResult = {
              ...results[0],
              name: "Current Location",
              location: [position.coords.latitude, position.coords.longitude],
            };
            handleSelectOriginResult(currentLocation);
          }
        } catch (error) {
          console.error("Failed to get location details:", error);
          alert("Failed to get your current location");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get your current location");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  if (!isVisible) return null;

  return (
    <div className="absolute left-4 top-24 bg-white rounded-lg shadow-lg p-4 w-80 z-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Directions</h2>
        </div>
        <button
          onClick={handleToggleDirections}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close directions"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              From:
            </label>
            <button
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <Crosshair className="w-4 h-4" />
              {isGettingLocation
                ? "Getting location..."
                : "Use current location"}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={originInput}
              onChange={handleOriginChange}
              placeholder="Enter starting point"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {(isLoadingOrigin || isGettingLocation) && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
          </div>
          {showOriginResults && originResults.length > 0 && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              {originResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectOriginResult(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-500">
                    {result.displayName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To:
          </label>
          <div className="relative">
            <input
              type="text"
              value={destinationInput}
              onChange={handleDestinationChange}
              placeholder="Enter destination"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isLoadingDestination && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
          </div>
          {showDestinationResults && destinationResults.length > 0 && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              {destinationResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectDestinationResult(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-500">
                    {result.displayName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleClear}
        className="m-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close directions"
      >
        clear all
      </button>
    </div>
  );
}
