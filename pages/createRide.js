// createRide.js

import { useState } from 'react';
import { useRouter } from 'next/router';

const CreateRide = () => {
  const router = useRouter();

  const [seatError, setSeatError] = useState('');
  const [dateError, setDateError] = useState('');

  // State to manage form inputs
  const [rideDetails, setRideDetails] = useState({
    departure: '',
    destination: '',
    date: '',
    seatsAvailable: 0,
    // Add more details as needed (e.g., time, price, etc.)
  });

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform validation before submitting the data
    // You can also send this data to your backend or manage it as needed
    console.log('Submitted details:', rideDetails);
    // Redirect to a confirmation page or perform other actions
    router.push('/confirmation'); // Replace '/confirmation' with your confirmation page
  };

  // Function to update state when form inputs change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      const currentDate = new Date();
      const selectedDate = new Date(value);
      if (selectedDate < currentDate) {
        setDateError('From today onward');
        return;
      } else {
        setDateError('');
      }
    }

    // Seats available validation
    if (name === 'seatsAvailable') {
      const seats = parseInt(value, 10);
      if (seats > 4) {
        setSeatError('Seats cannot exceed 4');
        return;
      } else {
        setSeatError('');
      }
    }




    setRideDetails({
      ...rideDetails,
      [name]: value,
    });
  };

  // createRide.js

  // ... (previous code remains unchanged)

  return (
    <div className="flex justify-center items-center h-screen">
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
