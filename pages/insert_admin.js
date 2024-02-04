import { useState } from 'react';

const InsertAdmin = () => {
  const [message, setMessage] = useState('');

  const handleInsertAdmin = async () => {
    try {
      const response = await fetch('/api/create_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
         username: 'admin', password: 'admin' 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Admin inserted successfully');
      } else {
        setMessage('Error inserting admin');
      }
    } catch (error) {
      console.error('Error inserting admin:', error);
      setMessage('Internal Server Error');
    }
  };

  return (
    <div>
      <h1>Insert Admin Page</h1>
      <button onClick={handleInsertAdmin}>Insert Admin</button>
      <p>{message}</p>
    </div>
  );
};

export default InsertAdmin;
