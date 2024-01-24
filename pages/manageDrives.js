// pages/manageTrips.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
import tw from "tailwind-styled-components";
import Link from "next/link";
import { BsArrowLeft, BsTrash } from "react-icons/bs";

const ManageDrives = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // Retrieve userId from localStorage or wherever you have it stored
        const userId = localStorage.getItem('userId');

        if (!userId) {
          console.error('User not authenticated');
          return;
        }

        const response = await fetch(`/api/apiManageDrives?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips || []);
        } else {
          console.error('Failed to fetch trips:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    fetchTrips();
  }, []);

  const handleDelete = async (tripId) => {
    // Display a confirmation prompt
    const confirmDelete = window.confirm('Are you sure you want to delete this trip?');
  
    if (!confirmDelete) {
      return; // Do nothing if the user cancels the deletion
    }
  
    try {
      // You need to implement your own API endpoint to handle trip deletion
      const response = await fetch(`/api/apiManageDrives?tripId=${tripId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // If deletion is successful, update the state to remove the deleted trip
        setTrips((prevTrips) => prevTrips.filter((trip) => trip.tripId !== tripId));
      } else {
        console.error('Failed to delete trip:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
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
      <h1 className="text-4xl font-bold text-center text-blue-600">Your Drives</h1>
      <div className="grid grid-cols-3 gap-4 mt-8">
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
            <DeleteButton onClick={() => handleDelete(trip.tripId)}>
              {/* <BsTrash size={20} /> */}
              Delete
            </DeleteButton>
          </div>
        ))}
      </div>
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

const DeleteButton = tw.button`
    mt-2 self-end bg-red-500 text-white p-2 rounded-lg w-20
  `;

export default ManageDrives;
