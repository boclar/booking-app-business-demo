import { CustomGestureDetectorProps } from './custom-gesture-detector.types';
import { customGestureDetectorStyles } from './custom-gesture-detector.styles';
import { router, usePathname } from 'expo-router';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Alert, AlertProps } from '@boclar/booking-app-components';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { getFromAsyncStorage } from '@/utils/storage/storage.utils';

/**
 * Detects triple tap gesture and navigates to report issue screen
 */
const CustomGestureDetector = ({
    children,
    ...props
}: CustomGestureDetectorProps) => {
    const styles = customGestureDetectorStyles();
    const [alertMsg, setAlertMsg] = useState<{
        message: string;
        type: AlertProps['type'];
    }>();
    const { t } = useTranslation();
    const pathname = usePathname();

    // Navigate to report issue screen on double tap
    const tapGesture = Gesture.Tap()
        .runOnJS(true)
        .numberOfTaps(3)
        .onStart(() => {
            router.navigate('/report-issue');
        })
        .withTestId('double-tap');

    const longPress = Gesture.LongPress()

        .numberOfPointers(3)
        .runOnJS(true)
        .minDuration(1000)
        .onStart(() => {
            router.navigate('/report-issue');
            console.log('long press');
        })
        .onTouchesCancelled(() => {
            console.log('long press cancelled');
        });

    useEffect(() => {
        const showAlert = async () => {
            const hasOpenedReportIssue = await getFromAsyncStorage(
                'hasOpenedReportIssue'
            );
            !hasOpenedReportIssue &&
                setAlertMsg({
                    message: t('reportIssueScreen.alertMessage'),
                    type: 'info',
                });
        };

        showAlert();
    }, [t]);

    useEffect(() => {
        // Clear alert message when navigating to report issue screen
        pathname === '/report-issue' && setAlertMsg(undefined);
    }, [pathname]);

    return (
        <>
            {alertMsg && (
                <Alert
                    autoDismiss={5000}
                    cancelable={false}
                    message={alertMsg.message}
                    onAlertClose={setAlertMsg}
                    position="top"
                    presentationStyle="absolute"
                    style={styles.alert}
                    type={alertMsg?.type}
                />
            )}

            <GestureHandlerRootView
                style={styles.fitScreen}
                {...props}
            >
                <GestureDetector gesture={longPress}>
                    <View style={styles.fitScreen}>{children}</View>
                </GestureDetector>
            </GestureHandlerRootView>
        </>
    );
};

export { CustomGestureDetector };
