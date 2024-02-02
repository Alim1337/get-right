// ReportModal.js
import React, { useState } from 'react';
import Modal from 'react-modal'; // Update the import to use react-modal
import { FaExclamationTriangle } from 'react-icons/fa';

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [problemType, setProblemType] = useState('technical');
  const [problemDetails, setProblemDetails] = useState('');

  const handleProblemTypeChange = (event) => {
    setProblemType(event.target.value);
  };

  const handleProblemDetailsChange = (event) => {
    setProblemDetails(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit({
      problemType,
      problemDetails,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">
          <FaExclamationTriangle size={24} className="mr-2" />
          Report to Admin
        </h2>
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
        <div className="mt-4">
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
