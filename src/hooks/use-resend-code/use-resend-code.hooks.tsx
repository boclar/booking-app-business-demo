import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Platform } from 'react-native';

export interface UseResendCodeProps {
    cooldownPeriod?: number;
    initialTimers?: number[];
    instanceKey: string;
    maxAttempts?: number;
}

// Keys for AsyncStorage to persist state
export const STORAGE_KEYS_FN = (key: string) => ({
    ATTEMPTS: `ATTEMPTS_${key}`,
    COOLDOWN: `COOLDOWN_${key}`,
    COOLDOWN_ENABLED: `COOLDOWN_ENABLED_${key}`,
    LAST_UPDATE: `LAST_UPDATE_${key}`,
    RESEND_CODE_ENABLED: `RESEND_CODE_ENABLED_${key}`,
    RESEND_CODE_INDEX: `RESEND_CODE_INDEX_${key}`,
    TIMER: `TIMER_${key}`,
});

// Function to reset all storage keys
export const resetTimerStorage = async (obj: object) => {
    // Clear all storage keys at once
    await AsyncStorage.multiRemove(Object.values(obj));
    // eslint-disable-next-line react-hooks/exhaustive-deps
};

/**
 *  Hook to handle resend code logic with cooldown and timer
 */
export const useResendCode = ({
    cooldownPeriod = 3600,
    // cooldownPeriod = 5,
    initialTimers = [60, 60 * 2, 60 * 5],
    // initialTimers = [2, 3, 4],
    instanceKey,
    maxAttempts = 3,
}: UseResendCodeProps) => {
    const [isResendCodeEnabled, setIsResendCodeEnabled] = useState(false);
    // The index of the initialTimers array to use for the next resend code when triggerResendCode is called the first time
    const [resendCodeIndex, setResendCodeIndex] = useState(1);
    const [timer, setTimer] = useState<number>(initialTimers[0]);
    const [attempts, setAttempts] = useState(1); // Start attempts at 0
    const [cooldown, setCooldown] = useState(0);
    const [isCooldownEnabled, setIsCooldownEnabled] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);
    const [hasStorageLoaded, setHasStorageLoaded] = useState<boolean>(false);
    const STORAGE_KEYS = STORAGE_KEYS_FN(instanceKey);

    // Load state from AsyncStorage on component mount
    useEffect(() => {
        const loadState = async () => {
            const [
                storedResendCodeEnabled,
                storedResendCodeIndex,
                storedTimer,
                storedAttempts,
                storedCooldown,
                storedCooldownEnabled,
                storedLastUpdate,
            ] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.RESEND_CODE_ENABLED),
                AsyncStorage.getItem(STORAGE_KEYS.RESEND_CODE_INDEX),
                AsyncStorage.getItem(STORAGE_KEYS.TIMER),
                AsyncStorage.getItem(STORAGE_KEYS.ATTEMPTS),
                AsyncStorage.getItem(STORAGE_KEYS.COOLDOWN),
                AsyncStorage.getItem(STORAGE_KEYS.COOLDOWN_ENABLED),
                AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE),
            ]);

            const now = Date.now();
            if (storedLastUpdate) {
                const elapsed = (now - parseInt(storedLastUpdate, 10)) / 1000;

                // Calculate new timer value based on elapsed time
                if (storedTimer !== null) {
                    const newTimer = Math.max(
                        0,
                        JSON.parse(storedTimer) - elapsed
                    );

                    setTimer(newTimer);
                    newTimer > 0 && setIsResendCodeEnabled(false);
                } else {
                    setTimer(initialTimers[0]);
                }

                // Calculate new cooldown value based on elapsed time
                if (storedCooldown !== null) {
                    const newCooldown = Math.max(
                        0,
                        JSON.parse(storedCooldown) - elapsed
                    );
                    setCooldown(newCooldown);
                    newCooldown > 0 && setIsCooldownEnabled(true);
                }
            } else {
                setTimer(initialTimers[0]);
            }

            // Set state from stored values
            if (storedResendCodeEnabled !== null)
                setIsResendCodeEnabled(JSON.parse(storedResendCodeEnabled));
            if (storedResendCodeIndex !== null)
                setResendCodeIndex(JSON.parse(storedResendCodeIndex));
            if (storedAttempts !== null)
                setAttempts(Math.max(0, JSON.parse(storedAttempts))); // Ensure attempts start from 0
            if (storedCooldownEnabled !== null)
                setIsCooldownEnabled(JSON.parse(storedCooldownEnabled));

            setHasStorageLoaded(true);
        };

        loadState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save state to AsyncStorage whenever state changes
    useEffect(() => {
        const saveState = async () => {
            if (!hasStorageLoaded) return;

            await AsyncStorage.multiSet([
                [STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts)],
                [STORAGE_KEYS.COOLDOWN, JSON.stringify(cooldown)],
                [
                    STORAGE_KEYS.COOLDOWN_ENABLED,
                    JSON.stringify(isCooldownEnabled),
                ],
                [
                    STORAGE_KEYS.RESEND_CODE_ENABLED,
                    JSON.stringify(isResendCodeEnabled),
                ],
                [
                    STORAGE_KEYS.RESEND_CODE_INDEX,
                    JSON.stringify(resendCodeIndex),
                ],
                [STORAGE_KEYS.TIMER, JSON.stringify(timer)],
            ]);

            Platform.OS === 'web' &&
                (await AsyncStorage.setItem(
                    STORAGE_KEYS.LAST_UPDATE,
                    Date.now().toString()
                ));
        };

        saveState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        attempts,
        cooldown,
        hasStorageLoaded,
        isCooldownEnabled,
        isResendCodeEnabled,
        resendCodeIndex,
        timer,
    ]);

    // Handle timer and cooldown countdown
    useEffect(() => {
        let timerInterval: NodeJS.Timeout;
        let cooldownInterval: NodeJS.Timeout;

        // Timer countdown logic
        if (timer && timer > 0 && !isResendCodeEnabled) {
            timerInterval = setInterval(() => {
                setTimer(prevTimer => Math.max(0, prevTimer! - 1));
            }, 1000);
        } else if (timer === 0 && cooldown === 0) {
            setIsResendCodeEnabled(true);
        }

        // Cooldown countdown logic
        if (cooldown > 0) {
            cooldownInterval = setInterval(() => {
                setCooldown(prevCooldown => Math.max(0, prevCooldown - 1));
            }, 1000);
        } else if (
            cooldown === 0 &&
            attempts >= maxAttempts &&
            isCooldownEnabled
        ) {
            setAttempts(1);
            setResendCodeIndex(1);
            setTimer(0);
            setIsResendCodeEnabled(true);
            setIsCooldownEnabled(false);
        }

        // Cleanup intervals on component unmount
        return () => {
            clearInterval(timerInterval);
            clearInterval(cooldownInterval);
        };
    }, [
        attempts,
        cooldown,
        hasStorageLoaded,
        isCooldownEnabled,
        isResendCodeEnabled,
        maxAttempts,
        timer,
    ]);

    // Handle app state changes (foreground/background)
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (
                appState.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                const storedLastUpdate = await AsyncStorage.getItem(
                    STORAGE_KEYS.LAST_UPDATE
                );
                const now = Date.now();

                if (storedLastUpdate) {
                    const elapsed = Math.round(
                        (now - parseInt(storedLastUpdate)) / 1000
                    ); // Round to avoid floating-point issues

                    // Calculate new timer value based on elapsed time
                    if (timer && timer > 0) {
                        const newTimer = Math.max(0, timer - elapsed);
                        setTimer(newTimer);
                        newTimer > 0 && setIsResendCodeEnabled(false);
                    }

                    // Calculate new cooldown value based on elapsed time
                    if (cooldown > 0) {
                        const newCooldown = Math.max(0, cooldown - elapsed);
                        setCooldown(newCooldown);
                        newCooldown > 0 && setIsCooldownEnabled(true);
                    }
                }
            } else if (nextAppState.match(/inactive|background/)) {
                await AsyncStorage.setItem(
                    STORAGE_KEYS.LAST_UPDATE,
                    Date.now().toString()
                );
            }
            setAppState(nextAppState);
        };

        // Subscribe to app state changes
        const subscription = AppState.addEventListener(
            'change',
            handleAppStateChange
        );

        // Cleanup subscription on component unmount
        return () => {
            subscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState, hasStorageLoaded, timer, cooldown]);

    // Trigger resend code logic
    const triggerResendCode = useCallback(async () => {
        if (!hasStorageLoaded) return;

        if (attempts < maxAttempts && isResendCodeEnabled) {
            setAttempts(attempts + 1);
            setTimer(initialTimers[resendCodeIndex]);

            if (resendCodeIndex < initialTimers.length - 1) {
                setResendCodeIndex(resendCodeIndex + 1);
            }

            setIsResendCodeEnabled(false);
        } else if (attempts >= maxAttempts && isResendCodeEnabled) {
            setIsResendCodeEnabled(false);
            setCooldown(cooldownPeriod);
            setIsCooldownEnabled(true);
        }
    }, [
        attempts,
        cooldownPeriod,
        hasStorageLoaded,
        initialTimers,
        isResendCodeEnabled,
        maxAttempts,
        resendCodeIndex,
    ]);

    const resetStorage = useCallback(async () => {
        await resetTimerStorage(STORAGE_KEYS);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        attempts,
        cooldown,
        isCooldownEnabled,
        isResendCodeEnabled,
        maxAttempts,
        resendCodeIndex,
        resetStorage: resetStorage,
        timer,
        triggerResendCode,
    };
};
