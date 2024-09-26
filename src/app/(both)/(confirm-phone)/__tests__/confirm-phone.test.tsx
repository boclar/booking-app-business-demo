import {
    act,
    fireEvent,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import * as ErrorHandlingUtils from '@/utils/error-handling/error-handling.utils';
import * as BusinessApi from '@/types/business-api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { GlobalContext } from '@/components/global-context';
import * as SecureStore from 'expo-secure-store';
import { setupStore } from '@/redux/store';
import * as Sentry from '@sentry/react-native';

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        ...originalModule,
        router: {
            ...originalModule.router,
            replace: jest.fn(),
        },
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@/hooks/use-auth/use-auth.hooks', () => {
    return {
        useAuth: jest.fn().mockReturnValue({
            token: 'token',
            getToken: jest.fn().mockResolvedValue('token'),
        }),
    };
});

const resendPhoneTextId = 'resend-phone-text';
const phoneConfirmationCodeContainerId = 'phone-confirmation-code-container';
const phoneConfirmationCodeInputId = 'phone-confirmation-code-input';
const resendCodeTimerId = 'resend-phone-timer';
const skipPhoneVerificationTextId = 'skip-phone-verification-text';

const phone = '+1234567890';

const translateErrorMessageSpy = jest.spyOn(
    ErrorHandlingUtils,
    'translateErrorMessage'
);

const businessOwnerDataInStorage = {
    cognito_user_id: '123',
    email: 'test@test.com',
    phone,
};

const viewLayout = {
    height: 4,
    width: 3,
    x: 1,
    y: 2,
};

const store = setupStore({
    initialState: {
        userProgress: {
            isBusinessOwnerCreated: businessOwnerDataInStorage,
        },
    },
});

const successfulWrapper = ({ children }: { children: React.ReactNode }) => (
    <GlobalContext store={store}>{children}</GlobalContext>
);

describe('ConfirmPhone screen', () => {
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
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: GlobalContext,
            }
        );

        await act(async () => {
            expect(screen).toHavePathname('/confirm-phone');
        });
    });

    it("shows user's phone", async () => {
        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(() => {
            expect(screen.getByText('+1234567890')).toBeTruthy();
        });
    });

    it('resend confirmation code', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'PhoneVerificationSent' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendPhoneTextId)).toBeOnTheScreen();
        });

        await act(async () => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        await waitFor(() => {
            expect(resendCodeFn).toHaveBeenCalledTimes(1);
        });
    });

    it('does not resend confirmation code if the user has already requested a code in the last 60 seconds', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'PhoneVerificationSent' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendPhoneTextId)).toBeOnTheScreen();
        });

        await act(async () => {
            jest.advanceTimersByTime(30000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        await waitFor(() => {
            expect(resendCodeFn).toHaveBeenCalledTimes(0);
        });
    });

    it('does not call resend code if there is nothing in storage', async () => {
        await AsyncStorage.clear();

        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'PhoneVerificationSent' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendPhoneTextId)).toBeOnTheScreen();
        });

        await act(async () => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        await waitFor(() => {
            expect(resendCodeFn).toHaveBeenCalledTimes(0);
        });
    });

    it('shows error message if resend code fails', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: null,
            error: 'error',
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendPhoneTextId)).toBeOnTheScreen();
        });

        await act(async () => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        await waitFor(() => {
            expect(translateErrorMessageSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('shows an error when resendVerificationCode response is not PhoneVerificationSent', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'error' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(() => {
            expect(screen.getByTestId(resendPhoneTextId)).toBeOnTheScreen();
        });

        await act(async () => {
            jest.advanceTimersByTime(60000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        expect(Sentry.captureMessage).toHaveBeenNthCalledWith(
            1,
            'Result of resending code is not as expected'
        );
    });

    it('should apply different styles when cooldown is enabled for resending email code verification', async () => {
        const resendCodeFn = jest.fn().mockResolvedValue({
            data: {
                resendVerificationCode: { response: 'PhoneVerificationSent' },
            },
            error: null,
        });
        jest.spyOn(
            BusinessApi,
            'useResendVerificationCodeMutation'
        ).mockReturnValue([resendCodeFn, {} as any]);
        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        fireEvent(
            screen.getByTestId(phoneConfirmationCodeContainerId),
            'layout',
            {
                nativeEvent: { layout: viewLayout },
            }
        );

        await waitFor(() => {});

        // Resend first code
        await act(() => {
            jest.advanceTimersByTime(60 * 1000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        expect(resendCodeFn).toHaveBeenCalledTimes(1);

        // Resends second code
        await act(() => {
            jest.advanceTimersByTime(120 * 1000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        expect(resendCodeFn).toHaveBeenCalledTimes(2);
        // Resends third code and enables cooldown
        await act(() => {
            jest.advanceTimersByTime(300 * 1000);
        });

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(resendPhoneTextId));
        });

        expect(resendCodeFn).toHaveBeenCalledTimes(3);

        // Shows cooldown message
        await waitFor(() => {
            expect(screen.getByText('Resend code in')).toBeOnTheScreen();
            expect(screen.getByTestId(resendPhoneTextId)).toHaveStyle({
                textDecorationLine: 'none',
            });
            expect(screen.getByTestId(resendCodeTimerId)).toHaveStyle({
                color: '#979797',
            });
        });
    });

    it('phone is verified successfully and automatically submitted after confirmation code input is filled', async () => {
        const verifyPhoneFn = jest.fn().mockResolvedValue({
            data: {
                verifyPhone: { status: 'PhoneSuccessfullyVerified' },
            },
            error: null,
        });

        jest.spyOn(BusinessApi, 'useVerifyPhoneMutation').mockReturnValue([
            verifyPhoneFn,
            {} as any,
        ]);

        // Mock getting the token from secure storage
        jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce(
            'test-token'
        );

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(() => {});

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(phoneConfirmationCodeInputId),
                '123456'
            );
        });

        await waitFor(() => {
            expect(verifyPhoneFn).toHaveBeenCalledTimes(1);
            expect(store.dispatch).toHaveBeenCalledWith({
                payload: {
                    isPhoneVerified: true,
                    skipPhoneVerification: false,
                },
                type: 'userProgress/setIsBusinessOwnerPhoneVerified',
            });
            expect(router.replace).toHaveBeenCalledWith('/subscribe');
        });
    });

    it('shows an error when there is nothing in storage on submitting verification code', async () => {
        await AsyncStorage.clear();
        const verifyPhoneFn = jest.fn().mockResolvedValue({
            data: null,
            error: 'error',
        });
        jest.spyOn(BusinessApi, 'useVerifyPhoneMutation').mockReturnValue([
            verifyPhoneFn,
            {} as any,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: GlobalContext,
            }
        );

        fireEvent(
            screen.getByTestId(phoneConfirmationCodeContainerId),
            'layout',
            {
                nativeEvent: { layout: viewLayout },
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(phoneConfirmationCodeInputId),
                '123456'
            );
        });

        await waitFor(() => {
            expect(verifyPhoneFn).not.toHaveBeenCalled();
        });
    });

    it('shows an error if phone verification fails', async () => {
        const verifyPhoneFn = jest.fn().mockResolvedValue({
            data: null,
            error: 'error',
        });
        jest.spyOn(BusinessApi, 'useVerifyPhoneMutation').mockReturnValue([
            verifyPhoneFn,
            {} as any,
        ]);

        // Mock getting the token from secure storage
        jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValueOnce(
            'test-token'
        );

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(async () => {
            await act(async () => {
                fireEvent(
                    screen.getByTestId(phoneConfirmationCodeContainerId),
                    'layout',
                    {
                        nativeEvent: { layout: viewLayout },
                    }
                );
            });
        });

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(phoneConfirmationCodeInputId),
                '12345'
            );

            fireEvent.press(screen.getByText('Confirm'));
        });

        await waitFor(() => {
            expect(translateErrorMessageSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('shows an error when verifyPhone response is not PhoneSuccessfullyVerified', async () => {
        const verifyPhoneFn = jest.fn().mockResolvedValue({
            data: {
                verifyPhone: { status: 'error' },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useVerifyPhoneMutation').mockReturnValue([
            verifyPhoneFn,
            {} as any,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(() => {
            fireEvent.changeText(
                screen.getByTestId(phoneConfirmationCodeInputId),
                '12345'
            );

            fireEvent.press(screen.getByText('Confirm'));
        });

        expect(Sentry.captureMessage).toHaveBeenNthCalledWith(
            1,
            'Result of phone verification is not as expected'
        );
    });

    it('does not submit phone for verification twice based on loading state', async () => {
        AsyncStorage.clear();
        const confirmPhoneFn = jest.fn().mockResolvedValue({
            data: {
                verifyPhone: { status: 'PhoneSuccessfullyVerified' },
            },
            error: null,
        });
        jest.spyOn(BusinessApi, 'useVerifyPhoneMutation').mockReturnValue([
            confirmPhoneFn,
            {
                isLoading: true,
            } as any,
        ]);

        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: GlobalContext,
            }
        );

        fireEvent(
            screen.getByTestId('phone-confirmation-code-container'),
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
                screen.getByTestId('phone-confirmation-code-input'),
                '123456'
            );
        });

        await waitFor(() => {
            expect(confirmPhoneFn).not.toHaveBeenCalled();
            expect(router.replace).not.toHaveBeenCalled();
        });
    });

    it('skip phone verification', async () => {
        renderRouter(
            {
                appDir: 'src/app/(both)/(confirm-phone)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-phone',
                wrapper: successfulWrapper,
            }
        );

        await waitFor(() => {
            fireEvent.press(screen.getByTestId(skipPhoneVerificationTextId));
        });

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith({
                payload: {
                    isPhoneVerified: false,
                    skipPhoneVerification: true,
                },
                type: 'userProgress/setIsBusinessOwnerPhoneVerified',
            });
            expect(router.replace).toHaveBeenNthCalledWith(1, '/subscribe');
        });
    });
});
