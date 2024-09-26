import { maxScreenWidth } from '@/constants/app.constants';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

interface LoginStylesProps {
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const loginStyles = ({ insets, theme }: LoginStylesProps) => {
    return StyleSheet.create({
        backBtn: {
            left: 20,
            marginTop: 20,
            position: 'absolute',
        },
        description: {
            flex: 1,
            textAlign: 'center',
        },
        fitScreen: {
            flex: 1,
        },
        forgotPassword: {
            alignSelf: 'flex-end',
            textDecorationLine: 'underline',
        },
        form: {
            gap: 12,
            marginTop: 32,
        },
        formFields: {
            gap: 20,
        },
        loginBtn: {
            marginTop: 24,
        },
        mainTextContent: {
            flex: 1,
            gap: 8,
            marginTop: 70,
        },
        rootContainer: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
            ...Platform.select({
                web: {
                    alignSelf: 'center',
                    maxWidth: maxScreenWidth,
                    width: '100%',
                },
            }),
        },
        scrollView: {
            flex: 1,
        },
        scrollViewContent: {
            paddingHorizontal: theme.spacing.horizontalScreenPadding,
            position: 'relative',
        },
        title: {
            flex: 1,
            textAlign: 'center',
        },
    });
};
