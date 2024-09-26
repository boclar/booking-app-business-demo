import { LocaleProvider } from '@/providers/locale-provider/locale-provider';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';
import { Text } from '@boclar/booking-app-components';
import { render, screen } from '@testing-library/react-native';
import i18n from 'i18next';
import { setupStore } from '@/redux/store';
import { changeLanguage } from '@/redux/slices/ui.slices';
import { GlobalContext } from '@/components/global-context';
import { act } from 'expo-router/testing-library';

jest.mock('expo-localization', () => {
    const originalModule = jest.requireActual('expo-localization');

    return {
        ...originalModule, // this will keep the original module functionality
        getLocales: () => [
            {
                currencyCode: 'CRC',
                currencySymbol: '₡',
                decimalSeparator: ',',
                digitGroupingSeparator: '.',
                languageCode: 'en',
                languageTag: 'es-CR',
                measurementSystem: 'metric',
                regionCode: 'CR',
                temperatureUnit: 'celsius',
                textDirection: 'ltr',
            },
        ],
    };
});

describe('LocaleProvider', () => {
    it('renders correctly', async () => {
        renderWithContext(
            <LocaleProvider>
                <Text>Test</Text>
            </LocaleProvider>
        );

        await act(async () => {
            expect(screen.getByText('Test')).toBeDefined();
        });
    });

    it('must change language if preferred language is changed', async () => {
        const store = setupStore({
            initialState: {
                ui: {
                    language: 'es',
                },
            },
        });

        await act(async () => {
            store?.dispatch(changeLanguage('fr'));
        });

        render(
            <GlobalContext store={store}>
                <LocaleProvider>
                    <></>
                </LocaleProvider>
                ,
            </GlobalContext>
        );

        expect(i18n.language).toBe('fr');
    });

    it('must change language to device language if preferred language is not set', async () => {
        const store = setupStore({
            initialState: {
                ui: {
                    language: null,
                },
            },
        });

        render(
            <GlobalContext store={store}>
                <LocaleProvider>
                    <></>
                </LocaleProvider>
            </GlobalContext>
        );

        await act(async () => {
            expect(i18n.language).toBe('en');
        });
    });
});
