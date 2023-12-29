import React, { useState } from 'react';

const Dashboard = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleUserAction = (action) => {
    // Handle the selected user action (e.g., add, delete, modify)
    console.log(`User action selected: ${action}`);
    // Add your logic here to perform the respective action
  };
  const [showRideMenu, setShowRideMenu] = useState(false);

  const toggleRideMenu = () => {
    setShowRideMenu(!showRideMenu);
  };

  const handleRideAction = (action) => {
    // Handle the selected ride action (e.g., add, delete, modify)
    console.log(`Ride action selected: ${action}`);
    // Add your logic here to perform the respective action
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
                className="inline-flex px-5 py-3 text-purple-600
                 hover:text-purple-700 focus:text-purple-700 hover:bg-purple-100 focus:bg-purple-100 border border-purple-600 rounded-md mb-3"
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
              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-56
                 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button
                      onClick={() => handleUserAction('add')}
                      className="block px-4 py-2 text-sm text-gray-700
                       hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Add User
                    </button>
                    <button
                      onClick={() => handleUserAction('delete')}
                      className="block px-4 py-2 text-sm text-gray-700
                       hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Delete User
                    </button>
                    <button
                      onClick={() => handleUserAction('modify')}
                      className="block px-4 py-2 text-sm text-gray-700
                       hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Modify User
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-6 md:space-y-0
             md:flex-row justify-between">
          <div className="mr-6">
       

          </div>
          <div className="flex flex-wrap items-start justify-end -mb-3">
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={toggleRideMenu}
                className="inline-flex px-5 py-3 text-purple-600
                 hover:text-purple-700 focus:text-purple-700 hover:bg-purple-100 focus:bg-purple-100 border border-purple-600 rounded-md mb-3"
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
                      className="block px-4 py-2 text-sm text-gray-700
                       hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Add Ride
                    </button>
                    <button
                      onClick={() => handleRideAction('delete')}
                      className="block px-4 py-2 text-sm text-gray-700
                       hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Delete Ride
                    </button>
                    <button
                      onClick={() => handleRideAction('modify')}
                      className="block px-4 py-2 text-sm text-gray-700
                       hover:bg-gray-100 hover:text-gray-900"
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
        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span className="block text-2xl font-bold">1200</span>
              <span className="block text-gray-500">Total Users</span>
            </div>
          </div>
          {/* Add more user-related metrics here */}
        </section>
        {/* Add additional sections for user management features */}
        <section className="grid md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-3 xl:grid-flow-col gap-6">
          {/* Add sections for travel settings, rules, etc. */}
          <div className="flex flex-col md:col-span-2 md:row-span-2 bg-white shadow rounded-lg">
            <div className="px-6 py-5 font-semibold border-b border-gray-100">Travel Settings</div>
            <div className="p-4 flex-grow">
              {/* Add input fields and buttons for travel settings */}
              <div className="flex items-center justify-center h-full px-4 py-16 text-gray-400 text-3xl font-semibold bg-gray-100 border-2 border-gray-200 border-dashed rounded-md">
                Travel Settings Form
              </div>
            </div>
          </div>
          {/* Add more sections for other functionalities */}
        </section>
      </main>
    </>
  );
};

export default Dashboard;
