import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { isRunningInExpoGo } from 'expo';

export const maxScreenWidth = 800;
export const isUserAuthenticatedState: () => boolean = () => true;
export const appUrl = 'https://boclar.com/';
export const appName = 'Boclar';
export const screenAnimation: NativeStackNavigationOptions['animation'] =
    'slide_from_right';
// Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_"
export const secureStoreKey = 'bookingappbusiness.';
export const localStorageKey = '@bookingappbusiness';

export const isJestEnv = (): boolean => {
    // @ts-ignore Do not use `@types/node` because it will prioritize Node types over RN types which breaks the types (ex. setTimeout) in React Native projects.
    return !!process.env.JEST_WORKER_ID;
};

export const isProd = (): boolean => {
    return process.env.NODE_ENV === 'production';
};

export const isDev = (): boolean => {
    return isRunningInExpoGo();
};
