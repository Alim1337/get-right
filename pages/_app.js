import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR/client hydration mismatch
  if (!mounted) return null;

  return (
    <>
      <Toaster position="top-right" expand={true} richColors />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;