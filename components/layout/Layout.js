// components/layout/Layout.js

import Head from "next/head";
import React, { Fragment, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children, title = "Sample Title", isLoggedIn, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLoginClick = () => {
    // Perform login logic with username and password
    onLogin(username, password);
  };

  return (
<Fragment>
  <Head>
    <title>{title}</title>
    <meta name="description" content="Generated by create next app" />
    <link rel="icon" href="/favicon.ico" />
  </Head>

  {isLoggedIn ? (
    <div className="flex bg-gray-100 min-h-screen relative">
      <Sidebar />
      <div className="flex-grow text-gray-800">
        <Header />
        {children}
      </div>
      <Footer />
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-cover bg-center" style={{backgroundImage: "url('C:\Users\Alim\Desktop\app\get-right\images\pngtree-low-poly-geometric-background-of-pink-and-blue-triangles-image_420740.jpg)"}}>
      <div className="border p-4 shadow-lg rounded-lg bg-white transform hover:scale-105 transition-transform duration-200 ">
        <h2 className="text-3xl hover:bg-gray-100 text-gray-800 font-semibold  border border-gray-400 rounded shadow text-center animate-bounce">Login admin</h2>
        <label className="block text-gray-700 text-lg font-semibold mb-4">
          <span className="hover:bg-gray-100 text-gray-800 font-semibold  border border-gray-400 rounded shadow block text-center">Username:</span>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className="border p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-500 transition-all duration-300 "
          />
        </label>
        <label className="block text-gray-700 text-lg font-semibold mb-4">
          <span className="hover:bg-gray-100 text-gray-800 font-semibold  border border-gray-400 rounded shadow block text-center">Password:</span>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="border p-2 w-full rounded-md focus:outline-none focus:ring focus:border-blue-500 transition-all duration-300 "
          />
        </label>
        <button
          onClick={handleLoginClick}
          className=" hover:bg-gray-100 text-gray-800 font-semibold  border border-gray-400 rounded shadow text-white p-3 w-full
           rounded-md hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-110 animate-bounce"
        >
          Log In
        </button>
      </div>
    </div>
  )}
</Fragment>






  );
};

export default Layout;
