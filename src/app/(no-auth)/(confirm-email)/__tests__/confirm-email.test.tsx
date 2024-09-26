import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    act,
    fireEvent,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import * as BusinessApi from '@/types/business-api';
import * as ErrorHandlingUtils from '@/utils/error-handling/error-handling.utils';
import { router } from 'expo-router';
import { setupStore } from '@/redux/store';
import * as useAuthHook from '@/hooks/use-auth/use-auth.hooks';
import * as Sentry from '@sentry/react-native';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';

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

const resendEmailTextId = 'resend-email-text';
const emailConfirmationCodeInputId = 'email-confirmation-code-input';
const emailConfirmationCodeContainerId = 'email-confirmation-code-container';
const email = 'test@test.com';

const businessOwnerDataInStorage = {
    cognito_user_id: '123',
    email: email,
    phone: '',
};

const translateErrorMessageSpy = jest.spyOn(
    ErrorHandlingUtils,
    'translateErrorMessage'
);

const store = setupStore({
    initialState: {
        userProgress: {
            isBusinessOwnerCreated: businessOwnerDataInStorage,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WithAuthContext store={store}>{children}</WithAuthContext>
);

describe('ConfirmEmail screen', () => {
    beforeAll(() => {
        jest.spyOn(store, 'dispatch');
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        await AsyncStorage.clear();
    });

    it('renders screen correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: WithAuthContext,
            }
        );

        await act(() => {
            expect(screen).toHavePathname('/confirm-email');
        });
    });

    it("shows the user's email", async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(async () => {
            expect(screen.queryByText(email)).toBeOnTheScreen();
        });
    });

    it('can resend email verification code', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'EmailVerificationSent' },
            },
            error: null,
        });

        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendEmailTextId)).toBeOnTheScreen();
        });

        await act(() => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        await waitFor(() => {
            expect(resendCodeFn).toHaveBeenCalledTimes(1);
        });
    });

    it('does not call resend code function if the user has already requested a code in the last 60 seconds', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'EmailVerificationSent' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendEmailTextId)).toBeOnTheScreen();
        });

        await act(() => {
            jest.advanceTimersByTime(30000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        await waitFor(() => {
            expect(resendCodeFn).toHaveBeenCalledTimes(0);
        });
    });

    it('does not call resend code if there is nothing in storage', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'EmailVerificationSent' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        await AsyncStorage.clear();

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendEmailTextId)).toBeOnTheScreen();
        });

        await act(() => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        await waitFor(() => {
            expect(resendCodeFn).toHaveBeenCalledTimes(0);
        });
    });

    it('shows an error message when it is not possible to resend email code', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Error'),
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendEmailTextId)).toBeOnTheScreen();
        });

        await act(() => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        await waitFor(() => {
            expect(translateErrorMessageSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('shows an error message when response is not EmailVerificationSent', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'Error' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);
        const t = jest.fn();

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendEmailTextId)).toBeOnTheScreen();
        });

        await act(() => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });
    });

    it('should apply different styles when cooldown is enabled for resending email code verification', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'EmailVerificationSent' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(() => {});

        // Resend first code
        await act(() => {
            jest.advanceTimersByTime(60 * 1000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        expect(resendCodeFn).toHaveBeenCalledTimes(1);

        // Resend second code
        await act(() => {
            jest.advanceTimersByTime(120 * 1000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        expect(resendCodeFn).toHaveBeenCalledTimes(2);

        // Resend third code and enables cooldown
        await act(() => {
            jest.advanceTimersByTime(300 * 1000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        expect(resendCodeFn).toHaveBeenCalledTimes(3);

        // Shows cooldown message
        await waitFor(() => {
            expect(screen.getByText('Resend code in')).toBeOnTheScreen();
        });
    });

    it('email is verified successfully and automatically submitted after confirmation code input is filled', async () => {
        const loginFn = jest.fn().mockImplementation((a, b) => {
            b();
        });
        const useAuthSpy = jest.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            login: loginFn,
        } as any);

        const confirmEmailFn = jest.fn().mockResolvedValue({
            data: {
                verifyEmail: {
                    status: 'EmailSuccessfullyVerified',
                    token: 'test',
                },
            },
            error: null,
        });

        jest.spyOn(BusinessApi, 'useVerifyEmailMutation').mockReturnValue([
            confirmEmailFn,
            {} as any,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        fireEvent(
            screen.getByTestId(emailConfirmationCodeContainerId),
            'layout',
            {
                nativeEvent: {
                    layout: {
                        x: 1,
                        y: 2,
                        width: 3,
                        height: 4,
                    },
                },
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(emailConfirmationCodeInputId),
                '123456'
            );
        });

        // After mocking redux
        await waitFor(() => {
            expect(confirmEmailFn).toHaveBeenCalledTimes(1);
            expect(store.dispatch).toHaveBeenCalledWith({
                payload: {
                    hasPhone: false,
                    isEmailVerified: true,
                },
                type: 'userProgress/setIsBusinessOwnerEmailVerified',
            });
            expect(loginFn).toHaveBeenCalledTimes(1);
            expect(router.replace).toHaveBeenCalledWith('/subscribe');
        });

        useAuthSpy.mockRestore();
    });

    it('email verified and redirects to confirm phone screen when phone is not verified', async () => {
        const loginFn = jest.fn().mockImplementation((a, b) => {
            b();
        });
        const useAuthSpy = jest.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            login: loginFn,
        } as any);

        const confirmEmailFn = jest.fn().mockResolvedValue({
            data: {
                verifyEmail: {
                    status: 'PhoneVerificationRequired',
                    token: 'test',
                },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useVerifyEmailMutation').mockReturnValue([
            confirmEmailFn,
            {} as any,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(emailConfirmationCodeInputId),
                '123456'
            );
        });

        await waitFor(() => {
            expect(confirmEmailFn).toHaveBeenCalledTimes(1);
            expect(store.dispatch).toHaveBeenCalledWith({
                payload: {
                    hasPhone: true,
                    isEmailVerified: true,
                },
                type: 'userProgress/setIsBusinessOwnerEmailVerified',
            });
            expect(loginFn).toHaveBeenCalledTimes(1);
            expect(router.replace).toHaveBeenCalledWith('/confirm-phone');
        });

        useAuthSpy.mockRestore();
    });

    it('shows an error when there is nothing in storage on submitting verification code', async () => {
        const confirmEmailFn = jest.fn().mockResolvedValue({
            data: {
                verifyEmail: { status: 'EmailSuccessfullyVerified' },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useVerifyEmailMutation').mockReturnValue([
            confirmEmailFn,
            {} as any,
        ]);

        await AsyncStorage.clear();

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: WithAuthContext,
            }
        );

        fireEvent(
            screen.getByTestId(emailConfirmationCodeContainerId),
            'layout',
            {
                nativeEvent: {
                    layout: {
                        x: 1,
                        y: 2,
                        width: 3,
                        height: 4,
                    },
                },
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(emailConfirmationCodeInputId),
                '123456'
            );
        });

        await waitFor(() => {
            expect(confirmEmailFn).toHaveBeenCalledTimes(0);
        });
    });

    it('shows an error when an error occurs on submitting verification code', async () => {
        const confirmEmailFn = jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Error'),
        });
        jest.spyOn(BusinessApi, 'useVerifyEmailMutation').mockReturnValue([
            confirmEmailFn,
            {} as any,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(emailConfirmationCodeInputId),
                '12345'
            );
            fireEvent.press(screen.getByText('Confirm'));
        });

        await waitFor(() => {
            expect(translateErrorMessageSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('shows an error when response is not either EmailSuccessfullyVerified or PhoneVerificationRequired', async () => {
        await AsyncStorage.clear();
        const confirmEmailFn = jest.fn().mockResolvedValue({
            data: {
                verifyEmail: { status: 'Error' },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useVerifyEmailMutation').mockReturnValue([
            confirmEmailFn,
            {} as any,
        ]);
        // await storeInAsyncStorage('isBusinessOwnerCreated', {
        //     businessOwner: businessOwnerDataInStorage,
        // });

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        fireEvent(
            screen.getByTestId(emailConfirmationCodeContainerId),
            'layout',
            {
                nativeEvent: {
                    layout: {
                        x: 1,
                        y: 2,
                        width: 3,
                        height: 4,
                    },
                },
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(emailConfirmationCodeInputId),
                '12345'
            );

            fireEvent.press(screen.getByText('Confirm'));
        });

        await waitFor(() => {
            expect(router.replace).not.toHaveBeenCalled();
        });
    });

    it('does not submit email for verification twice based on loading state', async () => {
        AsyncStorage.clear();
        const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
        const confirmEmailFn = jest.fn().mockResolvedValue({
            data: {
                verifyEmail: { status: 'EmailSuccessfullyVerified' },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useVerifyEmailMutation').mockReturnValue([
            confirmEmailFn,
            {
                isLoading: true,
            } as any,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: WithAuthContext,
            }
        );

        fireEvent(
            screen.getByTestId(emailConfirmationCodeContainerId),
            'layout',
            {
                nativeEvent: {
                    layout: {
                        x: 1,
                        y: 2,
                        width: 3,
                        height: 4,
                    },
                },
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(emailConfirmationCodeInputId),
                '123456'
            );
        });

        await waitFor(() => {
            expect(confirmEmailFn).not.toHaveBeenCalled();
            expect(router.replace).not.toHaveBeenCalled();
        });
    });

    it('capture an error when response from verifyEmail is not expected', async () => {
        const loginFn = jest.fn();
        const useAuthSpy = jest.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            login: loginFn,
        } as any);

        const confirmEmailFn = jest.fn().mockResolvedValue({
            data: {
                verifyEmail: {
                    status: 'UnknownStatus',
                    token: 'test',
                },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useVerifyEmailMutation').mockReturnValue([
            confirmEmailFn,
            {} as any,
        ]);

        // await storeInAsyncStorage('isBusinessOwnerCreated', {
        //     businessOwner: {
        //         ...businessOwnerDataInStorage,
        //         phone: '1234567890',
        //     },
        // });

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(emailConfirmationCodeInputId),
                '123456'
            );
        });

        await waitFor(() => {
            expect(confirmEmailFn).toHaveBeenCalledTimes(1);
            expect(store.dispatch).not.toHaveBeenCalledWith({
                payload: {
                    hasPhone: true,
                    isEmailVerified: true,
                },
                type: 'userProgress/setIsBusinessOwnerEmailVerified',
            });
            expect(loginFn).not.toHaveBeenCalledTimes(1);
            expect(router.replace).not.toHaveBeenCalledWith('/confirm-phone');
            expect(Sentry.captureMessage).toHaveBeenNthCalledWith(
                1,
                'Unknown status returned from verifyEmail'
            );
        });

        useAuthSpy.mockRestore();
    });

    it('capture an error when response from resendVerificationCode is not expected', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'Unknown' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-email)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-email',
                wrapper: wrapper,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendEmailTextId)).toBeOnTheScreen();
        });

        await act(() => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendEmailTextId));
        });

        await waitFor(() => {
            expect(resendCodeFn).toHaveBeenCalledTimes(1);
            expect(Sentry.captureMessage).toHaveBeenNthCalledWith(
                1,
                'Unknown status returned from resendVerificationCode'
            );
        });
    });
});
