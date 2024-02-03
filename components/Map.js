// components/Map.js

import React, { forwardRef, useEffect, useRef } from "react";
import tw from "tailwind-styled-components";
import mapboxgl from "mapbox-gl";

export const accessToken =
  "pk.eyJ1IjoidGhlYXNzZXQiLCJhIjoiY2tyb3V1ZTZmMWpsMDJubDdha2lsbXYxeSJ9.A_zwqkPVPGP75uNMSHlzNQ";

mapboxgl.accessToken = accessToken;

const Map = forwardRef(({ location, mapDestination }, ref) => {
  const mapRef = useRef(null);
  let previousMarkers = [];

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: location,
      zoom: 2,
    });

    addToMap(map, location);

    const bounds = new mapboxgl.LngLatBounds(location, location);

    map.fitBounds(bounds, {
      padding: 50,
    });

    // Attach the map instance to the ref
    mapRef.current = map;

    // Attach the ref to the map component
    if (ref) {
      ref.current = {
        ...mapRef.current,
        showPin: showPin,
        showRoad: showRoad,
      };
    }
  }, [location, ref]);

  useEffect(() => {
    if (mapDestination) {
      showPin(mapDestination.coordinates, mapDestination.locationName);
    }
  }, [mapDestination]);

  const addToMap = (map, latLon) => new mapboxgl.Marker().setLngLat(latLon).addTo(map);



  const showPin = (
    destinationLocation,
    destinationName,
    departureLocation = null,
    departureName = null
  ) => {
    // Remove any existing markers
    previousMarkers.forEach((marker) => marker.remove());
    previousMarkers = [];

    // Handle destination pin (always present)
    const [lat, lng] = destinationLocation.split(",").map(parseFloat);
    const destinationMarker = new mapboxgl.Marker({ color: "red" })
      .setLngLat([lat, lng])
      .addTo(mapRef.current);
    const destinationPopup = new mapboxgl.Popup({ offset: 25 })
      .setHTML("Destination: " + destinationName)
      .addTo(mapRef.current);
    destinationMarker.setPopup(destinationPopup);
    previousMarkers.push(destinationMarker);

    // Handle departure pin (optional)
    if (departureLocation) {
      const [departureLat, departureLng] = departureLocation.split(",").map(
        parseFloat
      );
      const departureMarker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([departureLat, departureLng])
        .addTo(mapRef.current);
      const departurePopup = new mapboxgl.Popup({ offset: 25 })
        .setHTML("Departure: " + departureName)
        .addTo(mapRef.current);
      departureMarker.setPopup(departurePopup);
      previousMarkers.push(departureMarker);
    }
  };

  const showRoad = (startCoords, endCoords, includeBegin = false) => {
    const end = endCoords.split(",").map(parseFloat);
    const lineCoordinates = includeBegin
      ? [startCoords.split(",").map(parseFloat), end]
      : [startCoords, end];

    if (mapRef.current.getSource("route")) {
      mapRef.current.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: lineCoordinates,
        },
      });
    } else {
      mapRef.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
          },
        },
      });

      mapRef.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        paint: {
          "line-color": "red",
          "line-width": 2,
        },
      });
    }
  };


  return <Wrapper id="map"></Wrapper>;
});

Map.displayName = 'Map';

const Wrapper = tw.div`
  flex-1 h-1/2 ml-2 mt-2
`;

export default Map;