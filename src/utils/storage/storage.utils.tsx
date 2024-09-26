import AsyncStorage from '@react-native-async-storage/async-storage';

type AsyncStorageData = {
    hasOpenedReportIssue: boolean;
};

/**
 * Store data in AsyncStorage
 */
export const storeInAsyncStorage = async <K extends keyof AsyncStorageData>(
    key: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: AsyncStorageData[K]
) => {
    try {
        const stringValue =
            typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(key, stringValue);
    } catch (err) {
        console.error('Error storing data in AsyncStorage', err);
    }
};

/**
 * Retrieve formatted data from AsyncStorage
 */
export const getFromAsyncStorage = async <K extends keyof AsyncStorageData>(
    key: K
): Promise<AsyncStorageData[K] | undefined> => {
    const value = await AsyncStorage.getItem(key);
    if (value) {
        try {
            return JSON.parse(value) as AsyncStorageData[K];
        } catch (e) {
            return value as unknown as AsyncStorageData[K];
        }
    }
};
