import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import {
    CreateBusinessOwnerResponse,
    CreateBusinessResponse,
} from '@/types/business-api';
import { PURGE } from 'redux-persist';

export interface UserProgressState {
    createBusinessForm: {
        businessName: string;
        businessType: string;
        country: string;
        currency: string;
        domain: string;
        language: string;
        themeStyle: string;
        timezone: string;
    };
    createBusinessOwnerForm: {
        acceptMarketing: string;
        acceptTerms: string;
        birthdate: string;
        email: string;
        firstname: string;
        gender: string;
        lastname: string;
        nationality: string;
        password: string;
        phoneNumber: `+${string}`;
        profilePicture: string;
        repeatPassword: string;
        username: string;
    };
    hasOpenedReportIssue: boolean;
    isBusinessCreated: CreateBusinessResponse | null;
    isBusinessOwnerCreated:
        | ({
              email: string;
              phone: string;
          } & CreateBusinessOwnerResponse)
        | null;
    isBusinessOwnerEmailVerified: {
        hasPhone: boolean;
        isEmailVerified: boolean;
    };
    isBusinessOwnerPhoneVerified: {
        isPhoneVerified: boolean;
        skipPhoneVerification: boolean;
    };
}

export const initialUserProgressState: UserProgressState = {
    createBusinessForm: {
        businessName: '',
        businessType: '',
        country: '',
        currency: '',
        domain: '',
        language: '',
        themeStyle: '',
        timezone: '',
    },
    createBusinessOwnerForm: {
        acceptMarketing: '',
        acceptTerms: '',
        birthdate: '',
        email: '',
        firstname: '',
        gender: '',
        lastname: '',
        nationality: '',
        password: '',
        phoneNumber: '' as `+${string}`,
        profilePicture: '',
        repeatPassword: '',
        username: '',
    },
    hasOpenedReportIssue: false,
    isBusinessCreated: null,
    isBusinessOwnerCreated: null,
    isBusinessOwnerEmailVerified: {
        hasPhone: false,
        isEmailVerified: false,
    },
    isBusinessOwnerPhoneVerified: {
        isPhoneVerified: false,
        skipPhoneVerification: false,
    },
};

const selectUserProgress = (state: RootState) => state.userProgress;

export const selectCreateBusinessForm = createSelector(
    selectUserProgress,
    userProgress => userProgress.createBusinessForm
);

export const selectCreateBusinessOwnerForm = createSelector(
    selectUserProgress,
    userProgress => userProgress.createBusinessOwnerForm
);

export const selectHasOpenedReportIssue = createSelector(
    selectUserProgress,
    userProgress => userProgress.hasOpenedReportIssue
);

export const selectIsBusinessOwnerCreated = createSelector(
    selectUserProgress,
    userProgress => userProgress.isBusinessOwnerCreated
);

export const selectIsBusinessCreated = createSelector(
    selectUserProgress,
    userProgress => userProgress.isBusinessCreated
);

export const selectIsBusinessOwnerEmailVerified = createSelector(
    selectUserProgress,
    userProgress => userProgress.isBusinessOwnerEmailVerified
);

export const selectIsBusinessOwnerPhoneVerified = createSelector(
    selectUserProgress,
    userProgress => userProgress.isBusinessOwnerPhoneVerified
);

export const userProgressSlice = createSlice({
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialUserProgressState);
    },
    initialState: initialUserProgressState,
    name: 'userProgress',
    reducers: {
        setCreateBusinessFormField: (
            state,
            action: PayloadAction<{
                field: keyof UserProgressState['createBusinessForm'];
                value: UserProgressState['createBusinessForm'][keyof UserProgressState['createBusinessForm']];
            }>
        ) => {
            state.createBusinessForm = {
                ...state.createBusinessForm,
                [action.payload.field]: action.payload.value,
            };
        },
        setCreateBusinessOwnerFormField: (
            state,
            action: PayloadAction<{
                field: keyof UserProgressState['createBusinessOwnerForm'];
                value: UserProgressState['createBusinessOwnerForm'][keyof UserProgressState['createBusinessOwnerForm']];
            }>
        ) => {
            state.createBusinessOwnerForm = {
                ...state.createBusinessOwnerForm,
                [action.payload.field]: action.payload.value,
            };
        },
        setIsBusinessCreated: (
            state,
            action: PayloadAction<UserProgressState['isBusinessCreated']>
        ) => {
            state.isBusinessCreated = action.payload;
        },
        setIsBusinessOwnerCreated: (
            state,
            action: PayloadAction<UserProgressState['isBusinessOwnerCreated']>
        ) => {
            state.isBusinessOwnerCreated = action.payload;
        },
        setIsBusinessOwnerEmailVerified: (
            state,
            action: PayloadAction<
                UserProgressState['isBusinessOwnerEmailVerified']
            >
        ) => {
            state.isBusinessOwnerEmailVerified = action.payload;
        },

        setIsBusinessOwnerPhoneVerified: (
            state,
            action: PayloadAction<
                UserProgressState['isBusinessOwnerPhoneVerified']
            >
        ) => {
            state.isBusinessOwnerPhoneVerified = action.payload;
        },
    },
});

export const {
    setCreateBusinessFormField,
    setCreateBusinessOwnerFormField,
    setIsBusinessCreated,
    setIsBusinessOwnerCreated,
    setIsBusinessOwnerEmailVerified,
    setIsBusinessOwnerPhoneVerified,
} = userProgressSlice.actions;

export const userProgressReducer = userProgressSlice.reducer;
