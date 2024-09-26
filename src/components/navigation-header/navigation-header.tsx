import { View } from 'react-native';
import { navigationHeaderStyles } from './navigation-header.styles';
import { Text, useTheme } from '@boclar/booking-app-components';
import { BackButton } from '@/components/back-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationHeaderProps } from './navigation-header.types';

/**
 * Header component for the navigation stack
 */
const NavigationHeader = ({
    backButtonVisible = true,
    backgroundColor,
    headerLeft,
    headerRight,
    onBackPress,
    testID,
    title,
}: NavigationHeaderProps) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = navigationHeaderStyles({
        backgroundColor,
        insets,
        theme,
    });

    return (
        <View
            style={styles.rootContainer}
            testID={testID}
        >
            <View style={styles.innerContainer}>
                <View style={styles.fitWidth}>
                    {backButtonVisible && (
                        <>
                            {headerLeft ? (
                                headerLeft
                            ) : (
                                <BackButton
                                    onPress={onBackPress}
                                    testID={`${testID}-back-btn`}
                                />
                            )}
                        </>
                    )}
                </View>

                <Text
                    allowFontScaling={false}
                    color={'screenHeaderTitle'}
                    fontFamily={'heading.bold'}
                    fontSize={'screenHeaderTitle'}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                <View style={styles.fitWidth}>
                    {backButtonVisible && (
                        <>{headerRight ? headerRight : null}</>
                    )}
                </View>
            </View>

            <View style={styles.bottomBorder} />
        </View>
    );
};

export { NavigationHeader };
