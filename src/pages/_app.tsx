import type { AppProps } from 'next/app';

import '../style.css';
import '../App.css';

export default function MyApp({ Component, pageProps }: AppProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...pageProps} />;
}
