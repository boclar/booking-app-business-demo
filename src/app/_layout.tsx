import {
    useNavigationContainerRef,
    usePathname,
    withLayoutContext,
    useFocusEffect,
} from 'expo-router';
import { AlertDialog, useAlert } from '@boclar/booking-app-components';
import { CustomGestureDetector } from '@/components/custom-gesture-detector';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectIsBusinessOwnerEmailVerified } from '@/redux/slices/userProgress.slices';
import { useTranslation } from 'react-i18next';
import { isDev } from '@/constants/app.constants';
import {
    createStackNavigator,
    StackNavigationEventMap,
    StackNavigationOptions,
    TransitionPresets,
} from '@react-navigation/stack';
import { ParamListBase, StackNavigationState } from '@react-navigation/native';
import { Dimensions, Platform } from 'react-native';
import { PortalHost } from '@gorhom/portal';
import { GlobalContext } from '@/components/global-context';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';
import i18n from 'i18next';
import { i18nResources } from '@/libs/i18n/i18n.libs';

if (!i18n.hasLoadedNamespace('translation')) {
    const resourcesEntires = Object.entries(i18nResources);
    resourcesEntires.forEach(([lng, resources]) => {
        i18n.addResources(lng, 'translation', resources.createBusinessScreen);
    });
}

const { Navigator } = createStackNavigator();

// This can be used like `<JsStack />`
export const JsStack = withLayoutContext<
    StackNavigationOptions,
    typeof Navigator,
    StackNavigationState<ParamListBase>,
    StackNavigationEventMap
>(Navigator);


const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

let initialPathname: string;

Sentry.init({
    _experiments: {
        /*
         * profilesSampleRate is relative to tracesSampleRate.
         * Here, we'll capture profiles for 100% of transactions.
         */
        profilesSampleRate: 1.0,
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.2,
    },
    attachScreenshot: true,
    attachStacktrace: true,
    attachViewHierarchy: true,
    debug: isDev(),
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableAutoPerformanceTracing: true,
    enabled: !isDev(),
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT,
    integrations: [
        new Sentry.ReactNativeTracing({
            enableAppStartTracking: true,
            enableHTTPTimings: true,
            enableNativeFramesTracking: !isDev(),
            enableUserInteractionTracing: true,
            routingInstrumentation,
        }),
        /*
         * Sentry.mobileReplayIntegration({
         *     maskAllImages: true,
         *     maskAllText: true,
         * }),
         */
    ],
    tracesSampleRate: 1.0,
});

export const LayoutContent = () => {
    const ref = useNavigationContainerRef();
    const isBusinessOwnerEmailVerified = useSelector(
        selectIsBusinessOwnerEmailVerified
    );
    const { t } = useTranslation();
    const { height: windowHeight } = Dimensions.get('window');
    // Avoid using useStates here as it will cause a flicker on the screen, or the screen will not be shown at all due to the several re-renders.
    const pathname = usePathname();
    !initialPathname && (initialPathname = pathname);
    const { alertInfo, clearAlert } = useAlert();

    const stackScreenOptions = useMemo<StackNavigationOptions>(
        () => ({
            // Should not animate if the initial pathname is the same as the current pathname
            animationEnabled: initialPathname !== pathname,

            // Fix scroll not working on web
            cardStyle: {
                flex: 1,
            },
            // Fixes the issue with the header being hidden behind the status bar on Android
            headerShown: false,
        }),
        [pathname]
    );

    const screenWithModalPresentation: StackNavigationOptions = useMemo(
        () => ({
            ...TransitionPresets.ModalSlideFromBottomIOS,
            detachPreviousScreen: false,
            presentation: 'transparentModal',
        }),
        []
    );

    const screenWithModalOptions: StackNavigationOptions = useMemo(
        () => ({
            ...Platform.select({
                android: TransitionPresets.ModalPresentationIOS,
                ios: TransitionPresets.ModalPresentationIOS,
            }),
            detachPreviousScreen: false,
            gestureEnabled: true,
            gestureResponseDistance: windowHeight,
        }),
        [windowHeight]
    );

    const screenWithoutAnimation = useMemo<StackNavigationOptions>(
        () => ({
            animationEnabled: false,
        }),
        []
    );

    // logout();
    useFocusEffect(() => {
        const handleRedirection = async () => {
            // Prevent redirection if the validation is in progress

            if (await handleRedirectionPrevent()) return;
            // Redirect to the initial screen if the user is not logged in
            if (isBusinessOwnerEmailVerified?.isEmailVerified) return;
        };

        const handleRedirectionPrevent = async () => {
            // Prevent redirection on certain paths
            const allowedPathnames = [
                '/report-issue',
                '/privacy-policy',
                '/terms-and-conditions',
            ];
            if (allowedPathnames.includes(pathname)) {
                return true;
            }

            return false;
        };

        handleRedirection();
    });

    useEffect(() => {
        const initSentry = async () => {
            Sentry.setTag('isRunningInExpoGo', isRunningInExpoGo());
            ref && routingInstrumentation.registerNavigationContainer(ref);
        };
        initSentry();
    }, [ref]);

    useEffect(() => {
        const initVercelAnalytics = async () => {
            if (Platform.OS === 'web') {
                injectSpeedInsights();
                inject();
            }
        };
        initVercelAnalytics();
    }, []);

    return (
        <CustomGestureDetector>
            {alertInfo && (
                <AlertDialog
                    cancelText={t('common.ok')}
                    description={alertInfo.message}
                    onDismiss={clearAlert}
                    testID="alert-dialog"
                    title={alertInfo.title}
                />
            )}

            <JsStack screenOptions={stackScreenOptions} />
        </CustomGestureDetector>
    );
};

export const Layout = () => {
    return (
        <GlobalContext>
            <PortalHost name="portal" />

            <LayoutContent />
        </GlobalContext>
    );
};
export default Layout;
