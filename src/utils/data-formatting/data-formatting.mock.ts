/* eslint-disable sort-keys */
import {
    SubscriptionId,
    SubscriptionPlanFeatureStatus,
    SubscriptionResponse,
} from '@/types/business-api';
import { PaypalSubscription } from '@/types/paypal.types';

export const monthlyEssentialPaypalSubscription: PaypalSubscription = {
    id: 'P-1RD80591A82092240M3LHEJQ',
    version: 1,
    product_id: 'bookingappbusiness',
    name: 'essential_monthly',
    status: 'ACTIVE',
    description: 'Essential Monthly Plan',
    usage_type: 'LICENSED',
    billing_cycles: [
        {
            pricing_scheme: {
                version: 1,
                fixed_price: {
                    currency_code: 'USD',
                    value: '34.99',
                },
                create_time: '2024-09-03T02:19:18Z',
                update_time: '2024-09-03T02:19:18Z',
            },
            frequency: {
                interval_unit: 'MONTH',
                interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
        },
    ],
    payment_preferences: {
        service_type: 'PREPAID',
        auto_bill_outstanding: true,
        setup_fee: {
            currency_code: 'USD',
            value: '0.0',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 1,
    },
    quantity_supported: false,
    payee: {
        merchant_id: 'VFJVGGENRQRQE',
        display_data: {
            business_email: 'cs-sb-1gmyy32353871@business.example.com',
        },
    },
    create_time: '2024-09-03T02:19:18Z',
    update_time: '2024-09-04T01:13:37Z',
    links: [
        {
            href: 'https://api.sandbox.paypal.com/v1/billing/plans/P-1RD80591A82092240M3LHEJQ',
            rel: 'self',
            method: 'GET',
            encType: 'application/json',
        },
    ],
};

export const yearlyEssentialPaypalSubscription: PaypalSubscription = {
    id: 'P-4JR7974776967824HM3LHEZQ',
    version: 1,
    product_id: 'bookingappbusiness',
    name: 'essential_yearly',
    status: 'INACTIVE',
    description: 'Essential Yearly Plan',
    usage_type: 'LICENSED',
    billing_cycles: [
        {
            pricing_scheme: {
                version: 1,
                fixed_price: {
                    currency_code: 'USD',
                    value: '379.0',
                },
                create_time: '2024-09-03T02:20:22Z',
                update_time: '2024-09-03T02:20:22Z',
            },
            frequency: {
                interval_unit: 'YEAR',
                interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
        },
    ],
    payment_preferences: {
        service_type: 'PREPAID',
        auto_bill_outstanding: true,
        setup_fee: {
            currency_code: 'USD',
            value: '0.0',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 1,
    },
    quantity_supported: false,
    payee: {
        merchant_id: 'VFJVGGENRQRQE',
        display_data: {
            business_email: 'cs-sb-1gmyy32353871@business.example.com',
        },
    },
    create_time: '2024-09-03T02:20:22Z',
    update_time: '2024-09-04T01:13:19Z',
    links: [
        {
            href: 'https://api.sandbox.paypal.com/v1/billing/plans/P-4JR7974776967824HM3LHEZQ',
            rel: 'self',
            method: 'GET',
            encType: 'application/json',
        },
    ],
};

export const monthlyAllInOnePaypalSubscription: PaypalSubscription = {
    id: 'P-10L03858S3301502NM3LHFSQ',
    version: 1,
    product_id: 'bookingappbusiness',
    name: 'all_in_one_monthly',
    status: 'ACTIVE',
    description: 'All-in-one Monthly Plan',
    usage_type: 'LICENSED',
    billing_cycles: [
        {
            pricing_scheme: {
                version: 1,
                fixed_price: {
                    currency_code: 'USD',
                    value: '69.99',
                },
                create_time: '2024-09-03T02:22:02Z',
                update_time: '2024-09-03T02:22:02Z',
            },
            frequency: {
                interval_unit: 'MONTH',
                interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
        },
    ],
    payment_preferences: {
        service_type: 'PREPAID',
        auto_bill_outstanding: true,
        setup_fee: {
            currency_code: 'USD',
            value: '0.0',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 1,
    },
    quantity_supported: false,
    payee: {
        merchant_id: 'VFJVGGENRQRQE',
        display_data: {
            business_email: 'cs-sb-1gmyy32353871@business.example.com',
        },
    },
    create_time: '2024-09-03T02:22:02Z',
    update_time: '2024-09-06T04:07:09Z',
    links: [
        {
            href: 'https://api.sandbox.paypal.com/v1/billing/plans/P-10L03858S3301502NM3LHFSQ',
            rel: 'self',
            method: 'GET',
            encType: 'application/json',
        },
    ],
};

export const yearlyAllInOnePaypalSubscription: PaypalSubscription = {
    id: 'P-1VH27550DP090781TM3LHFFY',
    version: 1,
    product_id: 'bookingappbusiness',
    name: 'all_in_one_yearly',
    status: 'ACTIVE',
    description: 'All-in-one Yearly Plan',
    usage_type: 'LICENSED',
    billing_cycles: [
        {
            pricing_scheme: {
                version: 1,
                fixed_price: {
                    currency_code: 'USD',
                    value: '759.0',
                },
                create_time: '2024-09-03T02:21:11Z',
                update_time: '2024-09-03T02:21:11Z',
            },
            frequency: {
                interval_unit: 'YEAR',
                interval_count: 1,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
        },
    ],
    payment_preferences: {
        service_type: 'PREPAID',
        auto_bill_outstanding: true,
        setup_fee: {
            currency_code: 'USD',
            value: '0.0',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 1,
    },
    quantity_supported: false,
    payee: {
        merchant_id: 'VFJVGGENRQRQE',
        display_data: {
            business_email: 'cs-sb-1gmyy32353871@business.example.com',
        },
    },
    create_time: '2024-09-03T02:21:11Z',
    update_time: '2024-09-04T01:12:51Z',
    links: [
        {
            href: 'https://api.sandbox.paypal.com/v1/billing/plans/P-1VH27550DP090781TM3LHFFY',
            rel: 'self',
            method: 'GET',
            encType: 'application/json',
        },
    ],
};

export const subscriptionWithUnknownIntervalUnit: PaypalSubscription = {
    ...monthlyEssentialPaypalSubscription,
    billing_cycles: [
        {
            ...monthlyEssentialPaypalSubscription.billing_cycles[0],
            frequency: {
                interval_count: 1,
                interval_unit: 'UNKNOWN',
            },
        },
    ],
};

export const subscriptionsData: SubscriptionResponse[] = [
    {
        id: SubscriptionId.Essential,
        name: 'Essential',
        features: {
            appointments_reminders: SubscriptionPlanFeatureStatus.Limited,
            fidelity_program: SubscriptionPlanFeatureStatus.Upcoming,
            free_business_sign: SubscriptionPlanFeatureStatus.Enabled,
            integrated_chat: SubscriptionPlanFeatureStatus.Upcoming,
            integrated_shop: SubscriptionPlanFeatureStatus.Upcoming,
            immediate_access_to_new_features:
                SubscriptionPlanFeatureStatus.Enabled,
            is_mobile_app_available: SubscriptionPlanFeatureStatus.Disabled,
            multiple_locations: SubscriptionPlanFeatureStatus.Enabled,
            priority_support: SubscriptionPlanFeatureStatus.Limited,
            reports_and_analytics: SubscriptionPlanFeatureStatus.Enabled,
            theme_customization: SubscriptionPlanFeatureStatus.Limited,
            unlimited_appointments: SubscriptionPlanFeatureStatus.Enabled,
            unlimited_clients: SubscriptionPlanFeatureStatus.Enabled,
            website: SubscriptionPlanFeatureStatus.Enabled,
        },
        order: 2,
    },
    {
        id: SubscriptionId.AllInOne,
        name: 'All-In-One',
        features: {
            appointments_reminders: SubscriptionPlanFeatureStatus.Enabled,
            fidelity_program: SubscriptionPlanFeatureStatus.Upcoming,
            free_business_sign: SubscriptionPlanFeatureStatus.Enabled,
            integrated_chat: SubscriptionPlanFeatureStatus.Upcoming,
            integrated_shop: SubscriptionPlanFeatureStatus.Upcoming,
            immediate_access_to_new_features:
                SubscriptionPlanFeatureStatus.Enabled,
            is_mobile_app_available: SubscriptionPlanFeatureStatus.Enabled,
            multiple_locations: SubscriptionPlanFeatureStatus.Enabled,
            priority_support: SubscriptionPlanFeatureStatus.Enabled,
            reports_and_analytics: SubscriptionPlanFeatureStatus.Enabled,
            theme_customization: SubscriptionPlanFeatureStatus.Enabled,
            unlimited_appointments: SubscriptionPlanFeatureStatus.Enabled,
            unlimited_clients: SubscriptionPlanFeatureStatus.Enabled,
            website: SubscriptionPlanFeatureStatus.Enabled,
        },
        order: 1,
    },
];
