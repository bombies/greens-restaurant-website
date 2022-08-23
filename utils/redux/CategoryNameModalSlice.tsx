import {createSlice} from "@reduxjs/toolkit";

export const categoryNameModalSlice = createSlice({
    name: 'categoryNameModalInput',
    initialState: {
        value: ''
    },
    reducers: {
        updateNewCategoryName: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { updateNewCategoryName } = categoryNameModalSlice.actions;
export default categoryNameModalSlice.reducer;