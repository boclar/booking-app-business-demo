import { useAuth } from './use-auth.hooks';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { renderHookAuthContext } from '@/utils/testing-library/testing-library.utils';
import { persistor } from '@/redux/store';
import * as BusinessApi from '@/types/business-api';
import * as Sentry from '@sentry/react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import Cookies from 'js-cookie';
import * as Updates from 'expo-updates';

jest.mock('@/types/business-api', () => {
    const originalModule = jest.requireActual('@/types/business-api');

    const result = {
        data: {},
        error: null,
        isError: false,
    };

    return {
        ...originalModule,
        useLazyGetBusinessQuery: jest
            .fn()
            .mockReturnValue([jest.fn().mockResolvedValue(result), {} as any]),
        useLazyRetrieveUserQuery: jest
            .fn()
            .mockReturnValue([
                jest.fn().mockResolvedValue(result),
                {} as any,
                {} as any,
            ]),
        useLazyVerifyTokenQuery: jest
            .fn()
            .mockReturnValue([
                jest.fn().mockResolvedValue(result),
                {} as any,
                {} as any,
            ]),
        useRefreshTokenMutation: jest
            .fn()
            .mockReturnValue([jest.fn().mockResolvedValue(result), {} as any]),
    };
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

jest.mock('expo-updates');

jest.useFakeTimers();

describe('useAuth', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        await persistor?.purge();

        jest.restoreAllMocks();
    });

    it('should initialize with correct default values', async () => {
        const { result } = renderHookAuthContext(() => useAuth());

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: null,
                    isLogged: false,
                    login: expect.any(Function),
                    logout: expect.any(Function),
                    user: null,
                })
            );
        });
    });

    it('successful login should store token and user', async () => {
        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: {
                retrieveUser: {
                    firstname: 'Test',
                    lastname: 'User',
                },
            },
            error: null,
            isError: false,
        });

        const verifyTokenFn = jest.fn().mockResolvedValue({
            data: {
                verifyToken: {
                    decoded_token: {
                        sub: 'test-sub',
                    },
                },
            },
            error: null,
            isError: false,
        });

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        const { result } = renderHookAuthContext(() => useAuth());

        await act(async () => {
            await result.current.login({
                token: 'test-token',
                refreshToken: 'test-refresh',
            });
        });

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: null,
                    isValidationInProgress: false,
                    user: expect.objectContaining({
                        firstname: 'Test',
                        lastname: 'User',
                    }),
                })
            );
        });
    });

    it('should throw error if token cannot be verified', async () => {
        const verifyTokenFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                message: 'Token is invalid',
            },
            isError: true,
        });

        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: {
                retrieveUser: {
                    firstname: 'Test',
                    lastname: 'User',
                },
            },
            error: null,
            isError: false,
        });

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue('test-token');

        const { result } = renderHookAuthContext(() => useAuth());

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: expect.any(String),
                })
            );
            expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        });
    });

    it('should refresh token if token is expired', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue({
            data: {
                refreshToken: {
                    token: 'new-token',
                },
            },
            error: null,
            isError: false,
        });

        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: {
                retrieveUser: {
                    firstname: 'Test',
                    lastname: 'User',
                },
            },
            error: null,
            isError: false,
        });

        const verifyTokenFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                name: 'TokenExpired',
            },
            isError: true,
        });

        jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(
            'test-refresh'
        );

        jest.spyOn(BusinessApi, 'useRefreshTokenMutation').mockReturnValue([
            refreshTokenFn,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        const { result } = renderHookAuthContext(() => useAuth());

        await act(async () => {
            await result.current.login({
                token: 'test-token',
                refreshToken: 'test-refresh',
            });
        });

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: null,
                    isValidationInProgress: false,
                })
            );
        });
    });

    it('should handle non-TokenExpired errors during token validation', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue({
            data: {
                refreshToken: {
                    token: 'new-token',
                },
            },
            error: null,
            isError: false,
        });

        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: {
                retrieveUser: {
                    firstname: 'Test',
                    lastname: 'User',
                },
            },
            error: null,
            isError: false,
        });

        const verifyTokenFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                name: 'UnknownError',
            },
            isError: true,
        });

        jest.spyOn(SecureStore, 'getItemAsync')
            .mockResolvedValueOnce('test-access-token')
            .mockResolvedValueOnce('test-refresh-token');

        jest.spyOn(BusinessApi, 'useRefreshTokenMutation').mockReturnValue([
            refreshTokenFn,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        const { result } = renderHookAuthContext(() => useAuth());

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: expect.any(String),
                    isValidationInProgress: false,
                })
            );
            expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        });
    });

    it('logs out the users when refresh token fails', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                message: 'Refresh token is invalid',
            },
            isError: true,
        });

        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: {
                retrieveUser: {
                    firstname: 'Test',
                    lastname: 'User',
                },
            },
            error: null,
            isError: false,
        });

        const verifyTokenFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                name: 'TokenExpired',
            },
            isError: true,
        });

        jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(
            'test-refresh'
        );

        jest.spyOn(BusinessApi, 'useRefreshTokenMutation').mockReturnValue([
            refreshTokenFn,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        const { result } = renderHookAuthContext(() => useAuth());

        await waitFor(() => {
            expect(router.replace).toHaveBeenNthCalledWith(1, '/login');
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: null,
                    isValidationInProgress: false,
                    user: null,
                })
            );
            expect(Updates.reloadAsync).toHaveBeenCalledTimes(1);
        });
    });

    it('catch validation errors if verifyToken fails', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                message: 'Refresh token is invalid',
            },
            isError: true,
        });

        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: {
                retrieveUser: {
                    firstname: 'Test',
                    lastname: 'User',
                },
            },
            error: null,
            isError: false,
        });

        const verifyTokenFn = jest.fn().mockImplementation(() => {
            throw new Error('Test error');
        });

        jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(
            'test-refresh'
        );

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        const { result } = renderHookAuthContext(() => useAuth());

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: 'Error in catch statement when verifying access token',
                })
            );
            expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        });
    });

    it('token is valid but no user data is found', async () => {
        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                message: 'User not found',
            },
            isError: true,
        });

        const verifyTokenFn = jest.fn().mockResolvedValue({
            data: {
                verifyToken: {
                    decoded_token: {
                        sub: 'test-sub',
                    },
                },
            },
            error: null,
            isError: false,
        });

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(SecureStore, 'getItemAsync').mockResolvedValue(
            'test-tokens'
        );

        const { result } = renderHookAuthContext(() => useAuth());
    });

    it('throws errors when no refresh token is found and token is expired', async () => {
        const retrieveUserFn = jest.fn().mockResolvedValue({
            data: {
                retrieveUser: {
                    firstname: 'Test',
                    lastname: 'User',
                },
            },
            error: null,
            isError: false,
        });

        const verifyTokenFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                name: 'TokenExpired',
            },
            isError: true,
        });

        jest.spyOn(BusinessApi, 'useLazyRetrieveUserQuery').mockReturnValue([
            retrieveUserFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(BusinessApi, 'useLazyVerifyTokenQuery').mockReturnValue([
            verifyTokenFn,
            {} as any,
            {} as any,
        ]);

        jest.spyOn(SecureStore, 'getItemAsync')
            .mockResolvedValueOnce('test-token')
            .mockResolvedValueOnce(null);

        const { result } = renderHookAuthContext(() => useAuth());

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    error: 'No refresh token found when access token is expired',
                })
            );
        });
    });

    it('calls Cookies.set correctly when login is called', async () => {
        jest.replaceProperty(Platform, 'OS', 'web');
        jest.spyOn(Cookies, 'set');

        const { result } = renderHookAuthContext(() => useAuth());

        await act(async () => {
            await result.current.login({
                token: 'test-token',
                refreshToken: 'test-refresh-token',
            });
        });

        // Check the first call
        expect(Cookies.set).toHaveBeenNthCalledWith(
            1,
            'bookingappbusiness.access-token',
            'test-token',
            { sameSite: 'strict' }
        );

        // Check the second call
        expect(Cookies.set).toHaveBeenNthCalledWith(
            2,
            'bookingappbusiness.refresh-token',
            'test-refresh-token',
            { sameSite: 'strict' }
        );
    });

    it('clears cookies when logout is called on web', async () => {
        jest.replaceProperty(Platform, 'OS', 'web');
        jest.spyOn(Cookies, 'set');

        const { result } = renderHookAuthContext(() => useAuth());

        await act(async () => {
            await result.current.logout();
        });

        expect(Cookies.set).toHaveBeenNthCalledWith(
            2,
            'bookingappbusiness.refresh-token',
            '',
            { sameSite: 'strict' }
        );

        expect(Cookies.set).toHaveBeenNthCalledWith(
            1,
            'bookingappbusiness.access-token',
            '',
            { sameSite: 'strict' }
        );
    });

    it('should throw errors when hook is used outside of AuthenticationProvider', async () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within a AuthenticationProvider');
    });

    it('should fetch user business data', async () => {
        const getBusinessFn = jest.fn().mockResolvedValue({
            data: {
                business: {
                    PK: 'test-pk',
                },
            },
        });
        jest.spyOn(BusinessApi, 'useLazyGetBusinessQuery').mockReturnValue([
            getBusinessFn,
            {} as any,
            {} as any,
        ]);

        const { result } = renderHookAuthContext(() => useAuth());

        await act(async () => {
            // @ts-expect-error - Test data being passed to function, but user data should not be required for regular use
            await result.current.fetchBusiness({
                business_pk: 'test-pk',
            });
        });

        expect(getBusinessFn).toHaveBeenCalledTimes(1);
    });

    it('should throw error if user data is not found when fetching business data', async () => {
        const getBusinessFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                message: 'Business not found',
            },
            isError: true,
        });
        jest.spyOn(BusinessApi, 'useLazyGetBusinessQuery').mockReturnValue([
            getBusinessFn,
            {} as any,
            {} as any,
        ]);

        const { result } = renderHookAuthContext(() => useAuth());

        await act(async () => {
            // @ts-expect-error - Test data being passed to function, but user data should not be required for regular use
            await result.current.fetchBusiness({
                business_pk: 'test-pk',
            });
        });

        expect(getBusinessFn).toHaveBeenCalledTimes(1);
        expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    });
});
