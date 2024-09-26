import {
    Text,
    Button,
    PreviewDemo,
    PreviewDemoProps,
    useTheme,
    capitalizeFirstLetter,
    PreviewDemoOption,
} from '@boclar/booking-app-components';
import { LayoutChangeEvent, Platform, ScrollView, View } from 'react-native';
import { welcomeStyles } from '@/app/(no-auth)/(welcome)/welcome.styles';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const swiperItems: PreviewDemoOption[] = [
    {
        image: require('../../../assets/images/beauty-salon-demo.png'),
        label: 'Salón de belleza',
        value: 'XXX',
    },
    {
        image: require('../../../assets/images/beauty-salon-demo.png'),
        label: 'Ejemplo #2',
        value: 'XXX',
    },
    {
        image: require('../../../assets/images/beauty-salon-demo.png'),
        label: 'Ejemplo #3',
        value: 'XXX',
    },
    {
        image: require('../../../assets/images/beauty-salon-demo.png'),
        label: 'Ejemplo #4',
        value: 'XXX',
    },
];

const Welcome = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = welcomeStyles({ insets, theme });
    const [swiperContainerDimensions, setSwiperContainerDimensions] = useState({
        height: 0,
        width: 0,
    });
    const { t } = useTranslation();
    const originalSwiperImageDimensions = useMemo(
        () => ({
            height: 429,
            width: 211,
        }),
        []
    );

    const previewDemoProps: Partial<PreviewDemoProps> = {
        data: swiperItems,
        expandableProps: {
            scalingOptions: {
                // TODO: Update measurement tracking so that when window is resize the swiper is also resized
                maxScaleHeight: Platform.select({
                    android: '70%',
                    ios: '70%',
                    web: '80%',
                }),
            },
        },
        loop: false,
    };

    const handlePreviewDemoContainerLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const { height } = event.nativeEvent.layout;
            const newWidth =
                (originalSwiperImageDimensions.width * height) /
                originalSwiperImageDimensions.height;
            setSwiperContainerDimensions({
                height: Math.ceil(height),
                width: Math.ceil(newWidth),
            });
        },
        [originalSwiperImageDimensions]
    );


    const handleLogin = useCallback(() => {
        router.navigate('/login');
    }, []);

    return (
        // TODO: Add an scroll for all platforms, so content is visible on small screens or when resizing the window
        <>
            <View style={styles.mainContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    scrollEnabled={Platform.OS === 'web'}
                    testID={'scroll_view'}
                >
                    <View style={styles.headerContainer}>
                        <Text
                            color={'paragraph'}
                            fontFamily={'body.regular'}
                            fontSize={'body'}
                            style={styles.appDescription}
                            testID={'app_description'}
                        >
                            {t('onboarding.appIntroduction')}
                        </Text>
                    </View>

                    <View
                        onLayout={handlePreviewDemoContainerLayout}
                        style={styles.swiperContainer}
                        testID={'swiper_container'}
                    >
                        <>
                            {Platform.OS === 'android' ||
                            Platform.OS === 'ios' ? (
                                <>
                                    {swiperContainerDimensions.height &&
                                    swiperContainerDimensions.width ? (
                                        <PreviewDemo
                                            {...previewDemoProps}
                                            height={
                                                swiperContainerDimensions.height
                                            }
                                            testID={'preview_demo_mobile'}
                                            width={
                                                swiperContainerDimensions.width
                                            }
                                        />
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    {
                                        <PreviewDemo
                                            {...previewDemoProps}
                                            height={
                                                originalSwiperImageDimensions.height
                                            }
                                            testID={'preview_demo_web'}
                                            width={
                                                originalSwiperImageDimensions.width
                                            }
                                        />
                                    }
                                </>
                            )}
                        </>
                    </View>

                    <View style={styles.footerContainer}>
                        <Button
                            background={'ctaPrimary'}
                            rounded={'default'}
                            testID={'create_business_button'}
                            variant={'filled'}
                        >
                            <Text
                                color={'ctaPrimary'}
                                fontFamily={'body.regular'}
                                fontSize={'button'}
                                selectable={false}
                            >
                                {capitalizeFirstLetter(
                                    t('onboarding.createBusiness')
                                )}
                            </Text>
                        </Button>

                        <Button
                            background={'ctaOutlinedPrimary'}
                            // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                            onPress={handleLogin}
                            rounded={'default'}
                            testID={'login_button'}
                            variant={'outlined'}
                        >
                            <Text
                                color={'ctaOutlinedPrimary'}
                                fontFamily={'body.regular'}
                                fontSize={'button'}
                                selectable={false}
                            >
                                {capitalizeFirstLetter(t('common.login'))}
                            </Text>
                        </Button>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default Welcome;
