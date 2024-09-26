import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
require('intl-pluralrules');

// Create a context for the locale files
const localeContext = require.context('../../locales', true, /\.json$/);

// Create a resources object
export const i18nResources = localeContext
    .keys()
    .reduce((acc: { [key: string]: object }, key) => {
        // Remove the './' and '.json' from the key to get the language code
        const lng = key.slice(2, -5);
        // Use the key to import the locale file and add it to the i18nResources object
        acc[lng] = { translation: localeContext(key) };

        return acc;
    }, {}) as Record<string, Resource>;

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
    nonExplicitSupportedLngs: true,
    resources: i18nResources,
});
