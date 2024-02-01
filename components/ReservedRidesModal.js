import React, { useEffect } from 'react';

const ReservedRidesModal = ({ reservations, onClose, location }) => {
  useEffect(() => {
    console.log('Received reservations from comp:', reservations);
  }, [reservations]);

  const handleShowInMap = (reservation) => {
    // Pass the reservation's destination location to the map component
    // Assume that `map` is a ref to the Map component (useRef)
    // map.current.showPin(reservation.destinationLocation);
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
          reservations.map((reservation) => (
            <li
              key={reservation.reservationId}
              className="mb-6 text-green-600 hover:text-green-800 transition-all duration-300 ease-in-out border-b-2 border-green-500"
            >
              <span className="font-bold">Reservation Time:</span> {reservation.reservationTime} <br />
              <span className="font-bold">Driver:</span> {reservation.driver.firstName} {reservation.driver.lastName} <br />
              <span className="font-bold">Driver's phone:</span> {reservation.driver.phoneNumber} <br />
              <span className="font-bold">Departure Location:</span> {reservation.departureLocation} <br />
              <span className="font-bold">Destination Location:</span> {reservation.destinationLocation} <br />
              <button
                onClick={() => handleShowInMap(reservation)}
                className="bg-green-500 text-white px-4 py-2 rounded-full text-lg font-roboto my-3 leading-normal transition-all duration-300 ease-in-out hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 active:bg-green-700"
              >
                Show in Map
              </button>
            </li>
          ))
        ) : (
          <li className="mb-6 text-green-600 hover:text-green-800 transition-all duration-300 ease-in-out">No reserved rides</li>
        )}
      </ul>
    </div>
  );
};

export default ReservedRidesModal;
