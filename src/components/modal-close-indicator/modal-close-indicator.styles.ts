import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { StyleSheet } from 'react-native';

interface ModalCloseIndicatorStylesProps {
    theme: ThemeDesignTokens;
}

export const modalCloseIndicatorStyles = ({
    theme,
}: ModalCloseIndicatorStylesProps) => {
    return StyleSheet.create({
        rootContainer: {
            alignSelf: 'center',
            backgroundColor: theme.color.background.modalIndicator,
            borderRadius: 2,
            height: 4,
            marginBottom: 2,
            marginTop: 8,
            width: 50,
        },
    });
};
