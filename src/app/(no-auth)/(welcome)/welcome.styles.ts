import { Platform, StyleSheet } from 'react-native';
import { maxScreenWidth } from '@/constants/app.constants';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { EdgeInsets } from 'react-native-safe-area-context';

const swiperContainerBg = 'transparent';

interface WelcomeStylesProps {
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const welcomeStyles = ({ insets, theme }: WelcomeStylesProps) => {
    return StyleSheet.create({
        appDescription: {
            lineHeight: 21,
            marginTop: 8,
            textAlign: 'center',
        },
        footerContainer: {
            alignSelf: 'center',
            gap: 12,
            marginTop: 32,
            maxWidth: maxScreenWidth,
            paddingBottom: 20,
            paddingHorizontal: theme.safeArea.left,
            width: '100%',
        },
        headerContainer: {
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            marginTop: 20,
            maxWidth: maxScreenWidth,
            paddingHorizontal: theme.safeArea.left,
            width: '100%',
        },
        logoContainer: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 2,
        },
        logoText: {
            textTransform: 'uppercase',
        },
        mainContainer: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
        },
        scrollView: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
        },
        swiper: {
            overflow: 'visible',
        },
        swiperContainer: {
            backgroundColor: swiperContainerBg,
            marginTop: 28,
            maxHeight: 500,
            minHeight: 150,
            overflow: 'visible',
            ...Platform.select({
                android: {
                    flexGrow: 1,
                },
                ios: {
                    flexGrow: 1,
                },
            }),
        },
    });
};
