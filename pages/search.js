import { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import mapboxgl from "mapbox-gl";
import {
  BsArrowLeft,
  BsCircleFill,
  BsPlusLg,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { FaSquareFull } from "react-icons/fa";
import { MdStars } from "react-icons/md";
import Link from "next/link";
import { accessToken } from "../components/Map";
import ListRides from "../components/ListRides";
const NEARBY_RANGE = 20;
const Search = () => {
  const [pickup, setPickup] = useState({
    coordinates: [0, 0],
    locationName: "Unknown Location",
  });
  const [dropoff, setDropoff] = useState(null);
  const [map, setMap] = useState(null);
  const [line, setLine] = useState(null);
  const [searchTermPickup, setSearchTermPickup] = useState('');
  const [searchTermDropoff, setSearchTermDropoff] = useState('');
  const [userId, setUserId] = useState(null);

  const [searchResults, setSearchResults] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [nearbyResults, setNearbyResults] = useState(null);
  const [showNearbyResults, setShowNearbyResults] = useState(false);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );

      setTimeout(() => navigator.geolocation.clearWatch(watchId), 5000);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUserId(decodedToken.userId);
    console.log('this is decodedToken', decodedToken);
  }, []);
  useEffect(() => {
    setSearchTermPickup(`(${pickup.locationName})`);
    setSearchTermDropoff(dropoff ? dropoff.locationName : "");
  }, [pickup, dropoff]);


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

  const addDropoffMarker = (lngLat, locationName) => {
    if (map) {
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat(lngLat)
        .setPopup(new mapboxgl.Popup().setHTML(locationName))
        .addTo(map);
    }
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



  const drawLine = (zoomLevel = 12) => {
    if (map && pickup && dropoff) {
      // Create a marker for the destination
      const destinationMarker = new mapboxgl.Marker({ color: "red" })
        .setLngLat(dropoff.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(dropoff.locationName))
        .addTo(map);

      // Create a line between pickup and destination
      const newLine = [pickup.coordinates, dropoff.coordinates];

      // Calculate the bounds of the line
      const bounds = new mapboxgl.LngLatBounds();
      newLine.forEach(point => bounds.extend(point));

      // Set the map's center and zoom level to fit the bounds
      map.setCenter(bounds.getCenter());
    map.setZoom(zoomLevel);

      // Note: If you want to draw a line on the map, you can use a GeoJSON source and layer
      // Uncomment and customize the code block below if needed
      // addLineToMap(newLine);
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

  const handleSearchInputChange = (pickupValue, dropoffValue) => {
    console.log("pickupValue:", pickupValue);
    console.log("dropoffValue:", dropoffValue);

    // Remove parentheses from pickup location
    const cleanedPickupValue = pickupValue.replace(/[\(\)]/g, '');
    setSearchTermPickup(cleanedPickupValue);

    // Remove parentheses from dropoff location
    const cleanedDropoffValue = dropoffValue.replace(/[\(\)]/g, '');
    setSearchTermDropoff(cleanedDropoffValue);

    // Trigger the search directly when input values change
    handleSearch();
  };


  const handleSearch = async () => {
    try {


      console.log("Encoded Pickup:", encodeURIComponent(searchTermPickup));
      console.log("Encoded Dropoff:", encodeURIComponent(searchTermDropoff));

      const response = await fetch(`/api/apiSearchTrips?searchTermPickup=${encodeURIComponent(searchTermPickup)}&searchTermDropoff=${encodeURIComponent(searchTermDropoff)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });



      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        setSearchResults(data);
        setShowSearchResults(true);
      } else {
        console.error('Failed to fetch search results');
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  useEffect(() => {
    setupMap();
  }, []);

  // Your component file
  const handleSearchNearby = async () => {
    try {
      // Fetch nearby trips
      const response = await fetch(`/api/getNearbyTrips?latitude=${pickup.coordinates[1]}&longitude=${pickup.coordinates[0]}&range=${NEARBY_RANGE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Nearby results:', data.nearbyTrips);
        setNearbyResults(data.nearbyTrips);
        setShowNearbyResults(true);
      } else {
        console.error('Failed to fetch nearby results');
      }
    } catch (error) {
      console.error('Error during nearby search:', error);
    }

    return null;
  };



  const handleRequestSeat = async (rideInfo) => {
    try {
      const response = await fetch('/api/requestSeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          tripId: rideInfo.ride_id,
          nbr_seat_req: rideInfo.requested_seats,
        }),
      });

      console.log('userId, rideInfo.ride_id', userId, rideInfo.ride_id);

      if (response.ok) {
        const data = await response.json();
        console.log('Seat requested successfully:', data);
        window.alert('Seat requested successfully!');
      } else {
        console.error('Failed to request seat');
        window.alert('Failed to request seat. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting seat:', error);
      window.alert('An error occurred while requesting the seat. Please try again.');
    }
  };

  const handleSeatCountChange = (tripId, newSeatCount) => {
    console.log(`Trip ${tripId} has ${newSeatCount} requested seats.`);
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

      <MapContainer id="map" />

      <LocationContainer>
        <span>Pickup Location: {pickup.locationName}</span>
      </LocationContainer>

      <InputContainer>
        <FromToIcons>
          <BsCircleFill size={12} opacity={0.5} />
          <BsThreeDotsVertical size={30} opacity={0.5} />
          <FaSquareFull size={12} opacity={0.5} />
        </FromToIcons>

        <InputBoxes>
          <Input
            value={`(${pickup.locationName})`}
            readOnly
            placeholder="Enter pickup location"
            onChange={(e) => handleSearchInputChange(e.target.value, dropoff ? dropoff.locationName : "")}
          />
          <Input
            value={dropoff ? dropoff.locationName : ""}
            readOnly
            placeholder="Enter dropoff location"
            onChange={(e) => handleSearchInputChange(pickup.locationName, e.target.value)}
          />

        </InputBoxes>

        <PlusIcon>
          <BsPlusLg size={22} />
        </PlusIcon>
      </InputContainer>

      <SavedPlaces>
        <MdStars size={30} /> Saved Places
      </SavedPlaces>
      <ConfirmLocation onClick={() => { handleSearch(); handleSearchNearby(); }}>Confirm Location</ConfirmLocation>

      {showSearchResults && (
  <div>
    <SectionTitle>Rides disponible</SectionTitle>
    <ListRides
      rides={searchResults}
      onRequestSeat={handleRequestSeat}
      onSeatCountChange={handleSeatCountChange}
      drawLine={drawLine}
      setDropoff={setDropoff} // Pass setDropoff function
    />
  </div>
)}
      {showNearbyResults && (
        <div>
          <SectionTitle>Nearby rides</SectionTitle>
          {nearbyResults ? (
            <ListRides rides={nearbyResults} onRequestSeat={handleRequestSeat} onSeatCountChange={handleSeatCountChange} />
          ) : (
            <p>No nearby rides found.</p>
          )}
        </div>
      )}

    </Wrapper>
  );
};
const Wrapper = tw.div`
    p-4 bg-gray-200 h-screen
`;

const ButtonContainer = tw.div`
    bg-white p-2 h-12
`;

const BackButton = tw.button``;

const InputContainer = tw.div`
    bg-white flex items-center py-4 my-4
`;
const SectionTitle = tw.h2`
  text-4xl font-bold mt-4 text-blue-900 
`;

const FromToIcons = tw.div`
    w-10 h-16 flex flex-col items-center justify-between
`;

const InputBoxes = tw.div`
 flex flex-col flex-1
`;

const Input = tw.input`
h-14 bg-gray-200 px-4 my-2 rounded-2 outline-none border-none
`;

const PlusIcon = tw.button`
      bg-gray-200 m-4 p-2 rounded-full
`;

const SavedPlaces = tw.div`
    flex items-center bg-white p-2 rounded-2
`;

const ConfirmLocation = tw.button`
    w-full h-12 px-6 my-4 text-blue-100 
    transition-colors duration-150 bg-blue-700 
    rounded-lg focus:shadow-outline hover:bg-blue-800
`;

const MapContainer = tw.div`
  flex-1 h-96
`;

const LocationContainer = tw.div`
  bg-white p-2 rounded-2 mt-2
`;

export default Search;
