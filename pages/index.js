// pages/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import tw from "tailwind-styled-components";
import Map from "../components/Map";
import { SiUber } from "react-icons/si";
import { FaCar, FaPlusCircle, FaCalendarAlt, FaBell } from "react-icons/fa";
import Link from "next/link";
import ReservedRidesModal from '../components/ReservedRidesModal';
import { Toaster, toast } from 'sonner'


const Index = () => {

  const [user, setUser] = useState(null);
  const [location, setLocation] = useState([44, 36.2]);
  const [hasReservations, setHasReservations] = useState(false);
  const router = useRouter();
  const [reservations, setReservations] = useState({});
  const [showReservedRidesModal, setShowReservedRidesModal] = useState(false);
  const [counter, setCounter] = useState(0);
  

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      router.push('/login');
    } else {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUser({
          role: decodedToken.role,
          id: decodedToken.userId,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName,
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        router.push('/login');
      }
    }
  }, [router]);
  
  

  useEffect(() => {
    // Fetch reservations periodically
    const intervalCleanup = fetchReservationsPeriodically();

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalCleanup);
    };
  }, [user]);

  const fetchReservationsPeriodically = () => {
    if (user && user.role === 'driver') {
      // If the user is a driver, do not fetch data periodically
      return;
    }
    const intervalId = setInterval(async () => {
      try {
        await fetchReservations();
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    }, 5000); // Fetch every 10 seconds (adjust as needed)

    return () => clearInterval(intervalId);
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/apiReservation?userId=${user.id}`);
      const data = await response.json();
      // console.log('API Response for reservations:', data);

      if (data.reservations) {
        setReservations(data.reservations);
      } else {
        setReservations({});
      }

      setHasReservations(data.hasReservations);

      setCounter((prevCounter) => {
        const newCounter = data.numberOfReservations;
  
        // Check for the condition and display toast if necessary
        if (newCounter > prevCounter) {
          toast.success('You have a new reservation!');
        }
  
        return newCounter;
      });
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };




  useEffect(() => {
    const updateLocation = async () => {
      try {
        const position = await getCurrentLocation();
        console.log("Updated Location:", position.coords);
        setLocation([position.coords.longitude, position.coords.latitude]);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    updateLocation();
  }, []);

  const handleShowReservedRides = () => {
    console.log('Showing reserved rides modal');
    setShowReservedRidesModal(true);
  };

  const handleCloseReservedRidesModal = () => {
    setShowReservedRidesModal(false);
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );

      // Stopping the watch after 5 seconds for simplicity. Adjust as needed.
      setTimeout(() => navigator.geolocation.clearWatch(watchId), 5000);
    });
  };

  const handleDisconnect = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <Wrapper>
      <Map location={location} />

      <ActionItems>
        <Header>
        <Profile className="flex items-center space-x-4 border-4 border-blue-600 p-4 rounded-lg shadow-lg">
  <div className="text-2xl font-bold text-blue-700">
    User Connected: {user && `${user.firstName} ${user.lastName}`}
  </div>
  <UserImage
    src={user && user.photoUrl}
    alt="User Photo"
    className="h-16 w-16 cursor-pointer rounded-full border-4 border-blue-800"
    onClick={() => signOut(auth)}
  />
</Profile>



          <DisconnectButton onClick={handleDisconnect}>Disconnect</DisconnectButton>
        </Header>

        <ActionButtons>
          <Link href="/search" passHref>
            <ActionButton className="flex flex-col items-center justify-center mt-8">
              <ActionButtonImage>
                <FaCar size={50} />
              </ActionButtonImage>
              Serch Ride
            </ActionButton>
          </Link>

          <Link href="/createRide" passHref>
            <ActionButton className="flex flex-col items-center justify-center mt-8">
              <ActionButtonImage>
                <FaPlusCircle size={50} />
              </ActionButtonImage>
              Create Trip
            </ActionButton>
          </Link>


          <Link href="/see_trips" passHref>
            <ActionButton className="flex flex-col items-center justify-center mt-8">

              <ActionButtonImage>
                <FaCalendarAlt size={50} />
              </ActionButtonImage>
              See Trips
            </ActionButton>
          </Link>
        </ActionButtons>


        <div className="flex flex-col items-center justify-center mt-8">
          {user && user.role === 'driver' ? (
            <Link href="/manageProposedDrives" passHref>
              <div className="w-1/2 text-center justify-center">
                <ActionButton className="">Trajets proposé</ActionButton>
              </div>
            </Link>
          ) : (
            <Link href="/proposeDrive" passHref>
              <div className=" w-1/2 text-center justify-center">
                <ActionButton className="w-full text-center">
                  Proposer un trajet
                </ActionButton>
              </div>
            </Link>
          )}
        </div>



        <div className="flex flex-col items-center justify-center mt-3">
          {user && user.role === 'driver' ? (
            <Link href="/manageDrives" passHref>
              <div className="w-full">
                <ActionButton className="">Manage My Drives</ActionButton>
              </div>
            </Link>
          ) : (
            <div className="w-full text-center justify-center">
              {hasReservations && (
                <div className="flex items-center">
                  <FaBell className="-mr-5" size={30}/>
                  <div className="bg-red-500 text-white text-center  mb-6 h-6 w-6 font-bold rounded-full mr-1">
                    {counter}
                  </div>
                   
                  <ActionButton
                    className="flex items-center w-full justify-center"
                    onClick={handleShowReservedRides}
                  >
                    
                    <div className="text-center">My reserved rides</div>
                  </ActionButton>
                </div>
              )}
            </div>

          )}
        </div>

      </ActionItems>
      {showReservedRidesModal && (
        <ReservedRidesModal
          reservations={reservations}
          onClose={handleCloseReservedRidesModal}
        />
      )}

    </Wrapper>
  );
};

const DisconnectButton = tw.button`
  inline-block rounded-full bg-black text-white px-6 pb-2 pt-2.5 text-xl font-medium uppercase leading-normal text-center transition-all duration-500 ease-in-out hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50 active:bg-gray-900
`;

const ActionButton = tw.button`
  inline-block w-full rounded-full bg-gray-200 text-black px-6 pb-2 pt-2.5 text-2xl font-serif uppercase leading-normal text-center shadow-[0_4px_9px_-4px_rgba(51,45,45,0.7)] transition-all duration-500 ease-in-out hover:bg-gray-300 hover:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:bg-gray-300 focus:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:outline-none focus:ring-0 active:bg-gray-300 active:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] dark:bg-gray-200 dark:shadow-[0_4px_9px_-4px_#030202] dark:hover:bg-gray-300 dark:hover:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:focus:bg-gray-300 dark:focus:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:active:bg-gray-300 dark:active:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)]
`;

const Wrapper = tw.div`
  flex flex-col bg-red-300 h-screen transition-all duration-500 ease-in-out
`;

const ActionItems = tw.div`
  bg-white flex-1 p-4 transition-all duration-500 ease-in-out
`;

const Header = tw.div`
  flex justify-between items-center transition-all duration-500 ease-in-out
`;

const Profile = tw.div`
  flex flex-row items-center transition-all duration-500 ease-in-out
`;

const Name = tw.div`
  mr-2 text-sm transition-all duration-500 ease-in-out
`;

const UserImage = tw.img`
  h-8 w-auto cursor-pointer rounded-full transition-all duration-500 ease-in-out
`;

const ActionButtons = tw.div`
  flex justify-between mt-4 transition-all duration-500 ease-in-out
`;

const ActionButtonImage = tw.div`
  h-3/5 mb-4 transition-all duration-500 ease-in-out
`;

export default Index;
