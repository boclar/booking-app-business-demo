import { router, Stack, useFocusEffect, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { isJestEnv, screenAnimation } from '@/constants/app.constants';
import { useAuth } from '@/hooks/use-auth/use-auth.hooks';
import { selectBusiness } from '@/redux/slices/user.slices';
import { useSelector } from 'react-redux';
import { SubscribeResponseStatus } from '@/types/business-api';

const Layout = () => {
    const { isLogged } = useAuth();
    const business = useSelector(selectBusiness);
    const pathname = usePathname();

    const isBusinessActive =
        business?.subscription?.status === SubscribeResponseStatus.Active;

    const stackScreenOptions = useMemo<NativeStackNavigationOptions>(
        () => ({
            animation: screenAnimation,
            // Fixes the issue with the header being hidden behind the status bar on Android
            headerShown: false,
        }),
        []
    );

    useFocusEffect(() => {
        const handleRedirection = async () => {
            if (isJestEnv()) return;
            // Redirect to the initial screen if the user is not logged in
            if (!isLogged) return router.replace('/login');
            if (await handleBusinessSubscription()) return;
        };

        const handleBusinessSubscription = async () => {
            const restrictedPathnames = ['/subscribe'];
            if (!restrictedPathnames.includes(pathname) && !isBusinessActive) {
                router.replace('/subscribe');

                return true;
            }

            return false;
        };

        handleRedirection();
    });

    if (!isJestEnv() && !isLogged) return null;

    return (
        <Stack
            initialRouteName="home"
            screenOptions={stackScreenOptions}
        />
    );
};

export default Layout;
