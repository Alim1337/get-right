// pages/admin.js

import { useState } from 'react';
import Dashboard from '../components/dashboard/Dashboard';
import Layout from '../components/layout/Layout';

export default function Admin() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      // Perform authentication logic on the backend
      const response = await fetch('/api/login_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Pass login credentials as needed
          username: 'admin',
          password: 'adminPassword',
        }),
      });

      if (response.ok) {
        // Successful login
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
