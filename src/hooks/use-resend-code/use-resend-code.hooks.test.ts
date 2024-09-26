import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
    STORAGE_KEYS_FN,
    useResendCode,
    UseResendCodeProps,
} from './use-resend-code.hooks'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

const instanceKey = 'CUSTOM_KEY';
const initialTimers = [60, 60 * 2, 60 * 5];
const cooldownPeriod = 3600;
const maxAttempts = 3;
const options: UseResendCodeProps = {
    instanceKey,
    cooldownPeriod,
    initialTimers,
    maxAttempts,
};
const STORAGE_KEYS = STORAGE_KEYS_FN(instanceKey);

jest.mock('react-native/Libraries/AppState/AppState', () => {
    const listeners: { [key: string]: (state: string) => void } = {};
    let currentState = 'active';

    return {
        currentState: undefined,
        isAvailable: true,
        addEventListener: jest.fn(
            (type: string, listener: (state: string) => void) => {
                listeners[type] = listener;
                return {
                    remove: () => {
                        delete listeners[type];
                    },
                };
            }
        ),
        // __setAppState: (state: string) => {
        //     currentState = state;
        //     listeners['change'](state);
        // },
    };
});

jest.useFakeTimers();

describe('useResendCode', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        await AsyncStorage.clear();
    });

    it('loads the initial values from the storage whenever there is no last update key saved in storage', async () => {
        await AsyncStorage.multiSet([
            [STORAGE_KEYS.ATTEMPTS, '2'],
            [STORAGE_KEYS.COOLDOWN_ENABLED, 'true'],
            [STORAGE_KEYS.RESEND_CODE_INDEX, '2'],
        ]);

        const { result } = renderHook(() => useResendCode(options));

        await waitFor(() => {
            expect(result.current.attempts).toBe(2);
            expect(result.current.isCooldownEnabled).toBe(true);
            expect(result.current.resendCodeIndex).toBe(2);
        });
    });

    it('calculates regular timer based on the last update key saved in storage', async () => {
        const STORAGE_KEYS = STORAGE_KEYS_FN(instanceKey);

        await AsyncStorage.multiSet([
            [STORAGE_KEYS.ATTEMPTS, '2'],
            [STORAGE_KEYS.LAST_UPDATE, `${Date.now() - 5000}`],
            [STORAGE_KEYS.RESEND_CODE_ENABLED, 'false'],
            [STORAGE_KEYS.RESEND_CODE_INDEX, '1'],
            [STORAGE_KEYS.TIMER, '60'],
        ]);

        const { result } = renderHook(() => useResendCode(options));

        await waitFor(() => {
            expect(result.current.attempts).toBe(2);
            expect(Math.round(result.current.timer)).toBe(55);
            // Cooldown period is not enabled regardless of the value in storage
            expect(result.current.isCooldownEnabled).toBe(false);
            expect(result.current.isResendCodeEnabled).toBe(false);
        });
    });

    it('calculates cooldown timer based on the last update key saved in storage and resets to default values', async () => {
        const STORAGE_KEYS = STORAGE_KEYS_FN(instanceKey);

        await AsyncStorage.multiSet([
            [STORAGE_KEYS.ATTEMPTS, '3'],
            [STORAGE_KEYS.COOLDOWN, '3600'],
            [STORAGE_KEYS.COOLDOWN_ENABLED, 'true'],
            [STORAGE_KEYS.LAST_UPDATE, `${Date.now() - 5000}`],
            [STORAGE_KEYS.RESEND_CODE_ENABLED, 'false'],
        ]);

        const { result } = renderHook(() => useResendCode(options));

        await waitFor(() => {
            expect(result.current.attempts).toBe(3);
            expect(Math.round(result.current.cooldown)).toBe(3595);
            expect(result.current.isCooldownEnabled).toBe(true);
            expect(result.current.isResendCodeEnabled).toBe(false);
        });

        await act(async () => {
            jest.advanceTimersByTime(3600 * 1000);
        });

        // Cooldown period ends and resets the attempts to 1
        expect(result.current.attempts).toBe(1);
        expect(result.current.cooldown).toBe(0);
        expect(result.current.isCooldownEnabled).toBe(false);
        expect(result.current.isResendCodeEnabled).toBe(true);
        expect(result.current.resendCodeIndex).toBe(1);
        expect(result.current.timer).toBe(0);
    });

    it('should return the initial values', async () => {
        const { result } = renderHook(() => useResendCode(options));

        await act(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    attempts: 1,
                    cooldown: 0,
                    isCooldownEnabled: false,
                    isResendCodeEnabled: false,
                    maxAttempts: 3,
                    resendCodeIndex: 1,
                })
            );
        });
    });

    it('return initial values when no options are provided', async () => {
        const { result } = renderHook(() =>
            useResendCode({
                instanceKey: 'CUSTOM_KEY',
            })
        );

        await act(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    attempts: 1,
                    cooldown: 0,
                    isCooldownEnabled: false,
                    isResendCodeEnabled: false,
                    maxAttempts: 3,
                    resendCodeIndex: 1,
                })
            );
        });
    });

    it('should allow sending the code up to three times before initiating a cooldown period, which can then be reset', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'web');
        const { result } = renderHook(() => useResendCode(options));

        await waitFor(() => {
            expect(result.current.attempts).toBe(1);
            expect(result.current.cooldown).toBe(0);
            expect(result.current.isCooldownEnabled).toBe(false);
            expect(result.current.isResendCodeEnabled).toBe(false);
            expect(result.current.resendCodeIndex).toBe(1);
            expect(result.current.timer).toBe(60);
        });

        await act(async () => {
            jest.advanceTimersByTime(30000);
        });

        await waitFor(() => {
            expect(result.current.attempts).toBe(1);
            expect(result.current.cooldown).toBe(0);
            expect(result.current.isCooldownEnabled).toBe(false);
            expect(result.current.isResendCodeEnabled).toBe(false);
            expect(result.current.resendCodeIndex).toBe(1);
            expect(result.current.timer).toBe(30);
        });

        // Resend code is requested again while timer is running
        await act(async () => {
            result.current.triggerResendCode();
        });

        expect(result.current.attempts).toBe(1);
        expect(result.current.isCooldownEnabled).toBe(false);
        expect(result.current.isResendCodeEnabled).toBe(false);
        expect(result.current.timer).toBe(30);

        // Send second code after timer is done
        await act(async () => {
            jest.advanceTimersByTime(30000);
        });

        await act(async () => {
            await result.current.triggerResendCode();
        });

        expect(result.current.attempts).toBe(2);
        expect(result.current.isResendCodeEnabled).toBe(false);
        expect(result.current.timer).toBe(120);

        await act(async () => {
            jest.advanceTimersByTime(120000);
        });

        // Send third code after timer is done
        await act(async () => {
            await result.current.triggerResendCode();
        });

        expect(result.current.attempts).toBe(3);
        expect(result.current.cooldown).toBe(0);
        expect(result.current.isCooldownEnabled).toBe(false);
        expect(result.current.isResendCodeEnabled).toBe(false);
        expect(result.current.resendCodeIndex).toBe(2);
        expect(result.current.timer).toBe(300);

        // Cooldown period starts can be started at this point
        await act(async () => {
            jest.advanceTimersByTime(300000);
        });

        expect(result.current.attempts).toBe(3);
        expect(result.current.isCooldownEnabled).toBe(false);
        expect(result.current.isResendCodeEnabled).toBe(true);
        expect(result.current.resendCodeIndex).toBe(2);
        expect(result.current.timer).toBe(0);

        // Cooldown period triggers after the third attempt
        await act(async () => {
            result.current.triggerResendCode();
        });

        expect(result.current.attempts).toBe(3);
        expect(result.current.cooldown).toBe(3600);
        expect(result.current.isCooldownEnabled).toBe(true);
        expect(result.current.isResendCodeEnabled).toBe(false);
        expect(result.current.resendCodeIndex).toBe(2);
        expect(result.current.timer).toBe(0);

        // Cooldown period ends and resets the attempts to 1
        await act(async () => {
            jest.advanceTimersByTime(3600 * 1000);
        });

        expect(result.current.attempts).toBe(1);
        expect(result.current.cooldown).toBe(0);
        expect(result.current.isCooldownEnabled).toBe(false);
        expect(result.current.isResendCodeEnabled).toBe(true);
        expect(result.current.resendCodeIndex).toBe(1);
        expect(result.current.timer).toBe(0);

        platformSpy.restore();
    });

    it('resets everything from the storage', async () => {
        const asyncStorageSpy = jest.spyOn(AsyncStorage, 'multiRemove');
        const { result } = renderHook(() => useResendCode(options));

        await act(async () => {
            result.current.resetStorage();
        });

        expect(asyncStorageSpy).toHaveBeenCalledWith([
            'ATTEMPTS_CUSTOM_KEY',
            'COOLDOWN_CUSTOM_KEY',
            'COOLDOWN_ENABLED_CUSTOM_KEY',
            'LAST_UPDATE_CUSTOM_KEY',
            'RESEND_CODE_ENABLED_CUSTOM_KEY',
            'RESEND_CODE_INDEX_CUSTOM_KEY',
            'TIMER_CUSTOM_KEY',
        ]);

        // Trigger resend code
        await act(async () => {
            result.current.triggerResendCode();
        });

        expect(result.current.attempts).toBe(1);
        expect(result.current.cooldown).toBe(0);
        expect(result.current.isCooldownEnabled).toBe(false);
        expect(result.current.isResendCodeEnabled).toBe(false);
        expect(result.current.timer).toBe(60);
    });

    it('should handle app state changes correctly', async () => {
        // Mock AppState change
        const appStateCurrentState = jest.replaceProperty(
            AppState,
            'currentState',
            'active'
        );
        const appStateListenerSpy = jest.spyOn(AppState, 'addEventListener');

        const { result } = renderHook(() => useResendCode(options));

        await waitFor(() => {
            expect(result.current.attempts).toBe(1);
        });

        await act(async () => {
            result.current.triggerResendCode();
        });

        expect(result.current.timer).toBe(60);

        // Simulate app going to background
        await act(async () => {
            const handler = appStateListenerSpy.mock.calls[0][1];
            handler('background');
        });

        // Simulate time passing while app is in background
        await act(async () => {
            jest.advanceTimersByTime(30000); // 30 seconds
        });

        // // Simulate app coming to foreground
        await act(async () => {
            const handler = appStateListenerSpy.mock.calls[0][1];
            handler('active');
        });

        // The timer should be reduced by the elapsed time (30 seconds)
        expect(result.current.timer).toBe(30);

        // Cooldown check after further timer advance
        await act(async () => {
            jest.advanceTimersByTime(30000); // Remaining 30 seconds
        });

        expect(result.current.timer).toBe(0);
        expect(result.current.isResendCodeEnabled).toBe(true);

        // appStateCurrentState.mockRestore();
        // appStateSpy.mockRestore();
    });

    it('should handle app state changes correctly from inactive to active', async () => {
        const appStateCurrentState = jest.replaceProperty(
            AppState,
            'currentState',
            'inactive'
        );
        const appStateListenerSpy = jest.spyOn(AppState, 'addEventListener');
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE, `${Date.now()}`);

        const { result } = renderHook(() => useResendCode(options));

        await waitFor(() => {
            expect(result.current.attempts).toBe(1);
        });

        await act(async () => {
            result.current.triggerResendCode();
        });

        expect(result.current.timer).toBe(60);

        // Simulate time passing while app is in background
        await act(async () => {
            jest.advanceTimersByTime(30000); // 30 seconds
        });

        // Simulate app coming to foreground
        await act(async () => {
            const handler = appStateListenerSpy.mock.calls[0][1];
            handler('active');
        });

        // The timer should be reduced by the elapsed time (30 seconds)
        expect(result.current.timer).toBe(30);

        // Cooldown check after further timer advance
        await act(async () => {
            jest.advanceTimersByTime(30000); // Remaining 30 seconds
        });

        expect(result.current.timer).toBe(0);
        expect(result.current.isResendCodeEnabled).toBe(true);

        // Simulate app going to background without any last update saved in the background
        await act(async () => {
            result.current.triggerResendCode();
        });

        await act(async () => {
            const handler = appStateListenerSpy.mock.calls[0][1];
            handler('background');
        });

        await act(async () => {
            jest.advanceTimersByTime(20000); // 20 seconds
        });

        await AsyncStorage.setItem('LAST_UPDATE_CUSTOM_KEY', '');

        await act(async () => {
            const handler = appStateListenerSpy.mock.calls[0][1];
            handler('active');
        });

        expect(result.current.timer).toBe(100);
    });
});
