import {createSlice} from "@reduxjs/toolkit";

export const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState: {
        value: true
    },
    reducers: {
        toggleSidebarState: (state) => {
            state.value = !state.value;
        }
    }
})

export const { toggleSidebarState } = sidebarSlice.actions;
export default sidebarSlice.reducer;