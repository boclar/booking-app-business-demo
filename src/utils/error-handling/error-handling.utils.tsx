import type { TFunction } from 'i18next';
import { BusinessApiError } from '@/services/business-services/business-rtk-query';

interface TranslateErrorMessage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * Business API error object to provide more context.
     */
    businessError?: BusinessApiError;
    /**
     * Error name.
     */
    name: string;
    t: TFunction;
}

export const translateErrorMessage = ({
    businessError,
    name,
    t,
}: TranslateErrorMessage): string => {
    switch (name) {
        case 'ValidationError':
            const errorKey =
                businessError?.stack?.errorInfo?.details?.[0]?.context?.key;

            return t(`businessApiErrors.${errorKey}`, {
                defaultValue: t('businessApiErrors.ValidationError'),
            });
        default:
            return t(`businessApiErrors.${name}`, {
                defaultValue: t('businessApiErrors.SomethingWentWrong'),
            });
    }
};
