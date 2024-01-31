import React, { useState } from "react";
import tw from "tailwind-styled-components";

const RideItem = ({ ride, onRequestSeat, onSeatCountChange, drawLine ,setDropoff}) => {
  const [seatRequests, setSeatRequests] = useState(0);

  console.log("ride", ride);

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
    // Set the destination location as the dropoff state
    const destinationLocation = {
      coordinates: [ride.destinationLongitude, ride.destinationLatitude],
      locationName: ride.destinationLocation,
    };
    setDropoff(destinationLocation);
  
    // Call the drawLine function with a lower zoom level (e.g., 10)
    drawLine(10);
  };
  
  return (
    <Ride>
      <RideDetails>
        <Location>{ride.departureLocation}</Location>
        <Location>{ride.destinationLocation}</Location>
        <Time>{new Date(ride.departureTime).toLocaleString()}</Time>
        <Seats>Available Seats: {ride.availableSeats - seatRequests}</Seats>
        <Seats>Requested Seats: {seatRequests}</Seats>
        <DriverID>Driver: {ride.driverName}</DriverID>
        <Button onClick={handleRequestSeat}>Request Seat</Button>
        <Button onClick={handleSubmit}>Submit</Button>
        <ButtonMap onClick={handleShowOnMap}>Show on map</ButtonMap>
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
  flex flex-row py-4 items-center cursor-pointer bg-white shadow-lg rounded-lg mb-4
`;

const RideDetails = tw.div`
  flex-1 px-4
`;

const Location = tw.div`
  font-bold text-lg
`;

const Time = tw.div`
  text-sm text-blue-500
`;

const Seats = tw.div`
  text-sm
`;

const DriverID = tw.div`
  text-sm
`;

const Button = tw.button`
  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 ml-2
`;

const ButtonMap = tw.button`
  bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-2 ml-2
`;

export default ListRides;
