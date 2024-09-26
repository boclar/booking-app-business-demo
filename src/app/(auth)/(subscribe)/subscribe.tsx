import { router, useFocusEffect } from 'expo-router';
import {
    PagerView,
    StepIndicator,
    useTheme,
} from '@boclar/booking-app-components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { NavigationHeader } from '@/components/navigation-header';
import { Dimensions, Platform, ScrollView, View } from 'react-native';
import { subscribeStyles } from './subscribe.styles';
import { createBusinessSteps } from '@/app/(no-auth)/(create-business)/create-business';
import { maxScreenWidth } from '@/constants/app.constants';
import { Subscription } from '@/components/subscription';
import { useSelector } from 'react-redux';
import { selectBusiness } from '@/redux/slices/user.slices';
import { SubscribeResponseStatus } from '@/types/business-api';

const Subscribe = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const styles = subscribeStyles({ insets, theme });
    const business = useSelector(selectBusiness);
    const isBusinessActive =
        business?.subscription?.status === SubscribeResponseStatus.Active;

    useFocusEffect(() => {
        // Redirect to home if business already has a subscription
        if (isBusinessActive) {
            router.replace('/home');
        }
    });

    if (isBusinessActive) return null;

    return (
        <View
            style={styles.rootContainer}
            testID={'subscribe-screen'}
        >
            <NavigationHeader
                backButtonVisible={false}
                testID="create-business-header"
                title={t('createBusinessScreen.title')}
            />

            <View style={styles.stepContainer}>
                <StepIndicator
                    currentStepIndex={2}
                    stepBorderColor={theme.color.background.screen}
                    steps={createBusinessSteps}
                />
            </View>

            <PagerView
                itemWidth={
                    Platform.OS === 'web'
                        ? maxScreenWidth
                        : Dimensions.get('window').width
                }
                scrollEnabled={false}
            >
                <ScrollView style={styles.page}>
                    <Subscription />
                </ScrollView>
            </PagerView>
        </View>
    );
};

export default Subscribe;
