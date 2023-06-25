import { Action, combineReducers, configureStore, ThunkAction } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/SidebarSlice";
import darkModeReducer from "./slices/DarkModeSlice";
import userDataSliceReducer from "./slices/UserDataSlice";
import {persistReducer, persistStore} from "redux-persist";
import storage from "./NoopStorage";
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from "redux-persist/es/constants";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { createWrapper } from "next-redux-wrapper";

const persistConfig = {
    key: 'root',
    storage,
}

const rootReducers = combineReducers({
    sidebar: sidebarReducer,
    darkMode: darkModeReducer,
    userData: userDataSliceReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducers);

const reducers = combineReducers({
    persistedReducer
})

export function makeStore() {
    return configureStore({
        reducer: reducers,
        devTools: process.env.NODE_ENV !== 'production',
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            }),
    })
}

export const store = makeStore();
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const persistor = persistStore(store);
export const storeWrapper = createWrapper(() => store)
export default store;
