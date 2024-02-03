import React, { useState } from 'react';
import tw from "tailwind-styled-components";

const StyledForm = tw.form`
  flex
  flex-col
  gap-4
  p-4
  bg-white
  rounded-lg
  shadow-md
`;

const StyledLabel = tw.label`
  flex
  flex-col
`;

const StyledInput = tw.input`
  mt-1
  p-2
  border
  border-gray-300
  rounded-md
`;

const StyledButton = tw.button`
  w-full
  p-2
  bg-blue-500
  text-white
  rounded-md
  hover:bg-blue-600
`;

const UserForm = ({ onSubmit, onCancel }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ firstName, lastName, phoneNumber, email, studentId, password });
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <StyledLabel>
        First Name:
        <StyledInput type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </StyledLabel>
      <StyledLabel>
        Last Name:
        <StyledInput type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </StyledLabel>
      <StyledLabel>
        Phone Number:
        <StyledInput type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      </StyledLabel>
      <StyledLabel>
        Email:
        <StyledInput type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      </StyledLabel>
      <StyledLabel>
        Student ID:
        <StyledInput type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
      </StyledLabel>
      <StyledLabel>
        Password:
        <StyledInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </StyledLabel>
      <div className="flex gap-4 mt-4">
        <StyledButton type="submit">Submit</StyledButton>
        <StyledButton type="button" onClick={onCancel} className="bg-red-500 hover:bg-red-600">Cancel</StyledButton>
      </div>
    </StyledForm>
  );
};

export default UserForm;
