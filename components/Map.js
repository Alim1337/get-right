// components/Map.js
import React, { forwardRef, useEffect, useRef, useImperativeHandle } from "react";

// Keep accessToken export so existing imports don't break
export const accessToken = "";

const Map = forwardRef(({ location, mapDestination }, ref) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    showPin,
    showRoad,
    setZoom: (z) => mapInstanceRef.current?.setZoom(z),
  }));

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    if (typeof window === "undefined") return;
    if (mapInstanceRef.current) return; // already initialized

    import("leaflet").then((L) => {
      // Fix default marker icon path issue with Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, { zoomAnimation: false }).setView(
        [location[1], location[0]], // Leaflet uses [lat, lng]
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add current location marker
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

      L.marker([location[1], location[0]], { icon: userIcon })
        .addTo(map)
        .bindPopup("Your location");

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update view when location changes
  useEffect(() => {
    if (mapInstanceRef.current && location) {
      mapInstanceRef.current.setView([location[1], location[0]], 13);
    }
  }, [location]);

  useEffect(() => {
    if (mapDestination) {
      showPin(mapDestination.coordinates, mapDestination.locationName);
    }
  }, [mapDestination]);

  const showPin = (destinationLocation, destinationName, departureLocation = null, departureName = null) => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Remove old markers
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

      // Parse destination
      const [dLng, dLat] = destinationLocation.split(",").map(parseFloat);
      const destMarker = L.marker([dLat, dLng], { icon: makeIcon("#ef4444") })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>Destination:</b> ${destinationName}`)
        .openPopup();
      markersRef.current.push(destMarker);

      // Parse departure if provided
      if (departureLocation) {
        const [depLng, depLat] = departureLocation.split(",").map(parseFloat);
        const depMarker = L.marker([depLat, depLng], { icon: makeIcon("#16a34a") })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Departure:</b> ${departureName}`);
        markersRef.current.push(depMarker);

        // Fit map to show both markers
        const group = L.featureGroup([destMarker, depMarker]);
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [40, 40] });
      } else {
        mapInstanceRef.current.setView([dLat, dLng], 13);
      }
    });
  };

  const showRoad = (startCoords, endCoords, includeBegin = false) => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Remove old route
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
        // startCoords is already an array [lng, lat]
        start = [startCoords[1], startCoords[0]];
        const [eLng, eLat] = endCoords.split(",").map(parseFloat);
        end = [eLat, eLng];
      }

      const polyline = L.polyline([start, end], {
        color: "#4f46e5",
        weight: 4,
        opacity: 0.8,
        dashArray: "8, 4",
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = polyline;
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    });
  };

  return (
    <>
      <style>{`
        .map-container {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        .leaflet-container {
          width: 100%; height: 100%;
          background: #f0f0f0;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapContainerRef} className="map-container" />
    </>
  );
});

Map.displayName = "Map";

export default Map;