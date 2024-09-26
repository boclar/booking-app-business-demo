import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { TextProps } from '@boclar/booking-app-components';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { NavigationHeaderProps } from './navigation-header.types';

interface NavigationHeaderStylesProps {
    backgroundColor: NavigationHeaderProps['backgroundColor'];
    insets: EdgeInsets;
    theme: ThemeDesignTokens;
}

export const navigationHeaderStyles = ({
    backgroundColor,
    insets,
    theme,
}: NavigationHeaderStylesProps) => {
    return {
        headerTitle: {
            position: 'absolute',
        } as TextProps['style'],
        ...StyleSheet.create({
            bottomBorder: {
                backgroundColor: theme.color.border.topNavigation,
                height: 3,
                width: '100%',
            },
            fitWidth: {
                flex: 1,
            },
            innerContainer: {
                alignItems: 'center',
                flexDirection: 'row',
                padding: 18.5,
                paddingHorizontal: 20,
            },
            rootContainer: {
                backgroundColor:
                    backgroundColor || theme.color.background.screen,
                paddingTop: insets.top,
            },
        }),
    };
};
