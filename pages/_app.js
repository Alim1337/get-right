import "../styles/globals.css"
import "tailwindcss/tailwind.css"
import "mapbox-gl/dist/mapbox-gl.css"
import { Toaster, toast } from 'sonner'



function MyApp({ Component, pageProps }) {
    return (
        <>
            <Toaster position="top-right" expand={true} richColors  />
            <Component {...pageProps} />
        </>)
}

export default MyApp
