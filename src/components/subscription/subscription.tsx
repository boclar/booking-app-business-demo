import { ScrollView, View, Platform, ActivityIndicator } from 'react-native';
import { subscriptionStyles } from './subscription.styles';
import {
    SubscriptionCard,
    Switch,
    useAlert,
    useTheme,
} from '@boclar/booking-app-components';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import {
    getSubscriptionPlans,
    GetSubscriptionPlansResponse,
    initRevenueCat,
    makePackagePurchase,
} from '@/libs/revenue-cat/revenue-cat.libs';
import { PurchasesPackage } from '@revenuecat/purchases-typescript-internal';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { router } from 'expo-router';
import {
    SubscribePaymentProvider,
    useGetSubscriptionsQuery,
    useSubscribeMutation,
} from '@/types/business-api';
import { useSelector } from 'react-redux';
import { selectBusiness } from '@/redux/slices/user.slices';
import { useAuth } from '@/hooks/use-auth/use-auth.hooks';
import {
    getSubscriptionDetailsById,
    GetSubscriptionDetailsByIdResponse,
} from '@/utils/data-formatting/data-formatting';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubscriptionProps } from './subscription.types';
import { FormatMoney } from 'format-money-js';

export interface AvailableOffering {
    details: GetSubscriptionDetailsByIdResponse | undefined;
    offering: PurchasesPackage;
}

/**
 * Shows the subscription plans available for the user to subscribe to
 */
const Subscription = (props: SubscriptionProps) => {
    const { testID } = props;
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = subscriptionStyles({
        insets,
        theme,
    });
    const [isYearly, setIsYearly] = useState(false);
    const [offerings, setOfferings] = useState<GetSubscriptionPlansResponse>();
    const [isLoading, setIsLoading] = useState(true);
    const [availableOfferings, setAvailableOfferings] =
        useState<AvailableOffering[]>();
    const { t } = useTranslation();
    const [subscribe] = useSubscribeMutation();
    const business = useSelector(selectBusiness);
    const { fetchBusiness } = useAuth();
    const { data: subscriptionsData } = useGetSubscriptionsQuery();
    const { showAlert } = useAlert();
    const fm = new FormatMoney({
        decimals: 2,
    });

    const handleSubscriptionChange = useCallback((value: boolean) => {
        setIsYearly(value);
    }, []);

    const handleSubscribe = useCallback(
        async (pkg: PurchasesPackage) => {
            if (!business?.PK) {
                Sentry.captureMessage('Business PK not found');
                showAlert({
                    message: t('appCrash.businessNotFound'),
                    title: t('appCrash.title'),
                });

                return;
            }

            try {
                const result = await makePackagePurchase(pkg);
                setIsLoading(true);
                const subscribeResponse = await subscribe({
                    input: {
                        business_pk: business?.PK,
                        payment_data: JSON.stringify(result),
                        payment_provider: SubscribePaymentProvider.RevenueCat,
                    },
                });

                // Update business data after subscription so the user can access the app
                await fetchBusiness();

                if (subscribeResponse.error) {
                    console.error(
                        'Error purchasing package',
                        JSON.stringify(subscribeResponse.error)
                    );
                    Sentry.captureException(subscribeResponse.error);
                } else {
                    router.replace('/home');
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                if (error.userCancelled) return;
                console.error('Error purchasing package', error);
                Sentry.captureException(error);
            }

            setIsLoading(false);
        },
        [business, fetchBusiness, showAlert, subscribe, t]
    );

    useEffect(() => {
        if (offerings) {
            const offeringsArray = isYearly
                ? offerings?.yearly
                : offerings?.monthly;
            const formattedOfferings: AvailableOffering[] = offeringsArray.map(
                offering => {
                    return {
                        details: getSubscriptionDetailsById(
                            offering.product.identifier,
                            subscriptionsData?.subscriptions,
                            t
                        ),
                        offering,
                    };
                }
            );
            formattedOfferings.sort(
                (a, b) => b.offering.product.price - a.offering.product.price
            );
            formattedOfferings && setAvailableOfferings(formattedOfferings);
        }
    }, [isYearly, offerings, subscriptionsData, t]);

    useEffect(() => {
        const getSubscriptions = async () => {
            // RevenueCat is not available in Expo Go as it requires native modules
            if (
                !isRunningInExpoGo() &&
                (Platform.OS === 'android' || Platform.OS === 'ios')
            ) {
                initRevenueCat();
                try {
                    const subscriptionPlans = await getSubscriptionPlans();

                    setOfferings(subscriptionPlans);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error fetching offerings', error);
                    Sentry.captureException(error);
                }
            }
        };
        getSubscriptions();
    }, []);

    return (
        <>
            <View style={styles.wrapper}>
                <View style={styles.switchContainer}>
                    <Switch
                        labelActive={t('common.yearly')}
                        labelInactive={t('common.monthly')}
                        onChangeValue={handleSubscriptionChange}
                        testID={`${testID}-cycle-switch`}
                        tooltipText={t('subscriptionScreen.yearlyTooltip')}
                        tooltipVisible
                    />
                </View>
            </View>

            <View
                style={styles.contentContainer}
                testID={testID}
            >
                {isLoading ? (
                    <View
                        style={styles.loaderContainer}
                        testID="subscription-loader"
                    >
                        <ActivityIndicator
                            color={theme.color.background.spinner}
                            size={'small'}
                        />
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={
                            styles.scrollViewContentContainer
                        }
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        {availableOfferings &&
                            availableOfferings.map(plan => {
                                const introPrice =
                                    plan.offering.product.introPrice?.price;

                                const price = isYearly
                                    ? (introPrice ||
                                          plan.offering.product.price) / 12
                                    : introPrice || plan.offering.product.price;

                                const oldPrice =
                                    introPrice && plan.offering.product.price;

                                return (
                                    <SubscriptionCard
                                        billingCycleText={t(
                                            'subscriptionScreen.monthlyBillingCycle'
                                        )}
                                        currencyText={
                                            plan.offering.product.currencyCode
                                        }
                                        description={plan.details?.description}
                                        features={
                                            // eslint-disable-next-line react-perf/jsx-no-new-array-as-prop
                                            plan.details?.features || []
                                        }
                                        key={Math.random() * 1000}
                                        maxWidth={300}
                                        oldPrice={
                                            oldPrice &&
                                            (fm.from(oldPrice) as string)
                                        }
                                        // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                                        onPrimaryAction={() =>
                                            handleSubscribe(plan.offering)
                                        }
                                        price={fm.from(price) as string}
                                        primaryButtonLabel={t(
                                            'subscriptionScreen.subscribe'
                                        )}
                                        testID={`${testID}-${plan.offering.product.identifier}`}
                                        title={plan.offering.product.title}
                                    />
                                );
                            })}
                    </ScrollView>
                )}
            </View>
        </>
    );
};

export { Subscription };
