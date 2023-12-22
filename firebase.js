// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { GoogleAuthProvider, getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB2XfAvlj-2WNjLYv5TE02fgE3YEMf1m4M",
    authDomain: "uber-clone-next-8ee76.firebaseapp.com",
    projectId: "uber-clone-next-8ee76",
    storageBucket: "uber-clone-next-8ee76.appspot.com",
    messagingSenderId: "277143425197",
    appId: "1:277143425197:web:cd8a6055e9595017a4f624",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const provider = new GoogleAuthProvider()
const auth = getAuth()

export { app, provider, auth }
