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

const Index = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState([44, 36.2]); // Default location
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      // Fetch user information including role
      const userRole = localStorage.getItem("role");
      setUser({ role: userRole });
    }
  }, []);

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
  }, []); // Empty dependency array means this effect runs once after the initial render

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
              <ActionButton className="w-full text-center">Where to?</ActionButton>
            </div>
          )}
        </div>

      </ActionItems>
    </Wrapper>
  );
};

const DisconnectButton = tw.button`
  inline-block rounded-full bg-black text-white px-6 pb-2 pt-2.5 text-xl font-medium uppercase leading-normal text-center transition duration-300 ease-in-out hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50 active:bg-gray-900
`;

const ActionButton = tw.button`
  inline-block w-full rounded-full bg-gray-200 text-black px-6 pb-2 pt-2.5 text-2xl font-serif uppercase leading-normal text-center shadow-[0_4px_9px_-4px_rgba(51,45,45,0.7)] transition duration-150 ease-in-out hover:bg-gray-300 hover:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:bg-gray-300 focus:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:outline-none focus:ring-0 active:bg-gray-300 active:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] dark:bg-gray-200 dark:shadow-[0_4px_9px_-4px_#030202] dark:hover:bg-gray-300 dark:hover:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:focus:bg-gray-300 dark:focus:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:active:bg-gray-300 dark:active:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)]
`;


const Wrapper = tw.div`
  flex flex-col bg-red-300 h-screen
`;

const ActionItems = tw.div`
  bg-white flex-1 p-4
`;

const Header = tw.div`
  flex justify-between items-center
`;

const Profile = tw.div`
  flex flex-row items-center
`;

const Name = tw.div`
  mr-2 text-sm
`;

const UserImage = tw.img`
  h-8 w-auto cursor-pointer rounded-full
`;

const ActionButtons = tw.div`
  flex justify-between mt-4
`;

const ActionButtonImage = tw.div`
  h-3/5
  mb-4
`;

export default Index;
