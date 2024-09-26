import {
    Alert,
    Text,
    useTheme,
    ConfirmationCodeInput,
    Button,
} from '@boclar/booking-app-components';
import { confirmPhoneStyles } from './confirm-phone.styles';
import { useTranslation, Trans } from 'react-i18next';
import {
    GestureResponderEvent,
    ScrollView,
    TextStyle,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ResendVerificationCodeStatus,
    useResendVerificationCodeMutation,
    useVerifyPhoneMutation,
    VerifyPhoneStatus,
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
    setIsBusinessOwnerPhoneVerified,
} from '@/redux/slices/userProgress.slices';
import { useSelector } from 'react-redux';
import * as Sentry from '@sentry/react-native';

const ConfirmPhone = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = confirmPhoneStyles({
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
        instanceKey: 'CONFIRM_PHONE',
    });
    const [confirmationCode, setConfirmationCode] = useState('');
    const [phone, setPhone] = useState<string>();
    const [resendCode] = useResendVerificationCodeMutation();
    const [alertMsg, setAlertMsg] = useState<
        { isError: boolean; msg: string } | undefined
    >();
    const [verifyPhone, { isLoading: isVerifyPhoneLoading }] =
        useVerifyPhoneMutation();
    const { getToken } = useAuth();
    const dispatch = useAppDispatch();
    const isBusinessOwnerCreated = useSelector(selectIsBusinessOwnerCreated);
    const [isLoading, setIsLoading] = useState(false);

    const resendCodeStyle: TextStyle = useMemo(
        () => ({
            textDecorationLine: !isCooldownEnabled ? 'underline' : 'none',
        }),
        [isCooldownEnabled]
    );

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
            phone,
        }),
        [phone]
    );

    const submitConfirmationCode = useCallback(
        async (passedCode: GestureResponderEvent | String) => {
            const token = await getToken();

            if (isBusinessOwnerCreated?.cognito_user_id && token) {
                setIsLoading(true);
                const { data, error } = await verifyPhone({
                    input: {
                        confirmation_code:
                            typeof passedCode === 'string'
                                ? passedCode
                                : confirmationCode,
                        token,
                    },
                });

                const businessError = error as BusinessApiError;

                if (error) {
                    console.error('Error verifying phone', error);
                    setAlertMsg({
                        isError: true,
                        msg: translateErrorMessage({
                            name: businessError.name,
                            t,
                        }),
                    });
                } else {
                    if (
                        data?.verifyPhone?.status ===
                        VerifyPhoneStatus.PhoneSuccessfullyVerified
                    ) {
                        await resetStorage();
                        dispatch(
                            setIsBusinessOwnerPhoneVerified({
                                isPhoneVerified: true,
                                skipPhoneVerification: false,
                            })
                        );

                        router.replace('/subscribe');
                    } else {
                        setAlertMsg({
                            isError: true,
                            msg: t('businessApiErrors.SomethingWentWrong'),
                        });
                        Sentry.captureMessage(
                            'Result of phone verification is not as expected'
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
            isLoading,
            t,
            resetStorage,
            getToken,
            verifyPhone,
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
                    ResendVerificationCodeStatus.PhoneVerificationSent
                ) {
                    setAlertMsg({
                        isError: false,
                        msg: t('confirmPhoneScreen.codeResent'),
                    });
                } else {
                    setAlertMsg({
                        isError: true,
                        msg: t('businessApiErrors.SomethingWentWrong'),
                    });
                    Sentry.captureMessage(
                        'Result of resending code is not as expected'
                    );
                }
            }
        } else {
            setAlertMsg({
                isError: true,
                msg: t('businessApiErrors.SomethingWentWrong'),
            });
        }
    }, [isBusinessOwnerCreated, resendCode, t, triggerResendCode]);

    const handleSkip = useCallback(async () => {
        dispatch(
            setIsBusinessOwnerPhoneVerified({
                isPhoneVerified: false,
                skipPhoneVerification: true,
            })
        );

        router.replace('/subscribe');
    }, [dispatch]);

    useEffect(() => {
        const getPhoneFromStorage = async () => {
            const phone = isBusinessOwnerCreated?.phone;
            setPhone(phone);
        };

        getPhoneFromStorage();
    }, [isBusinessOwnerCreated]);

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
                <Text
                    color="paragraph"
                    fontFamily="body.regular"
                    fontSize="big"
                    onPress={handleSkip}
                    style={styles.skipText}
                    testID="skip-phone-verification-text"
                >
                    {t('common.skip')}
                </Text>

                <View style={styles.textContainer}>
                    <Text
                        color="body"
                        fontFamily="heading.bold"
                        fontSize="screenTitle"
                        numberOfLines={1}
                        style={styles.title}
                    >
                        {changeCase.capitalCase(t('confirmPhoneScreen.title'))}
                    </Text>

                    <Trans
                        components={descriptionComponents}
                        i18nKey={'confirmPhoneScreen.description'}
                        phone={phone}
                        values={descriptionValues}
                    />
                </View>

                <View
                    style={styles.confirmationCodeInput}
                    testID="phone-confirmation-code-container"
                >
                    <ConfirmationCodeInput
                        cellCount={6}
                        // fitParentWidth
                        gap={12}
                        onCodeChange={setConfirmationCode}
                        onCodeFilled={submitConfirmationCode}
                        // parentWidth={confirmationParentLayout?.width}
                        testID="phone-confirmation-code-input"
                    />
                </View>

                <Button
                    background="ctaPrimary"
                    isLoading={isVerifyPhoneLoading}
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
                        style={resendCodeStyle}
                        testID="resend-phone-text"
                    >
                        {isCooldownEnabled
                            ? t('common.resendCodeIn')
                            : `${t('common.resendCode')} (${attempts}/${maxAttempts})`}
                    </Text>

                    <Text
                        color={isCooldownEnabled ? 'paragraph' : 'body'}
                        fontFamily="body.regular"
                        fontSize="body"
                        testID="resend-phone-timer"
                    >
                        {formatDuration((cooldown || timer) * 1000)}
                    </Text>
                </View>
            </ScrollView>
        </>
    );
};

export default ConfirmPhone;
