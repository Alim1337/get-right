import { useState } from "react"
import tw from "tailwind-styled-components"
import {
    BsArrowLeft,
    BsCircleFill,
    BsPlusLg,
    BsThreeDotsVertical,
} from "react-icons/bs"
import { FaSquareFull } from "react-icons/fa"

import { MdStars } from "react-icons/md"
import Link from "next/link"
import { accessToken } from "../components/Map"

const Search = () => {
    const [pickup, setPickup] = useState([0, 0])
    const [dropoff, setDropoff] = useState([0, 0])

    const getCoords = (location, callback) => {
        fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?${new URLSearchParams(
                { access_token: accessToken, limit: 1 }
            )}`
        )
            .then((response) => response.json())
            .then((data) => {
                const points = data.features[0].center
                callback(points)
            })
            .catch((err) => console.log(err))
    }

    return (
        <Wrapper>
            {/* Button Container */}
            <ButtonContainer>
                <Link href='/' passHref>
                    <BackButton>
                        <BsArrowLeft size={30} />
                    </BackButton>
                </Link>
            </ButtonContainer>

            {/* Input Container */}
            <InputContainer>
                <FromToIcons>
                    <BsCircleFill size={12} opacity={0.5} />
                    <BsThreeDotsVertical size={30} opacity={0.5} />
                    <FaSquareFull size={12} opacity={0.5} />
                </FromToIcons>

                <InputBoxes>
                    <Input
                        onChange={(e) => getCoords(e.target.value, setPickup)}
                        placeholder='Enter pickup location'
                    />
                    <Input
                        onChange={(e) => getCoords(e.target.value, setDropoff)}
                        placeholder='Where to?'
                    />
                </InputBoxes>

                <PlusIcon>
                    <BsPlusLg size={22} />
                </PlusIcon>
            </InputContainer>

            {/* Saved Places */}
            <SavedPlaces>
                <MdStars size={30} /> Saved Places
            </SavedPlaces>

            {/* Confirm Locations */}
            <Link
                href={{
                    pathname: "/confirm",
                    query: {
                        pickup: pickup,
                        dropoff: dropoff,
                    },
                }}
                passHref>
                <ConfirmLocation>Confirm Location</ConfirmLocation>
            </Link>
        </Wrapper>
    )
}

const Wrapper = tw.div`
    p-4 bg-gray-200 h-screen
`
const ButtonContainer = tw.div`
    bg-white p-2 h-12
`

const BackButton = tw.button` `

const InputContainer = tw.div`
    bg-white flex items-center py-4 my-4
`
const FromToIcons = tw.div`
    w-10 h-16 flex flex-col items-center justify-between
`

const InputBoxes = tw.div`
 flex flex-col flex-1
`

const Input = tw.input`
h-14 bg-gray-200 px-4 my-2 rounded-2 outline-none border-none
`

const PlusIcon = tw.button`
      bg-gray-200 m-4 p-2 rounded-full
`

const SavedPlaces = tw.div`
    flex items-center bg-white p-2 rounded-2
`

const ConfirmLocation = tw.button`
    w-full h-12 px-6 my-4 text-blue-100 
    transition-colors duration-150 bg-blue-700 
    rounded-lg focus:shadow-outline hover:bg-blue-800
`
export default Search
