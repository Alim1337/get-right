// pages/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import tw from "tailwind-styled-components";
import Map from "../components/Map";
import { SiUber } from "react-icons/si";
import { FaCar, FaPlusCircle, FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import ReservedRidesModal from '../components/ReservedRidesModal';


const Index = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState([44, 36.2]);
  const [hasReservations, setHasReservations] = useState(false);
  const router = useRouter();
  const [reservations, setReservations] = useState({});
  const [showReservedRidesModal, setShowReservedRidesModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
    } else {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUser({ role: localStorage.getItem('role'), id: decodedToken.userId });
      } catch (error) {
        console.error('Error decoding token:', error);
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`/api/apiReservation?userId=${user.id}`);
        const data = await response.json();
        console.log('API Response for reservations:', data); // Log the data received

        // Check if data.reservations exists and is an array
        if (data.reservations) {
          setReservations(data.reservations);
        } else {
          setReservations({}); // Set reservations to an empty object if not an array
        }

        setHasReservations(data.hasReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    if (user && user.id) {
      fetchReservations();
    }
  }, [user]);


 

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
          <Profile>
            <Name>{user && user.name}</Name>
            <UserImage src={user && user.photoUrl} onClick={() => signOut(auth)} />
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
            <Link href="/manageDrives" passHref>
              <div className="w-full">
                
                <ActionButton className="">Manage My Drives</ActionButton>
              </div>
            </Link>
          ) : (
            <div className="w-full text-center justify-center">
             {hasReservations && (
    <ActionButton className="w-full text-center" onClick={handleShowReservedRides}>
      My reserved rides?
    </ActionButton>
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
