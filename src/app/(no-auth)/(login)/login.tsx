import { router } from 'expo-router';
import {
    Alert,
    AlertProps,
    Button,
    Input,
    Text,
    useTheme,
} from '@boclar/booking-app-components';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { loginStyles } from './login.styles';
import { useTranslation } from 'react-i18next';
import * as changeCase from 'change-case';
import { Formik } from 'formik';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/back-button';
import { translateErrorMessage } from '@/utils/error-handling/error-handling.utils';
import * as Yup from 'yup';
import * as Sentry from '@sentry/react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface FormValues {
    email: string;
    password: string;
}

const Login = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = loginStyles({ insets, theme });
    const { t } = useTranslation();
    const [alertMsg, setAlertMsg] = useState<{
        message: string;
        type: AlertProps['type'];
    }>();
    const initialFormValues = useRef<FormValues>({
        email: '',
        password: '',
    });
    const [login, { isLoading: isLoginLoading }] = useLoginAdminMutation();
    const { login: authenticate } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const loginSchema = Yup.object().shape({
        email: Yup.string()
            .email(t('formValidations.invalidEmail'))
            .required(
                t('formValidations.required', {
                    fieldName: t('loginScreen.emailInputLabel'),
                })
            ),
        password: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('form.passwordInputLabel'),
            })
        ),
    });

    const handleGoBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.navigate('/');
        }
    }, []);

    const handleLogin = useCallback(
        async (values: FormValues) => {
            if (isLoginLoading) return;
            setIsLoading(true);

            try {
                const { data, error } = await login({
                    input: {
                        password: values.password,
                        username: values.email,
                    },
                });
                const businessError = error as BusinessApiError;
                if (error) {
                    console.error(businessError.stack);
                    setAlertMsg({
                        message: translateErrorMessage({
                            name: businessError.name,
                            t,
                        }),
                        type: 'error',
                    });
                } else {
                    if (data?.loginAdmin?.data) {
                        // Redirecting is being handled by noAuth routes layout
                        await authenticate({
                            refreshToken: data.loginAdmin.refresh_token,
                            token: data.loginAdmin.token,
                        });
                        router.replace('/home');
                    }

                    Sentry.captureMessage(
                        'Login failed, no data returned from the server'
                    );
                }
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                Sentry.captureException(error);
                setAlertMsg({
                    message: t('businessApiErrors.SomethingWentWrong'),
                    type: 'error',
                });
                setIsLoading(false);
            }
        },
        [authenticate, isLoginLoading, login, t]
    );

    const handleForgotPassword = useCallback(() => {
        router.navigate('/forgot-password');
    }, []);

    return (
        <View style={styles.rootContainer}>
            <KeyboardAwareScrollView
                alwaysBounceVertical={false}
                contentContainerStyle={styles.scrollViewContent}
                keyboardDismissMode="none"
                keyboardShouldPersistTaps="handled"
            >
                <Formik
                    initialValues={initialFormValues.current}
                    onSubmit={handleLogin}
                    validationSchema={loginSchema}
                >
                    {({
                        errors,
                        handleBlur,
                        handleChange,
                        submitForm,
                        touched,
                    }) => (
                        <>
                            <BackButton
                                onPress={handleGoBack}
                                style={styles.backBtn}
                                testID="login-back-button"
                            />

                            <View style={styles.mainTextContent}>
                                <Text
                                    color="body"
                                    fontFamily="heading.bold"
                                    fontSize="screenTitle"
                                    numberOfLines={1}
                                    style={styles.title}
                                >
                                    {changeCase.capitalCase(
                                        t('loginScreen.title')
                                    )}
                                </Text>

                                <Text
                                    color="paragraph"
                                    fontFamily="body.regular"
                                    fontSize="body"
                                    style={styles.description}
                                >
                                    {t('loginScreen.description')}
                                </Text>
                            </View>

                            <View style={styles.form}>
                                {alertMsg && (
                                    <Alert
                                        message={alertMsg.message}
                                        onAlertClose={setAlertMsg}
                                        presentationStyle="static"
                                        type={alertMsg.type}
                                    />
                                )}

                                <View style={styles.formFields}>
                                    <Input
                                        autoComplete="email"
                                        error={touched.email && !!errors.email}
                                        errorMessage={errors.email}
                                        label={t('loginScreen.emailInputLabel')}
                                        onBlur={handleBlur('email')}
                                        onChangeText={handleChange('email')}
                                        testID="email-input"
                                        type="text"
                                        variant="outlined"
                                    />

                                    <Input
                                        autoComplete="password"
                                        error={
                                            touched.password &&
                                            !!errors.password
                                        }
                                        errorMessage={errors.password}
                                        label={t('form.passwordInputLabel')}
                                        onBlur={handleBlur('password')}
                                        onChangeText={handleChange('password')}
                                        returnKeyType="done"
                                        testID="password-input"
                                        type="password"
                                        variant="outlined"
                                    />
                                </View>

                                <Text
                                    color="body"
                                    fontFamily="body.regular"
                                    fontSize="body"
                                    onPress={handleForgotPassword}
                                    style={styles.forgotPassword}
                                    testID="forgot-password-button"
                                >
                                    {t('form.forgotPassword')}
                                </Text>
                            </View>

                            <Button
                                background="ctaPrimary"
                                isLoading={isLoading}
                                onPress={submitForm}
                                style={styles.loginBtn}
                                testID="login-button"
                            >
                                <Text color="ctaPrimary">
                                    {t('loginScreen.loginButtonLabel')}
                                </Text>
                            </Button>
                        </>
                    )}
                </Formik>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default Login;
