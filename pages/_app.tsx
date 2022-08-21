import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import NextNProgress from "nextjs-progressbar";
import NotificationProvider from "../components/notifications/NotificationProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <>
          <NotificationProvider>
              <NextNProgress color='#0c8400'/>
              <Component {...pageProps} />
          </NotificationProvider>
      </>
  )
}

export default MyApp
