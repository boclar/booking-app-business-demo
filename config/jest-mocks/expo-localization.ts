export const locale = {
    'currencyCode': 'CRC',
    'currencySymbol': '₡',
    'decimalSeparator': ',',
    'digitGroupingSeparator': '.',
    'languageCode': 'es',
    'languageTag': 'es-CR',
    'measurementSystem': 'metric',
    'regionCode': 'CR',
    'temperatureUnit': 'celsius',
    'textDirection': 'ltr',
};

jest.mock('expo-localization', () => {
    const originalModule = jest.requireActual('expo-localization');

    return {
        ...originalModule, // this will keep the original module functionality
        getLocales: () => [
            {
                ...locale,
                isTesting: true,
            }
        ],
    };
});
