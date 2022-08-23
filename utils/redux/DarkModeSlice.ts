import {createSlice} from "@reduxjs/toolkit";

const darkModeSlice = createSlice({
    name: 'darkMode',
    initialState: {
        value: false
    },
    reducers: {
        toggleDarkMode: (state) => {
            state.value = !state.value;
        }
    }
});

export const { toggleDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;