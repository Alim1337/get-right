import React, { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import Map from "../components/Map";
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
const SeeTrips = () => {
  const [trips, setTrips] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [userId, setUserId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [mapDestination, setMapDestination] = useState(null);

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
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setUserId(decodedToken.userId);
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
    mapboxgl.accessToken = accessToken;

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
    } catch (error) {
      console.error("Error getting current location:", error);
      setupMapWithPickup({
        coordinates: [0, 0],
        locationName: "Unknown Location",
      });
    }
  };
  const setupMapWithPickup = (pickupLocation) => {
    const addPickupMarker = (lngLat, locationName) => {
      if (map) {
        new mapboxgl.Marker({ color: "green" })
          .setLngLat(lngLat)
          .setPopup(new mapboxgl.Popup().setHTML(locationName))
          .addTo(map);
      }
    };

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

    // Add marker for Pickup Location
    addPickupMarker(pickupLocation.coordinates, pickupLocation.locationName);

    newMap.on("dblclick", async (event) => {
      const lngLat = event.lngLat.toArray();
      const locationName = await reverseGeocode(lngLat[1], lngLat[0]);
      setDropoff({ coordinates: lngLat, locationName });

      // Add marker for destination location
      addDropoffMarker(lngLat, locationName);

      drawLine();
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
      <h1 className="text-4xl font-bold text-center text-blue-600">
        All the trips
      </h1>
      <MapContainer>
              {/* Pass the location information to the Map component */}
         
            </MapContainer>

    
      <div className="grid grid-cols-3 gap-4 mt-8">
        {trips.map((trip) => (
          <div
            key={trip.tripId}
            className="p-4 border-2 border-blue-600 rounded-lg shadow-lg"
          >
            <p className="text-xl font-semibold text-blue-800">
              Departure: {trip.departureLocation}
            </p>
            <p className="text-xl font-semibold text-blue-800">
              Destination: {trip.destinationLocation}
            </p>
            <p className="text-lg text-gray-700">
              Departure Time: {trip.departureTime.toString()}
            </p>
            <p className="text-lg text-gray-700">
              Available Seats: {trip.availableSeats}
            </p>
            <div className="flex justify-between mt-4">
              <Button onClick={() => handleRequestSeat(trip.tripId)}>
                Request Seat
              </Button>
              <Button onClick={() => handleSubmit(trip.tripId)}>Submit</Button>
              <ButtonMap
                onClick={() => handleShowOnMap(trip.destinationLocation)}
              >
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
  bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer
`;

const Button = tw.button`
  bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer
`;

const Wrapper = tw.div`
  p-4 bg-gray-200 h-screen
`;

const ButtonContainer = tw.div`
  bg-white p-2 h-12
`;

const BackButton = tw.button``;

const NotificationContainer = tw.div`
  fixed bottom-0 right-0 p-4 mb-4 mr-4 bg-green-500 text-white rounded-md
`;

const MapContainer = tw.div`
  flex-1 w-full rounded-xl
`;

export default SeeTrips;
