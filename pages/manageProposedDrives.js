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
      <h1 className="text-4xl font-bold text-center text-blue-600">
        Propositions
      </h1>
      <div className="grid grid-cols-3 gap-4 mt-8">
        {propositions.map((proposition) => (
          <div
            key={proposition.propositionId}
            className="p-4 border-2 border-blue-600 rounded-lg shadow-lg bg-white"
          >
            <p className="text-xl font-semibold text-blue-800">
              Departure: {proposition.departureLocation}
            </p>
            <p className="text-xl font-semibold text-blue-800">
              Destination: {proposition.destinationLocation}
            </p>
            <p className="text-lg text-gray-700">
              Departure Time: {proposition.departureTime.toString()}
            </p>
            <p className="text-lg text-gray-700">
              Available Seats: {proposition.availableSeats}
            </p>
            <div className="flex mt-4 gap-2 justify-center">
              <Button onClick={() => handleSubmit(proposition.propositionId)}><BsCheck2 size={20} />Accept</Button>
            </div>
          </div>
        ))}
      </div>
    </Wrapper>
  );
};

const Button = tw.button`
mt-2 self-end bg-blue-500 text-white p-2 gap-2 rounded-lg flex justify-center items-center
`;

const Wrapper = tw.div`
  p-4 bg-gray-200 h-screen
`;
const ButtonContainer = tw.div`
  bg-white p-2 h-12
`;

const BackButton = tw.button``;

export default SeePropositions;
