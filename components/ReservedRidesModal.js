import React, { useEffect } from 'react';

const ReservedRidesModal = ({ reservations, onClose, location }) => {
  useEffect(() => {
    console.log('Received reservations from comp:', reservations);
  }, [reservations]);

// In ReservedRidesModal.js
const handleShowInMap = (reservation) => {
  // Pass the reservation's destination location to the map component
  // Assume that `map` is a ref to the Map component (useRef)
  //map.current.showPin(reservation.destinationLocation);
};


  return (
    <div className="fixed left-0 top-0 h-full overflow-y-auto bg-white rounded-lg p-6 shadow-lg transition-all duration-300 ease-in-out border-4 border-green-500 flex flex-col opacity-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-sans text-green-700">Your Reserved Rides</h2>
        <button onClick={onClose} className="bg-green-500 text-white px-6 py-2 rounded-full text-lg font-sans uppercase leading-normal transition-all duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 active:bg-green-700">Close</button>
      </div>
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
    </div>
  );
};

export default ReservedRidesModal;
