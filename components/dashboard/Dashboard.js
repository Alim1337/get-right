import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRideMenu, setShowRideMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [rides, setRides] = useState([]);
  const [deleteRideId, setDeleteRideId] = useState(null);
  const [showConfigTable, setShowConfigTable] = useState(false);
  const [maxSeats, setMaxSeats] = useState(5); // Initial value, change as needed
  const [maxRidesPerDay, setMaxRidesPerDay] = useState(4); // Initial value, change as needed
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (!showUserMenu) {
      fetchUsers();
    }
  };

  const toggleRideMenu = () => {
    setShowRideMenu(!showRideMenu);
  };
  const handleConfigButtonClick = () => {
    setShowConfigTable(!showConfigTable);
  };

  const handleMaxSeatsChange = (event) => {
    setMaxSeats(parseInt(event.target.value, 10));
  };

  const handleMaxRidesPerDayChange = (event) => {
    setMaxRidesPerDay(parseInt(event.target.value, 10));
  };

  const handleDoneButtonClick = () => {
    // Implement logic to save the changes, e.g., send to server
    // You can use the maxSeats and maxRidesPerDay values for this

    // For demonstration purposes, you can log the values to the console
    console.log('Max Seats:', maxSeats);
    console.log('Max Rides Per Day:', maxRidesPerDay);

    // Add any additional logic you need for finalizing the changes
  };

  const handleUserAction = (action) => {
    console.log(`User action selected: ${action}`);
    // Handle the selected user action (add, delete, modify) as needed
  };

  const handleRideAction = (action) => {
    console.log(`Ride action selected: ${action}`);
    // Handle the selected ride action (add, delete, modify) as needed
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin_functions');
      const data = await response.json();
      setUsers(data.users);
      console.log(users);

    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    // Fetch users when the component mounts
    fetchUsers();
  }, []);
  const handleDeleteUser = async (userId) => {
    try {
      if (!userId) {
        console.error('Invalid userId for deletion');
        return;
      }

      const response = await fetch('/api/admin_functions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      if (response.ok) {
        console.log('User deleted successfully');
        fetchUsers(); // Fetch users again to update the list
        setDeleteUserId(null); // Reset deleteUserId after successful deletion
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error during user deletion:', error);
    }
  };
  const fetchRides = async () => {
    try {
      const response = await fetch('/api/admin_functions');
      const data = await response.json();
      setRides(data.rides);
      console.log(rides);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  useEffect(() => {
    // Fetch rides when the component mounts
    fetchRides();
  }, []);

  const handleDeleteRide = async (rideId) => {
    try {
      if (!rideId) {
        console.error('Invalid rideId for deletion');
        return;
      }

      const response = await fetch('/api/admin_functions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ride',
          id: rideId,
        }),
      });

      if (response.ok) {
        console.log('Ride deleted successfully');
        fetchRides(); // Fetch rides again to update the list
        setDeleteRideId(null); // Reset deleteRideId after successful deletion
      } else {
        console.error('Failed to delete ride');
      }
    } catch (error) {
      console.error('Error during ride deletion:', error);
    }
  };

  
  return (
    <>
      <main className="p-6 sm:p-10 space-y-6 text-center">
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between">
          <div className="mr-6">
            <h1 className="text-4xl font-semibold mb-2">Admin Dashboard</h1>
            <h2 className="text-gray-600 ml-0.5">Manage users and travel settings</h2>
          </div>
          <div className="flex flex-wrap items-start justify-end -mb-3">
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={toggleUserMenu}
                className="inline-flex px-5 py-3 text-purple-600 hover:text-purple-700
                 focus:text-purple-700 hover:bg-purple-100 focus:bg-purple-100 border
                  border-purple-600 rounded-md mb-3"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="flex-shrink-0 h-5 w-5 -ml-1 mt-0.5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 
                    3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Manage Users
              </button>
              <button
        type="button"
        onClick={handleConfigButtonClick}
        className="inline-flex px-5 py-3 text-purple-600 hover:text-purple-700
         focus:text-purple-700 hover:bg-purple-100 focus:bg-purple-100 border
          border-purple-600 rounded-md mb-3"
      >
        <svg
          aria-hidden="true"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="flex-shrink-0 h-5 w-5 -ml-1 mt-0.5 mr-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 
            3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        Configure application rules
      </button>

      {showConfigTable && (
        <div className="p-4 bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration Setting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Max Seats</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={maxSeats}
                    onChange={handleMaxSeatsChange}
                    className="w-16 border-gray-300 rounded-md"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Max Rides Per Day</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={maxRidesPerDay}
                    onChange={handleMaxRidesPerDayChange}
                    className="w-16 border-gray-300 rounded-md"
                  />
                </td>
              </tr>
              {/* Add more rows for additional configuration settings */}
            </tbody>
          </table>
          <button
            type="button"
            onClick={handleDoneButtonClick}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4
              rounded-md"
          >
            Done
          </button>
        </div>
      )}

              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-56
                 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button
                      onClick={() => handleUserAction('show')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                       hover:text-gray-900"
                      role="menuitem"
                    >
                      Show Users
                    </button>
                    <button
                      onClick={() => handleUserAction('add')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                       hover:text-gray-900"
                      role="menuitem"
                    >
                      Add User
                    </button>
                    <button
                      onClick={() => handleUserAction('delete')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Delete User
                    </button>
                    <button
                      onClick={() => handleUserAction('modify')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Modify User
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between">
              <div className="mr-6"></div>
              <div className="flex flex-wrap items-start justify-end -mb-3">
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={toggleRideMenu}
                    className="inline-flex px-5 py-3 text-purple-600 hover:text-purple-700 focus:text-purple-700
                     hover:bg-purple-100 focus:bg-purple-100 border border-purple-600 rounded-md mb-3"
                  >
                    <svg
                      aria-hidden="true"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="flex-shrink-0 h-5 w-5 -ml-1 mt-0.5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.53
                        6 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Manage Rides
                  </button>
                  {showRideMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 
                    rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                          onClick={() => handleRideAction('add')}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          Add Ride
                        </button>
                        <button
                          onClick={() => handleRideAction('delete')}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          Delete Ride
                        </button>
                        <button
                          onClick={() => handleRideAction('modify')}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          Modify Ride
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Add more buttons for additional functionalities */}
              </div>
            </div>
            {/* Add more buttons for additional functionalities */}
          </div>
        </div>
 
        <section className="grid md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-3 xl:grid-flow-col gap-6">
          
          <div className="flex flex-col md:col-span-2 md:row-span-2 bg-white shadow rounded-lg">
            <div className="px-6 py-5 font-semibold border-b border-gray-100">Users</div>
         
            <div className="p-4 flex-grow">
            <div className="inline-flex flex-shrink-0 items-center justify-center
             h-16 w-16 text-purple-600 bg-purple-100 rounded-full mr-6">
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" 
                strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10
                 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 
                 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 
                 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
            <span className="block text-2xl font-bold">{users.length}</span>
      <span className="block text-gray-500">Total Users</span>
            </div>
            <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4
             border border-gray-400 rounded shadow">
            Add
          </button>
              <div className="overflow-x-auto">
                
              <table className="min-w-full divide-y divide-gray-200">
                
  <thead className="bg-gray-50">
    
    <tr>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Name
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Email
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
        {users.map((user) => (
          <tr key={user.userId}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{user.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                className="text-white bg-gradient-to-r from-green-400 via-green-500
                 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none
                  focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg 
                  dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Modify
              </button>
              <button
                onClick={() => {
                  setDeleteUserId(user.userId); // Set deleteUserId when the button is clicked
                  handleDeleteUser(user.userId); // Pass user.userId to handleDeleteUser
                }}
                className="text-white bg-gradient-to-r from-red-400 via-red-500
                 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
</table>

              </div>
            </div>
          </div>
          {/* Add more sections for other functionalities */}
          
          <div className="flex flex-col md:col-span-2 md:row-span-2 bg-white shadow rounded-lg">
          <div className="flex items-center p-8 bg-white shadow rounded-lg">
            <div className="inline-flex flex-shrink-0 items-center justify-center
             h-16 w-16 text-purple-600 bg-purple-100 rounded-full mr-6">
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" 
                strokeWidth={2} d="M30.915,17.439l-0.524-4.262c-0.103-0.818-0.818-1.418-1.643-1.373L27.6,11.868l-3.564-3.211    c-0.344-0.309-0.787-0.479-1.249-0.479l-7.241-0.001c-1.625,0-3.201,0.555-4.468,1.573l-4.04,3.246l-5.433,1.358    c-0.698,0.174-1.188,0.802-1.188,1.521v1.566C0.187,17.44,0,17.626,0,17.856v2.071c0,0.295,0.239,0.534,0.534,0.534h3.067   
                 c-0.013-0.133-0.04-0.26-0.04-0.396c0-2.227,1.804-4.029,4.03-4.029s4.029,1.802,4.029,4.029c0,0.137-0.028,0.264-0.041,0.396    h8.493c-0.012-0.133-0.039-0.26-0.039-0.396c0-2.227,1.804-4.029,4.029-4.029c2.227,0,4.028,1.802,4.028,4.029    c0,0.137-0.026,0.264-0.04,0.396h2.861c0.295,0,0.533-0.239,0.533-0.534v-1.953C31.449,17.68,31.21,17.439,30.915,17.439z  
                    M20.168,12.202l-10.102,0.511L12,11.158c1.051-0.845,2.357-1.305,3.706-1.305h4.462V12.202z M21.846,12.117V9.854h0.657    c0.228,0,0.447,0.084,0.616,0.237l2.062,1.856L21.846,12.117z" />
              </svg>
            </div>
            <div>
            <span className="block text-2xl font-bold">{rides.length}</span>
      <span className="block text-gray-500">Total Trips</span>
            </div>
          </div>
            <div className="px-6 py-5 font-semibold border-b border-gray-100">Rides</div>
            <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4
              border border-gray-400 rounded shadow">
              Add
            </button>
            <div className="p-4 flex-grow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departure Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departure Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available Seats
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
              
            {rides.map((ride) => (
              
              <tr key={ride.tripId}>
                   
                {/* Adjust the cells based on your ride model */}
                <td className="px-6 py-4 whitespace-nowrap">{ride.departureLocation}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ride.destinationLocation}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ride.departureTime}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ride.availableSeats}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ride.driverId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Add buttons for ride actions (modify, delete) */}
                  <button
                    className="text-white bg-gradient-to-r from-green-400 via-green-500
                      to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none
                      focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg 
                      dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  >
                    Modify
                  </button>
                  <button
                    onClick={() => {
                      setDeleteRideId(ride.tripId); // Set deleteRideId when the button is clicked
                      handleDeleteRide(ride.tripId); // Pass ride.tripId to handleDeleteRide
                    }}
                    className="text-white bg-gradient-to-r from-red-400 via-red-500
                      to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Dashboard;
