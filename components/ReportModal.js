import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaExclamationTriangle } from 'react-icons/fa';

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [problemType, setProblemType] = useState('technical');
  const [problemDetails, setProblemDetails] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleProblemTypeChange = (event) => {
    setProblemType(event.target.value);
  };

  const handleProblemDetailsChange = (event) => {
    setProblemDetails(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      // Prepare the data to be sent in the POST request
      const reportData = {
        userId: localStorage.getItem('userId'), // Assuming you store userId in localStorage
        problemType,
        problemDetails,
      };
  
      // Make a POST request to the API endpoint using fetch
      const response = await fetch('/api/apiReports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
  
      // Ensure the response is successful before proceeding
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Handle the response as needed
      const responseData = await response.json();
      console.log('Report submitted successfully:', responseData);
  
      // Call the onSubmit callback, set success message, and clear the error message
      onSubmit(reportData);
      setSuccessMessage('Report submitted successfully!');
      setErrorMessage('');
  
      // Clear the success message after 3 seconds and then close the modal
      setTimeout(() => {
        setSuccessMessage('');
        onClose(); // Move this inside the setTimeout function
      }, 3000);
  
    } catch (error) {
      // Handle errors
      console.error('Error submitting report:', error);
  
      // Set error message and clear the success message
      setErrorMessage('Error submitting report. Please try again.');
      setSuccessMessage('');
  
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };
  
  

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">
          <FaExclamationTriangle size={24} className="mr-2" />
          Report to Admin
        </h2>
        {errorMessage && (
          <div className="text-red-500 mb-4">
            <p>{errorMessage}</p>
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 mb-4">
            <p>{successMessage}</p>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Problem Type</label>
          <select
            value={problemType}
            onChange={handleProblemTypeChange}
            className="mt-1 p-2 w-full border rounded-md"
          >
            <option value="technical">Technical Problem</option>
            <option value="user">Report User</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Problem Details</label>
          <textarea
            value={problemDetails}
            onChange={handleProblemDetailsChange}
            className="mt-1 p-2 w-full border rounded-md"
          ></textarea>
        </div>
        <div className="mt-4 space-x-3">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;
