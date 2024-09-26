import {
    act,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import * as Constants from '@/constants/app.constants';
import * as UseAuth from '@/hooks/use-auth/use-auth.hooks';
import { AuthenticationContextProps } from '@/context/authentication/authentication.context';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';

describe('Auth Layout', () => {
    it('renders screen correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app/(auth)',
                overrides: {},
            },
            {
                initialUrl: '/home',
                wrapper: WithAuthContext,
            }
        );

        await act(() => {
            expect(screen).toHavePathname('/home');
        });
    });

    it('redirects users to the login screen if they are not logged in', async () => {
        const useAuthSpy = jest.spyOn(UseAuth, 'useAuth').mockReturnValue({
            isLogged: false,
        } as AuthenticationContextProps);

        const isJestEnvSpy = jest
            .spyOn(Constants, 'isJestEnv')
            .mockReturnValue(false);

        renderRouter(
            {
                appDir: 'src/app',
                overrides: {},
            },
            {
                initialUrl: '/home',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {});

        await act(() => {
            expect(screen).toHavePathname('/login');
        });

        useAuthSpy.mockRestore();
        isJestEnvSpy.mockRestore();
    });

    it('redirects users to the subscription screen if they are not subscribed', async () => {
        const useAuthSpy = jest.spyOn(UseAuth, 'useAuth').mockReturnValue({
            isLogged: true,
        } as AuthenticationContextProps);

        const isJestEnvSpy = jest
            .spyOn(Constants, 'isJestEnv')
            .mockReturnValue(false);

        renderRouter(
            {
                appDir: 'src/app',
                overrides: {},
            },
            {
                initialUrl: '/home',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {});

        await act(() => {
            expect(screen).toHavePathname('/subscribe');
        });

        useAuthSpy.mockRestore();
        isJestEnvSpy.mockRestore();
    });
});
