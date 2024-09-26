import {
    selectLanguage,
    changeLanguage as changeLanguageRedux,
} from '@/redux/slices/ui.slices';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/redux/hooks';
import i18n from 'i18next';
import { useCallback } from 'react';

export const useLocale = () => {
    const dispatch = useAppDispatch();
    const language = useSelector(selectLanguage) || i18n.language;

    const changeLanguage = useCallback(
        async (language: string) => {
            await i18n.changeLanguage(language);
            dispatch(changeLanguageRedux(language));
        },
        [dispatch]
    );

    return {
        changeLanguage,
        language,
    };
};
