import {createSlice} from "@reduxjs/toolkit";

const userDataSlice = createSlice({
    name: 'userData',
    initialState: {
        value: {}
    },
    reducers: {
        setUserData: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setUserData } = userDataSlice.actions;
export default userDataSlice.reducer;