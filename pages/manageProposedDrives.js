import React, { useState, useEffect } from "react";
import tw from "tailwind-styled-components";
import Link from "next/link";
import { BsArrowLeft, BsCheck2 } from "react-icons/bs";
import { Toaster, toast } from 'sonner'

const SeePropositions = () => {
  const [propositions, setPropositions] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [driverId, setDriverId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setDriverId(decodedToken.userId);
    console.log('this is decodedToken', decodedToken);
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/apiManageProposedDrives");
        if (response.ok) {
          const data = await response.json();
          setPropositions(data);
        } else {
          console.error("Failed to fetch propositions data");
        }
      } catch (error) {
        console.error("Error fetching propositions:", error);
      }
    };

    fetchData();
  }, []);

  // const handleRequestSeat = (propositionId) => {
  //   setSelectedSeats((prev) => ({
  //     ...prev,
  //     [propositionId]: (prev[propositionId] || 0) + 1,
  //   }));
  // };

  const handleSubmit = async (propositionId) => {
    try {
      const response = await fetch("/api/apiManageProposedDrives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propositionId: propositionId, driverId: driverId, action: 'accept' }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Seat requested successfully:", data);
  
        // Update propositions state by removing the accepted proposition
        setPropositions((prevPropositions) =>
          prevPropositions.filter((prop) => prop.propositionId !== propositionId)
        );
        toast.success('Drive proposition accepted successfully', {
          position: 'top-center',
          duration: 3000,
        });
        router.push('/');
      } else {
        console.error("Failed to request seat");
      }
    } catch (error) {
      console.error("Error requesting seat:", error);
    }
  };
  

  return (
    <Wrapper>
      <ButtonContainer>
        <Link href="/" passHref>
          <BackButton>
            <BsArrowLeft size={30} />
          </BackButton>
        </Link>
      </ButtonContainer>
      <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-10">
        Propositions
      </h1>
      <div className="grid grid-cols-3 gap-8">
        {propositions.map((proposition) => (
          <div
            key={proposition.propositionId}
            className="p-8 border-4 border-indigo-600 rounded-2xl shadow-2xl bg-white transform hover:scale-110 transition-transform duration-200"
          >
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">
              User name: {proposition.users.firstName}
            </p>
  
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">
              Last Name: {proposition.users.lastName}
            </p>
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">
              Departure: {proposition.departureLocation}
            </p>
            <p className="text-3xl font-extrabold text-indigo-900 mb-3">
              Destination: {proposition.destinationLocation}
            </p>
            <p className="text-2xl text-gray-800 mb-3">
              Departure Time: {proposition.departureTime.toString()}
            </p>
            <p className="text-2xl text-gray-800 mb-6">
              Available Seats: {proposition.availableSeats}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => handleSubmit(proposition.propositionId)}>
                <BsCheck2 size={25} /> Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};
  const Button = tw.button`
    mt-2 self-end bg-indigo-500 text-white py-3 px-6 gap-2 rounded-full flex justify-center items-center hover:bg-indigo-700 transition-colors duration-200
  `;
  
  const Wrapper = tw.div`
    p-6 bg-gray-300 min-h-screen
  `;
  
  const ButtonContainer = tw.div`
    bg-white p-4 h-16
  `;
  
  const BackButton = tw.button`
    hover:bg-gray-300 transition-colors duration-200
  `;
  
  export default SeePropositions;
  
  
