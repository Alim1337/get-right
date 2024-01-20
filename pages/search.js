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

const Search = () => {
    const [pickup, setPickup] = useState({
        coordinates: [0, 0],
        locationName: "Unknown Location",
      });
      const [dropoff, setDropoff] = useState(null);
      const [map, setMap] = useState(null);
      const [line, setLine] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [userId, setUserId] = useState(null);

      const [searchResults, setSearchResults] = useState(null);
      const [showSearchResults, setShowSearchResults] = useState(false);
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

    newMap.on("dblclick", async (event) => {
      const lngLat = event.lngLat.toArray();
      const locationName = await reverseGeocode(lngLat[1], lngLat[0]);
      setDropoff({ coordinates: lngLat, locationName });
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
      if (line) {
        line.remove();
      }

      const newLine = new mapboxgl.NavigationControl()
        .setLngLat(pickup.coordinates)
        .addTo(map);

      setLine(newLine);
    }
  };

  const handleSearch = async () => {
    try {
      console.log('searchTerm', searchTerm);
      const response = await fetch(`/api/apiSearchTrips?searchTerm=${searchTerm}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data); // Log the data received
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

  
  const handleRequestSeat = async (rideInfo) => {
    try {
      // Send the ride information to the backend
      const response = await fetch('/api/requestSeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // Replace with actual user ID
          tripId: rideInfo.ride_id,
          // Include other relevant information if needed
        }),
      });
      console.log('userId,rideInfo.ride_id',userId,rideInfo.ride_id);

      if (response.ok) {
        const data = await response.json();
        console.log('Seat requested successfully:', data);
      } else {
        console.error('Failed to request seat');
      }
    } catch (error) {
      console.error('Error requesting seat:', error);
    }
  };

  return (
    <Wrapper>
      {/* Button Container */}
      <ButtonContainer>
        <Link href="/" passHref>
          <BackButton>
            <BsArrowLeft size={30} />
          </BackButton>
        </Link>
      </ButtonContainer>

      {/* Map Container */}
      <MapContainer id="map" />

      {/* Current Pickup Location */}
      <LocationContainer>
        <span>Pickup Location: {pickup.locationName}</span>
      </LocationContainer>

      {/* Input Container */}
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input
            value={dropoff ? dropoff.locationName : "Where to?"}
            readOnly
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputBoxes>

        <PlusIcon>
          <BsPlusLg size={22} />
        </PlusIcon>
      </InputContainer>

      {/* Saved Places */}
      <SavedPlaces>
        <MdStars size={30} /> Saved Places
      </SavedPlaces>


      <ConfirmLocation onClick={handleSearch}>Confirm Location</ConfirmLocation>
        {showSearchResults && <ListRides rides={searchResults} onRequestSeat={handleRequestSeat} />}
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
