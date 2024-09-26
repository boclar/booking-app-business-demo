import { maxScreenWidth } from '@/constants/app.constants';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

interface ReportIssueStylesProps {
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const reportIssueStyles = ({
    insets,
    theme,
}: ReportIssueStylesProps) => {
    return StyleSheet.create({
        actionBtn: {},
        bottomButtonsContainer: {
            marginTop: 'auto',
        },
        contentContainer: {
            marginHorizontal: 20,
            paddingTop: insets.top,
        },
        form: {
            gap: 20,
            marginTop: 20,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        premium: {
            flexDirection: 'row',
            gap: 8,
        },
        premiumBadge: {
            paddingHorizontal: 4,
            paddingVertical: 2,
        },
        premiumNotice: {
            flex: 1,
        },
        rootContainer: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
            paddingBottom: insets.bottom,
            ...Platform.select({
                web: {
                    alignSelf: 'center',
                    maxWidth: maxScreenWidth,
                },
            }),
        },
        scrollView: {
            flex: 1,
        },
        scrollViewContent: {
            flex: 1,
        },
        textContainer: {
            gap: 8,
            marginTop: 32,
        },
    });
};
