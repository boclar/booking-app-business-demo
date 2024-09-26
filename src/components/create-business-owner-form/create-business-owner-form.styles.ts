import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { StyleSheet } from 'react-native';

interface CreateBusinessOwnerFormStylesProps {
    theme: ThemeDesignTokens;
}

export const createBusinessOwnerFormStyles = ({
    theme,
}: CreateBusinessOwnerFormStylesProps) => {
    return StyleSheet.create({
        avatarContainer: {
            alignItems: 'center',
            gap: 8,
        },
        contentContainer: {
            gap: 24,
            paddingBottom: 40,
            paddingTop: 20,
        },
        ctaText: {
            color: theme.color.background.ctaPrimary,
        },
        fitScreen: {
            flex: 1,
        },
        rootContainer: {
            flex: 1,
            paddingHorizontal: 20,
        },
    });
};
