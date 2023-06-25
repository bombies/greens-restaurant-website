'use client';

import { Provider } from "react-redux";
import { persistor, store } from "../../utils/redux/GlobalStore";
import { PersistGate } from "redux-persist/integration/react";
import { PropsWithChildren } from "react";

export default function ReduxProvider(props: PropsWithChildren) {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor} loading={null}>
                {props.children}
            </PersistGate>
        </Provider>
    )
}