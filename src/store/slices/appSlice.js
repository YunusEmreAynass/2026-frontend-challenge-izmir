import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: 'light',
    isLoading: false,
    language: 'tr',
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
        },
    },
});

export const { setTheme, setLoading, setLanguage } = appSlice.actions;

export default appSlice.reducer;
