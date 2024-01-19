

import { useState } from 'react';
import { useRouter } from 'next/router';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CreateRide = () => {
  const router = useRouter();

  const [seatError, setSeatError] = useState('');
  const [dateError, setDateError] = useState('');

  // State to manage form inputs
  const [rideDetails, setRideDetails] = useState({
    departure: '',
    destination: '',
    date: '', // Combine date and time into a single property
    time: '',
    seatsAvailable: 0,
    // Add more details as needed (e.g., time, price, etc.)
  });

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {


      const loggedInUserId = localStorage.getItem('userId');

      if (!loggedInUserId) {
        console.error('User not authenticated.'); // Handle this case appropriately
        return;
      }

      // Add the driverId to the rideDetails before sending the request
      const rideDataWithDriverId = { ...rideDetails, driverId: loggedInUserId };
      // Fetch API route to create a ride
      const response = await fetch('/api/apiCreateRide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideDataWithDriverId),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
        //router.push('/confirmation'); // Replace with your confirmation page
      } else {
        console.error('Error creating ride:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating ride:', error);
    }
  };


  // Function to update state when form inputs change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      console.log('Date:', value);
      // Combine date and time into a single string

      // Check if the selected date and time are not prior to the current date and time
      const selectedDateTime = new Date(value); // Corrected date handling
      const currentDateTime = new Date();

      if (selectedDateTime < currentDateTime) {
        setDateError('Selected date and time must be in the future');
      } else {
        setDateError('');
      }

      setRideDetails({
        ...rideDetails,
        date: value,
      });
    }
     else if (name === 'seatsAvailable') {
      // Convert seatsAvailable to an integer
      const seats = parseInt(value, 10);

      // Seats available validation
      if (seats > 4) {
        setSeatError('Seats cannot exceed 4');
      } else {
        setSeatError('');
      }

      setRideDetails({
        ...rideDetails,
        seatsAvailable: seats, // Update with the converted integer
      });
    } else {
      // Handle other form inputs
      setRideDetails({
        ...rideDetails,
        [name]: value,
      });
    }
  };


  // createRide.js

  // ... (previous code remains unchanged)

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-3xl mb-16 text-center">Create a Ride</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-xl border-2 rounded-xl px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departure">
              Departure:
              <input
                type="text"
                name="departure"
                value={rideDetails.departure}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination">
              Destination:
              <input
                type="text"
                name="destination"
                value={rideDetails.destination}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date:
              <input
                type="date"
                name="date"
                value={rideDetails.date}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
            {dateError && (
              <p className="text-red-500 text-s text-center">{dateError}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
              Time:
              <input
                type="time"
                name="time"
                value={rideDetails.time}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seatsAvailable">
              Seats Available:
              <input
                type="number"
                name="seatsAvailable"
                value={rideDetails.seatsAvailable}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
            {seatError && (
              <p className="text-red-500 text-s text-center">{seatError}</p>
            )}
          </div>
          <div className='mt-10 text-center'>
            <button disabled={dateError || seatError} type="submit" className=" left-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Publish Ride
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRide;
