import { useEffect } from 'react';
import { useRouter } from 'next/router';
import 'lenis/dist/lenis.css';
import '../styles/gallery.css';
import '../styles/page-motion.css';
import { ScrollMotion } from '../components/ScrollMotion';

export default function Application({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    if (router.pathname !== '/admin' && /(?:invite_token|recovery_token|confirmation_token|access_token)=/.test(window.location.hash)) {
      router.replace('/admin' + window.location.hash);
    }
  }, [router.pathname]);
  if (router.pathname === '/admin') return <Component {...pageProps} />;
  return <ScrollMotion><Component {...pageProps} /></ScrollMotion>;
}
