import { MoonIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import LogOutButton from './header/LogOutButton';
import Notifications from './header/Notifications';
import SearchBox from './header/SearchBox';
import UserMenu from './header/UserMenu';

const Header = ({ mobileNavsidebar, setMobileNavsidebar, token }) => {
  const [actualUsernameFromToken, setActualUsernameFromToken] = useState('');

  useEffect(() => {
    // Decode the JWT and extract the username
    const token = localStorage.getItem('token');
    if (token) {
      console.log('token from header',token);
      const decodedToken = jwt.decode(token);
      console.log('decodedToken',decodedToken);

      if (decodedToken) {
        setActualUsernameFromToken(decodedToken.username);
      }
    }
  }, [token]);

  const handleLogout = () => {
    // Perform logout logic here
    console.log('User logged out'); // You can replace this with your actual logout logic
  };

  return (
    <header className="flex items-center h-20 px-6 sm:px-10 bg-white">
      <MoonIcon
        className="h-12 stroke-slate-600 cursor-pointer sm:hidden"
        onClick={() => setMobileNavsidebar(!mobileNavsidebar)}
      />
      <SearchBox />
      <div className="flex flex-shrink-0 items-center ml-auto">
        <UserMenu token={token} />
        <div className="border-l pl-3 ml-3 space-x-1">
          <Notifications />
          <LogOutButton onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;
