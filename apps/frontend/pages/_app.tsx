import type { AppProps } from 'next/app';

import 'flag-icons/css/flag-icons.min.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
