import { maxScreenWidth } from '@/constants/app.constants';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

interface TermsAndConditionsStyles {
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const termsAndConditionsStyles = ({
    insets,
    theme,
}: TermsAndConditionsStyles) => {
    return StyleSheet.create({
        closeModalIcon: {
            cursor: 'pointer',
        },
        lastUpdatedText: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
            marginTop: 8,
        },
        paragraphContainer: {
            flexGrow: 1,
            marginTop: 16,
        },
        rootContainer: {
            backgroundColor: theme.color.background.modal,
            flex: 1,
            ...Platform.select({
                web: {
                    alignSelf: 'center',
                    maxWidth: maxScreenWidth,
                    width: '100%',
                },
            }),
        },
        scrollViewContent: {
            flexGrow: 1,
            paddingBottom: insets.bottom || 20,
            paddingHorizontal: theme.spacing.horizontalScreenPadding,
            paddingTop: 20,
        },
        spinnerContainer: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
        },
        topBar: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
    });
};
