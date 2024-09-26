import { ReactNode, useEffect } from 'react';
import { getLocales } from 'expo-localization';
import { useSelector } from 'react-redux';
import { selectLanguage } from '@/redux/slices/ui.slices';
import { useLocale } from '@/hooks/useLocale/useLocale';
import i18n from 'i18next';
import '@/libs/i18n/i18n.libs';

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
    const locales = getLocales();
    const deviceLanguage = locales[0].languageCode;
    // @ts-ignore isTesting is not part of the type definition
    const isLocaleTest = locales[0].isTesting;
    const preferredUserLanguage = useSelector(selectLanguage);
    const { changeLanguage } = useLocale();

    useEffect(() => {
        const setLanguage = async () => {
            if (
                preferredUserLanguage &&
                i18n.language !== preferredUserLanguage
            ) {
                await changeLanguage(preferredUserLanguage);
            } else if (
                !preferredUserLanguage &&
                deviceLanguage &&
                i18n.language !== deviceLanguage &&
                !isLocaleTest
            ) {
                // Set the device language if the preferred user language is not set
                await changeLanguage(deviceLanguage);
            }
        };
        setLanguage();
    }, [changeLanguage, deviceLanguage, isLocaleTest, preferredUserLanguage]);

    return <>{children}</>;
};
