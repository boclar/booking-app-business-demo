import { PurchasesOfferings } from 'react-native-purchases';

export const revenueCatOfferings = {
    current: {
        serverDescription: 'Essential Offering',
        monthly: {
            product: {
                productCategory: 'SUBSCRIPTION',
                discounts: [
                    {
                        price: 29.99,
                        cycles: 12,
                        periodNumberOfUnits: 1,
                        priceString: '$29.99',
                        period: 'P1M',
                        periodUnit: 'MONTH',
                        identifier: 'test',
                    },
                ],
                price: 34.989999999999995,
                pricePerMonthString: '$34.99',
                title: 'Essential',
                pricePerYear: 419.88,
                pricePerWeek: 8.05,
                introPrice: {
                    periodUnit: 'MONTH',
                    price: 29.99,
                    periodNumberOfUnits: 1,
                    period: 'P1M',
                    priceString: '$29.99',
                    cycles: 12,
                },
                currencyCode: 'USD',
                priceString: '$34.99',
                pricePerMonth: 34.989999999999995,
                pricePerWeekString: '$8.05',
                subscriptionPeriod: 'P1M',
                identifier: 'essential_monthly',
                productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                pricePerYearString: '$419.88',
                description: 'Essential Monthly',
            },
            packageType: 'MONTHLY',
            offeringIdentifier: 'essential_offering',
            presentedOfferingContext: {
                placementIdentifier: null,
                targetingContext: null,
                offeringIdentifier: 'essential_offering',
            },
            identifier: '$rc_monthly',
        },
        metadata: {},
        annual: {
            identifier: '$rc_annual',
            presentedOfferingContext: {
                placementIdentifier: null,
                offeringIdentifier: 'essential_offering',
                targetingContext: null,
            },
            packageType: 'ANNUAL',
            offeringIdentifier: 'essential_offering',
            product: {
                price: 379,
                identifier: 'essential_yearly',
                subscriptionPeriod: 'P1Y',
                pricePerWeekString: '$7.26',
                currencyCode: 'USD',
                introPrice: null,
                pricePerWeek: 7.26,
                pricePerYear: 379,
                productCategory: 'SUBSCRIPTION',
                pricePerMonth: 31.580000000000002,
                priceString: '$379.00',
                description: 'Essential Yearly',
                pricePerYearString: '$379.00',
                pricePerMonthString: '$31.58',
                title: 'Essential',
                discounts: [],
                productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
            },
        },
        identifier: 'essential_offering',
        availablePackages: [
            {
                product: {
                    identifier: 'essential_monthly',
                    price: 34.989999999999995,
                    discounts: [
                        {
                            identifier: 'test',
                            periodUnit: 'MONTH',
                            cycles: 12,
                            period: 'P1M',
                            priceString: '$29.99',
                            periodNumberOfUnits: 1,
                            price: 29.99,
                        },
                    ],
                    productCategory: 'SUBSCRIPTION',
                    pricePerWeekString: '$8.05',
                    subscriptionPeriod: 'P1M',
                    pricePerMonth: 34.989999999999995,
                    priceString: '$34.99',
                    title: 'Essential',
                    pricePerMonthString: '$34.99',
                    productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                    description: 'Essential Monthly',
                    pricePerYearString: '$419.88',
                    currencyCode: 'USD',
                    pricePerWeek: 8.05,
                    introPrice: {
                        price: 29.99,
                        period: 'P1M',
                        priceString: '$29.99',
                        periodNumberOfUnits: 1,
                        periodUnit: 'MONTH',
                        cycles: 12,
                    },
                    pricePerYear: 419.88,
                },
                offeringIdentifier: 'essential_offering',
                packageType: 'MONTHLY',
                presentedOfferingContext: {
                    placementIdentifier: null,
                    targetingContext: null,
                    offeringIdentifier: 'essential_offering',
                },
                identifier: '$rc_monthly',
            },
            {
                product: {
                    productCategory: 'SUBSCRIPTION',
                    identifier: 'essential_yearly',
                    price: 379,
                    pricePerWeekString: '$7.26',
                    subscriptionPeriod: 'P1Y',
                    introPrice: null,
                    pricePerWeek: 7.26,
                    currencyCode: 'USD',
                    pricePerYear: 379,
                    pricePerMonthString: '$31.58',
                    title: 'Essential',
                    description: 'Essential Yearly',
                    pricePerYearString: '$379.00',
                    pricePerMonth: 31.580000000000002,
                    priceString: '$379.00',
                    productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                    discounts: [],
                },
                offeringIdentifier: 'essential_offering',
                presentedOfferingContext: {
                    placementIdentifier: null,
                    offeringIdentifier: 'essential_offering',
                    targetingContext: null,
                },
                identifier: '$rc_annual',
                packageType: 'ANNUAL',
            },
        ],
    },
    all: {
        essential_offering: {
            metadata: {},
            monthly: {
                packageType: 'MONTHLY',
                presentedOfferingContext: {
                    offeringIdentifier: 'essential_offering',
                    targetingContext: null,
                    placementIdentifier: null,
                },
                identifier: '$rc_monthly',
                offeringIdentifier: 'essential_offering',
                product: {
                    price: 34.989999999999995,
                    productCategory: 'SUBSCRIPTION',
                    discounts: [
                        {
                            cycles: 12,
                            periodUnit: 'MONTH',
                            identifier: 'test',
                            price: 29.99,
                            periodNumberOfUnits: 1,
                            priceString: '$29.99',
                            period: 'P1M',
                        },
                    ],
                    productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                    identifier: 'essential_monthly',
                    pricePerWeekString: '$8.05',
                    subscriptionPeriod: 'P1M',
                    currencyCode: 'USD',
                    introPrice: {
                        cycles: 12,
                        period: 'P1M',
                        priceString: '$29.99',
                        periodNumberOfUnits: 1,
                        periodUnit: 'MONTH',
                        price: 29.99,
                    },
                    pricePerWeek: 8.05,
                    priceString: '$34.99',
                    pricePerMonth: 34.989999999999995,
                    title: 'Essential',
                    pricePerMonthString: '$34.99',
                    description: 'Essential Monthly',
                    pricePerYearString: '$419.88',
                    pricePerYear: 419.88,
                },
            },
            serverDescription: 'Essential Offering',
            identifier: 'essential_offering',
            availablePackages: [
                {
                    offeringIdentifier: 'essential_offering',
                    packageType: 'MONTHLY',
                    product: {
                        productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                        title: 'Essential',
                        pricePerMonthString: '$34.99',
                        pricePerYearString: '$419.88',
                        description: 'Essential Monthly',
                        pricePerYear: 419.88,
                        introPrice: {
                            price: 29.99,
                            periodUnit: 'MONTH',
                            periodNumberOfUnits: 1,
                            priceString: '$29.99',
                            period: 'P1M',
                            cycles: 12,
                        },
                        pricePerWeek: 8.05,
                        currencyCode: 'USD',
                        identifier: 'essential_monthly',
                        priceString: '$34.99',
                        pricePerMonth: 34.989999999999995,
                        productCategory: 'SUBSCRIPTION',
                        discounts: [
                            {
                                price: 29.99,
                                periodUnit: 'MONTH',
                                identifier: 'test',
                                cycles: 12,
                                periodNumberOfUnits: 1,
                                priceString: '$29.99',
                                period: 'P1M',
                            },
                        ],
                        pricePerWeekString: '$8.05',
                        subscriptionPeriod: 'P1M',
                        price: 34.989999999999995,
                    },
                    identifier: '$rc_monthly',
                    presentedOfferingContext: {
                        placementIdentifier: null,
                        targetingContext: null,
                        offeringIdentifier: 'essential_offering',
                    },
                },
                {
                    packageType: 'ANNUAL',
                    offeringIdentifier: 'essential_offering',
                    presentedOfferingContext: {
                        offeringIdentifier: 'essential_offering',
                        targetingContext: null,
                        placementIdentifier: null,
                    },
                    identifier: '$rc_annual',
                    product: {
                        identifier: 'essential_yearly',
                        title: 'Essential',
                        pricePerMonthString: '$31.58',
                        pricePerYearString: '$379.00',
                        description: 'Essential Yearly',
                        currencyCode: 'USD',
                        introPrice: null,
                        pricePerWeek: 7.26,
                        pricePerYear: 379,
                        productCategory: 'SUBSCRIPTION',
                        subscriptionPeriod: 'P1Y',
                        pricePerWeekString: '$7.26',
                        pricePerMonth: 31.580000000000002,
                        priceString: '$379.00',
                        productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                        price: 379,
                        discounts: [],
                    },
                },
            ],
            annual: {
                identifier: '$rc_annual',
                presentedOfferingContext: {
                    placementIdentifier: null,
                    offeringIdentifier: 'essential_offering',
                    targetingContext: null,
                },
                product: {
                    price: 379,
                    productCategory: 'SUBSCRIPTION',
                    pricePerMonthString: '$31.58',
                    title: 'Essential',
                    description: 'Essential Yearly',
                    pricePerYearString: '$379.00',
                    pricePerWeekString: '$7.26',
                    subscriptionPeriod: 'P1Y',
                    pricePerYear: 379,
                    pricePerWeek: 7.26,
                    introPrice: null,
                    currencyCode: 'USD',
                    priceString: '$379.00',
                    pricePerMonth: 31.580000000000002,
                    identifier: 'essential_yearly',
                    discounts: [],
                    productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                },
                offeringIdentifier: 'essential_offering',
                packageType: 'ANNUAL',
            },
        },
        all_in_one_offering: {
            identifier: 'all_in_one_offering',
            availablePackages: [
                {
                    product: {
                        price: 69.99,
                        productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                        identifier: 'all_in_one_monthly',
                        pricePerWeekString: '$16.10',
                        subscriptionPeriod: 'P1M',
                        introPrice: null,
                        pricePerWeek: 16.1,
                        currencyCode: 'USD',
                        pricePerYear: 839.8799999999999,
                        pricePerYearString: '$839.88',
                        description: 'All-in-one Monthly',
                        priceString: '$69.99',
                        pricePerMonth: 69.99,
                        title: 'All-in-one',
                        pricePerMonthString: '$69.99',
                        discounts: [],
                        productCategory: 'SUBSCRIPTION',
                    },
                    packageType: 'MONTHLY',
                    offeringIdentifier: 'all_in_one_offering',
                    presentedOfferingContext: {
                        offeringIdentifier: 'all_in_one_offering',
                        targetingContext: null,
                        placementIdentifier: null,
                    },
                    identifier: '$rc_monthly',
                },
                {
                    offeringIdentifier: 'all_in_one_offering',
                    product: {
                        pricePerYearString: '$759.00',
                        description: 'All-in-one Yearly',
                        pricePerMonthString: '$63.25',
                        title: 'All-in-one',
                        productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                        discounts: [],
                        productCategory: 'SUBSCRIPTION',
                        subscriptionPeriod: 'P1Y',
                        pricePerWeekString: '$14.55',
                        pricePerYear: 759,
                        currencyCode: 'USD',
                        pricePerWeek: 14.55,
                        introPrice: null,
                        identifier: 'all_in_one_yearly',
                        priceString: '$759.00',
                        pricePerMonth: 63.25,
                        price: 759,
                    },
                    presentedOfferingContext: {
                        placementIdentifier: null,
                        offeringIdentifier: 'all_in_one_offering',
                        targetingContext: null,
                    },
                    identifier: '$rc_annual',
                    packageType: 'ANNUAL',
                },
            ],
            serverDescription: 'All-in-one Offering',
            monthly: {
                offeringIdentifier: 'all_in_one_offering',
                product: {
                    discounts: [],
                    pricePerWeekString: '$16.10',
                    subscriptionPeriod: 'P1M',
                    pricePerYear: 839.8799999999999,
                    productCategory: 'SUBSCRIPTION',
                    pricePerYearString: '$839.88',
                    description: 'All-in-one Monthly',
                    title: 'All-in-one',
                    pricePerMonthString: '$69.99',
                    priceString: '$69.99',
                    pricePerMonth: 69.99,
                    identifier: 'all_in_one_monthly',
                    pricePerWeek: 16.1,
                    introPrice: null,
                    currencyCode: 'USD',
                    price: 69.99,
                    productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                },
                presentedOfferingContext: {
                    targetingContext: null,
                    offeringIdentifier: 'all_in_one_offering',
                    placementIdentifier: null,
                },
                identifier: '$rc_monthly',
                packageType: 'MONTHLY',
            },
            metadata: {},
            annual: {
                identifier: '$rc_annual',
                presentedOfferingContext: {
                    placementIdentifier: null,
                    offeringIdentifier: 'all_in_one_offering',
                    targetingContext: null,
                },
                offeringIdentifier: 'all_in_one_offering',
                packageType: 'ANNUAL',
                product: {
                    title: 'All-in-one',
                    pricePerMonthString: '$63.25',
                    description: 'All-in-one Yearly',
                    pricePerYearString: '$759.00',
                    productType: 'AUTO_RENEWABLE_SUBSCRIPTION',
                    discounts: [],
                    subscriptionPeriod: 'P1Y',
                    pricePerWeekString: '$14.55',
                    currencyCode: 'USD',
                    introPrice: null,
                    pricePerWeek: 14.55,
                    pricePerYear: 759,
                    identifier: 'all_in_one_yearly',
                    pricePerMonth: 63.25,
                    priceString: '$759.00',
                    productCategory: 'SUBSCRIPTION',
                    price: 759,
                },
            },
        },
    },
} as unknown as PurchasesOfferings;
