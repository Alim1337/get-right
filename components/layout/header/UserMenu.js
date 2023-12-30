import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library
import React, { useEffect, useRef, useState } from 'react';
import OutsideClick from '../../../utils/outsideClick';

const UserMenu = ({ token }) => {
  const [userMenuStatus, setUserMenuStatus] = useState(false);
  const [username, setUsername] = useState('');
  const buttonRef = useRef(null);
  const buttonOutsideClick = OutsideClick(buttonRef);

  const userMenuhandle = () => {
    setUserMenuStatus(!userMenuStatus);
  };

  useEffect(() => {
    if (buttonOutsideClick) {
      setUserMenuStatus(false);
    }
  }, [buttonOutsideClick]);

  // Decode the JWT and extract the username
  useEffect(() => {
    const token = localStorage.getItem('token');

    console.log('Token:', token); // Debug statement
    if (token) {
      const decodedToken = jwt.decode(token);
      console.log('Decoded Token:', decodedToken);
       // Debug statement
      if (decodedToken) {
        setUsername(decodedToken.username);
      }
    }
  }, [token]);
  
  
  // Debug statement to log the username
  console.log('Username:', username);
  return (
    <button className="inline-flex items-center p-2 hover:bg-gray-100 focus:bg-gray-100 rounded-lg relative" onClick={userMenuhandle} ref={buttonRef}>
      <span className="sr-only">User Menu</span>
      <div className="hidden md:flex md:flex-col md:items-end md:leading-tight">
      <span className="font-semibold text-sm text-gray-600">Admin connected: </span>
<span className="font-bold text-xl text-blue-700">{username}</span>

      </div>
      <span className="h-12 w-12 ml-2 sm:ml-3 mr-2 bg-gray-100 rounded-full overflow-hidden">
        {/* Replace the image URL with the actual user profile photo */}
        <img
          src="https://randomuser.me/api/portraits/lego/5.jpg"
          alt="user profile photo"
          className="h-full w-full object-cover"
        />
      </span>

      {userMenuStatus && (
        <div className="absolute right-0 sm:-bottom-16 bg-slate-500 px-2 py-1 space-x-2 text-yellow-50 w-full -bottom-28">
          <a className="block hover:bg-gray-50 hover:text-black">User Profile</a>
          <a className="block hover:bg-gray-50 hover:text-black">User Settings</a>
        </div>
      )}

      {userMenuStatus ? (
        <ChevronDownIcon className="hidden sm:block h-6 w-6 text-gray-300" />
      ) : (
        <ChevronUpIcon className="hidden sm:block h-6 w-6 text-gray-300" />
      )}
    </button>
  );
};

export default UserMenu;
