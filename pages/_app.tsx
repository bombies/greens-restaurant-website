import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import NextNProgress from "nextjs-progressbar";
import NotificationProvider from "../components/notifications/NotificationProvider";
import {QueryClient, QueryClientProvider} from 'react-query';
import ModalProvider from "../components/modals/ModalProvider";
import {Provider} from "react-redux";
import {store} from "../utils/redux/GlobalStore";
import DarkModeWrapper from "../components/DarkModeWrapper";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <Provider store={store}>
          <QueryClientProvider client={queryClient}>
              <DarkModeWrapper>
                  <ModalProvider>
                      <NotificationProvider>
                          <NextNProgress color='#0c8400'/>
                          <Component {...pageProps} />
                      </NotificationProvider>
                  </ModalProvider>
              </DarkModeWrapper>
          </QueryClientProvider>
      </Provider>
  )
}

export default MyApp
