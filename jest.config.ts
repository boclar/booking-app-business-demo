import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

// Load expo env variables
import { load } from '@expo/env';
load(process.cwd());

const config: Config = {
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/Storybook.tsx',
        '!src/App.tsx',

        '!src/redux/**/*',
        '!src/services/**/*',
        '!src/constants/**/*',
        '!src/types/**/*',

        // Hide coverage for index files as they are just exports except for the index in app
        '!src/**/index.{ts,tsx}',
        '!src/index.{ts,tsx}',
        '!src/app/index.{ts,tsx}',
        'src/app/**/**/*.{ts,tsx}',

        '!config/**/**/*.{ts,tsx}',
    ],
    coverageDirectory: 'dist/coverage',
    coveragePathIgnorePatterns: [
        'props.ts',
        'styles.ts',
        'types.ts',
        'stories.tsx',
        'stories.ts',
        'mock.ts',
        // '.d.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
    globals: {
        'process.env.EXPO_PUBLIC_GRAPHQL_API_URL':
            process.env.EXPO_PUBLIC_GRAPHQL_API_URL,
        'process.env.EXPO_PUBLIC_GRAPHQL_API_KEY':
            process.env.EXPO_PUBLIC_GRAPHQL_API_KEY,
    },
    moduleNameMapper: {
        '\\.svg': '<rootDir>/config/jest-mocks/svg-mock.tsx',
        ...pathsToModuleNameMapper(compilerOptions.paths, {
            prefix: '<rootDir>/',
        }),
    },
    preset: 'jest-expo',
    // setupFiles: ['dotenv-flow/config'],
    setupFilesAfterEnv: [
        './config/jest-setup.ts',
        './node_modules/react-native-gesture-handler/jestSetup.js',
        './config/jest-mocks/expo-localization.ts',
    ],
    // testMatch: [
    //     ' "**/*.{ts,tsx,js,jsx}"
    //     // '<rootDir>/src/**/**/*.(spec|test).(js|jsx|ts|tsx)',
    //     // '<rootDir>/src/**/**/__tests__/*.(spec|test).(js|jsx|ts|tsx)',
    // ],
    testEnvironment: 'node',
    testTimeout: 60000,
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@boclar/booking-app-components|change-case)',
    ],
};

export default config;
