import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import NextNProgress from "nextjs-progressbar";
import NotificationProvider from "../components/notifications/NotificationProvider";
import {QueryClient, QueryClientProvider} from 'react-query';
import ModalProvider from "../components/modals/ModalProvider";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <QueryClientProvider client={queryClient}>
          <NotificationProvider>
              <ModalProvider>
                  <NextNProgress color='#0c8400'/>
                  <Component {...pageProps} />
              </ModalProvider>
          </NotificationProvider>
      </QueryClientProvider>
  )
}

export default MyApp
