/// <reference types="vite/client" />

declare module 'leaflet-routing-machine' {
  import * as L from 'leaflet';

  namespace Routing {
    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      routeWhileDragging?: boolean;
      addWaypoints?: boolean;
      draggableWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
      showAlternatives?: boolean;
      lineOptions?: {
        styles?: {
          color: string;
          opacity: number;
          weight: number;
        }[];
      };
    }

    class Control extends L.Control {
      constructor(options: RoutingControlOptions);
      getPlan(): any;
      getRouter(): any;
      route(): void;
    }

    namespace control {
      function (options: RoutingControlOptions): Control;
    }
  }

  export = Routing;
}