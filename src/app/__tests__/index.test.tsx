import { act, renderRouter, screen } from 'expo-router/testing-library';
import * as BookingAppComponents from '@boclar/booking-app-components';
import * as Constants from '@/constants/app.constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as UseAuthHook from '@/hooks/use-auth/use-auth.hooks';
import { AuthenticationContextProps } from '@/context/authentication/authentication.context';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';

jest.mock('@/types/business-api', () => {
    const originalModule = jest.requireActual('@/types/business-api');

    return {
        ...originalModule,
        useLazyGetBusinessQuery: jest.fn().mockReturnValue([jest.fn(), {}]),
        useLazyRetrieveUserQuery: jest.fn().mockReturnValue([jest.fn(), {}]),
        useLazyVerifyTokenQuery: jest.fn().mockReturnValue([jest.fn(), {}]),
        useRefreshTokenMutation: jest.fn().mockReturnValue([jest.fn(), {}]),
    };
});

jest.mock('@boclar/booking-app-components', () => {
    const originalModule = jest.requireActual('@boclar/booking-app-components');

    return {
        ...originalModule,
        useThemeFonts: jest.fn(),
    };
});

jest.mock('@/constants/app.constants', () => {
    const originalModule = jest.requireActual('@/constants/app.constants');

    return {
        ...originalModule,
        isUserAuthenticatedState: jest.fn(),
    };
});

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        ...originalModule,
        router: {
            replace: jest.fn(),
        },
    };
});

describe('Index screen', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
        (BookingAppComponents.useThemeFonts as jest.Mock).mockImplementation(
            () => [true]
        );
    });

    it('renders correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: WithAuthContext,
            }
        );

        await act(() => {
            expect(screen).toHavePathname('/welcome');
        });
    });

    it('renders nothing if fonts are not loaded', async () => {
        (BookingAppComponents.useThemeFonts as jest.Mock).mockImplementation(
            () => [false]
        );

        const isJestEnvSpy = (require('@/constants/app.constants').isJestEnv =
            jest.fn().mockReturnValue(false));

        renderRouter(
            {
                appDir: 'src/app',
                overrides: {},
            },
            {
                wrapper: WithAuthContext,
            }
        );

        await act(async () => {
            expect(screen).not.toHavePathname('/welcome');
        });

        isJestEnvSpy.mockReturnValue(true);
    });

    it('users are redirected to the welcome screen when they lands on the index screen', async () => {
        renderRouter(
            {
                appDir: 'src/app',
                overrides: {},
            },
            {
                initialUrl: '/',
                wrapper: WithAuthContext,
            }
        );

        await act(async () => {
            expect(screen).toHavePathname('/welcome');
        });
    });
    it('redirects to the home screen if the user is logged in', async () => {
        const useAuthSpy = jest.spyOn(UseAuthHook, 'useAuth').mockReturnValue({
            isLogged: true,
            isValidationInProgress: false,
        } as AuthenticationContextProps);

        renderRouter(
            {
                appDir: 'src/app',
                overrides: {},
            },
            {
                initialUrl: '/',
                wrapper: WithAuthContext,
            }
        );

        await act(async () => {
            expect(screen).toHavePathname('/home');
        });

        useAuthSpy.mockRestore();
    });
});
