import { SubscriptionPlan } from '@/components/subscription/subscription.web';
import { PaypalSubscription } from '@/types/paypal.types';
import {
    SubscriptionPlanFeatureStatus,
    SubscriptionResponse,
} from '../../types/business-api';
import { TFunction } from 'i18next';
import { FeedbackTextProps } from '@boclar/booking-app-components';

/**
 * Get the readable format of a Paypal subscription
 */
export const formatPaypalSubscription = (
    subscription: PaypalSubscription
): SubscriptionPlan => {
    const { name } = subscription;

    const price =
        subscription.billing_cycles[0].pricing_scheme.fixed_price.value;

    const intervalCount =
        subscription.billing_cycles[0].frequency.interval_count;
    const intervalUnit = subscription.billing_cycles[0].frequency.interval_unit;
    const interval =
        intervalUnit === 'MONTH' && intervalCount === 1
            ? 'month'
            : intervalUnit === 'YEAR' && intervalCount === 1
              ? 'year'
              : 'other';

    const currencyCode =
        subscription.billing_cycles[0].pricing_scheme.fixed_price.currency_code;

    return {
        currencyCode,
        id: subscription.id,
        interval,
        isActive: subscription.status === 'ACTIVE',
        name: name,
        price: Number(price),
    };
};

export type GetSubscriptionDetailsByIdResponse = Omit<
    SubscriptionResponse,
    'features'
> & {
    description?: string;
    features: FeedbackTextProps[];
};

export const getSubscriptionDetailsById = (
    id: string,
    subscriptions: SubscriptionResponse[] | undefined,
    t: TFunction<'translation', undefined>
): GetSubscriptionDetailsByIdResponse => {
    let subscription: Omit<GetSubscriptionDetailsByIdResponse, 'description'> =
        {
            features: [],
        } as unknown as GetSubscriptionDetailsByIdResponse;

    const formatSubscriptionFeature = (
        key: string,
        value: SubscriptionPlanFeatureStatus
    ): FeedbackTextProps => {
        let status: FeedbackTextProps['variant'];

        switch (value) {
            case SubscriptionPlanFeatureStatus['Enabled']:
                status = 'success';
                break;
            case SubscriptionPlanFeatureStatus['Disabled']:
                status = 'danger';
                break;
            case SubscriptionPlanFeatureStatus['Limited']:
                status = 'warning';
                break;
            case SubscriptionPlanFeatureStatus['Upcoming']:
                status = 'warning';
                break;
        }

        const isDotNotationWithNoSpacesRegex = /^\w+(\.\w+)*$/;
        const feedbackText = t(`subscriptionScreen.features.${key}` as never);

        return {
            text: t(
                `subscriptionScreen.features.${key}_${value.toLocaleLowerCase()}` as never,
                {
                    defaultValue: isDotNotationWithNoSpacesRegex.test(
                        feedbackText
                    )
                        ? ''
                        : feedbackText,
                }
            ),
            variant: status,
        };
    };

    // Count disabled and warning features in a subscription plan
    const countDisabledAndWarningFeatures = (
        features: Record<string, SubscriptionPlanFeatureStatus>
    ) => {
        return Object.values(features).reduce(
            (acc, value) => {
                if (value === SubscriptionPlanFeatureStatus['Disabled']) {
                    acc.disabledCount++;
                } else if (
                    value === SubscriptionPlanFeatureStatus['Limited'] ||
                    value === SubscriptionPlanFeatureStatus['Upcoming']
                ) {
                    acc.warningCount++;
                }

                return acc;
            },
            { disabledCount: 0, warningCount: 0 }
        );
    };

    // Find the subscription with the most disabled and warning features
    const subscriptionWithMostDisabledAndWarnings = subscriptions?.reduce(
        (prev, current) => {
            const prevCount = countDisabledAndWarningFeatures(prev.features);
            const currentCount = countDisabledAndWarningFeatures(
                current.features
            );

            if (
                currentCount.disabledCount > prevCount.disabledCount ||
                (currentCount.disabledCount === prevCount.disabledCount &&
                    currentCount.warningCount > prevCount.warningCount)
            ) {
                return current;
            }

            return prev;
        },
        subscriptions?.[0]
    );

    // Create an array of feature keys based on the subscription with the most disabled and warnings
    const referenceFeatureOrder = Object.entries(
        subscriptionWithMostDisabledAndWarnings?.features || {}
    )
        .sort(([, statusA], [, statusB]) => {
            const order = {
                [SubscriptionPlanFeatureStatus['Disabled']]: 0,
                [SubscriptionPlanFeatureStatus['Limited']]: 1,
                [SubscriptionPlanFeatureStatus['Enabled']]: 2,
                [SubscriptionPlanFeatureStatus['Upcoming']]: 3,
            };

            return order[statusA] - order[statusB];
        })
        .map(([key]) => key); // Extract just the feature keys

    // Sort based on the reference feature order
    const sortByReferenceFeatureOrder = (
        featureA: [string, SubscriptionPlanFeatureStatus],
        featureB: [string, SubscriptionPlanFeatureStatus]
    ) => {
        const indexA = referenceFeatureOrder.indexOf(featureA[0]);
        const indexB = referenceFeatureOrder.indexOf(featureB[0]);

        // If both features exist in the reference array, sort by their order in the reference
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        // If one of the features does not exist in the reference, fallback to the default order
        const order = {
            [SubscriptionPlanFeatureStatus['Disabled']]: 0,
            [SubscriptionPlanFeatureStatus['Limited']]: 1,
            [SubscriptionPlanFeatureStatus['Enabled']]: 2,
            [SubscriptionPlanFeatureStatus['Upcoming']]: 3,
        };

        return order[featureA[1]] - order[featureB[1]];
    };

    subscriptions?.forEach(item => {
        const subscriptionId = item.id.toLocaleLowerCase();
        if (id.toLocaleLowerCase().startsWith(subscriptionId)) {
            const feedbackTexts: FeedbackTextProps[] = Object.entries(
                item.features
            )
                .sort(sortByReferenceFeatureOrder) // Sort by the reference feature order
                .map(([key, value]) => formatSubscriptionFeature(key, value));

            subscription = {
                ...item,
                features: feedbackTexts.filter(item => item.text !== ''),
            };
        }
    });

    return {
        ...subscription,
        description: t(
            `subscriptionScreen.descriptions.${subscription.name?.toLocaleLowerCase()}` as never,
            {
                defaultValue: '',
            }
        ),
    };
};
