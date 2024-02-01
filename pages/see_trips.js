import React, { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";

const SeeTrips = () => {
  const [trips, setTrips] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [userId, setUserId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [mapDestination, setMapDestination] = useState(null);

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
      {mapDestination && (
        <MapContainer>
          <iframe
            width="100%"
            height="300"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={`https://www.google.com/maps/embed/v1/place?q=${mapDestination}&key=YOUR_GOOGLE_MAPS_API_KEY`}
          ></iframe>
        </MapContainer>
      )}
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
  mb-4
`;

export default SeeTrips;
