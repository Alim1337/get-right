import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { signInWithPopup, onAuthStateChanged } from "firebase/auth"
import { auth, provider } from "../firebase"

import tw from "tailwind-styled-components"
import { SiX } from "react-icons/si"

const Login = () => {
    const router = useRouter()
    const [showLoginFields, setShowLoginFields] = useState(false)
    const [showInscriptionFields, setShowInscriptionFields] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push("/"); // Redirect to the main page if token exists
        }
    }, [])

    const handleSignInClick = () => {
        setShowLoginFields(true)
    }

    const handleInscriptionClick = () => {
        setShowInscriptionFields(true)
    }

    const handleLogin = async () => {
        try {
            const response = await fetch('/api/login_users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token_login) {
                    // handle successful login here
                    localStorage.setItem('token', data.token_login);
                    console.log('Token:', data.token_login);
                    router.push("/"); // Redirect to the main page
                } else {
                    // handle failed login here
                    alert('Login failed');
                }
            } else {
                // handle other error cases
                console.error(`Failed to fetch: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <Wrapper>
            <LogoWrapper>
                <SiX size={48} />
            </LogoWrapper>
            <Title>Login to access your account</Title>
            <HeadImage src='https://i.ibb.co/CsV9RYZ/login-image.png' />
            {showLoginFields && (
                <>
                    <Input type="text" placeholder="email" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <SignInButtonL onClick={handleLogin}>
                        Sign in 
                    </SignInButtonL>
                </>
            )}
           {showInscriptionFields && (
    <>
        <Input type="text" placeholder="First Name" />
        <Input type="text" placeholder="Last Name" />
        <Input type="text" placeholder="Phone Number" />
        <Input type="text" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <SignInButtonL onClick={handleInscriptionClick}>
            Register 
        </SignInButtonL>
    </>
)}

            {!showLoginFields && !showInscriptionFields && <SignInButton onClick={handleSignInClick}>Sign in</SignInButton>}
            <SignInButton onClick={() => signInWithPopup(auth, provider)}>
                Sign in with Google
            </SignInButton>
           <InscriptionButton onClick={handleInscriptionClick}>inscription</InscriptionButton>
        </Wrapper>
    )
}


// ... rest of your code


const Wrapper = tw.div`
    flex flex-col items-center justify-center h-screen w-screen bg-gray-200
`

const LogoWrapper = tw.div`
    bg-white p-4 rounded-full mb-4
`

const SignInButton = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`

const SignInButtonL = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`

const InscriptionButton = tw.button`
w-64 py-2 px-4 my-4 bg-white hover:bg-gray-100 text-gray-800 
font-semibold border border-gray-400 rounded shadow
`


const Input = tw.input`
w-64 py-2 px-4 my-2 bg-white border border-gray-300 rounded shadow
`

const Title = tw.div`
    text-3xl pt-4 text-gray-500
`
const HeadImage = tw.img`
    object-contain w-64 h-64
`

export default Login
