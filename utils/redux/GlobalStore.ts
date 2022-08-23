import {configureStore} from "@reduxjs/toolkit";
import sidebarReducer from "./SidebarSlice";
import categoryNameModalReducer from "./CategoryNameModalSlice";

export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        categoryNameModalInput: categoryNameModalReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch