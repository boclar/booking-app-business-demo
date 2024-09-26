declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: undefined;

            EXPO_PUBLIC_DEEPL_API_KEY: string | undefined;
            EXPO_PUBLIC_GRAPHQL_API_KEY: string | undefined;
            EXPO_PUBLIC_GRAPHQL_API_URL: string | undefined;
            EXPO_PUBLIC_PAYPAL_CLIENT_ID: string | undefined;
            EXPO_PUBLIC_PAYPAL_SECRET_KEY: string | undefined;
            EXPO_PUBLIC_REVENUE_CAT_ANDROID_API_KEY: string | undefined;
            EXPO_PUBLIC_REVENUE_CAT_IOS_API_KEY: string | undefined;
            EXPO_PUBLIC_SANITY_PROJECT_ID: string | undefined;
            EXPO_PUBLIC_SENTRY_DSN: string | undefined;
            EXPO_PUBLIC_SENTRY_ENVIRONMENT: string | undefined;

            JEST_WORKER_ID: string | undefined;

            SENTRY_AUTH_TOKEN: string | undefined;
            SENTRY_ORG: string | undefined;
            SENTRY_PROJECT: string | undefined;
        }
    }
}

export {};
