import {
    act,
    fireEvent,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import * as BusinessApi from '@/types/business-api';
import * as ExpoRouter from 'expo-router';
import * as ErrorHandlingUtils from '@/utils/error-handling/error-handling.utils';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';

const loginBtnId = 'login-button';
const emailInputId = 'email-input';
const passwordInputId = 'password-input';
const backBtnId = 'login-back-button';
const forgotPasswordBtnId = 'forgot-password-button';

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        ...originalModule,
        router: {
            ...originalModule.router,
            back: jest.fn(),
            navigate: jest.fn(),
            replace: jest.fn(),
        },
    };
});

jest.mock('@/utils/error-handling/error-handling.utils', () => ({
    translateErrorMessage: jest.fn(),
}));

describe('Login screen', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    it('renders screen correctly', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'android');
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await act(() => {
            expect(screen).toHavePathname('/login');
        });
        platformSpy.restore();
    });

    it('shows errors when logging in with an empty form', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        const loginBtn = screen.getByTestId(loginBtnId);
        fireEvent.press(loginBtn);

        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeOnTheScreen();
            expect(screen.getByText('Password is required')).toBeOnTheScreen();
        });
    });

    it('should login successfully', async () => {
        const loginFn = jest.fn().mockResolvedValue({
            data: {
                loginAdmin: {
                    data: {},
                },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useLoginAdminMutation').mockReturnValue([
            loginFn,
            {} as never,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            const emailInput = screen.getByTestId(emailInputId);
            const passwordInput = screen.getByTestId(passwordInputId);

            fireEvent.changeText(emailInput, 'test@test.com');
            fireEvent.changeText(passwordInput, 'password');
        });

        await act(async () => {
            const loginBtn = screen.getByTestId(loginBtnId);
            fireEvent.press(loginBtn);
        });

        await waitFor(() => {
            expect(
                screen.queryByText('Email / phone number is required')
            ).not.toBeOnTheScreen();
            expect(
                screen.queryByText('Password is required')
            ).not.toBeOnTheScreen();
            expect(ExpoRouter.router.replace).toHaveBeenNthCalledWith(
                1,
                '/home'
            );
        });
    });

    it('should go back to previous screen if history is available', async () => {
        jest.spyOn(ExpoRouter.router, 'canGoBack').mockReturnValue(true);
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await act(async () => {
            const backBtn = screen.getByTestId(backBtnId);
            fireEvent.press(backBtn);
        });

        await waitFor(() => {
            expect(ExpoRouter.router.back).toHaveBeenCalled();
        });
    });

    it('should show errors when login fails', async () => {
        const loginFn = jest.fn().mockResolvedValue({
            error: {
                name: 'Error',
            },
        });
        jest.spyOn(BusinessApi, 'useLoginAdminMutation').mockReturnValue([
            loginFn,
            {} as never,
        ]);
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            const emailInput = screen.getByTestId(emailInputId);
            const passwordInput = screen.getByTestId(passwordInputId);

            fireEvent.changeText(emailInput, 'test@test.com');
            fireEvent.changeText(passwordInput, 'password');
        });

        await act(async () => {
            const loginBtn = screen.getByTestId(loginBtnId);
            fireEvent.press(loginBtn);
        });

        await waitFor(() => {
            expect(
                ErrorHandlingUtils.translateErrorMessage
            ).toHaveBeenCalledTimes(1);
            expect(screen).toHavePathname('/login');
        });

        consoleSpy.mockRestore();
    });

    it('should show errors when login throws an error', async () => {
        const loginFn = jest.fn().mockRejectedValue(new Error('Error'));
        jest.spyOn(BusinessApi, 'useLoginAdminMutation').mockReturnValue([
            loginFn,
            {} as never,
        ]);
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            const emailInput = screen.getByTestId(emailInputId);
            const passwordInput = screen.getByTestId(passwordInputId);

            fireEvent.changeText(emailInput, 'test@test.com');
            fireEvent.changeText(passwordInput, 'password');
        });

        await act(async () => {
            const loginBtn = screen.getByTestId(loginBtnId);
            fireEvent.press(loginBtn);
        });

        await waitFor(() => {
            expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        });

        consoleSpy.mockRestore();
    });

    it('should not trigger login if login is loading', async () => {
        const loginFn = jest.fn().mockResolvedValue({
            error: null,
        });
        jest.spyOn(BusinessApi, 'useLoginAdminMutation').mockReturnValue([
            loginFn,
            {
                isLoading: true,
            } as never,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            const emailInput = screen.getByTestId(emailInputId);
            const passwordInput = screen.getByTestId(passwordInputId);

            fireEvent.changeText(emailInput, 'test@test.com');
            fireEvent.changeText(passwordInput, 'password');
        });

        await act(async () => {
            const loginBtn = screen.getByTestId(loginBtnId);
            fireEvent.press(loginBtn);
        });

        await waitFor(() => {
            expect(loginFn).not.toHaveBeenCalled();
        });
    });

    it('should redirect to home when going back if no history is available', async () => {
        jest.spyOn(ExpoRouter.router, 'canGoBack').mockReturnValue(false);
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await act(async () => {
            const backBtn = screen.getByTestId(backBtnId);
            fireEvent.press(backBtn);
        });

        await waitFor(() => {
            expect(ExpoRouter.router.navigate).toHaveBeenNthCalledWith(1, '/');
        });
    });

    it('should capture a sentry message when no user data is returned after a successful login', async () => {
        const loginFn = jest.fn().mockResolvedValue({
            data: {
                loginAdmin: {},
            },
            error: null,
        });
        const useLoginAdminMutationSpy = jest
            .spyOn(BusinessApi, 'useLoginAdminMutation')
            .mockReturnValue([loginFn, {} as never]);
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            const emailInput = screen.getByTestId(emailInputId);
            const passwordInput = screen.getByTestId(passwordInputId);

            fireEvent.changeText(emailInput, 'test@test.com');
            fireEvent.changeText(passwordInput, 'password');
        });

        await act(async () => {
            const loginBtn = screen.getByTestId(loginBtnId);
            fireEvent.press(loginBtn);
        });

        await waitFor(() => {
            expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
        });

        consoleSpy.mockRestore();
        useLoginAdminMutationSpy.mockRestore();
    });

    it('navigates to forgot password screen', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(login)/',
                overrides: {},
            },
            {
                initialUrl: '/login',
                wrapper: WithAuthContext,
            }
        );

        await act(async () => {
            const forgotPasswordBtn = screen.getByTestId(forgotPasswordBtnId);
            fireEvent.press(forgotPasswordBtn);
        });

        await waitFor(() => {
            expect(ExpoRouter.router.navigate).toHaveBeenNthCalledWith(
                1,
                '/forgot-password'
            );
        });
    });
});
