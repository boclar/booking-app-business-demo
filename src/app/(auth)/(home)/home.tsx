import { useAuth } from '@/hooks/use-auth/use-auth.hooks';
import { Button, Text } from '@boclar/booking-app-components';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
    const { logout } = useAuth();

    const handleLogout = useCallback(async () => {
        await logout();
        router.replace('/');
    }, [logout]);

    const handleTerms = useCallback(() => {
        router.navigate('/terms-and-conditions');
    }, []);

    const handlePrivacy = useCallback(() => {
        router.navigate('/privacy-policy');
    }, []);

    return (
        <SafeAreaView>
            <Button onPress={handleLogout}>
                <Text>Logout</Text>
            </Button>

            <Button onPress={handleTerms}>
                <Text>Open Terms</Text>
            </Button>

            <Button onPress={handlePrivacy}>
                <Text>Open Privacy</Text>
            </Button>
        </SafeAreaView>
    );
};

export default Home;
