import React, { forwardRef, useEffect, useRef } from "react";
import tw from "tailwind-styled-components";
import mapboxgl from "mapbox-gl";

export const accessToken =
  "pk.eyJ1IjoidGhlYXNzZXQiLCJhIjoiY2tyb3V1ZTZmMWpsMDJubDdha2lsbXYxeSJ9.A_zwqkPVPGP75uNMSHlzNQ";

mapboxgl.accessToken = accessToken;

const Map = forwardRef(({ location }, ref) => {
  const mapRef = useRef(null);

  useEffect(() => {
    console.log("Received Coordinates:", location);

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: location,
      zoom: 3,
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
        showPin: showPin, // Add showPin to the ref
      };
    }
  }, [location, ref]);

  const addToMap = (map, latLon) =>
    new mapboxgl.Marker().setLngLat(latLon).addTo(map);

    const showPin = (destinationLocation) => {
      const [lat, lng] = destinationLocation.split(',').map(parseFloat);
      console.log('showPin log ', [lat, lng]);
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    };
    
    

  return <Wrapper id="map"></Wrapper>;
});

const Wrapper = tw.div`
  flex-1 h-1/2 ml-2 mt-2
`;

export default Map;
