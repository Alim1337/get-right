// pages/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import tw from "tailwind-styled-components";
import Map from "../components/Map";
import { SiUber } from "react-icons/si";
import { FaCar, FaBiking, FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";

const Index = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState([44, 36.2]); // Default location
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
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
          <SiUber size={44} />
          <Profile>
            <Name>{user && user.name}</Name>
            <UserImage src={user && user.photoUrl} onClick={() => signOut(auth)} />
          </Profile>
          <DisconnectButton onClick={handleDisconnect}>Disconnect</DisconnectButton>
        </Header>

        <ActionButtons>
          <Link href="/search" passHref>
            <ActionButton>
              <ActionButtonImage>
                <FaCar size={34} />
              </ActionButtonImage>
              Ride
            </ActionButton>
          </Link>

          <ActionButton>
            <ActionButtonImage>
              <FaBiking size={34} />
            </ActionButtonImage>
            Wheels
          </ActionButton>

          <ActionButton>
            <ActionButtonImage>
              <FaCalendarAlt size={34} />
            </ActionButtonImage>
            Reserve
          </ActionButton>
        </ActionButtons>

        <InputButton>Where to?</InputButton>
      </ActionItems>
    </Wrapper>
  );
};

const DisconnectButton = tw.button`
    h-8 w-auto bg-gray-200 text-xl p-2
    flex items-center rounded
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

const ActionButton = tw.button`
    bg-gray-200 flex-1 m-1 flex flex-col 
    p-4 justify-between items-center text-xl
    rounded transform hover:scale-105 transition
`;

const ActionButtonImage = tw.div`
    h-3/5
    mb-4
`;

const InputButton = tw.div`
    h-20 bg-gray-200 text-2xl p-4
    flex items-center mt-8 rounded
`;

export default Index;
