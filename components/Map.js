// components/Map.js
import React, { forwardRef, useEffect, useRef, useImperativeHandle } from "react";

export const accessToken = "";

const Map = forwardRef(({ location, mapDestination }, ref) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const isMountedRef = useRef(true); // track mount state

  useImperativeHandle(ref, () => ({
    showPin,
    showRoad,
    setZoom: (z) => {
      if (mapInstanceRef.current && isMountedRef.current) {
        mapInstanceRef.current.setZoom(z);
      }
    },
  }));

  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window === "undefined") return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || !isMountedRef.current) return;

      import("leaflet").then((L) => {
        if (mapInstanceRef.current || !isMountedRef.current) return;
        if (!mapContainerRef.current) return;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const center = location ? [location[1], location[0]] : [36.7, 3.0];

        const map = L.map(mapContainerRef.current, {
          zoomAnimation: false,      // prevents _leaflet_pos error on unmount
          fadeAnimation: false,      // prevents animation errors
          markerZoomAnimation: false,
          preferCanvas: true,
        }).setView(center, 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const userIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:14px;height:14px;
            background:#4f46e5;
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        L.marker(center, { icon: userIcon })
          .addTo(map)
          .bindPopup("Your location");

        mapInstanceRef.current = map;
      }).catch((err) => {
        console.error("Leaflet load error:", err);
      });
    }, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off(); // remove all event listeners first
          mapInstanceRef.current.remove();
        } catch (e) {
          // swallow cleanup errors silently
        }
        mapInstanceRef.current = null;
      }

      markersRef.current = [];
      routeLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && location && isMountedRef.current) {
      try {
        mapInstanceRef.current.setView([location[1], location[0]], 13);
      } catch (e) { /* ignore */ }
    }
  }, [location]);

  useEffect(() => {
    if (mapDestination && isMountedRef.current) {
      showPin(mapDestination.coordinates, mapDestination.locationName);
    }
  }, [mapDestination]);

  const showPin = (destinationLocation, destinationName, departureLocation = null, departureName = null) => {
    if (!mapInstanceRef.current || !isMountedRef.current) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current || !isMountedRef.current) return;

      try {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const makeIcon = (color) => L.divIcon({
          className: "",
          html: `<div style="
            width:16px;height:16px;
            background:${color};
            border:3px solid #fff;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const [dLng, dLat] = destinationLocation.split(",").map(parseFloat);
        if (isNaN(dLat) || isNaN(dLng)) return;

        const destMarker = L.marker([dLat, dLng], { icon: makeIcon("#ef4444") })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Destination:</b> ${destinationName}`)
          .openPopup();
        markersRef.current.push(destMarker);

        if (departureLocation) {
          const [depLng, depLat] = departureLocation.split(",").map(parseFloat);
          if (!isNaN(depLat) && !isNaN(depLng)) {
            const depMarker = L.marker([depLat, depLng], { icon: makeIcon("#16a34a") })
              .addTo(mapInstanceRef.current)
              .bindPopup(`<b>Departure:</b> ${departureName}`);
            markersRef.current.push(depMarker);
            const group = L.featureGroup([destMarker, depMarker]);
            mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [40, 40] });
          }
        } else {
          mapInstanceRef.current.setView([dLat, dLng], 13);
        }
      } catch (e) { console.error("showPin error:", e); }
    });
  };

  const showRoad = (startCoords, endCoords, includeBegin = false) => {
    if (!mapInstanceRef.current || !isMountedRef.current) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current || !isMountedRef.current) return;

      try {
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
          routeLayerRef.current = null;
        }

        let start, end;

        if (includeBegin) {
          const [sLng, sLat] = startCoords.split(",").map(parseFloat);
          const [eLng, eLat] = endCoords.split(",").map(parseFloat);
          start = [sLat, sLng];
          end = [eLat, eLng];
        } else {
          start = [startCoords[1], startCoords[0]];
          const [eLng, eLat] = endCoords.split(",").map(parseFloat);
          end = [eLat, eLng];
        }

        if (isNaN(start[0]) || isNaN(end[0])) return;

        const polyline = L.polyline([start, end], {
          color: "#4f46e5",
          weight: 4,
          opacity: 0.8,
          dashArray: "8, 4",
        }).addTo(mapInstanceRef.current);

        routeLayerRef.current = polyline;
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      } catch (e) { console.error("showRoad error:", e); }
    });
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .map-container {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        .leaflet-container {
          width: 100%; height: 100%;
          background: #e8e8e8;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapContainerRef} className="map-container" suppressHydrationWarning />
    </>
  );
});

Map.displayName = "Map";

export default Map;