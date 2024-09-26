import {
    getFromAsyncStorage,
    storeInAsyncStorage,
} from '@/utils/storage/storage.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Storage Utils', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('storeInAsyncStorage', () => {
        it('stores a string in AsyncStorage', async () => {
            const key = 'isBusinessCreated';
            const value = 'test';
            const spy = jest.spyOn(AsyncStorage, 'setItem');
            // @ts-ignore - We are testing the function with different types
            await storeInAsyncStorage(key, value);
            expect(spy).toHaveBeenCalledWith(key, value);
        });

        it('stores an object in AsyncStorage', async () => {
            const key = 'hasOpenedReportIssue';
            const value = true;
            const spy = jest.spyOn(AsyncStorage, 'setItem');
            await storeInAsyncStorage(key, value);
            expect(spy).toHaveBeenCalledWith(key, JSON.stringify(value));
        });

        it('logs an error if storing fails', async () => {
            const asyncStorageSpy = jest
                .spyOn(AsyncStorage, 'setItem')
                .mockRejectedValue(new Error('test'));
            const consoleSpy = jest.spyOn(console, 'error');
            await storeInAsyncStorage('hasOpenedReportIssue', true);
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error storing data in AsyncStorage',
                new Error('test')
            );
            asyncStorageSpy.mockRestore();
        });
    });

    describe('getFromAsyncStorage', () => {
        it('retrieves a formatted true value from AsyncStorage', async () => {
            const key = 'hasOpenedReportIssue';
            const value = 'true';
            const spy = jest
                .spyOn(AsyncStorage, 'getItem')
                .mockResolvedValue(value);
            const result = await getFromAsyncStorage(key);
            expect(spy).toHaveBeenCalledWith(key);
            expect(result).toBe(true);
        });

        it('retrieves an unformatted string value from AsyncStorage', async () => {
            const key = 'hasOpenedReportIssue';
            const value = 'xxx';
            const spy = jest
                .spyOn(AsyncStorage, 'getItem')
                .mockResolvedValue(value);
            const result = await getFromAsyncStorage(key);
            expect(spy).toHaveBeenCalledWith(key);
            expect(result).toBe(value);
        });

        it('returns undefined if no value is found in AsyncStorage', async () => {
            const key = 'hasOpenedReportIssue';
            const spy = jest
                .spyOn(AsyncStorage, 'getItem')
                .mockResolvedValue(null);
            const result = await getFromAsyncStorage(key);
            expect(spy).toHaveBeenCalledWith(key);
            expect(result).toBeUndefined();
        });
    });
});
