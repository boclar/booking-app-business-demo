import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { defaultTheme } from '@boclar/booking-app-components';

export const lightMobileTheme: ThemeDesignTokens = {
    ...defaultTheme,
    color: {
        ...defaultTheme.color,
        background: {
            ...defaultTheme.color.background,
            screen: '#FFF',
            spinner: '#000',
            switchTrack: '#242424',
        },
    },
    component: {
        ...defaultTheme.component,
        button: {
            ...defaultTheme.component.button,
            height: 48,
        },
        text: {
            ...defaultTheme.component.text,
            maxFontSizeMultiplier: 1.5,
        },
    },
    typography: {
        ...defaultTheme.typography,
        fontSize: {
            ...defaultTheme.typography.fontSize,
            subscriptionPrice: 24,
            /*
             * ...Object.entries(defaultTheme.typography.fontSize).reduce(
             *     (acc: { [key: string]: number | object }, [key, value]) => {
             *         if (typeof value === 'number') {
             *             acc[key] = value - 2;
             *         }
             *
             *         return acc;
             *     },
             *     {}
             * ),
             */
        },
    },
};
