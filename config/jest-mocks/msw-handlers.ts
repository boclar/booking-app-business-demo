import { graphql, HttpResponse, http } from 'msw';
import {
    mswBusiness,
    mswSubscriptions,
    mswSubscribe,
    mswPaypalSubscriptionPlans,
    mswPaypalAuthentication,
    mswBusinessTypes,
    mswCountries,
    mswTimezones,
    mswThemeStyles,
    mswCreateBusiness,
} from './msw-data';
import { paypalBaseURL } from '@/libs/paypal/paypal.libs';

export const handlers = [
    graphql.mutation('CreateBusiness', params => {
        return HttpResponse.json({
            data: {
                createBusiness: mswCreateBusiness,
            },
        });
    }),
    graphql.query('GetBusiness', params => {
        return HttpResponse.json({
            data: {
                business: mswBusiness,
            },
        });
    }),
    graphql.query('GetBusinessTypes', params => {
        return HttpResponse.json({
            data: {
                businessTypes: mswBusinessTypes,
            },
        });
    }),
    graphql.query('GetCountries', params => {
        return HttpResponse.json({
            data: {
                countries: mswCountries,
            },
        });
    }),
    graphql.query('GetSubscriptions', params => {
        return HttpResponse.json({
            data: {
                subscriptions: mswSubscriptions,
            },
        });
    }),
    graphql.query('GetThemeStyles', params => {
        return HttpResponse.json({
            data: {
                themeStyles: mswThemeStyles,
            },
        });
    }),
    graphql.query('GetTimezones', params => {
        return HttpResponse.json({
            data: {
                timezones: mswTimezones,
            },
        });
    }),
    graphql.mutation('Subscribe', params => {
        return HttpResponse.json({
            data: {
                subscribe: mswSubscribe,
            },
        });
    }),
    http.post(`${paypalBaseURL}/oauth2/token`, ({ request }) => {
        return HttpResponse.json(mswPaypalAuthentication);
    }),

    http.get(
        `${paypalBaseURL}/billing/plans`,
        ({ request }) => {
            return HttpResponse.json(mswPaypalSubscriptionPlans);
        }
    ),
];
