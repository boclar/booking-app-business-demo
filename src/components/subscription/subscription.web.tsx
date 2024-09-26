import {
    ScrollView,
    View,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SubscriptionProps } from './subscription.types';
import { subscriptionStyles } from './subscription.styles';
import {
    AlertDialog,
    SubscriptionCard,
    Switch,
    useTheme,
} from '@boclar/booking-app-components';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { getPaypalSubscriptions } from '@/libs/paypal/paypal.libs';
import {
    PayPalScriptProvider,
    ReactPayPalScriptOptions,
    PayPalButtons,
} from '@paypal/react-paypal-js';
import type {
    PayPalButtonCreateSubscription,
    PayPalButtonOnApprove,
} from '@paypal/paypal-js';
import { isProd } from '@/constants/app.constants';
import {
    formatPaypalSubscription,
    getSubscriptionDetailsById,
    GetSubscriptionDetailsByIdResponse,
} from '@/utils/data-formatting/data-formatting';
import {
    SubscribePaymentProvider,
    useGetSubscriptionsQuery,
    useSubscribeMutation,
} from '@/types/business-api';
import { useSelector } from 'react-redux';
import { selectBusiness } from '@/redux/slices/user.slices';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth/use-auth.hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface SubscriptionPlan {
    currencyCode: string;
    id: string;
    interval: 'month' | 'year' | 'other';
    intervalCount?: number;
    isActive: boolean;
    name: string;
    price: number;
}

export interface AvailableSubscription {
    details: GetSubscriptionDetailsByIdResponse | undefined;
    subscription: SubscriptionPlan;
}

export interface Subscriptions {
    monthly: SubscriptionPlan[];
    yearly: SubscriptionPlan[];
}

/**
 * Shows the subscription plans available for the user to subscribe to
 */
const Subscription = ({ ...props }: SubscriptionProps) => {
    const { testID } = props;
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = subscriptionStyles({
        insets,
        theme,
    });
    const [isYearly, setIsYearly] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [availableSubscriptions, setAvailableSubscriptions] =
        useState<AvailableSubscription[]>();
    const [subscriptions, setSubscriptions] = useState<Subscriptions>();
    const { t } = useTranslation();
    const [visiblePaymentModal, setVisiblePaymentModal] = useState(false);
    const [chosenSubscriptionPlan, setChosenSubscriptionPlan] =
        useState<AvailableSubscription>();
    const { data: subscriptionsData } = useGetSubscriptionsQuery();

    const handleSubscriptionChange = useCallback((value: boolean) => {
        setIsYearly(value);
    }, []);
    const business = useSelector(selectBusiness);
    const [subscribe] = useSubscribeMutation();
    const { fetchBusiness } = useAuth();

    const handleSubscribe = useCallback(async (plan: AvailableSubscription) => {
        setChosenSubscriptionPlan(plan);
        setVisiblePaymentModal(true);
    }, []);

    const handlePaymentMethodModalClose = useCallback(() => {
        setVisiblePaymentModal(false);
    }, []);

    const handlePaypalSubscription: PayPalButtonCreateSubscription =
        useCallback(
            async (data, actions) => {
                // TODO: Show error if business pk is not coming
                if (!business?.PK) {
                    const err =
                        'Business id not found while subscribing to a plan';
                    console.error(err);
                    Alert.alert(err);
                    Sentry.captureMessage(err);

                    return '';
                }

                try {
                    if (!chosenSubscriptionPlan) {
                        throw new Error('No subscription plan chosen');
                    }

                    const paypalSubscription =
                        await actions.subscription.create({
                            plan_id: chosenSubscriptionPlan?.subscription.id,
                        });

                    return paypalSubscription;
                } catch (error) {
                    console.error(
                        'Error creating PayPal subscription',
                        JSON.stringify(error)
                    );
                    Sentry.captureException(error);
                    throw error;
                }
            },
            [business, chosenSubscriptionPlan]
        );

    const handlePaypalSubscriptionApprove: PayPalButtonOnApprove = useCallback(
        async data => {
            // TODO: show error alert on subscription failure
            const paymentData = {
                facilitatorAccessToken: data.facilitatorAccessToken,
                orderID: data.orderID,
                subscriptionID: data.subscriptionID,
            };

            const { error } = await subscribe({
                input: {
                    business_pk: business!.PK,
                    payment_data: JSON.stringify(paymentData),
                    payment_provider: SubscribePaymentProvider.Paypal,
                },
            });

            await fetchBusiness();
            if (error) {
                console.error('Error subscribing', error);
                Alert.alert(
                    'Error subscribing. Please try again or contact support'
                );
                Sentry.captureException(error);
            } else {
                await fetchBusiness();
                router.replace('/home');
            }
        },
        [business, fetchBusiness, subscribe]
    );

    useEffect(() => {
        const getSubscriptions = async () => {
            try {
                const subscriptions = await getPaypalSubscriptions();

                const formattedSubscriptions =
                    subscriptions.plans.reduce<Subscriptions>(
                        (acc, sub) => {
                            const formattedSub = formatPaypalSubscription(sub);

                            if (formattedSub.interval === 'month') {
                                acc.monthly.push(formattedSub);
                            } else if (formattedSub.interval === 'year') {
                                acc.yearly.push(formattedSub);
                            }

                            return acc;
                        },
                        { monthly: [], yearly: [] }
                    );
                setSubscriptions(formattedSubscriptions);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching subscriptions');
                Sentry.captureException(error);
            }
        };
        getSubscriptions();
    }, []);

    useEffect(() => {
        if (subscriptions) {
            const subscriptionsArray = isYearly
                ? subscriptions.yearly
                : subscriptions.monthly;
            const formattedSubscriptions: AvailableSubscription[] =
                subscriptionsArray.map(subscription => {
                    return {
                        details: getSubscriptionDetailsById(
                            subscription.name,
                            subscriptionsData?.subscriptions,
                            t
                        ),
                        subscription,
                    };
                });
            formattedSubscriptions.sort((a, b) => {
                return b.subscription.price - a.subscription.price;
            });
            formattedSubscriptions &&
                setAvailableSubscriptions(
                    formattedSubscriptions.filter(
                        item => item.subscription.isActive
                    )
                );
        }
    }, [isYearly, subscriptions, subscriptionsData, t]);

    return (
        <>
            <AlertDialog
                acceptText=""
                cancelText={t('common.cancel')}
                description={t('subscriptionScreen.subscriptionPlanChosen', {
                    plan: chosenSubscriptionPlan?.details?.name,
                })}
                isVisible={visiblePaymentModal}
                onBackdropPress={handlePaymentMethodModalClose}
                onDismiss={handlePaymentMethodModalClose}
                title={t('common.choosePaymentMethod')}
                type="custom"
                visiblePrimaryButton={false}
            >
                <PayPalButtons
                    createSubscription={handlePaypalSubscription}
                    onApprove={handlePaypalSubscriptionApprove}
                />
            </AlertDialog>

            <ScrollView
                contentContainerStyle={styles.rootScrollViewContentContainer}
                style={styles.rootContainer}
                testID={testID}
            >
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

                <View style={styles.contentContainer}>
                    <>
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
                                showsHorizontalScrollIndicator={
                                    Platform.OS === 'web'
                                }
                                style={styles.scrollView}
                            >
                                {availableSubscriptions &&
                                    availableSubscriptions.map(
                                        (plan, index) => (
                                            <SubscriptionCard
                                                billingCycleText={t(
                                                    'subscriptionScreen.monthlyBillingCycle'
                                                )}
                                                currencyText={
                                                    plan.subscription
                                                        .currencyCode
                                                }
                                                description={
                                                    plan.details?.description
                                                }
                                                features={
                                                    // eslint-disable-next-line react-perf/jsx-no-new-array-as-prop
                                                    plan.details?.features || []
                                                }
                                                key={Math.random() * 1000}
                                                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                                                onPrimaryAction={() =>
                                                    handleSubscribe(plan)
                                                }
                                                price={new Intl.NumberFormat(
                                                    'en-US',
                                                    {
                                                        maximumFractionDigits: 2,
                                                    }
                                                ).format(
                                                    isYearly
                                                        ? plan.subscription
                                                              .price / 12
                                                        : plan.subscription
                                                              .price
                                                )}
                                                primaryButtonLabel={t(
                                                    'subscriptionScreen.subscribe'
                                                )}
                                                testID={`${testID}-card-${index}`}
                                                title={
                                                    plan.details?.name ||
                                                    plan.subscription.name
                                                }
                                            />
                                        )
                                    )}
                            </ScrollView>
                        )}
                    </>
                </View>
            </ScrollView>
        </>
    );
};

export const SubscriptionWrapper = (props: SubscriptionProps) => {
    const paypalScriptOptions: ReactPayPalScriptOptions = useMemo(
        () => ({
            clientId: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID!,
            components: 'buttons',
            currency: 'USD',
            environment: isProd() ? 'production' : 'sandbox',
            intent: 'subscription',
            vault: true,
        }),
        []
    );

    return (
        <PayPalScriptProvider options={paypalScriptOptions}>
            <Subscription {...props} />
        </PayPalScriptProvider>
    );
};

export { SubscriptionWrapper as Subscription };
