import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { PURGE } from 'redux-persist';

interface UIState {
    language: string | null;
}

const initialState: UIState = {
    /*
     * The language is set to null by default to allow the LocaleProvider to set it to the device language
     * language: null,
     */
    language: null,
};

const selectUI = (state: RootState) => state.ui;

export const selectLanguage = createSelector(selectUI, ui => ui.language);

export const uiSlice = createSlice({
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState);
    },
    initialState,
    name: 'ui',
    reducers: {
        changeLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
    },
});

export const { changeLanguage } = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
