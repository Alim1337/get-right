import React, { useState } from "react";
import tw from "tailwind-styled-components";
const RideItem = ({ ride, onRequestSeat, onSeatCountChange }) => {
  const [seatRequests, setSeatRequests] = useState(0);

  const handleRequestSeat = () => {
    if (seatRequests < ride.availableSeats) {
      setSeatRequests(seatRequests + 1);
      onSeatCountChange((prev) => ({ ...prev, [ride.tripId]: seatRequests + 1 }));
    } else {
      alert('No more seats available');
    }
  };

  const handleSubmit = () => {
    onRequestSeat({
      ride_id: ride.tripId,
      requested_seats: seatRequests,
    });
  };

  return (
    <Ride>
      <RideDetails>
        <Location>{ride.departureLocation}</Location>
        <Location>{ride.destinationLocation}</Location>
        <Time>{new Date(ride.departureTime).toLocaleString()}</Time>
        <Seats>Available Seats: {ride.availableSeats - seatRequests}</Seats>
        <Seats>Requested Seats: {seatRequests}</Seats>
        <DriverID>Driver ID: {ride.driverId}</DriverID>
        <Button onClick={handleRequestSeat}>Request Seat</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </RideDetails>
    </Ride>
  );
};

//export default RideItem;

const ListRides = ({ rides, onRequestSeat, onSeatCountChange }) => (
  <Wrapper>
    {rides.map((ride) => (
      <RideItem key={ride.tripId} ride={ride} onRequestSeat={onRequestSeat} onSeatCountChange={onSeatCountChange} />
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
  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2
`;

export default ListRides;
