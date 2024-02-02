import React, { useEffect } from 'react';

const ReservedRidesModal = ({ reservations, onClose, location }) => {
  useEffect(() => {
    console.log('Received reservations from comp:', reservations);
  }, [reservations]);

  const handleDeleteReservation = async (reservationId) => {

    try {

      console.log('Deleting reservation with ID:', reservationId);
      const response = await fetch('/api/apiReservation', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId }),
      });

      if (response.ok) {
        // Handle successful deletion, such as refreshing the reservations list
        console.log('Reservation deleted successfully');
        // You might want to refetch or update the reservations list here
      } else {
        console.error('Failed to delete reservation');
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const handleShowInMap = (reservation) => {
    // Pass the reservation's destination location to the map component
    // Assume that `map` is a ref to the Map component (useRef)
    // map.current.showPin(reservation.destinationLocation);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M ${remainingSeconds.toString().padStart(2, '0')}S`;
  };

  return (
    <div className="fixed left-0 top-0 h-full overflow-y-auto bg-white rounded-lg p-6 shadow-lg transition-all duration-300 ease-in-out border-4 border-green-500 flex flex-col opacity-100 transform  hover:scale-105">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-roboto font-bold text-green-700 transition-colors duration-500 ease-in-out hover:text-green-800">Your Reserved Rides</h2>
        <button
          onClick={onClose}
          className="bg-green-500 text-white px-6 py-2 rounded-full text-lg font-roboto uppercase leading-normal transition-all duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 active:bg-green-700"
        >
          Close
        </button>
      </div>
      <ul className="list-none border-t-2 border-green-500">
        {reservations && reservations.length > 0 ? (
          reservations.map((reservation) => {
            const now = new Date();
            const departureTime = new Date(reservation.departureTime);
            const timeDifference = Math.floor((departureTime - now) / 1000); // Seconds difference
            if (timeDifference <= -12 * 60 * 60) {
              // If more than 12 hours have passed, delete the reservation
              handleDeleteReservation(reservation.reservationId);
            }

            return (
              <li
                key={reservation.reservationId}
                className="mb-6 text-green-600 hover:text-green-800 transition-all duration-300 ease-in-out border-b-2 border-green-500"
              >
                <span className="font-bold">Reservation Time:</span> {new Date(reservation.reservationTime).toLocaleString()} <br />
                <span className="font-bold">Departure Time:</span> {new Date(reservation.departureTime).toLocaleString()} <br />

                <span className="font-bold">Driver:</span> {reservation.driver.firstName} {reservation.driver.lastName} <br />
                <span className="font-bold">Driver's phone:</span> {reservation.driver.phoneNumber} <br />
                <span className="font-bold">Departure Location:</span> {reservation.departureLocation} <br />
                <span className="font-bold">Destination Location:</span> {reservation.destinationLocation} <br />
                <div className='flex items-center'>
                  <button
                    onClick={() => handleShowInMap(reservation)}
                    className=" bg-green-500 text-white px-4 py-2 rounded-full text-lg font-roboto my-3 leading-normal transition-all duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 active:bg-green-700"
                  >
                    Show in Map
                  </button>
                  <span className='ml-auto'>
                    {timeDifference >= 0 ? (
                      <>
                        {formatTime(timeDifference)} before departure
                      </>
                    ) : (
                      <span className=' text-red-500'>Departure time has passed</span>
                    )}
                  </span>

                </div>

              </li>
            );
          })
        ) : (
          <li className="mb-6 text-green-600 hover:text-green-800 transition-all duration-300 ease-in-out">No reserved rides</li>
        )}
      </ul>
    </div>
  );
};

export default ReservedRidesModal;
