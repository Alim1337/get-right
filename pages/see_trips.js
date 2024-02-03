import React, { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import Map from "../components/Map";
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
import { useRouter } from "next/router";
import { useRef } from "react";

const SeeTrips = () => {
  const mapRef = useRef(null); // Create a ref for the Map component
  const [location, setLocation] = useState([44, 36.2]);

  const [trips, setTrips] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [userId, setUserId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [mapDestination, setMapDestination] = useState(null);
  const router = useRouter();
  const myPosition = [0, 0];

  const [seatError, setSeatError] = useState('');
  const [dateError, setDateError] = useState('');
  const [rideDetails, setRideDetails] = useState({
    departure: '',
    destination: '',
    date: '',
    time: '',
    seatsAvailable: 0,
  });
  const [pickup, setPickup] = useState({
    coordinates: [0, 0],
    locationName: "",
  });
  const [dropoff, setDropoff] = useState({
    coordinates: [0, 0],
    locationName: "",
  });
  const [map, setMap] = useState(null);
  const [line, setLine] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push('/login');
    }
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setUserId(decodedToken.userId);
  }, []);
  useEffect(() => {
    setPickup(`(${pickup.locationName})`);
    setDropoff(dropoff ? dropoff.locationName : "");
  }, [pickup, dropoff]);
  useEffect(() => {
    const updateLocation = async () => {
      try {
        const position = await getCurrentLocation();
        console.log("Updated Location:", position.coords);
        setLocation([position.coords.longitude, position.coords.latitude]);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    updateLocation();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getTrips");
        if (response.ok) {
          const data = await response.json();
          setTrips(data);
        } else {
          console.error("Failed to fetch trips data");
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchData();
  }, []);
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );

      setTimeout(() => navigator.geolocation.clearWatch(watchId), 5000);
    });
  };

  const setupMap = async () => {
    if (!mapboxgl) {
      console.error('Mapbox GL JS library not loaded.');
      return;
    }
    mapboxgl.accessToken = accessToken;
    console.log("Setting up map...");

    try {
      const position = await getCurrentLocation();
      const currentLocation = {
        coordinates: [position.coords.longitude, position.coords.latitude],
        locationName: await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        ),
      };
      setPickup(currentLocation);
      setupMapWithPickup(currentLocation);
      myPosition = currentLocation.coordinates;
    } catch (error) {
      console.error("Error getting current location:", error);
      setupMapWithPickup({
        coordinates: [0, 0],
        locationName: "Unknown Location",
      });
    }
  };

  const setupMapWithPickup = (pickupLocation) => {
    const newMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: pickupLocation.coordinates,
      zoom: 12,
    });

    // Add marker for current position
    new mapboxgl.Marker({ color: "green" })
      .setLngLat(pickupLocation.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(pickupLocation.locationName))
      .addTo(newMap);

    let previousMarker = null;

    newMap.on("dblclick", async (event) => {
      const lngLat = event.lngLat.toArray();
      const locationName = await reverseGeocode(lngLat[1], lngLat[0]);
      setDropoff({ coordinates: lngLat, locationName });

      // Draw or update the line between pickup and dropoff
      drawOrUpdateLine(myPosition, lngLat, newMap);

      // Create marker at the clicked location
      previousMarker = createMarker(lngLat, newMap, locationName, previousMarker);



    });


    setMap(newMap);
  };

 
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`
      );
      const data = await response.json();
      const locationName = data.features[0]?.place_name || "Unknown Location";
      return locationName;
    } catch (error) {
      console.error("Error fetching reverse geocoding:", error);
      return "Unknown Location";
    }
  };

  const addPickupMarker = (lngLat, locationName) => {
    if (map) {
      new mapboxgl.Marker({ color: "green" })
        .setLngLat(lngLat)
        .setPopup(new mapboxgl.Popup().setHTML(locationName))
        .addTo(map);
    }
  };

  const addDropoffMarker = (lngLat, locationName) => {
    if (map) {
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat(lngLat)
        .setPopup(new mapboxgl.Popup().setHTML(locationName))
        .addTo(map);
    }
  };
  const drawLine = () => {
    if (map && pickup && dropoff) {
      // Add a marker for Pickup Location
      addPickupMarker(pickup.coordinates, "Pickup Location");

      // Add a marker for Destination
      addDestinationMarker(dropoff.coordinates, "Destination");

      // Create a line between pickup and destination
      const newLine = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [pickup.coordinates, dropoff.coordinates],
        },
      };

      const sourceId = 'line-source';

      // Check if the source already exists, remove it if it does
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
        map.removeLayer('line-layer');
      }

      // Add the line to the map
      map.addSource(sourceId, {
        type: 'geojson',
        data: newLine,
      });

      map.addLayer({
        id: 'line-layer',
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'red',
          'line-width': 2,
        },
      });

      // Fit the map to the new line
      map.fitBounds([pickup.coordinates, dropoff.coordinates], { padding: 50 });

      setLine(newLine);
    }
  };
  const drawOrUpdateLine = (startCoords, endCoords, map) => {
    const lineCoordinates = [startCoords, endCoords];
    console.log('lineCoordinates', lineCoordinates);

    if (map.getSource('route')) {
      map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates,
        },
      });
    } else {
      // Create a new source and layer
      map.addSource('route', {
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

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': 'blue',  // Customize line color
          'line-width': 2,       // Customize line width
        },
      });
    }
  };

  const createMarker = (lngLat, map, popupContent, previousMarker) => {
    // Remove previous marker
    if (previousMarker) {
      previousMarker.remove();
    }

    // Add new marker
    const marker = new mapboxgl.Marker({ color: "blue" })
      .setLngLat(lngLat)
      .addTo(map);

      const popup = new mapboxgl.Popup({ offset: 25 }) // Adjust offset as needed
        .setHTML(popupContent)
        .addTo(map);

        marker.setPopup(popup); // Associate popup with marker

      // Open the popup immediately after creating the marker
      popup.addTo(map);

      return marker;
  };
  useEffect(() => {
    setupMap();
  }, []);
  // Helper function to calculate zoom level based on bounds
  const getZoomLevel = (bounds, map) => {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    const ne = map.project(bounds.getNorthEast());
    const sw = map.project(bounds.getSouthWest());

    const dx = ne.x - sw.x;
    const dy = ne.y - sw.y;

    for (let zoom = ZOOM_MAX; zoom >= 0; --zoom) {
      if (dx <= WORLD_DIM.width && dy <= WORLD_DIM.height) {
        return zoom;
      }
      dx /= 2;
      dy /= 2;
    }

    return 0;
  };



  // Example function to add a line to the map using GeoJSON source and layer
  const addLineToMap = (coordinates) => {
    map.addSource('line-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
    });

    map.addLayer({
      id: 'line-layer',
      type: 'line',
      source: 'line-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': 'red',
        'line-width': 2,
      },
    });
  };
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleRequestSeat = (tripId) => {
    setSelectedSeats((prev) => ({
      ...prev,
      [tripId]: (prev[tripId] || 0) + 1,
    }));

    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.tripId === tripId
          ? { ...trip, availableSeats: trip.availableSeats - 1 }
          : trip
      )
    );

    showNotification("Seat requested successfully", "success");
  };

  const handleSubmit = async (tripId) => {
    try {
      const response = await fetch("/api/requestSeat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          tripId: tripId,
          nbr_seat_req: selectedSeats[tripId] || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Seat requested successfully:", data);
        showNotification("Seat requested successfully", "success");
      } else {
        console.error("Failed to request seat");
        showNotification(
          "Failed to request seat. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error requesting seat:", error);
      showNotification(
        "An error occurred while requesting the seat. Please try again.",
        "error"
      );
    }
  };

  const handleShowOnMap = (destinationLocation) => {
    setMapDestination(destinationLocation);
  };
  return (
    <Wrapper>
      <ButtonContainer>
        <Link href="/" passHref>
          <BackButton>
            <BsArrowLeft size={30} />
          </BackButton>
        </Link>
      </ButtonContainer>
      <Map ref={mapRef} location={location} />

      <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-10">
        All the trips
      </h1>

      <div className="grid grid-cols-3 gap-8">
        {trips.map((trip) => (
          <div
            key={trip.tripId}
            className="p-8 border-4 border-indigo-600 rounded-2xl shadow-2xl bg-white transform hover:scale-110 transition-transform duration-200"
          >
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">
              Departure: {trip.departureLocation}
            </p>
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">
              Destination: {trip.destinationLocation}
            </p>
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">

  distance: {trip.distance.toFixed(2)}
  km
</p>
<p className="text-3xl font-extrabold text-indigo-900 mb-3">
  Departure Time: {new Date(trip.departureTime).toLocaleString()}
</p>

<p className="text-3xl font-extrabold text-indigo-900 mb-3">
              Available Seats: {trip.availableSeats}
            </p>
            <div className="flex justify-between mt-4">
              <Button onClick={() => handleRequestSeat(trip.tripId)}>
                Request Seat
              </Button>
              <Button onClick={() => handleSubmit(trip.tripId)}>Submit</Button>
              <ButtonMap onClick={() => handleShowOnMap(trip.destinationLocation)}>
                Show in Map
              </ButtonMap>
            </div>
          </div>
        ))}
      </div>
      {notification && (
        <NotificationContainer type={notification.type}>
          {notification.message}
        </NotificationContainer>
      )}
    </Wrapper>
  );
};

const ButtonMap = tw.button`
className=" bg-green-500 text-white px-4 py-2 rounded-full text-lg font-roboto my-3 leading-normal transition-all duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 active:bg-green-700
`;

const Button = tw.button`
mt-2 self-end bg-indigo-500 text-white py-3 px-6 gap-2 rounded-full flex justify-center items-center hover:bg-indigo-700 transition-colors duration-200
`;
const Wrapper = tw.div`
  p-4 bg-gray-200 h-screen
`;

const ButtonContainer = tw.div`
bg-white p-4 h-16
`;

const BackButton = tw.button`
hover:bg-gray-300 transition-colors duration-200
`;


const NotificationContainer = tw.div`
  fixed bottom-0 right-0 p-4 mb-4 mr-4 bg-green-500 text-white rounded-md
`;

const MapContainer = tw.div`
  flex-1 w-full rounded-xl
`;


export default SeeTrips;
