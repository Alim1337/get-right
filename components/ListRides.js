import React, { useState } from "react";
import tw from "tailwind-styled-components";

const RideItem = ({ ride }) => {
  const [seatRequests, setSeatRequests] = useState(0);

  const handleRequestSeat = () => {
    if (seatRequests < ride.availableSeats) {
      setSeatRequests(seatRequests + 1);
    } else {
      alert('No more seats available');
    }
  };

  return (
    <Ride>
      <RideDetails>
        <Location>{ride.departureLocation}</Location>
        <Location>{ride.destinationLocation}</Location>
        <Time>{new Date(ride.departureTime).toLocaleString()}</Time>
        <Seats>Available Seats: {ride.availableSeats - seatRequests}</Seats>
        <Seats>Requested Seats: {seatRequests}</Seats> {/* Display the number of requested seats */}
        <DriverID>Driver ID: {ride.driverId}</DriverID>
        <Button onClick={handleRequestSeat}>Request Seat</Button>
      </RideDetails>
    </Ride>
  );
};

const ListRides = ({ rides }) => (
  <Wrapper>
    {rides.map((ride) => (
      <RideItem key={ride.tripId} ride={ride} />
    ))}
  </Wrapper>
);

const Wrapper = tw.div`
  mt-4
`;

const Ride = tw.div`
  flex flex-row py-4 items-center cursor-pointer bg-white shadow-lg rounded-lg mb-4
`; // Add background color, shadow, and rounded corners

const RideDetails = tw.div`
  flex-1 px-4
`; // Add padding

const Location = tw.div`
  font-bold text-lg
`; // Increase font size

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
`; // Add margin-top

export default ListRides;
