import {combineReducers, configureStore} from "@reduxjs/toolkit";
import sidebarReducer from "./SidebarSlice";
import darkModeReducer from "./DarkModeSlice";
import userDataSliceReducer from "./UserDataSlice";
// @ts-ignore
import storage from "redux-persist/lib/storage";
import {persistReducer, persistStore} from "redux-persist";
import thunk from "redux-thunk";

const persistConfig = {
    key: 'root',
    storage,
}

const rootReducer = combineReducers({
    sidebar: sidebarReducer,
    darkMode: darkModeReducer,
    userData: userDataSliceReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: [thunk]
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
