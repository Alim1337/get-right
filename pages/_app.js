import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import { Toaster } from 'sonner';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Toaster position="top-right" expand={true} richColors />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;