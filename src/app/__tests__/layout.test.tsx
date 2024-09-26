import {
    act,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import * as UseAuthHook from '@/hooks/use-auth/use-auth.hooks';
import { setupStore } from '@/redux/store';
import { View } from 'lucide-react-native';
import { router } from 'expo-router';
import { AuthenticationContextProps } from '@/context/authentication/authentication.context';
import * as Constants from '@/constants/app.constants';
import * as UseCrashHook from '@boclar/booking-app-components/src/hooks/use-crash/use-crash.hooks';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';
import { LayoutContent } from '../_layout';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';
import { Platform } from 'react-native';
import * as UseAlertHook from '@boclar/booking-app-components/src/hooks/use-alert/use-alert.hooks';

jest.mock('@vercel/speed-insights', () => {
    return {
        injectSpeedInsights: jest.fn(),
    };
});

jest.mock('@vercel/analytics', () => {
    return {
        inject: jest.fn(),
    };
});

const businessOwnerData = {
    cognito_user_id: '123',
    email: 'test@test.com',
    phone: '+1234566789',
};

const storeWithBusinessOwnerCreated = setupStore({
    initialState: {
        userProgress: {
            isBusinessOwnerCreated: businessOwnerData,
        },
    },
});

const storeWithBusinessOwnerEmailVerified = setupStore({
    initialState: {
        userProgress: {
            ...storeWithBusinessOwnerCreated.getState().userProgress,
            isBusinessOwnerEmailVerified: {
                hasPhone: false,
                isEmailVerified: true,
            },
        },
    },
});

const storeWithBusinessCreated = setupStore({
    initialState: {
        userProgress: {
            isBusinessCreated: {
                business_pk: '123',
            },
        },
    },
});

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

const crashComponentId = 'app-crash-feedback';

describe('Index Layout', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    it('renders the layout correctly', async () => {
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
            // Automatically redirects to the welcome screen
            expect(screen).toHavePathname('/welcome');
        });
    });

    it('should call analytics and speed on web', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'web');

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

        await waitFor(async () => {
            expect(inject).toHaveBeenCalled();
            expect(injectSpeedInsights).toHaveBeenCalled();
        });

        platformSpy.restore();
    });

    it('should redirects users with a business owner account recently created to the confirm email screen', async () => {
        const MockComponent = jest.fn(() => <View />);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext store={storeWithBusinessOwnerCreated}>
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/',
                // wrapper: LocalAuthenticationWrapper,
            }
        );

        await waitFor(async () => {});

        await waitFor(async () => {
            expect(router.replace).toHaveBeenCalledWith('/confirm-email');
        });
    });

    it('should not redirect to the confirm email screen once user has verified their email', async () => {
        const MockComponent = jest.fn(() => <View />);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext
                            store={storeWithBusinessOwnerEmailVerified}
                        >
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },

            {
                initialUrl: '/',
            }
        );

        await waitFor(async () => {
            expect(router.replace).not.toHaveBeenCalled();
        });
    });

    it('should not redirect to any screen if the user is logged in', async () => {
        const MockComponent = jest.fn(() => <View />);

        const useAuthHookSpy = jest
            .spyOn(UseAuthHook, 'useAuth')
            .mockReturnValue({ isLogged: true } as AuthenticationContextProps);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext
                            store={storeWithBusinessOwnerEmailVerified}
                        >
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/',
            }
        );

        await waitFor(async () => {
            expect(router.replace).not.toHaveBeenCalled();
        });

        useAuthHookSpy.mockRestore();
    });

    it('should redirect to the create business screen if the business has been created', async () => {
        const MockComponent = jest.fn(() => <View />);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext store={storeWithBusinessCreated}>
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/',
            }
        );

        await waitFor(async () => {
            expect(router.replace).toHaveBeenCalledWith({
                params: {
                    'animation-enabled': 'false',
                    'go-to-page': 'create-business-owner',
                },
                pathname: '/create-business',
            });
        });
    });

    it('should not render anything when app is not ready', async () => {
        const MockComponent = jest.fn(() => <View testID="view" />);

        const isJestEnvSpy = jest
            .spyOn(Constants, 'isJestEnv')
            .mockReturnValue(false);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext store={storeWithBusinessCreated}>
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/',
            }
        );

        await waitFor(async () => {
            expect(screen.queryByTestId('view')).not.toBeOnTheScreen();
        });

        isJestEnvSpy.mockRestore();
    });

    it('should render a crash modal when an error occurs', async () => {
        const MockComponent = jest.fn(() => <View />);

        const useCrashSpy = jest
            .spyOn(UseCrashHook, 'useCrash')
            .mockReturnValue({
                crash: jest.fn(),
                crashInfo: {
                    actionBtnText: 'actionBtnText',
                    reason: 'description',
                    title: 'title',
                    onAction: jest.fn(),
                },
                crashCount: 0,
            });

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext store={storeWithBusinessCreated}>
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/',
            }
        );

        await waitFor(async () => {
            expect(useCrashSpy).toHaveBeenCalled();
            expect(screen.getByTestId(crashComponentId)).toBeOnTheScreen();
        });

        useCrashSpy.mockRestore();
    });

    it('should crash the app when there is an authentication error', async () => {
        const MockComponent = jest.fn(() => <View />);

        const crashFn = jest.fn();
        const useCrashSpy = jest
            .spyOn(UseCrashHook, 'useCrash')
            .mockReturnValue({
                crash: crashFn,
                crashInfo: null,
                crashCount: 0,
            });

        const logout: any = jest.fn();
        const useAuthHookSpy = jest
            .spyOn(UseAuthHook, 'useAuth')
            .mockReturnValue({
                error: 'error',
                isLogged: true,
                logout: logout,
            } as AuthenticationContextProps);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext store={storeWithBusinessCreated}>
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/',
            }
        );

        await waitFor(async () => {
            expect(crashFn).toHaveBeenNthCalledWith(1, {
                actionBtnText: expect.any(String),
                reason: expect.any(String),
                title: expect.any(String),
                onAction: logout,
            });
        });

        useCrashSpy.mockRestore();
        useAuthHookSpy.mockRestore();
    });

    it('should not redirect to any other screen when pathname is between allowed paths', async () => {
        const MockComponent = jest.fn(() => <View />);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext store={storeWithBusinessCreated}>
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/privacy-policy',
            }
        );

        await waitFor(async () => {
            expect(router.replace).not.toHaveBeenCalled();
        });
    });

    it('should show an alert dialog when there is an alert created', async () => {
        const MockComponent = jest.fn(() => <View />);

        const useAlertSpy = jest
            .spyOn(UseAlertHook, 'useAlert')
            .mockReturnValue({
                alertInfo: {
                    title: 'title',
                    message: 'message',
                },
            } as any);

        renderRouter(
            {
                _layout: () => {
                    return (
                        <WithAuthContext store={storeWithBusinessCreated}>
                            <LayoutContent />
                        </WithAuthContext>
                    );
                },
                index: MockComponent,
            },
            {
                initialUrl: '/',
            }
        );

        await waitFor(async () => {
            expect(useAlertSpy).toHaveBeenCalled();
            expect(screen.getByTestId('alert-dialog')).toBeOnTheScreen();
        });

        useAlertSpy.mockRestore();
    });
});
