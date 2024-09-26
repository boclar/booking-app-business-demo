import { router } from 'expo-router';
import {
    Alert,
    AlertProps,
    BottomButtons,
    Button,
    Input,
    Text,
    useTheme,
} from '@boclar/booking-app-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import { reportIssueStyles } from './report-issue.styles';
import { OverlayOption } from '@boclar/booking-app-components/src/components/molecules/overlay-dropdown';
import { Formik, FormikHandlers, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumBadge } from '@/assets/icons';
import * as Sentry from '@sentry/react-native';
import { useAppDispatch } from '@/redux/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormValues {
    issueDescription: string;
    issueType: string;
}

export const getSentryLevel = (
    value: FormValues['issueType']
): Sentry.Event['level'] => {
    switch (value) {
        case 'critical':
            return 'fatal';
        case 'high':
            return 'error';
        case 'medium':
            return 'warning';
        case 'low':
            return 'info';
    }
};

const ReportIssue = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = reportIssueStyles({ insets, theme });
    const [initialFormValues] = useState<FormValues>({
        issueDescription: '',
        issueType: '',
    });
    const [alertMsg, setAlertMsg] = useState<{
        message: string;
        type: AlertProps['type'];
    }>();
    const formikRef = useRef<FormikProps<FormValues>>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        AsyncStorage.setItem('hasOpenedReportIssue', 'true');
    }, [dispatch]);

    const issueOptions: OverlayOption[] = useMemo(
        () => [
            {
                description: t(
                    'reportIssueScreen.issueOptionCriticalDescription'
                ),
                label: t('reportIssueScreen.issueOptionCritical'),
                value: 'critical',
            },
            {
                description: t('reportIssueScreen.issueOptionHighDescription'),
                label: t('reportIssueScreen.issueOptionHigh'),
                value: 'high',
            },
            {
                description: t(
                    'reportIssueScreen.issueOptionMediumDescription'
                ),
                label: t('reportIssueScreen.issueOptionMedium'),
                value: 'medium',
            },
            {
                description: t('reportIssueScreen.issueOptionLowDescription'),
                label: t('reportIssueScreen.issueOptionLow'),
                value: 'low',
            },
        ],
        [t]
    );

    const handleGoBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    }, []);

    const handleSendReport = useCallback(
        (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
            const eventId = Sentry.captureEvent({
                extra: {
                    issueDescription: values.issueDescription,
                    issueType: values.issueType,
                },
                level: getSentryLevel(values.issueType),
                message: 'Issue reported by user',
                tags: {
                    // TODO: Change priority to depend on the user's subscription
                    isPriority: true,
                },
            });

            const userFeedback: Sentry.UserFeedback = {
                comments: values.issueDescription,
                // TODO: Change email to the user's email when the user is logged in, otherwise use a default email
                email: 'admin@boclar.com',
                event_id: eventId,
                name: `Issue reported - ${values.issueType}`,
            };

            Sentry.captureUserFeedback(userFeedback);
            Keyboard.dismiss();

            setTimeout(() => {
                formikHelpers.resetForm();
            }, 100);

            setAlertMsg({
                message: t('reportIssueScreen.successMessage'),
                type: 'success',
            });
        },
        [t]
    );

    const bottomButtons = useCallback(
        (submit: FormikHandlers['handleSubmit']) => [
            <Button
                background="ctaOutlinedPrimary"
                key={'cancel'}
                onPress={handleGoBack}
                testID="cancel-report-issue"
                variant="outlined"
            >
                <Text
                    color="ctaOutlinedPrimary"
                    fontFamily="body.regular"
                    fontSize="body"
                >
                    {t('reportIssueScreen.closeButtonLabel')}
                </Text>
            </Button>,
            <Button
                background="ctaSecondary"
                key={'submit'}
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                onPress={() => {
                    submit();
                }}
            >
                <Text
                    color="ctaSecondary"
                    fontFamily="body.regular"
                    fontSize="body"
                    testID="submit-report-issue"
                >
                    {t('reportIssueScreen.submitButtonLabel')}
                </Text>
            </Button>,
        ],
        [handleGoBack, t]
    );

    const reportIssueSchema = Yup.object().shape({
        issueDescription: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('reportIssueScreen.issueDescriptionLabel'),
            })
        ),
        issueType: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('reportIssueScreen.issueTypeLabel'),
            })
        ),
    });

    return (
        <View style={styles.rootContainer}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <Formik
                    enableReinitialize
                    initialValues={initialFormValues}
                    innerRef={formikRef}
                    onSubmit={handleSendReport}
                    validationSchema={reportIssueSchema}
                >
                    {({
                        errors,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                        touched,
                        values,
                    }) => (
                        <>
                            <ScrollView
                                alwaysBounceVertical={false}
                                keyboardShouldPersistTaps="handled"
                                style={styles.scrollView}
                            >
                                {alertMsg && (
                                    <Alert
                                        message={alertMsg.message}
                                        onAlertClose={setAlertMsg}
                                        presentationStyle="absolute"
                                        type={alertMsg.type}
                                    />
                                )}

                                <View style={styles.contentContainer}>
                                    <View style={styles.textContainer}>
                                        <Text
                                            color={'modalTitle'}
                                            fontFamily={'heading.bold'}
                                            fontSize={'modalTitle'}
                                        >
                                            {t('reportIssueScreen.title')}
                                        </Text>

                                        <View style={styles.premium}>
                                            <View style={styles.premiumBadge}>
                                                <PremiumBadge
                                                    fill={
                                                        theme.color.background
                                                            .premium
                                                    }
                                                    height={20}
                                                    width={20}
                                                />
                                            </View>

                                            <Text
                                                color={'premium'}
                                                fontFamily="body.regular"
                                                fontSize="small"
                                                style={styles.premiumNotice}
                                            >
                                                {t(
                                                    'reportIssueScreen.premiumNotice'
                                                )}
                                            </Text>
                                        </View>

                                        <Text
                                            color="paragraph"
                                            fontFamily="body.regular"
                                            fontSize="body"
                                        >
                                            {t('reportIssueScreen.description')}
                                        </Text>
                                    </View>

                                    <View style={styles.form}>
                                        <Input
                                            error={
                                                touched.issueType &&
                                                !!errors.issueType
                                            }
                                            errorMessage={errors.issueType}
                                            label={t(
                                                'reportIssueScreen.issueTypeLabel'
                                            )}
                                            onChangeOption={handleChange(
                                                'issueType'
                                            )}
                                            options={issueOptions}
                                            placeholder={t('common.select')}
                                            testID="issue-type-input"
                                            type="overlay-dropdown"
                                            value={values.issueType}
                                            variant="outlined"
                                        />

                                        <Input
                                            error={
                                                touched.issueDescription &&
                                                !!errors.issueDescription
                                            }
                                            errorMessage={
                                                errors.issueDescription
                                            }
                                            label={t(
                                                'reportIssueScreen.issueDescriptionLabel'
                                            )}
                                            onBlur={handleBlur(
                                                'issueDescription'
                                            )}
                                            onChangeText={handleChange(
                                                'issueDescription'
                                            )}
                                            placeholder={t(
                                                'reportIssueScreen.issueDescriptionPlaceholder'
                                            )}
                                            testID="issue-description-input"
                                            type="textarea"
                                            value={values.issueDescription}
                                            variant="outlined"
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.bottomButtonsContainer}>
                                <BottomButtons
                                    backgroundColor="screen"
                                    buttons={bottomButtons(handleSubmit)}
                                    useSafeArea={false}
                                />
                            </View>
                        </>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ReportIssue;
