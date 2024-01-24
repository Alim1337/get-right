// pages/manageTrips.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
import tw from "tailwind-styled-components";

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

  return (
    <Wrapper>
      <h1 className="text-4xl font-bold text-center text-blue-600">Your Drives</h1>
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
            {/* Add other trip details as needed */}
          </div>
        ))}
      </div>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  p-4 bg-gray-200 h-screen
`;

export default ManageDrives;
