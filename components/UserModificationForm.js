// UserModificationForm.jsx

import React, { useState } from 'react';

const UserModificationForm = ({ user, onSubmit, onCancel }) => {
  // State for form fields
  const [modifiedUser, setModifiedUser] = useState({
    userId : user.userId ,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    // Add more fields as needed
    // Example placeholders:
    studentId: user.studentId || '',
    phoneNumber: user.phoneNumber || '',
  });

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModifiedUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the onSubmit prop with the modified user data
    onSubmit(modifiedUser);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={modifiedUser.firstName}
          onChange={handleInputChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={modifiedUser.lastName}
          onChange={handleInputChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={modifiedUser.email}
          onChange={handleInputChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          required
        />
      </div>

      {/* Additional Fields */}
      <div className="mb-4">
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
        student Id
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={modifiedUser.studentId}
          onChange={handleInputChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={modifiedUser.phoneNumber}
          onChange={handleInputChange}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
      
      </div>
      
      {/* Add more form fields as needed */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="mr-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default UserModificationForm;
