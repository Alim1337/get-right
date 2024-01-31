import React, { useEffect } from 'react';

const ReservedRidesModal = ({ reservations, onClose }) => {
  useEffect(() => {
    console.log('Received reservations from comp:', reservations);
  }, [reservations]);

  const handleShowInMap = (reservation) => {
    // Add logic to handle showing the reservation in the map
    console.log('Show in map clicked for reservation:', reservation);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg transform transition-all duration-500 ease-in-out border-4 border-green-500">
      <h2 className="text-3xl font-sans mb-4 text-green-700">Your Reserved Rides</h2>
      <ul className="list-none border-t-2 border-green-500">
        {reservations && reservations.length > 0 ? (
          reservations.map((reservation) => (
            <li key={reservation.reservationId} className="mb-2 text-green-600 hover:text-green-800 transition-all duration-300 ease-in-out border-b-2 border-green-500">
              {/* Reservation ID: {reservation.reservationId} <br /> */}
              {/* Trip ID: {reservation.tripId} <br />
              Passenger ID: {reservation.passengerId} <br /> */}
              Reservation Time: {reservation.reservationTime} <br />
              Driver: {reservation.driver.firstName} {reservation.driver.lastName} <br />
              Driver's phone: {reservation.driver.phoneNumber} <br />
              departureLocation: {reservation.departureLocation} <br />
              destinationLocation: {reservation.destinationLocation} <br />
              <button onClick={() => handleShowInMap(reservation)} className="bg-blue-500 text-white px-4 py-2 rounded-full text-lg font-sans my-3 leading-normal transition-all duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 active:bg-blue-700">Show in Map</button>
            </li>
          ))
        ) : (
          <li className="mb-2 text-green-600 hover:text-green-800 transition-all duration-300 ease-in-out">No reserved rides</li>
        )}
      </ul>
      <button onClick={onClose} className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-full text-lg font-sans uppercase leading-normal transition-all duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 active:bg-green-700">Close</button>
    </div>
  );
};

export default ReservedRidesModal;
