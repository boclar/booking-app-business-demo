import { renderRouter, screen } from 'expo-router/testing-library';
import { waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as useAuthHook from '@/hooks/use-auth/use-auth.hooks';
import { AuthenticationContextProps } from '@/context/authentication/authentication.context';
import * as Constants from '@/constants/app.constants';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';
import { router } from 'expo-router';

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');

    return {
        ...originalModule,
        router: {
            ...originalModule.router,
            replace: jest.fn(),
        },
    };
});

describe('Layout', () => {
    const originalEnv = process.env;

    afterEach(() => {
        // Reset process.env after each test case
        process.env = originalEnv;
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
    });

    it('renders screen correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/welcome');
        });
    });

    it('redirects users to the home screen if they are logged in', async () => {
        const useAuthSpy = jest.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            isLogged: true,
        } as AuthenticationContextProps);

        const isJestEnvSpy = jest
            .spyOn(Constants, 'isJestEnv')
            .mockReturnValue(false);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            expect(router.replace).toHaveBeenNthCalledWith(1, {
                pathname: '/home',
            });
        });

        useAuthSpy.mockRestore();
        isJestEnvSpy.mockRestore();
    });
});
