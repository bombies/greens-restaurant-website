import "../styles/globals.scss";
import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import NotificationProvider from "../components/notifications/NotificationProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import ModalProvider from "../components/modals/ModalProvider";
import { Provider } from "react-redux";
import { persistor, store } from "../utils/redux/GlobalStore";
import DarkModeWrapper from "../components/DarkModeWrapper";
import { PersistGate } from "redux-persist/integration/react";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <QueryClientProvider client={queryClient}>
                    <DarkModeWrapper>
                        <NotificationProvider>
                            <ModalProvider>
                                <NextNProgress color="#0c8400" />
                                <Component {...pageProps} />
                            </ModalProvider>
                        </NotificationProvider>
                    </DarkModeWrapper>
                </QueryClientProvider>
            </PersistGate>
        </Provider>
    );
}

export default MyApp
