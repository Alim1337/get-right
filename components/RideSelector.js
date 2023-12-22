import { useState, useEffect } from "react"
import tw from "tailwind-styled-components"
import { carList } from "../data/carList"
import { accessToken } from "./Map"
const RideSelector = ({ pickupCoords, dropoffCoords }) => {
    const [rideDuration, setRideDuration] = useState(0)

    // ride duration from mapbox API
    // requires
    // pickup coordinates
    // dropoff coordinates

    useEffect(() => {
        fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?access_token=${accessToken}`
        )
            .then((res) => res.json())
            .then((data) => setRideDuration(data.routes[0].duration / 100))
            .catch((e) => console.log(e))
    }, [pickupCoords, dropoffCoords])
    return (
        <Wrapper>
            <Title>Choose a ride, or swipe to see more.</Title>

            <CarList>
                {carList.map((car, idx) => (
                    <Car key={idx}>
                        <CarImageContainer>
                            <CarImage src={car.imgUrl} />
                        </CarImageContainer>
                        <CarDetails>
                            <Service>{car.service}</Service>
                            <Time>{rideDuration.toFixed()} min away</Time>
                        </CarDetails>
                        <Price>
                            ${(rideDuration * car.multipiler).toFixed(2)}
                        </Price>
                    </Car>
                ))}
            </CarList>
        </Wrapper>
    )
}

const Wrapper = tw.div`
    flex-1 flex flex-col overflow-y-scroll
`

const Title = tw.div`
    text-center text-gray-500 text-xs border-b py-2
`

/* ===================================
    CAR
=================================== */
const CarList = tw.div`
    flex flex-col overflow-y-scroll
`
const Car = tw.div`
    flex flex-row py-4 items-center cursor-pointer
`
const CarImageContainer = tw.div`
     w-28 flex-initial
`
const CarImage = tw.img`
    h-14 mr-4
`
const CarDetails = tw.div`
    flex-1
`
const Service = tw.div`
    font-bold
`
const Time = tw.div`
    text-sm text-blue-500
`
const Price = tw.div`
    text-sm
`

export default RideSelector
