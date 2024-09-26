import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { uiReducer } from '@/redux/slices/ui.slices';
import { userReducer } from '@/redux/slices/user.slices';
import { userProgressReducer } from '@/redux/slices/userProgress.slices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import { Platform } from 'react-native';
import { isJestEnv, localStorageKey } from '@/constants/app.constants';

const rootReducer = combineReducers({
    ui: uiReducer,
    user: userReducer,
    userProgress: userProgressReducer,
});

const persistedReducer = persistReducer(
    {
        key: localStorageKey,
        /*
         * Avoid errors on terminal by having web storage inside the conditional when running Jest
         * storage:
         *     Platform.OS === 'web'
         *         ? require('redux-persist/lib/storage').default
         *         : AsyncStorage,
         */
        storage: Platform.OS === 'web' ? AsyncStorage : AsyncStorage,
    },
    rootReducer
);

interface SetupStoreProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialState?: any;
}

export const setupStore = ({ initialState }: SetupStoreProps) => {
    return configureStore({
        devTools: true,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [
                        FLUSH,
                        REHYDRATE,
                        PAUSE,
                        PERSIST,
                        PURGE,
                        REGISTER,
                    ],
                },
            }),
        preloadedState: initialState,
        reducer: persistedReducer,
    });
};

export const store = setupStore({});
export const persistor = isJestEnv() ? null : persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
