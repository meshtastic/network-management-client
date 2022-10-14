import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from 'store';

import '../style.css';
import '../App.css';

const ApplicationWrapper = ({ Component, pageProps }: AppProps) => (
    <Provider store={store}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
    </Provider>
);

export default ApplicationWrapper;
