import React, { useState } from "react";
import tw from "tailwind-styled-components";

const RideItem = ({ ride, onRequestSeat, onSeatCountChange, drawLine, setDropoff }) => {
  const [seatRequests, setSeatRequests] = useState(0);

  const handleRequestSeat = () => {
    if (seatRequests < ride.availableSeats) {
      setSeatRequests((prev) => prev + 1);
      onSeatCountChange(ride.tripId, seatRequests + 1);
    } else {
      alert("No more seats available");
    }
  };

  const handleSubmit = () => {
    onRequestSeat({
      ride_id: ride.tripId,
      requested_seats: seatRequests,
    });
  };

  const handleShowOnMap = () => {
    const destinationLocation = {
      coordinates: [ride.destinationLongitude, ride.destinationLatitude],
      locationName: ride.destinationLocation,
    };
    setDropoff(destinationLocation);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // drawLine(10);
  };

  return (
    <Ride>
      <RideDetails>
        <Location>
          <Title>Departure Location:</Title> {ride.departureLocation}
        </Location>
        <Location>
          <Title>Destination Location:</Title> {ride.destinationLocation}
        </Location>
        <Location>
          <Title>Distance:</Title> {ride.distance.toFixed(2)} km
        </Location>
        <Time>
          <Title>Departure Time:</Title> {new Date(ride.departureTime).toLocaleString()}
        </Time>
        <Seats>
          <Title>Available Seats:</Title> {ride.availableSeats - seatRequests}
        </Seats>
        <Seats>
          <Title>Requested Seats:</Title> {seatRequests}
        </Seats>
        <DriverID>
          <Title>Driver:</Title> {ride.driverName}
        </DriverID>
        <Button onClick={handleRequestSeat}>Request Seat</Button>
        <Button onClick={handleSubmit}>Submit</Button>
        <ButtonMap onClick={handleShowOnMap}>Show on Map</ButtonMap>
      </RideDetails>
    </Ride>
  );
};

const ListRides = ({ rides, onRequestSeat, onSeatCountChange, drawLine, setDropoff }) => (
  <Wrapper>
    {rides.map((ride) => (
      <RideItem
        key={ride.tripId}
        ride={ride}
        onRequestSeat={onRequestSeat}
        onSeatCountChange={onSeatCountChange}
        drawLine={drawLine}
        setDropoff={setDropoff}
      />
    ))}
  </Wrapper>
);

const Wrapper = tw.div`
  mt-4
`;

const Ride = tw.div`
  flex flex-row py-4 items-center cursor-pointer bg-white shadow-lg rounded-lg mb-4 border-2 border-blue-500
`;

const RideDetails = tw.div`
  flex-1 px-4
`;

const Location = tw.div`
  text-xl text-blue-800 font-semibold
`;

const Time = tw.div`
  text-lg text-blue-500 font-medium
`;

const Seats = tw.div`
  text-lg text-gray-600 font-medium
`;

const DriverID = tw.div`
  text-lg text-gray-600 font-medium
`;

const Title = tw.span`
  font-bold text-2xl
`;

const Button = tw.button`
  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 ml-2 transition-all duration-300 ease-in-out shadow-md
`;

const ButtonMap = tw.button`
  bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-2 ml-2 transition-all duration-300 ease-in-out shadow-md
`;

export default ListRides;
