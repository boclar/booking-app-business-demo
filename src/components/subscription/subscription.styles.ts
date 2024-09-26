import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

interface SubscriptionStylesProps {
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const subscriptionStyles = ({
    insets,
    theme,
}: SubscriptionStylesProps) => {
    return StyleSheet.create({
        applyDiscountText: {
            textDecorationLine: 'underline',
        },
        applyDiscountTextContainer: {
            marginTop: 24,
        },
        contentContainer: {
            flex: 1,
            marginTop: 24,
            paddingBottom: insets.bottom || 20,
        },
        loaderContainer: {
            height: '100%',
        },
        rootContainer: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
        },
        rootScrollViewContentContainer: {
            flex: 1,
        },
        scrollView: {
            gap: 20,
        },
        scrollViewContentContainer: {
            gap: 20,
            paddingHorizontal: theme.spacing.horizontalScreenPadding,
        },
        switchContainer: {
            alignItems: 'center',
            marginTop: 24,
        },
        wrapper: {
            paddingHorizontal: theme.spacing.horizontalScreenPadding,
        },
    });
};
