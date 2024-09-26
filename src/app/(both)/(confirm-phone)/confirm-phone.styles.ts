import { maxScreenWidth } from '@/constants/app.constants';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

interface ConfirmPhoneStylesProps {
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const confirmPhoneStyles = ({
    insets,
    theme,
}: ConfirmPhoneStylesProps) => {
    return StyleSheet.create({
        confirmBtn: {
            marginTop: 32,
        },
        confirmationCodeInput: {
            alignSelf: 'center',
            marginTop: 32,
            width: '100%',
        },
        description: {
            textAlign: 'center',
        },
        resendCode: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 32,
        },
        resendCodeText: {
            textDecorationLine: 'underline',
        },
        rootContainer: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: insets.top,
            ...Platform.select({
                web: {
                    marginHorizontal: 'auto',
                    maxWidth: maxScreenWidth,
                    width: '100%',
                },
            }),
        },
        skipText: {
            position: 'absolute',
            right: 20,
            top: 20,
            zIndex: 1,
        },
        textContainer: {
            alignSelf: 'center',
            gap: 8,
            maxWidth: 400,
        },
        title: {
            marginTop: 70,
            textAlign: 'center',
        },
    });
};