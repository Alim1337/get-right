import tw from "tailwind-styled-components"
import Map from "../components/Map"
import RideSelector from "../components/RideSelector"
import { useRouter } from "next/router"
import { BsArrowLeft } from "react-icons/bs"
import Link from "next/link"
const Confirm = () => {
    const router = useRouter()
    const { pickup, dropoff } = router.query
    return (
        <Wrapper>
            <Link href='/search' passHref>
                <BackButton>
                    <BsArrowLeft size={32} />
                </BackButton>
            </Link>

            <Map pickupCoords={pickup} dropoffCoords={dropoff} />

            <RideContainer>
                <RideSelector pickupCoords={pickup} dropoffCoords={dropoff} />
                <ConfirmButtonContainer>
                    <ConfirmButton>Confirm UberX</ConfirmButton>
                </ConfirmButtonContainer>
            </RideContainer>
        </Wrapper>
    )
}

const Wrapper = tw.div`
    flex h-screen flex-col overflow-y-hidden relative
`

const RideContainer = tw.div`
    flex-1 px-2 flex flex-col h-1/2
`
const ConfirmButtonContainer = tw.div`

`
const ConfirmButton = tw.button`
    w-full py-4 px-6 my-4 text-blue-100 
    transition-colors duration-150 bg-blue-700 
    rounded-lg focus:shadow-outline hover:bg-blue-800
`

const BackButton = tw.button`
    absolute z-50 inset-2 bg-blue-100 h-12 w-12 
    p-2 rounded-full text-blue-700 opacity-90
`

export default Confirm
