import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import tw from "tailwind-styled-components";
import { SiX } from "react-icons/si";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { toast } from 'sonner'
import Image from 'next/image';

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

const showErrorToast = (error) => {
  toast.error(error);
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
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};

    if (step === 1) {
      if (!firstName.trim()) {
        errors.firstName = 'First Name is required';
      }
      if (!lastName.trim()) {
        errors.lastName = 'Last Name is required';
      }
    } else if (step === 2) {
      if (!phoneNumber.trim() || !isPhoneNumberValid(phoneNumber)) {
        errors.phoneNumber = 'Invalid or empty phone number';
      }
    } else if (step === 3) {
      if (!username.trim() || !validateEmail(username)) {
        errors.username = 'Invalid or empty email';
      }
    } else if (step === 4) {
      if (!password.trim()) {
        errors.password = 'Password is required';
      }
    } else if (step === 5) {
      if (!studentId.trim() || !isValidStudentId(studentId)) {
        errors.studentId = 'Invalid or empty student ID';
      }
    }

    setValidationErrors(errors);

    // Return true if no errors, false otherwise
    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleNextStep = () => {
    const validationErrors = validateFields();
    if (!validationErrors) {
      setStep((prevStep) => prevStep + 1);
    } else {
      console.log('Validation errors:', validationErrors);
      const errorMessage = Object.values(validationErrors)[0];
      showErrorToast(errorMessage || 'Please fill in the required fields correctly.');
    }
  };

  const handlePrevStep = () => {
    setStep((prevStep) => Math.max(1, prevStep - 1));
  };

  const showNotification = (message, type) => {
    toast[type](message);
  };

  const closeNotification = () => {
    // Close the toast if needed
    toast.dismiss();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push("/"); // Redirect to the main page if token exists
    }
  }, []);

  // const handleSignInClick = () => {
  //   setShowLoginFields(true);
  // };

  // const handleInscriptionClick = () => {
  //   setShowInscriptionFields(true);
  // };

  const handleToggleMode = (state) => {
    setStep(1); // Reset step to 1
    setIsRegisterVisible(state); // Toggle visibility of RegisterFields
  };

  const handleLogin = async () => {
    if (!validateEmail(username)) {
      showErrorToast('Invalid email format. Please enter a valid email.');
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
          toast.success('Login successful');
        } else {
          showErrorToast('Login failed');
        }
      } else {
        console.error(`Failed to fetch: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      showErrorToast('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async () => {
    // if (!validateEmail(username)) {
    //   showErrorToast('Invalid email format. Please enter a valid email.');
    //   return;
    // }

    // if (!isPhoneNumberValid(phoneNumber)) {
    //   showErrorToast('Invalid phone number format. Please enter a valid phone number.');
    //   return;
    // }

    // if (!isValidStudentId(studentId)) {
    //   showErrorToast('Invalid student ID format. Please enter a valid student ID.');
    //   return;
    // }

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
          localStorage.setItem('role', data.role);
          router.push('/');
          toast.success('Registration successful. You will log in.');
        }
      } else if (response.status === 400) {
        const errorData = await response.json();
        showErrorToast(`Registration failed. ${errorData.error}`);
      } else {
        console.error(`Failed to fetch: ${response.status} - ${response.statusText}`);
        showErrorToast('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showErrorToast('Registration failed. Please try again.');
    }
  };

  // const isPhoneNumberValid = (phoneNumber) => {
  //   return !isNaN(phoneNumber);
  // };

  return (
    <Wrapper>



      <SectionLeft>

        <MainTitle><span className="bg-black text-white rounded-md p-1.5 pb-3">Get</span> <span className="p-1.5 text-white">Right</span> </MainTitle>
        <Image
          src="/assets/image6.svg"
          alt="Your SVG Alt Text"
          width={300} // Adjust the width as needed
          height={200} // Adjust the height as needed
        />
        <div className="flex gap-20 mt-10">
          <Image
            src="/assets/image3.svg"
            alt="Your SVG Alt Text"
            width={300} // Adjust the width as needed
            height={200} // Adjust the height as needed
          />
          <Image
            src="/assets/image5.svg"
            alt="Your SVG Alt Text"
            width={300} // Adjust the width as needed
            height={200} // Adjust the height as needed
          />
        </div>

      </SectionLeft>

      <SectionRight>
        <Title><span className="bg-black text-white rounded-md p-1.5">Get</span> <span className="p-1.5">Right</span> </Title>


        {isRegisterVisible ? (
          <RegisterFields>
            <LoginTitle>Register</LoginTitle>

            {step <= 5 && (
              <>
                {step === 1 && (
                  <>
                    <Input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <Input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </>
                )}

                {step === 3 && (
                  <>
                    <Input type="text" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </>
                )}

                {step === 4 && (
                  <>
                    <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </>
                )}

                {step === 5 && (
                  <>
                    <Input type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                  </>
                )}

                {step <= 5 && (
                  <div className="flex justify-center mt-5 w-full gap-3">
                    {step > 1 && (
                      <PreviousNextButton onClick={handlePrevStep}>
                        <BsArrowLeft />
                        Previous
                      </PreviousNextButton>
                    )}

                    {step < 5 && (
                      <PreviousNextButton onClick={handleNextStep}>
                        Next
                        <BsArrowRight />
                      </PreviousNextButton>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <SignInButtonL onClick={handleRegister}>
                    Register
                  </SignInButtonL>
                )}
              </>
            )}

            <div className="relative flex py-5 items-center w-full px-8 mt-20 -mb-5">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="flex-shrink mx-4 text-gray-600">
                Already have an account?
              </span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>

            <SignInButtonB onClick={() => handleToggleMode(false)}>
              Sign In
            </SignInButtonB>
          </RegisterFields>
        ) : <LoginFields>
          <LoginTitle>Login</LoginTitle>
          <Input type="text" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <SignInButtonT onClick={handleLogin}>
            Sign In
          </SignInButtonT>

          <div className="relative flex py-5 items-center w-full px-8 mt-10 -mb-5">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="flex-shrink mx-4 text-gray-600">
              Don't have an account?
            </span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          <SignInButtonB onClick={() => handleToggleMode(true)}>
            Create an account
          </SignInButtonB>
        </LoginFields>}


      </SectionRight>








      {/* <LogoWrapper>
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
      <InscriptionButton onClick={handleInscriptionClick}>inscription</InscriptionButton> */}







      {/* {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )} */}
    </Wrapper>
  );
};

const Wrapper = tw.div`
    flex flex-row h-screen w-screen bg-gray-500
  `;



const SectionLeft = tw.section`
flex flex-col items-center h-screen w-1/2 
`;
const SectionRight = tw.section`
flex flex-col h-screen w-1/2 bg-gray-50 rounded-l-3xl shadow-2xl
`;

const Title = tw.h1`
   flex ml-auto text-3xl uppercase pt-8 pr-8 font-bold   
`;
const MainTitle = tw.h1`
   flex text-5xl uppercase mt-20 font-bold  mb-16 
`;

const LoginTitle = tw.div`
 flex items-center justify-center text-4xl mt-2 mb-8  font-bold
`;

const LoginFields = tw.div`
flex justify-center items-center flex-col mt-8
`;

const RegisterFields = tw.div`
flex justify-center items-center flex-col mt-8
`;


const Input = tw.input`
  w-80 py-2 px-5 my-3 bg-white border border-gray-300 rounded-xl shadow-md
  transition-transform duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:border-black
`;

const SignInButtonT = tw.button`
  w-1/2 py-2 px-4 bg-white mt-12 text-gray-800 
  font-semibold text-lg border border-gray-400 rounded-full shadow-lg
  transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-800 hover:text-white
`;

const SignInButtonB = tw.button`
  justify-center w-1/2 py-2 px-4 bg-gray-800 text-white mt-12 
  font-semibold text-lg border border-gray-400 rounded-full shadow-lg
  transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-900
`;


const SignInButtonL = tw.button`
  w-1/2 py-2 px-4 bg-white mt-12 text-gray-800 
  font-semibold text-lg border border-gray-400 rounded-full shadow-lg
  transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-800 hover:text-white
`;


const PreviousNextButton = tw.button`
  w-1/6 py-2 px-4 bg-white text-gray-800 flex items-center justify-center gap-3
  font-semibold text-lg border border-gray-400 rounded-full shadow-lg
  transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-800 hover:text-white
`;


const LogoWrapper = tw.div`
    bg-white p-4 rounded-full mb-4
  `;

const SignInButton = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`;



const InscriptionButton = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`;





const HeadImage = tw.img`
    object-contain w-64 h-64
`;

export default Login;
