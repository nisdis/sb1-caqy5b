import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import type { SearchResult } from "../services/searchService";
import { getCachedRoute } from "../services/routeHistoryService";
import { saveRouteToHistory } from "../services/routeHistoryService";

interface RouteControlProps {
  origin: SearchResult;
  destination: SearchResult;
  isVisible: boolean;
}

export function RouteControl({
  origin,
  destination,
  isVisible,
}: RouteControlProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !origin || !destination) return;

    const cachedRoute = getCachedRoute(origin, destination);

    const routingControl = L.Routing.control({
      //router: L.Routing.osrmv1({
      //  serviceUrl: "http://localhost:5000/route/v1",
      //}),
      waypoints: [
        L.latLng(origin.location[0], origin.location[1]),
        L.latLng(destination.location[0], destination.location[1]),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      // draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        extendToWaypoints: true, // Ensure this property is set
        missingRouteTolerance: 10,
        styles: [
          { color: "#4A90E2", opacity: 0.5, weight: 6 },
          { color: "#2E75CC", opacity: 0.8, weight: 4 },
        ],
      },
    }).addTo(map);

    // If we have a cached route, use it
    if (cachedRoute) {
      routingControl.setWaypoints(cachedRoute.waypoints);
    } else {
      // Save the route once it's calculated
      routingControl.on("routesfound", (e) => {
        saveRouteToHistory(origin, destination, {
          waypoints: e.waypoints,
          routes: e.routes,
        });
      });
    }

    if (isVisible) {
      routingControl.show();
    } else {
      routingControl.hide();
    }

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, origin, destination, isVisible]);

  return null;
}
