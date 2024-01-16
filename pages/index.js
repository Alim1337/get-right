import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"


import tw from "tailwind-styled-components"
import Map from "../components/Map"
import { SiUber } from "react-icons/si"
import { FaCar, FaBiking, FaCalendarAlt } from "react-icons/fa"
import Link from "next/link"
const Index = () => {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser({
                    name: user.displayName,
                    photoUrl: user.photoURL,
                })
            } else {
                setUser(null)
                router.push("/login")
            }
        })
    }, [])
    return (
        <Wrapper>
            {/* map wrapper */}
            <Map />

            {/* Action Items Wrapper */}
            <ActionItems>
                {/* ===================================== */}
                {/* HEADER */}
                {/* ===================================== */}
                <Header>
                    {/* Uber Logo */}
                    <SiUber size={44} />

                    {/* Profile */}
                    <Profile>
                        <Name>{user && user.name}</Name>
                        <UserImage
                            src={user && user.photoUrl}
                            onClick={() => signOut(auth)}
                        />
                    </Profile>
                </Header>

                {/* ===================================== */}
                {/* ACTION BUTTONS */}
                {/* ===================================== */}
                <ActionButtons>
                    <Link href='/search' passHref>
                        <ActionButton>
                            <ActionButtonImage>
                                <FaCar size={34} />
                            </ActionButtonImage>
                            Ride
                        </ActionButton>
                    </Link>



                    <ActionButton>
                        {" "}
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

                {/* ===================================== */}
                {/* INPUT BUTTONS */}
                {/* ===================================== */}
                <InputButton>Where to?</InputButton>
            </ActionItems>
        </Wrapper>
    )
}

const Wrapper = tw.div`
  flex flex-col bg-red-300 h-screen
`
const ActionItems = tw.div`
  bg-white flex-1 p-4
`

const Header = tw.div`
    flex justify-between items-center
`

const Profile = tw.div`
    flex flex-row items-center
`
const Name = tw.div`
    mr-2 text-sm
`

const UserImage = tw.img`
    h-8 w-auto cursor-pointer rounded-full
`

const ActionButtons = tw.div`
    flex justify-between mt-4
`

const ActionButton = tw.button`
    bg-gray-200 flex-1 m-1 flex flex-col 
    p-4 justify-between items-center text-xl
    rounded transform hover:scale-105 transition
`
const ActionButtonImage = tw.div`
    h-3/5
    mb-4
`

const InputButton = tw.div`
    h-20 bg-gray-200 text-2xl p-4
    flex items-center mt-8 rounded
`

export default Index
