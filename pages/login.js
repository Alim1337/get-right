import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import tw from "tailwind-styled-components";
import { SiX } from "react-icons/si";

const Notification = ({ message, type, onClose }) => {
  return (
    <div
      style={{
        padding: '10px',
        margin: '10px',
        borderRadius: '5px',
        backgroundColor: type === 'success' ? 'green' : 'red',
        color: 'white',
        textAlign: 'center',
      }}
    >
      {message}
      <button onClick={onClose} style={{ marginLeft: '10px' }}>
        Close
      </button>
    </div>
  );
};

const validateEmail = (email) => {
  // Basic email validation, adjust as needed
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const isPhoneNumberValid = (phoneNumber) => {
  return !isNaN(phoneNumber) && phoneNumber.length === 10;
};

const isValidStudentId = (studentId) => {
  return !isNaN(studentId) && studentId.length === 12;
};

const Login = () => {
  const router = useRouter();
  const [showLoginFields, setShowLoginFields] = useState(false);
  const [showInscriptionFields, setShowInscriptionFields] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push("/"); // Redirect to the main page if token exists
    }
  }, []);

  const handleSignInClick = () => {
    setShowLoginFields(true);
  };

  const handleInscriptionClick = () => {
    setShowInscriptionFields(true);
  };

  const handleLogin = async () => {
    if (!validateEmail(username)) {
      showNotification('Invalid email format. Please enter a valid email.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/login_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token_login) {
          localStorage.setItem('token', data.token_login);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('role', data.role);
          router.push("/");
        } else {
          alert('Login failed');
        }
      } else {
        console.error(`Failed to fetch: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      showNotification('Login failed. Please check your credentials.', 'error');
    }
  };

  const handleRegister = async () => {
    if (!validateEmail(username)) {
      showNotification('Invalid email format. Please enter a valid email.', 'error');
      return;
    }

    if (!isPhoneNumberValid(phoneNumber)) {
      showNotification('Invalid phone number format. Please enter a valid phone number.', 'error');
      return;
    }

    if (!isValidStudentId(studentId)) {
      showNotification('Invalid student ID format. Please enter a valid student ID.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/signup_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber,
          email: username,
          password,
          studentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token_signup) {
          localStorage.setItem('token', data.token_signup);
          localStorage.setItem('userId', data.userId);
          router.push("/");
          alert('Registration successful. You will log in.');
        } else {
          alert('Registration failed');
        }
      } else {
        console.error(`Failed to fetch: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showNotification('Registration failed. Please try again.', 'error');
    }
  };

  const isPhoneNumberValid = (phoneNumber) => {
    return !isNaN(phoneNumber);
  };

  return (
    <Wrapper>
      <LogoWrapper>
        <SiX size={48} />
      </LogoWrapper>
      <Title>Login to access your account</Title>
      <HeadImage src='https://i.ibb.co/CsV9RYZ/login-image.png' />
      {showLoginFields && (
        <>
          <Input type="text" placeholder="email" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <SignInButtonL onClick={handleLogin}>
            Sign in
          </SignInButtonL>
        </>
      )}
      {showInscriptionFields && (
        <>
          <Input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <Input type="text" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          <SignInButtonL onClick={handleRegister}>
            Register
          </SignInButtonL>
        </>
      )}

      {!showLoginFields && !showInscriptionFields && <SignInButton onClick={handleSignInClick}>Sign in</SignInButton>}
      <InscriptionButton onClick={handleInscriptionClick}>inscription</InscriptionButton>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
    flex flex-col items-center justify-center h-screen w-screen bg-gray-200
  `;

const LogoWrapper = tw.div`
    bg-white p-4 rounded-full mb-4
  `;

const SignInButton = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`;

const SignInButtonL = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`;

const InscriptionButton = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`;

const Input = tw.input`
w-64 py-2 px-4 my-2 bg-white border border-gray-300 rounded shadow
`;

const Title = tw.div`
    text-3xl pt-4 text-gray-500
`;

const HeadImage = tw.img`
    object-contain w-64 h-64
`;

export default Login;
