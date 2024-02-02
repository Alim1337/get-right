import React, { forwardRef, useEffect, useRef } from "react";
import tw from "tailwind-styled-components";
import mapboxgl from "mapbox-gl";

export const accessToken =
  "pk.eyJ1IjoidGhlYXNzZXQiLCJhIjoiY2tyb3V1ZTZmMWpsMDJubDdha2lsbXYxeSJ9.A_zwqkPVPGP75uNMSHlzNQ";

mapboxgl.accessToken = accessToken;

const Map = forwardRef(({ location }, ref) => {
  const mapRef = useRef(null);
  const previousMarker = null;

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
        showRoad: showRoad,

      };
    }
  }, [location, ref]);

  const addToMap = (map, latLon) =>
    new mapboxgl.Marker().setLngLat(latLon).addTo(map);


    const showPin = (destinationLocation, destinationName) => {
      if (previousMarker) {
        previousMarker.remove();
      }
    
      const [lat, lng] = destinationLocation.split(',').map(parseFloat);
      console.log('showPin log ', [lat, lng]);
    
      const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([lat, lng])
        .addTo(mapRef.current); // Add marker to map
    
      const popup = new mapboxgl.Popup({ offset: 25 }) // Adjust offset as needed
        .setHTML(destinationName)
        .addTo(mapRef.current); // Add popup to map
    
      marker.setPopup(popup); // Associate popup with marker
    
      // Open the popup immediately after creating the marker
      popup.addTo(mapRef.current);
    
      previousMarker = marker;
    };
    

  const showRoad = (startCoords, endCoords) => {
    const end = endCoords.split(',').map(parseFloat);
    const lineCoordinates = [startCoords, end];
    console.log('showRoad log ', lineCoordinates);

    if (mapRef.current.getSource('route')) {
      mapRef.current.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates,
        },
      });
    } else {
      // Create a new source and layer
      mapRef.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates,
          },
        },
      });

      mapRef.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': 'red',  // Customize line color
          'line-width': 2,       // Customize line width
        },
      });
    }
  };



  return <Wrapper id="map"></Wrapper>;
});

const Wrapper = tw.div`
  flex-1 h-1/2 ml-2 mt-2
`;

export default Map;
