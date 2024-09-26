import {
    Alert,
    Text,
    useTheme,
    ConfirmationCodeInput,
    Button,
} from '@boclar/booking-app-components';
import { confirmEmailStyles } from './confirm-email.styles';
import { useTranslation, Trans } from 'react-i18next';
import { GestureResponderEvent, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ResendVerificationCodeStatus,
    useResendVerificationCodeMutation,
    useVerifyEmailMutation,
    VerifyEmailStatus,
} from '@/types/business-api';
import { router } from 'expo-router';
import { useResendCode } from '@/hooks/use-resend-code/use-resend-code.hooks';
import formatDuration from 'format-duration';
import { translateErrorMessage } from '@/utils/error-handling/error-handling.utils';
import { BusinessApiError } from '../../../services/business-services/business-rtk-query';
import * as changeCase from 'change-case';
import { useAuth } from '@/hooks/use-auth/use-auth.hooks';
import { useAppDispatch } from '@/redux/hooks';
import {
    selectIsBusinessOwnerCreated,
    setIsBusinessOwnerEmailVerified,
} from '@/redux/slices/userProgress.slices';
import { useSelector } from 'react-redux';
import * as Sentry from '@sentry/react-native';

const ConfirmEmail = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = confirmEmailStyles({
        insets,
        theme,
    });
    const { t } = useTranslation();
    const {
        attempts,
        cooldown,
        isCooldownEnabled,
        isResendCodeEnabled,
        maxAttempts,
        resetStorage,
        timer,
        triggerResendCode,
    } = useResendCode({
        instanceKey: 'CONFIRM_EMAIL',
    });

    const [verifyEmail] = useVerifyEmailMutation();
    const [confirmationCode, setConfirmationCode] = useState('');
    const [email, setEmail] = useState<string>();
    const [resendCode] = useResendVerificationCodeMutation();
    const [alertMsg, setAlertMsg] = useState<
        { isError: boolean; msg: string } | undefined
    >();
    const { login } = useAuth();
    const dispatch = useAppDispatch();
    const isBusinessOwnerCreated = useSelector(selectIsBusinessOwnerCreated);
    const [isLoading, setIsLoading] = useState(false);

    const descriptionComponents = useMemo(
        () => ({
            bold: (
                <Text
                    color="body"
                    fontFamily="body.bold"
                    fontSize="body"
                />
            ),
            regular: (
                <Text
                    color="paragraph"
                    fontFamily="body.regular"
                    fontSize="body"
                    style={styles.description}
                />
            ),
        }),
        [styles.description]
    );

    const descriptionValues = useMemo(
        () => ({
            email,
        }),
        [email]
    );

    const submitConfirmationCode = useCallback(
        async (passedCode: GestureResponderEvent | String) => {
            if (isBusinessOwnerCreated?.cognito_user_id) {
                setIsLoading(true);
                const { data, error } = await verifyEmail({
                    input: {
                        cognito_user_id: isBusinessOwnerCreated.cognito_user_id,
                        confirmation_code:
                            typeof passedCode === 'string'
                                ? passedCode
                                : confirmationCode,
                    },
                });
                const businessApiError = error as BusinessApiError;

                if (error) {
                    console.error(
                        'Error verifying email',
                        JSON.stringify(error)
                    );
                    setAlertMsg({
                        isError: true,
                        msg: translateErrorMessage({
                            name: businessApiError.name,
                            t,
                        }),
                    });
                } else {
                    if (
                        data?.verifyEmail?.status ===
                        VerifyEmailStatus.EmailSuccessfullyVerified
                    ) {
                        await resetStorage();
                        dispatch(
                            setIsBusinessOwnerEmailVerified({
                                hasPhone: false,
                                isEmailVerified: true,
                            })
                        );
                        data.verifyEmail.token &&
                            (await login(
                                {
                                    refreshToken:
                                        data.verifyEmail.refresh_token,
                                    token: data.verifyEmail.token,
                                },
                                () => {
                                    router.replace('/subscribe');
                                }
                            ));
                    } else if (
                        data?.verifyEmail?.status ===
                        VerifyEmailStatus.PhoneVerificationRequired
                    ) {
                        await resetStorage();
                        dispatch(
                            setIsBusinessOwnerEmailVerified({
                                hasPhone: true,
                                isEmailVerified: true,
                            })
                        );
                        data.verifyEmail.token &&
                            (await login(
                                {
                                    refreshToken:
                                        data.verifyEmail.refresh_token,
                                    token: data.verifyEmail.token,
                                },
                                () => {
                                    router.replace('/confirm-phone');
                                }
                            ));
                    } else {
                        setAlertMsg({
                            isError: true,
                            msg: t('businessApiErrors.SomethingWentWrong'),
                        });
                        Sentry.captureMessage(
                            'Unknown status returned from verifyEmail'
                        );
                    }
                }
                setIsLoading(false);
            } else {
                setAlertMsg({
                    isError: true,
                    msg: t('businessApiErrors.SomethingWentWrong'),
                });
            }
        },
        [
            confirmationCode,
            dispatch,
            isBusinessOwnerCreated,
            login,
            resetStorage,
            t,
            verifyEmail,
        ]
    );

    const handleResendCode = useCallback(async () => {
        if (isBusinessOwnerCreated?.cognito_user_id) {
            triggerResendCode();
            const { data, error } = await resendCode({
                input: {
                    unique_username: isBusinessOwnerCreated.cognito_user_id,
                },
            });
            const businessError = error as BusinessApiError;

            if (error) {
                console.error('Error resending code', error);
                setAlertMsg({
                    isError: true,
                    msg: translateErrorMessage({
                        name: businessError.name,
                        t,
                    }),
                });
            } else {
                if (
                    data?.resendVerificationCode?.response ===
                    ResendVerificationCodeStatus.EmailVerificationSent
                ) {
                    setAlertMsg({
                        isError: false,
                        msg: t('confirmEmailScreen.codeResent'),
                    });
                } else {
                    setAlertMsg({
                        isError: true,
                        msg: t('businessApiErrors.SomethingWentWrong'),
                    });
                    Sentry.captureMessage(
                        'Unknown status returned from resendVerificationCode'
                    );
                }
            }
        } else {
            setAlertMsg({
                isError: true,
                msg: t('businessApiErrors.SomethingWentWrong'),
            });
        }
    }, [
        isBusinessOwnerCreated?.cognito_user_id,
        resendCode,
        t,
        triggerResendCode,
    ]);

    useEffect(() => {
        const getEmail = async () => {
            setEmail(isBusinessOwnerCreated?.email);
        };

        getEmail();
    }, [isBusinessOwnerCreated?.email]);

    return (
        <>
            {alertMsg?.msg && (
                <Alert
                    onAlertClose={setAlertMsg}
                    presentationStyle="absolute"
                    type={alertMsg.isError ? 'error' : 'success'}
                >
                    {alertMsg.msg}
                </Alert>
            )}

            <ScrollView
                alwaysBounceVertical={false}
                keyboardDismissMode="none"
                keyboardShouldPersistTaps="handled"
                style={styles.rootContainer}
            >
                <View style={styles.textContainer}>
                    <Text
                        color="body"
                        fontFamily="heading.bold"
                        fontSize="screenTitle"
                        numberOfLines={1}
                        style={styles.title}
                    >
                        {changeCase.capitalCase(t('confirmEmailScreen.title'))}
                    </Text>

                    <Trans
                        components={descriptionComponents}
                        email={email}
                        i18nKey={'confirmEmailScreen.description'}
                        values={descriptionValues}
                    />
                </View>

                <View
                    style={styles.confirmationCodeInput}
                    testID="email-confirmation-code-container"
                >
                    <ConfirmationCodeInput
                        cellCount={6}
                        gap={12}
                        onCodeChange={setConfirmationCode}
                        onCodeFilled={submitConfirmationCode}
                        testID="email-confirmation-code-input"
                    />
                </View>

                <Button
                    background="ctaPrimary"
                    isLoading={isLoading}
                    onPress={submitConfirmationCode}
                    style={styles.confirmBtn}
                >
                    <Text
                        color="ctaPrimary"
                        fontFamily="body.regular"
                        fontSize="body"
                    >
                        {t('common.confirm')}
                    </Text>
                </Button>

                <View style={styles.resendCode}>
                    <Text
                        color={isCooldownEnabled ? 'paragraph' : 'body'}
                        fontFamily="body.regular"
                        fontSize="body"
                        numberOfLines={1}
                        onPress={
                            isResendCodeEnabled ? handleResendCode : undefined
                        }
                        style={useMemo(
                            () => ({
                                textDecorationLine: !isCooldownEnabled
                                    ? 'underline'
                                    : 'none',
                            }),
                            [isCooldownEnabled]
                        )}
                        testID="resend-email-text"
                    >
                        {isCooldownEnabled
                            ? t('common.resendCodeIn')
                            : `${t('common.resendCode')} (${attempts}/${maxAttempts})`}
                    </Text>

                    <Text
                        color={isCooldownEnabled ? 'paragraph' : 'body'}
                        fontFamily="body.regular"
                        fontSize="body"
                    >
                        {formatDuration((cooldown || timer) * 1000)}
                    </Text>
                </View>
            </ScrollView>
        </>
    );
};

export default ConfirmEmail;
