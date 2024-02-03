import React, { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import Map from "../components/Map";
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
import { useRouter } from "next/router";
import { useRef } from "react";
import { toast } from "sonner";

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
  const [sortValue, setSortValue] = useState("");

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


  //useEffect to check if user is connected
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



  //useEffect to update user location
  useEffect(() => {
    const updateLocation = async () => {
      try {
        const position = await getCurrentLocation();
        setLocation([position.coords.longitude, position.coords.latitude]);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    updateLocation();
  }, []);


  //function to get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );

      setTimeout(() => navigator.geolocation.clearWatch(watchId), 5000);
    });
  };



  //useEffect to fetch all trips
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchUrl = sortValue ? `/api/getTrips?sort=${sortValue}` : '/api/getTrips';
        console.log('fetchUrl:', fetchUrl);
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const data = await response.json();
          setTrips(data);
          console.log("Trips data:", data);
        } else {
          console.error("Failed to fetch trips data");
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchData();
  },[sortValue]);










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
        toast.success("Seat requested successfully");
        router.push("/")
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




  const handleShowOnMap = (trip) => {
    setMapDestination(trip);
    console.log('first function triggered')
    if (!mapRef.current) {
      console.log('mapRef.current is null', mapRef.current);
      return;
    }

    const destinationLocationString = `${trip.destinationLongitude},${trip.destinationLatitude}`;
    const departureLocationString = `${trip.departureLongitude},${trip.departureLatitude}`;
    //departure pin
    mapRef.current.showPin(destinationLocationString, trip.destinationLocation, departureLocationString, trip.departureLocation);
    mapRef.current.showRoad(departureLocationString, destinationLocationString, true);
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


      <select className="p-2 rounded-full mt-12 border-2 border-black shadow-lg w-1/8" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
        <option value="">Sort by...</option>
        <option value="Asc">Departure Time Asc</option>
        <option value="Dsc">Departure Time Desc</option>
      </select>

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
              driver firstName: {trip.driver.firstName}
            </p>
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">
              driverlastName: {trip.driver.lastName}
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
              <ButtonMap onClick={() => handleShowOnMap(trip)}>
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
  p-4 bg-gray-100 h-screen
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
