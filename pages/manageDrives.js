import { useState, useEffect } from 'react';
import tw from "tailwind-styled-components";
import Link from "next/link";
import { BsArrowLeft, BsTrashFill, BsCheck2, BsX } from "react-icons/bs";

const ManageDrives = () => {
  const [trips, setTrips] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');

        if (!userId) {
          console.error('User not authenticated');
          return;
        }

        const response = await fetch(`/api/apiManageDrives?userId=${userId}`);

        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips || []);
          setRideRequests(data.rideRequests || []);

          console.log('Fetched data:', data); // Log the fetched data
        } else {
          console.error('Failed to fetch data:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async ({ tripId, requestId }) => {
    // Display a confirmation prompt
    const confirmDelete = requestId
      ? window.confirm('Are you sure you want to delete this Ride request?')
      : window.confirm('Are you sure you want to delete this drive?');

    if (!confirmDelete) {
      return; // Do nothing if the user cancels the deletion
    }

    try {
      const endpoint = requestId
        ? `/api/apiManageDrives?requestId=${requestId}`
        : `/api/apiManageDrives?tripId=${tripId}`;

      // You need to implement your own API endpoint to handle trip deletion
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (requestId) {
          setRideRequests((prevRequests) => prevRequests.filter((request) => request.requestId !== requestId));
        } else {
          setTrips((prevTrips) => prevTrips.filter((trip) => trip.tripId !== tripId));
        }
      } else {
        console.error('Failed to delete trip:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  // Handler for accepting ride requests
  const handleAccept = async (request) => {
    if (!request || !request.requestId) {
      console.error('No requestId selected for accept');
      return;
    }

    try {
      const response = await fetch(`/api/apiManageDrives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: request.requestId, action: 'accept' }),
      });

      if (response.ok) {
        // Update the state to reflect the accepted request
        setRideRequests((prevRequests) =>
          prevRequests.map((r) =>
            r.requestId === request.requestId
              ? { ...r, status: 'approved' }
              : r
          )
        );
      } else {
        console.error('Failed to accept ride request:', response.status, response.statusText);
        // Display error notification
        toast.error('Failed to accept ride request');
      }
    } catch (error) {
      console.error('Error accepting ride request:', error);
      // Display error notification
      toast.error('Error accepting ride request');
    } finally {
      // Reset the selected request ID
      setSelectedRequestId(null);
    }
  };


  const handleDecline = async (requestId) => {
    try {
      const response = await fetch(`/api/apiManageDrives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action: 'decline' }),
      });
      setRideRequests((prevRequests) =>
        prevRequests.map((r) =>
          r.requestId === requestId
            ? { ...r, status: 'rejected' }
            : r
        )
      );
      console.log('Decline Request:', JSON.stringify({ requestId, action: 'decline' }));
      console.log('Decline Response:', await response.json());

      // Rest of the code...
    } catch (error) {
      console.error('Error declining ride request:', error);
    } finally {
      // Reset the selected request ID
      setSelectedRequestId(null);
    }
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
      <MainContainer>
        <Section>
          <h1 className="text-4xl font-bold text-center text-blue-600">Your Drives</h1>
          <div className="grid mx-10 gap-4 mt-8">
            {trips.map((trip) => (
              <div
                key={trip.tripId}
                className="flex flex-col p-4 bg-white shadow-lg rounded-lg mb-4"
              >
                <Location className="font-bold text-lg">
                  Departure: {trip.departureLocation}
                </Location>
                <Location className="font-bold text-lg">
                  Destination: {trip.destinationLocation}
                </Location>
                <Time className="text-sm text-blue-500">
                  Departure Time: {new Date(trip.departureTime).toLocaleString()}
                </Time>
                <Seats className="text-sm">
                  Available Seats: {trip.availableSeats}
                </Seats>
                {/* Add other trip details as needed */}
                <DeleteButton onClick={() => handleDelete({ tripId: trip.tripId })}>
                  <BsTrashFill size={20} />
                  Delete
                </DeleteButton>
              </div>
            ))}
          </div>
        </Section>
        <Section>
          <h1 className="text-4xl font-bold text-center text-blue-600">Ride Requests</h1>
          <div className="grid gap-4 mt-8 mx-10">
            {rideRequests.map((request) => (
              <div key={request.requestId} className="flex flex-col p-4 bg-white shadow-lg rounded-lg mb-4">
                <Location className="font-bold text-lg">
                  User Name: {request.users.firstName} {request.users.lastName}
                </Location>
                <Location className="font-bold text-lg">
                  Phone Number: {request.users.phoneNumber}
                </Location>
                <Location className="font-bold text-lg">
                  Trip Details:
                </Location>
                <Location>
                  Departure: {request.trips.departureLocation}
                </Location>
                <Location>
                  Destination: {request.trips.destinationLocation}
                </Location>
                <Time>
                  Departure Time: {new Date(request.trips.departureTime).toLocaleString()}
                </Time>
                <Seats>
                  Requested Seats: {request.nbr_seat_req}
                </Seats>
                <Status style={{ color: request.status === 'approved' ? 'green' : 'red' }}>
                  Status: {request.status}
                </Status>

                <div className='flex gap-2 justify-end'>
                  <ConfirmButton onClick={() => handleAccept(request)}>
                    <BsCheck2 size={20} />
                    Accept
                  </ConfirmButton>

                  <DeclineButton onClick={() => handleDecline(request.requestId)}>
                    <BsX size={25} />
                    Decline
                  </DeclineButton>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </MainContainer>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  p-4 bg-gray-200 h-screen
`;

const ButtonContainer = tw.div`
  bg-white p-2 h-12
`;

const BackButton = tw.button`
  border-none outline-none
`;

const Location = tw.div``;

const Time = tw.div`
    text-sm text-blue-500
  `;

const Seats = tw.div`
    text-sm
  `;
const Status = tw.div`
  text-sm
`;

const MainContainer = tw.div`
  flex
`;

const Section = tw.div`
  flex-1
`;

const DeleteButton = tw.button`
  mt-2 self-end bg-red-500 text-white p-2 rounded-lg flex justify-center items-center gap-2
`;

const DeclineButton = tw.button`
  mt-2 self-end bg-red-500 text-white p-2 rounded-lg flex justify-center items-center 
`;

const ConfirmButton = tw.button`
  mt-2 self-end bg-blue-500 text-white p-2 rounded-lg flex justify-center items-center
`;

export default ManageDrives;
