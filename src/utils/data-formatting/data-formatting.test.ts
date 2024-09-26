import i18next from 'i18next';
import {
    formatPaypalSubscription,
    getSubscriptionDetailsById,
    GetSubscriptionDetailsByIdResponse,
} from './data-formatting';
import {
    monthlyAllInOnePaypalSubscription,
    monthlyEssentialPaypalSubscription,
    subscriptionsData,
    subscriptionWithUnknownIntervalUnit,
    yearlyAllInOnePaypalSubscription,
    yearlyEssentialPaypalSubscription,
} from './data-formatting.mock';
import '@/libs/i18n/i18n.libs';
import { SubscriptionId } from '@/types/business-api';

describe('Data Formatting Utils', () => {
    describe('formatPaypalSubscription', () => {
        it('should format monthly all-in-one paypal subscription', () => {
            const subscription = formatPaypalSubscription(
                monthlyAllInOnePaypalSubscription
            );
            expect(subscription).toEqual({
                currencyCode: 'USD',
                id: expect.any(String),
                interval: 'month',
                isActive: true,
                name: 'all_in_one_monthly',
                price: expect.any(Number),
            });
        });

        it('should format yearly all-in-one paypal subscription', () => {
            const subscription = formatPaypalSubscription(
                yearlyAllInOnePaypalSubscription
            );
            expect(subscription).toEqual({
                currencyCode: 'USD',
                id: expect.any(String),
                interval: 'year',
                isActive: true,
                name: 'all_in_one_yearly',
                price: expect.any(Number),
            });
        });

        it('should format monthly essential paypal subscription', () => {
            const subscription = formatPaypalSubscription(
                monthlyEssentialPaypalSubscription
            );
            expect(subscription).toEqual({
                currencyCode: 'USD',
                id: expect.any(String),
                interval: 'month',
                isActive: true,
                name: 'essential_monthly',
                price: expect.any(Number),
            });
        });

        it('should format yearly essential paypal subscription', () => {
            const subscription = formatPaypalSubscription(
                yearlyEssentialPaypalSubscription
            );
            expect(subscription).toEqual({
                currencyCode: 'USD',
                id: expect.any(String),
                interval: 'year',
                isActive: false,
                name: 'essential_yearly',
                price: expect.any(Number),
            });
        });

        it('should format paypal subscription with unknown interval unit', () => {
            const subscription = formatPaypalSubscription(
                subscriptionWithUnknownIntervalUnit
            );

            expect(subscription).toEqual(
                expect.objectContaining({
                    interval: 'other',
                })
            );
        });
    });

    describe('getSubscriptionDetailsById', () => {
        it('should return subscription details by id', () => {
            const subscription = getSubscriptionDetailsById(
                'essential_monthly',
                subscriptionsData,
                i18next.t
            );

            const subscriptionDetails = {
                id: SubscriptionId.Essential,
                name: 'Essential',
                description: expect.any(String),
                features: expect.any(Array),
                order: 2,
            } as GetSubscriptionDetailsByIdResponse;

            expect(subscription).toEqual(subscriptionDetails);
        });
    });
});
