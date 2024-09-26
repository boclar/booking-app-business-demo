import '../msw.polyfills'
import '@testing-library/react-native/extend-expect';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import React from 'react';
import { View } from 'react-native';
// @ts-ignore - require.context is not recognized by jest.
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
import { mswServer } from '../config/jest-mocks/msw.server';

mswServer.events.on('request:start', ({ request, requestId }) => {
    console.log('Outgoing request:', request.method, request.url)
  })
  
beforeAll(() => {
    mswServer.listen({
        onUnhandledRequest: 'warn'
    })
});
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());


registerRequireContextHook();

// Async Storage
jest.mock(
    '@react-native-async-storage/async-storage',
    () =>
        require('@react-native-async-storage/async-storage/jest/async-storage-mock') as object
);

// React Native Safe Area Context

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// React Native Reanimated
// require("react-native-reanimated").setUpTests();

jest.mock('react-native-portal', () => {
    const originalModule = jest.requireActual('react-native-portal');

    return {
        ...originalModule,
        BlackPortal: ({ children }: { children: React.ReactNode }) => children,
    };
});

// Hide warnings
global.console.warn = jest.fn();

// Mock React Native
const measureInWindow = jest.fn().mockImplementation(f => {
    f(1, 2, 3, 4, 5, 6);
});

View.prototype.measureInWindow = measureInWindow;

jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}));

jest.mock('@sentry/react-native', () => ({
    captureEvent: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    captureUserFeedback: jest.fn(),
    init: () => jest.fn(),
    ReactNativeTracing: jest.fn(), // Mocking the constructor
    ReactNavigationInstrumentation: jest.fn().mockImplementation(() => ({
        registerNavigationContainer: jest.fn(),
    })),
    setTag: jest.fn(),
    wrap: jest.fn().mockImplementation((fn: any) => fn),
}));

// Mock the module that exports GestureHandlerRefContext
jest.mock('@react-navigation/stack', () => {
    const originalModule = jest.requireActual('@react-navigation/stack');
    return {
        ...originalModule,
        GestureHandlerRefContext: {
            Consumer: ({ children }: { children: React.FC }) => children({}),
        },
    };
});

jest.mock('react-native-keyboard-aware-scroll-view', () => {
    const KeyboardAwareScrollView = require('react-native').ScrollView;
    return { KeyboardAwareScrollView };
});


jest.mock('react-native-purchases', () => ({
    configure: jest.fn(),
    setup: jest.fn(),
    addPurchaserInfoUpdateListener: jest.fn(),
    removePurchaserInfoUpdateListener: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restoreTransactions: jest.fn(),
}));