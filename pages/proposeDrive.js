import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
import tw from "tailwind-styled-components";
import Link from "next/link";
import {
  BsArrowLeft,
  BsCircleFill,
  BsPlusLg,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { FaSquareFull } from "react-icons/fa";
import { MdStars } from "react-icons/md";

const ProposeDrive = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');

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
    const token = localStorage.getItem('token');
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUserId(decodedToken.userId);
    console.log('this is decodedToken', decodedToken);
}, []);

useEffect(() => {
    console.log('this is driver id ', userId);
}, [userId]); // This useEffect runs whenever driverId changes


  const setupMap = () => {
    mapboxgl.accessToken = accessToken;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLocation = {
          coordinates: [position.coords.longitude, position.coords.latitude],
          locationName: await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          ),
        };
        setPickup(currentLocation);
        setupMapWithPickup(currentLocation);
      },
      (error) => {
        console.error("Error getting current location:", error);
        setupMapWithPickup({
          coordinates: [0, 0],
          locationName: "Unknown Location",
        });
      }
    );
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
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Reverse geocode to get coordinates for departure and destination
      const pickupCoordinates = await reverseGeocodeCoordinates(pickup.locationName);
      const dropoffCoordinates = await reverseGeocodeCoordinates(dropoff.locationName);
  
      const response = await fetch('/api/apiProposeDrive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departure: pickup.locationName,
          destination: dropoff.locationName,
          date: rideDetails.date,
          time: rideDetails.time,
          seatsAvailable: rideDetails.seatsAvailable,
          userId: userId,
          departureLatitude: pickupCoordinates.latitude,
          departureLongitude: pickupCoordinates.longitude,
          destinationLatitude: dropoffCoordinates.latitude,
          destinationLongitude: dropoffCoordinates.longitude,
        }),
      });
  
      if (response.ok) {
        console.log('Drive proposed successfully');
        // Show a notification before redirecting
        window.alert('Drive proposed successfully');
        // Redirect or perform any other actions after successful ride creation
        router.push('/'); // Redirect to the home page
      } else {
        console.error('Failed to create ride');
      }
    } catch (error) {
      console.error('Error during ride creation:', error);
    }
  };
  
  // Function to get coordinates from location name using reverse geocoding
  const reverseGeocodeCoordinates = async (locationName) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${accessToken}`
      );
      const data = await response.json();
      const coordinates = data.features[0]?.geometry?.coordinates || [0, 0];
      return { latitude: coordinates[1], longitude: coordinates[0] };
    } catch (error) {
      console.error("Error fetching reverse geocoding coordinates:", error);
      return { latitude: 0, longitude: 0 }; // Return default coordinates on error
    }
  };
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setRideDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setRideDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;

    setRideDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  useEffect(() => {
    setupMap();
  }, []); // Run this effect once after the initial render

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

      <ContentContainer>
        <FormContainer>
          <h1 className="text-4xl mb-8 text-center font-serif text-blue-990">Proposer un trajet</h1>
          <form
            onSubmit={handleSubmit}
            className="border-2 border-blue-500 rounded-xl px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departure">
                Pickup Location:
                <input
                  type="text"
                  name="departure"
                  value={pickup.locationName}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination">
                Destination:
                <input
                  type="text"
                  name="destination"
                  value={dropoff.locationName}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date:
                <input
                  type="date"
                  name="date"
                  value={rideDetails.date}
                  onChange={handleDateChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>
              {dateError && (
                <p className="text-red-500 text-s text-center">{dateError}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                Time:
                <input
                  type="time"
                  name="time"
                  value={rideDetails.time}
                  onChange={handleTimeChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seatsAvailable">
                Seats Available:
                <input
                  type="number"
                  name="seatsAvailable"
                  value={rideDetails.seatsAvailable}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>
              {seatError && (
                <p className="text-red-500 text-s text-center">{seatError}</p>
              )}
            </div>
            <div className='mt-10 text-center'>
              <button
                disabled={dateError || seatError}
                type="submit"
                className="left-1/2 bg-blue-500 hover:bg-blue-700
                 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Proposer le trajet
              </button>
            </div>
          </form>
        </FormContainer>

  
      </ContentContainer>
    </Wrapper>
  );
}
const Wrapper = tw.div`
  p-4 bg-gray-200 h-screen
`;

const ButtonContainer = tw.div`
  bg-white p-2 h-12
`;

const BackButton = tw.button``;

const MapContainer = tw.div`
  flex-1 h-96
`;

const ContentContainer = tw.div`
  flex-1 flex flex-col
`;

const FormContainer = tw.div`
  max-w-2xl mb-8 p-8 bg-white shadow-2xl rounded-xl
`;


export default ProposeDrive;
