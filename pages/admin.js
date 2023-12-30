// pages/admin.js

import { useState, useEffect } from 'react';
import Dashboard from '../components/dashboard/Dashboard';
import Layout from '../components/layout/Layout';

export default function Admin() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Check for an existing token during page load
    const token = localStorage.getItem('token');

    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch('/api/login_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        // Successful login
        const { token } = await response.json();
        localStorage.setItem('token', token);
        setLoggedIn(true);
      } else {
        // Handle authentication failure
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <Layout title="Home Layout" isLoggedIn={isLoggedIn} onLogin={handleLogin}>
      {isLoggedIn && <Dashboard />}
    </Layout>
  );
}
