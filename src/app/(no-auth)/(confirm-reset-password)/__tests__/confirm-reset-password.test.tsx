import { GlobalContext } from '@/components/global-context';
import { Portal, PortalHost } from '@gorhom/portal';
import { router, useLocalSearchParams } from 'expo-router';
import {
    act,
    fireEvent,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import * as useResendCodeHook from '@/hooks/use-resend-code/use-resend-code.hooks';
import * as BusinessApi from '@/types/business-api';
import en from '@/locales/en.json';
import { Platform } from 'react-native';

const confirmationCodeInputId = 'confirm-reset-password-code-input';
const submitButtonId = 'confirm-reset-password-button';
const backBtn = 'confirm-reset-password-back-button';
const resendCodeBtnId = 'confirm-reset-password-resend-code-button';
const timerId = 'confirm-reset-password-resend-code-timer';

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        __esModule: true,
        ...originalModule,
        useLocalSearchParams: jest.fn().mockReturnValue({}),
        router: {
            ...originalModule.router,
            back: jest.fn(),
            replace: jest.fn(),
        },
    };
});

const WithPortal = ({ children }: { children: React.ReactNode }) => {
    return (
        <GlobalContext>
            <PortalHost name="portal" />
            {children}
        </GlobalContext>
    );
};

describe('ConfirmResetPassword screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useLocalSearchParams as jest.Mock).mockImplementation(() => ({
            email: 'test@test.com',
        }));
    });

    it('renders screen correctly', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'android');

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: GlobalContext,
            }
        );
        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        platformSpy.restore();
    });

    it('should not do anything when submitting an uncompleted confirmation code', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: GlobalContext,
            }
        );
        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        expect(screen.getByTestId(confirmationCodeInputId)).not.toBeNull();
        await waitFor(() => {
            expect(screen.getByTestId(confirmationCodeInputId)).toBeVisible();
        });

        await waitFor(() => {
            fireEvent(
                screen.getByTestId(confirmationCodeInputId),
                'onCodeChange',
                '12345'
            );
        });

        await act(async () => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });

        await waitFor(() => {
            expect(router.replace).not.toHaveBeenCalled();
        });
    });

    it('should redirect to reset password screen after entering confirmation code', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: GlobalContext,
            }
        );
        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await act(() => {
            expect(
                screen.getByTestId(confirmationCodeInputId)
            ).toBeOnTheScreen();

            fireEvent(
                screen.getByTestId(confirmationCodeInputId),
                'onCodeFilled',
                '123456'
            );
        });

        await waitFor(() => {
            expect(router.replace).toHaveBeenNthCalledWith(1, {
                params: {
                    email: 'test@test.com',
                    confirmation_code: '123456',
                },
                pathname: '/reset-password',
            });
        });
    });

    it('should go back to previous screen when clicking back button', async () => {
        const canGoBackSpy = jest
            .spyOn(router, 'canGoBack')
            .mockReturnValue(true);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await act(async () => {
            fireEvent.press(screen.getByTestId(backBtn));
        });

        expect(router.back).toHaveBeenCalled();

        canGoBackSpy.mockRestore();
    });

    it('should go to / when clicking back button and there is no history', async () => {
        const canGoBackSpy = jest
            .spyOn(router, 'canGoBack')
            .mockReturnValue(false);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await act(async () => {
            fireEvent.press(screen.getByTestId(backBtn));
        });

        expect(router.replace).toHaveBeenCalledWith('/');

        canGoBackSpy.mockRestore();
    });

    it('shows an alert when email is not found in local params when submitting', async () => {
        (useLocalSearchParams as jest.Mock).mockImplementation(() => ({}));

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <>
                        <GlobalContext>
                            <PortalHost name="portal" />
                            {children}
                        </GlobalContext>
                    </>
                ),
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await act(() => {
            expect(
                screen.getByTestId(confirmationCodeInputId)
            ).toBeOnTheScreen();

            fireEvent(
                screen.getByTestId(confirmationCodeInputId),
                'onCodeFilled',
                '123456'
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Invalid data provided')).toBeOnTheScreen();
        });
    });

    it('should show an alert when it is passed from screen params', async () => {
        (useLocalSearchParams as jest.Mock).mockImplementation(() => ({
            code_mismatch: 'true',
        }));

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <>
                        <GlobalContext>
                            <PortalHost name="portal" />
                            {children}
                        </GlobalContext>
                    </>
                ),
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await waitFor(() => {
            expect(screen.getByText('Code is invalid')).toBeOnTheScreen();
        });
    });

    it('should apply the corresponding styling for when resend code cooldown is active', async () => {
        const useResendCodeSpy = jest
            .spyOn(useResendCodeHook, 'useResendCode')
            .mockImplementation(
                () =>
                    ({
                        isCooldownEnabled: true,
                    }) as any
            );

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await waitFor(() => {
            expect(screen.getByTestId(resendCodeBtnId)).toHaveStyle({
                textDecorationLine: 'none',
            });
            expect(screen.getByText('Resend code in')).toBeOnTheScreen();
            expect(screen.getByTestId(timerId)).toHaveStyle({
                color: '#979797',
            });
        });

        useResendCodeSpy.mockRestore();
    });

    it('should resend code when clicking on resend code button', async () => {
        const triggerResendCodeSpy = jest.fn();
        const useResendCodeSpy = jest
            .spyOn(useResendCodeHook, 'useResendCode')
            .mockImplementation(
                () =>
                    ({
                        isCooldownEnabled: false,
                        isResendCodeEnabled: true,
                        triggerResendCode: triggerResendCodeSpy,
                    }) as any
            );

        const forgotPasswordFn = jest.fn().mockResolvedValue({
            error: false,
            data: 1,
        });

        const resendCodeSpy = jest
            .spyOn(BusinessApi, 'useForgotPasswordMutation')
            .mockReturnValue([forgotPasswordFn, { isLoading: false } as any]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: WithPortal,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await act(async () => {
            fireEvent.press(screen.getByTestId(resendCodeBtnId));
        });

        await waitFor(() => {
            expect(resendCodeSpy).toHaveBeenCalled();
            expect(triggerResendCodeSpy).toHaveBeenCalledTimes(1);
            expect(
                screen.getByText('Code resent successfully')
            ).toBeOnTheScreen();
        });

        resendCodeSpy.mockRestore();
        useResendCodeSpy.mockRestore();
    });

    it('should not resend code if resend code is not enabled', async () => {
        (useLocalSearchParams as jest.Mock).mockImplementation(() => ({
            email: '',
        }));

        const triggerResendCodeSpy = jest.fn();
        const useResendCodeSpy = jest
            .spyOn(useResendCodeHook, 'useResendCode')
            .mockImplementation(
                () =>
                    ({
                        isCooldownEnabled: false,
                        isResendCodeEnabled: true,
                        triggerResendCode: triggerResendCodeSpy,
                    }) as any
            );

        const forgotPasswordFn = jest.fn().mockResolvedValue({
            error: false,
            data: 1,
        });

        const resendCodeSpy = jest
            .spyOn(BusinessApi, 'useForgotPasswordMutation')
            .mockReturnValue([forgotPasswordFn, { isLoading: true } as any]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: WithPortal,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await act(async () => {
            fireEvent.press(screen.getByTestId(resendCodeBtnId));
        });

        await waitFor(() => {
            expect(triggerResendCodeSpy).not.toHaveBeenCalledTimes(1);
            expect(
                screen.queryByText('Code resent successfully')
            ).not.toBeOnTheScreen();
        });
        resendCodeSpy.mockRestore();
        useResendCodeSpy.mockRestore();
    });

    it('should show an error on resend code failure', async () => {
        const triggerResendCodeSpy = jest.fn();
        const useResendCodeSpy = jest
            .spyOn(useResendCodeHook, 'useResendCode')
            .mockImplementation(
                () =>
                    ({
                        isCooldownEnabled: false,
                        isResendCodeEnabled: true,
                        triggerResendCode: triggerResendCodeSpy,
                    }) as any
            );

        const forgotPasswordFn = jest.fn().mockResolvedValue({
            error: true,
            data: null,
        });

        const resendCodeSpy = jest
            .spyOn(BusinessApi, 'useForgotPasswordMutation')
            .mockReturnValue([forgotPasswordFn, { isLoading: false } as any]);

        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(confirm-reset-password)',
                overrides: {},
            },
            {
                initialUrl: '/confirm-reset-password',
                wrapper: WithPortal,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/confirm-reset-password');
        });

        await act(async () => {
            fireEvent.press(screen.getByTestId(resendCodeBtnId));
        });

        await waitFor(() => {
            expect(resendCodeSpy).toHaveBeenCalled();
            expect(triggerResendCodeSpy).toHaveBeenCalledTimes(1);
            expect(
                screen.getByText(en.businessApiErrors.SomethingWentWrong)
            ).toBeOnTheScreen();
        });

        resendCodeSpy.mockRestore();
        useResendCodeSpy.mock;
    });
});
