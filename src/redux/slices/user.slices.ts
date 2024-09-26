import { BusinessResponse, UserResponse } from '@/types/business-api';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { PURGE } from 'redux-persist';

interface UserState {
    business: BusinessResponse | null;
    token: string | null;
    user: UserResponse | null;
}

const initialState: UserState = {
    business: null,
    token: null,
    user: null,
};

const selectState = (state: RootState) => state.user;

export const selectBusiness = createSelector(
    selectState,
    state => state.business
);
export const selectUser = createSelector(selectState, state => state.user);

export const userSlice = createSlice({
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialState);
    },
    initialState,
    name: 'user',
    reducers: {
        setBusiness: (state, action: PayloadAction<BusinessResponse>) => {
            state.business = action.payload;
        },
        setUser: (state, action: PayloadAction<UserResponse | null>) => {
            state.user = action.payload;
        },
    },
});

export const { setBusiness, setUser } = userSlice.actions;

export const userReducer = userSlice.reducer;
