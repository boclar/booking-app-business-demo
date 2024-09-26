import { useMemo } from 'react';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { screenAnimation } from '@/constants/app.constants';
import { Stack } from 'expo-router';

const Layout = () => {

    const stackScreenOptions = useMemo<NativeStackNavigationOptions>(
        () => ({
            animation: screenAnimation,
            // Fixes the issue with the header being hidden behind the status bar on Android
            headerShown: false,
        }),
        []
    );

    const welcomeOptions = useMemo(
        () => ({
            headerShown: false,
        }),
        []
    );

    const screenWithoutAnimation = useMemo<NativeStackNavigationOptions>(
        () => ({
            animation: 'none',
        }),
        []
    );



    return (
        <Stack
            initialRouteName="/"
            screenOptions={stackScreenOptions}
        >
            <Stack.Screen
                name="(welcome)/welcome"
                options={welcomeOptions}
            />
        </Stack>
    );
};

export default Layout;
