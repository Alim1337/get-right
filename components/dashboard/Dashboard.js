import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import UserForm from '../UserForm';
import UserModificationForm from '../UserModificationForm'; // Import the new form
import { Toaster, toast } from 'sonner'

const useModal = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return { modalIsOpen, openModal, closeModal };
};
const Dashboard = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRideMenu, setShowRideMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [rides, setRides] = useState([]);
  const [deleteRideId, setDeleteRideId] = useState(null);
  const [showConfigTable, setShowConfigTable] = useState(false);
  const [maxSeats, setMaxSeats] = useState(5);
  const [maxRidesPerDay, setMaxRidesPerDay] = useState(4);
  const [reports, setReports] = useState([]);
  const { modalIsOpen, openModal, closeModal } = useModal();
  const [modalDetails, setModalDetails] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedRideIdForModification, setSelectedRideIdForModification] = useState(null);
  const [selectedUserIdForModification, setSelectedUserIdForModification] = useState(null);
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/apiReports');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const reportsData = await response.json();
        console.log('Reports data:', reportsData);
        setReports(reportsData);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    
    fetchReports();
  }, []); 
  const handleModifyUser = (userId) => {
    setSelectedUserIdForModification(userId);
  };
  const showNotification = (message, type = 'success') => {
    // Set the notification state
    setNotification({ message, type });

    // Clear the notification after a timeout
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Adjust the timeout as needed
  };
  const toggleRideMenu = () => {
    setShowRideMenu(!showRideMenu);
  };

  const handleMaxSeatsChange = (event) => {
    setMaxSeats(parseInt(event.target.value, 10));
  };

  const handleMaxRidesPerDayChange = (event) => {
    setMaxRidesPerDay(parseInt(event.target.value, 10));
  };
  
  const DetailsModal = ({ isOpen, onClose, details }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%', // Adjust the width as needed
          },
        }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Problem Details</h2>
          <p className="mb-4">{details}</p>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  };

  const handleConfigButtonClick = async () => {
    setShowConfigTable(!showConfigTable);
  
    // Fetch current configuration settings from the server
    try {
      const response = await fetch('/api/admin_functions');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const configData = await response.json();
      setMaxSeats(configData.maxSeats);
      setMaxRidesPerDay(configData.maxRidesPerDay);
      // Add more state updates if needed for additional configuration settings
    } catch (error) {
      console.error('Error fetching configuration settings:', error);
    }
  };
  

  const handleReadDetails = (details) => {
    openModal();
    setModalDetails(details);
  };
  const handleUserModificationSubmit = async (modifiedUser) => {
    try {
      const response = await fetch('/api/admin_functions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          ...modifiedUser, // Assuming modifiedUser contains the updated user data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Handle the response data as needed

      // Show success notification
      showNotification('User updated successfully', 'success');
      
      // Optionally, refetch the users to update the list
      fetchUsers();
      
      // Close the modification form
      setSelectedUserIdForModification(null);
    } catch (error) {
      console.error('Error updating user:', error);

      // Show error notification
      showNotification('Failed to update user', 'error');
    }
  };
  const handleFormSubmit = async (formData) => {
    try {
      const response = await fetch('/api/admin_functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user', // or 'ride' based on the form data
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add user/ride');
      }

      const data = await response.json();
      // Handle the response data as needed

      // Show success notification
      showNotification('User/Ride added successfully', 'success');

    } catch (error) {
      console.error('Error adding user/ride:', error);
      // Handle error, show message to the user, etc.

      // Show error notification
      showNotification('Failed to add user/ride', 'error');
    }
  };


  const handleDoneButtonClick = async () => {
    try {
      // Save the changes to the server
      const response = await fetch('/api/admin_functions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'config',
          maxSeats,
          maxRidesPerDay,
          // Add more configuration settings if needed
        }),
      });
  
      if (response.ok) {
        console.log('Configuration settings updated successfully');
        // Add any additional logic you need after updating configuration settings
  
        // Show success notification using alert
        alert('Configuration settings updated successfully');
      } else {
        console.error('Failed to update configuration settings');
  
        // Show error notification using alert
        alert('Failed to update configuration settings');
      }
    } catch (error) {
      console.error('Error updating configuration settings:', error);
  
      // Show error notification using alert
      alert('Error updating configuration settings');
    }
  };
  
  
  const handleUserAction = (action) => {
    console.log(`User action selected: ${action}`);
    if (action === 'add') {
      setShowUserForm(true);
    }
    // Handle other actions as needed
  };

  const handleCloseUserForm = () => {
    setShowUserForm(false);
  };

  const handleUserFormSubmit = async (formData) => {
    try {
      const response = await fetch('/api/admin_functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user', // or 'ride' based on the form data
          ...formData,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add/modify user');
      }
  
      const data = await response.json();
  
      // Handle the response data as needed
  
      // Show success notification
      showNotification('User added/modified successfully', 'success');
    } catch (error) {
      console.error('Error adding/modifying user:', error);
  
      // Show error notification
      showNotification('Failed to add/modify user', 'error');
    }
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
          type: 'user', // Specify the type as 'user'
          id: userId, // Pass the userId for deletion
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
          type: 'ride', // Specify the type as 'ride'
          id: rideId, // Pass the rideId for deletion
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
  const renderReportsSection = () => {
    return (
      <div className="flex flex-col md:col-span-2 md:row-span-2 bg-white shadow rounded-lg">
        <div className="px-6 py-5 font-semibold border-b border-gray-100">Reports</div>
        <div className="p-4 flex-grow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Problem Type
                  </th>
                 
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                  {/* Add more columns if needed */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.reportId}>
                    <td className="px-6 py-4 whitespace-nowrap">{report.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.problemType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => handleReadDetails(report.problemDetails)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Read Details
              </button>
            </td>
                    {/* Add more cells if needed */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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

              
            </div>
            <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between">
              <div className="mr-6"></div>
              <div className="flex flex-wrap items-start justify-end -mb-3">
                <div className="relative inline-block text-left">
                
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
            <button
              type="button"
              onClick={() => handleUserAction('add')}
              className="inline-flex px-5 py-3 text-purple-600 hover:text-purple-700
                focus:text-purple-700 hover:bg-purple-100 focus:bg-purple-100 border
                border-purple-600 rounded-md mb-3"
            >
              Add User
            </button>
              <div className="overflow-x-auto">
              {showUserForm && (
      <UserForm onSubmit={handleFormSubmit}  onCancel={handleCloseUserForm} />
      )}
     {notification && (
  <div className={`notification ${notification.type} p-4 text-lg font-bold rounded-lg shadow-lg transform transition-all duration-500 ease-in-out hover:scale-105`}>
    {notification.message}
  </div>
)}

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
  onClick={() => handleModifyUser(user.userId)}
  className="text-white bg-gradient-to-r from-blue-400 via-blue-500
    to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none
    focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg 
    dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
>
  Modify
</button>
              <button
  onClick={() => {
    setDeleteUserId(user.userId);  // Set the state first
    handleDeleteUser(user.userId); // Pass user.userId to handleDeleteUser
}}
className="text-white bg-gradient-to-r from-red-400 via-red-500
  to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg 
  dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
  
>
  Delete
</button>
            </td>
          </tr>
        ))}
      </tbody>
</table>

              </div>
         

              {selectedUserIdForModification && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-8 rounded-md">
            <h2 className="text-2xl font-bold mb-4">Modify User</h2>
            <UserModificationForm
              user={users.find((user) => user.userId === selectedUserIdForModification)}
              onSubmit={handleUserModificationSubmit}
              onCancel={() => {
                // Close the modification form
                setSelectedUserIdForModification(null);
              }}
            />
          </div>
        </div>
      )}       </div>
            
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
              border border-gray-400 rounded shadow"
             >
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
    setDeleteRideId(ride.tripId);  // Set the state first
    handleDeleteRide(ride.tripId); // Pass ride.tripId to handleDeleteRide
}}
className="text-white bg-gradient-to-r from-red-400 via-red-500
  to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg 
  dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
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
          {modalIsOpen && (
  <DetailsModal isOpen={modalIsOpen} onClose={closeModal} details={modalDetails} />
)}
          {renderReportsSection()}
        </section>
      </main>
    </>
  );
};

export default Dashboard;
