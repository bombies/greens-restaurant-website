import {configureStore} from "@reduxjs/toolkit";
import sidebarReducer from "./SidebarSlice";
import darkModeReducer from "./DarkModeSlice";
import categoryNameModalReducer from "./CategoryNameModalSlice";

export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        categoryNameModalInput: categoryNameModalReducer,
        darkMode: darkModeReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch