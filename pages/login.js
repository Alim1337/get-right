import { useEffect } from "react"
import { useRouter } from "next/router"
import { signInWithPopup, onAuthStateChanged } from "firebase/auth"
import { auth, provider } from "../firebase"

import tw from "tailwind-styled-components"
import { SiUber } from "react-icons/si"
const Login = () => {
    const router = useRouter()

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push("/")
            }
        })
    }, [])
    return (
        <Wrapper>
            <SiUber size={48} />
            <Title>Login to access your account</Title>
            <HeadImage src='https://i.ibb.co/CsV9RYZ/login-image.png' />
            <SignInButton onClick={() => signInWithPopup(auth, provider)}>
                Sign in with Google
            </SignInButton>
        </Wrapper>
    )
}
const Wrapper = tw.div`
    p-4 flex flex-col h-screen w-screen bg-gray-200
`
const SignInButton = tw.button`
w-full py-4 px-6 my-4 text-blue-100 
transition-colors duration-150 bg-blue-700 
rounded-lg focus:shadow-outline hover:bg-blue-800
`
const Title = tw.div`
    text-5xl pt-4 text-gray-500
`

const HeadImage = tw.img`
    object-contain w-full
`

export default Login
