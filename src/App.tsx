import React, { useCallback, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  Map as MapIcon,
  Navigation,
  Wifi,
  WifiOff,
  X,
  History,
  Car,
} from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import { MapControls } from "./components/MapControls";
import { MapController } from "./components/MapController";
import { DirectionsPanel } from "./components/DirectionsPanel";
import { RouteControl } from "./components/RouteControl";
import { LocationDashboard } from "./components/LocationDashboard";
import { CurrentLocationMarker } from "./components/CurrentLocationMarker";
import { RouteHistoryPanel } from "./components/RouteHistoryPanel";
import { useLocationTracking } from "./hooks/useLocationTracking";
import { setupLeaflet } from "./utils/leaflet-setup";
import { getRouteHistory } from "./services/routeHistoryService";
import { createOfflineTileLayer } from "./services/tileService";
import type { SearchResult } from "./services/searchService";
import type { RouteHistoryItem } from "./services/routeHistoryService";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { LatLngTuple } from "leaflet";

function App() {
  const [center, setCenter] = useState<LatLngTuple>([51.505, -0.09]);
  const [zoom, setZoom] = useState(13);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(
    null
  );
  const [showDirections, setShowDirections] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [origin, setOrigin] = useState<SearchResult | null>(null);
  const [destination, setDestination] = useState<SearchResult | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [routeHistory, setRouteHistory] = useState<RouteHistoryItem[]>([]);
  const { locationData, error } = useLocationTracking();

  useEffect(() => {
    setupLeaflet();
    setIsMapReady(true);
    setRouteHistory(getRouteHistory());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (locationData && !selectedLocation && !origin && !destination) {
      setCenter(locationData.position);
    }
    if (origin && destination) {
      setRouteHistory(getRouteHistory());
    }
  }, [locationData, selectedLocation, origin, destination]);

  const handleSearch = useCallback((result: SearchResult) => {
    setSelectedLocation(result);
    setCenter(result.location);
    setZoom(15);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 1, 18));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 1, 1));
  }, []);

  const handleResetView = useCallback(() => {
    if (locationData) {
      setCenter(locationData.position);
    } else {
      setCenter([51.505, -0.09]);
    }
    setZoom(13);
    setSelectedLocation(null);
  }, [locationData]);

  const handleSelectOrigin = useCallback((result: SearchResult) => {
    setOrigin(result);
    setCenter(result?.location);
    setZoom(15);
  }, []);

  const handleSelectDestination = useCallback((result: SearchResult) => {
    setDestination(result);
    setCenter(result?.location);
    setZoom(15);
  }, []);

  const handleClearDirections = useCallback(() => {
    setShowDirections(false);
    setOrigin(null);
    setDestination(null);
  }, []);

  const handleToggleDirections = useCallback(() => {
    setShowDirections((prev) => !prev);
  }, []);

  const handleToggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  const handleSelectHistoryRoute = useCallback(
    (historyItem: RouteHistoryItem) => {
      setOrigin(historyItem.origin);
      setDestination(historyItem.destination);
      setShowHistory(false);
      setShowDirections(true);
    },
    []
  );

  if (!isMapReady) {
    return null;
  }

  if (error) {
    console.error("Location error:", error);
  }

  return (
    <div className="h-screen w-screen relative">
      <div className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-white/90 to-transparent p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Map Trip</h1>
            </div>
            <SearchBar onSearch={handleSearch} />
            <button
              onClick={handleToggleDirections}
              className={`p-2 rounded-lg transition-colors ${
                showDirections
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white hover:bg-gray-100 text-gray-700"
              }`}
              aria-label="Toggle directions"
            >
              <Navigation className="w-5 h-5" />
            </button>
            <button
              onClick={handleToggleHistory}
              className={`p-2 rounded-lg transition-colors ${
                showHistory
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white hover:bg-gray-100 text-gray-700"
              }`}
              aria-label="Show route history"
            >
              <History className="w-5 h-5" />
            </button>
            {origin && destination && !showDirections && (
              <>
                <button
                  onClick={handleClearDirections}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  aria-label="Clear directions"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsVisible((v) => !v);
                  }}
                  className="p-2 rounded-lg bg-sky-100 to-blue-400 hover:bg-sky-200 transition-colors"
                  aria-label="show/hide steps"
                >
                  <Car className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-5 h-5" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DirectionsPanel
        origin={origin}
        destination={destination}
        onSelectOrigin={handleSelectOrigin}
        onSelectDestination={handleSelectDestination}
        onClearDirections={handleClearDirections}
        isVisible={showDirections}
        handleToggleDirections={handleToggleDirections}
      />

      <RouteHistoryPanel
        isVisible={showHistory}
        onClose={handleToggleHistory}
        history={routeHistory}
        onSelectRoute={handleSelectHistoryRoute}
      />

      {origin && destination && (
        <div className="absolute top-24 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-gray-900">
                From: {origin.name}
              </div>
              <div className="truncate text-sm font-medium text-gray-900">
                To: {destination.name}
              </div>
            </div>
            {!showDirections && (
              <button
                onClick={handleToggleDirections}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Show directions"
              >
                <Navigation className="w-5 h-5 text-blue-600" />
              </button>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
      >
        <MapController onZoomChange={setZoom} center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locationData && <CurrentLocationMarker locationData={locationData} />}
        {selectedLocation && !origin && !destination && (
          <Marker position={selectedLocation.location}>
            <Popup>
              <div className="p-2">
                <h3 className="font-medium">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedLocation.displayName}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        {origin && destination && (
          <RouteControl
            origin={origin}
            destination={destination}
            isVisible={isVisible}
          />
        )}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
        />
      </MapContainer>

      <LocationDashboard locationData={locationData} />
    </div>
  );
}

export default App;