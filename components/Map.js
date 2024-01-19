// components/Map.js
import { useEffect } from "react";
import tw from "tailwind-styled-components";
import mapboxgl from "mapbox-gl";

export const accessToken =
  "pk.eyJ1IjoidGhlYXNzZXQiLCJhIjoiY2tyb3V1ZTZmMWpsMDJubDdha2lsbXYxeSJ9.A_zwqkPVPGP75uNMSHlzNQ";

mapboxgl.accessToken = accessToken;

const Map = ({ location }) => {
  useEffect(() => {
    console.log("Received Coordinates:", location);

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: location,
      zoom: 3,
    });

    addToMap(map, location);

    // Create a bounding box around the single point
    const bounds = new mapboxgl.LngLatBounds(location, location);

    map.fitBounds(bounds, {
      padding: 50,
    });
  }, [location]);

  const addToMap = (map, latLon) =>
    new mapboxgl.Marker().setLngLat(latLon).addTo(map);

  return <Wrapper id="map"></Wrapper>;
};

const Wrapper = tw.div`
    flex-1 h-1/2
`;

export default Map;
