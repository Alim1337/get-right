import React from "react";
import tw from "tailwind-styled-components";

const RideItem = ({ ride }) => (
  <Ride>
    <RideDetails>
      <Location>{ride.departureLocation}</Location>
      <Location>{ride.destinationLocation}</Location>
      <Time>{new Date(ride.departureTime).toLocaleString()}</Time>
      <Seats>Available Seats: {ride.availableSeats}</Seats>
      <DriverID>Driver ID: {ride.driverId}</DriverID>
    </RideDetails>
  </Ride>
);

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
  flex flex-row py-4 items-center cursor-pointer
`;

const RideDetails = tw.div`
  flex-1
`;

const Location = tw.div`
  font-bold
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

export default ListRides;
