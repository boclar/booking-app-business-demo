import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { lightMobileTheme } from '@/theme/light-mobile.theme';

export const lightDesktopTheme: ThemeDesignTokens = {
    ...lightMobileTheme,
    typography: {
        ...lightMobileTheme.typography,
        fontSize: {
            ...lightMobileTheme.typography.fontSize,
            big: 20,
            body: 16,
            extraExtraSmall: 10,
            small: 14,
        },
    },
};
