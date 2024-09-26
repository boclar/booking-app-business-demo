import { maxScreenWidth } from '@/constants/app.constants';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { Platform, StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

export interface SubscribeStylesProps {
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const subscribeStyles = ({ theme }: SubscribeStylesProps) => {
    return StyleSheet.create({
        page: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
        },
        rootContainer: {
            backgroundColor: theme.color.background.screen,
            flex: 1,
            height: '100%',
            marginHorizontal: 'auto',
            ...Platform.select({
                web: {
                    maxWidth: maxScreenWidth,
                },
            }),
            width: '100%',
        },
        stepContainer: {
            marginHorizontal: theme.spacing.horizontalScreenPadding,
            marginTop: theme.spacing.horizontalScreenPadding,
        },
    });
};
