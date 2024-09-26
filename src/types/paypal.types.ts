export interface PaypalGenerateAccessToken {
    access_token: string;
    app_id: string;
    expires_in: number;
    nonce: string;
    scope: string;
    token_type: string;
}

export interface PaypalSubscription {
    billing_cycles: PaypalBillingCycle[];
    create_time: string;
    description: string;
    id: string;
    links: PaypalLink[];
    name: string;
    payee: PaypalPayee;
    payment_preferences: PaypalPaymentPreference;
    product_id: string;
    quantity_supported: boolean;
    status: string;
    update_time: string;
    usage_type: string;
    version: number;
}

export interface PaypalBillingCycle {
    frequency: Frequency;
    pricing_scheme: PaypalPricingScheme;
    sequence: number;
    tenure_type: string;
    total_cycles: number;
}

export interface Frequency {
    interval_count: number;
    interval_unit: string;
}

export interface PaypalPricingScheme {
    create_time: string;
    fixed_price: PaypalFixedPrice;
    update_time: string;
    version: number;
}

export interface PaypalFixedPrice {
    currency_code: string;
    value: string;
}

export interface PaypalLink {
    encType: string;
    href: string;
    method: string;
    rel: string;
}

export interface PaypalPayee {
    display_data: PaypalPayeeDisplayData;
    merchant_id: string;
}

export interface PaypalPayeeDisplayData {
    business_email: string;
}

export interface PaypalPaymentPreference {
    auto_bill_outstanding: boolean;
    payment_failure_threshold: number;
    service_type: string;
    setup_fee: PaypalFixedPrice;
    setup_fee_failure_action: string;
}
