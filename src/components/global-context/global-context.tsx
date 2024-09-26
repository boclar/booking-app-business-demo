import { GlobalContextProps } from './global-context.types';
import {
    AlertProvider,
    CrashProvider,
    ThemeProvider,
} from '@boclar/booking-app-components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightMobileTheme } from '@/theme/light-mobile.theme';
import { Platform } from 'react-native';
import { lightDesktopTheme } from '@/theme/light-desktop.theme';
import { Provider } from 'react-redux';
import { persistor, store } from '@/redux/store';
import { LocaleProvider } from '@/providers/locale-provider/locale-provider';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { PortalProvider } from '@gorhom/portal';
import { PersistGate } from 'redux-persist/integration/react';

interface ExtendedGlobalContextProps extends GlobalContextProps {
}

const PersistorComponent = ({ children }: { children: React.ReactNode }) => {
    return persistor ? (
        <PersistGate
            loading={null}
            persistor={persistor}
        >
            {children}
        </PersistGate>
    ) : (
        children
    );
};

/**
 * Provide an application context for the components that are wrapped by this component.
 */
const GlobalContext = ({
    children,
    store: localStore = store,
}: ExtendedGlobalContextProps) => {
    let theme = lightMobileTheme;

    // Use the desktop theme if the platform is not android or ios
    Platform.OS !== 'android' &&
        Platform.OS !== 'ios' &&
        (theme = lightDesktopTheme);

    return (
        <SafeAreaProvider>
            <ThemeProvider theme={theme}>
                <Provider store={localStore}>
                    <PersistorComponent>
                        <CrashProvider>
                            <AlertProvider>
                                <I18nextProvider i18n={i18n}>
                                    <LocaleProvider>
                                        <PortalProvider>
                                            {children}
                                        </PortalProvider>
                                    </LocaleProvider>
                                </I18nextProvider>
                            </AlertProvider>
                        </CrashProvider>
                    </PersistorComponent>
                </Provider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export { GlobalContext };
