/* eslint-disable react/jsx-newline */
import { Platform, ScrollView, View } from 'react-native';
import { createBusinessOwnerFormStyles } from './create-business-owner-form.styles';
import {
    BottomButtons,
    Button,
    Input,
    Text,
    ChoiceBox,
    useTheme,
    Alert,
    RadioGroupOption,
} from '@boclar/booking-app-components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Formik, useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import {
    selectCreateBusinessOwnerForm,
    selectIsBusinessCreated,
    setCreateBusinessOwnerFormField,
    setIsBusinessOwnerCreated,
    UserProgressState,
} from '@/redux/slices/userProgress.slices';
import { useAppDispatch } from '@/redux/hooks';
import {
    useCreateBusinessOwnerMutation,
    useGetCountriesQuery,
} from '@/types/business-api';
import { Avatar } from '../avatar';
import * as Yup from 'yup';
import parsePhoneNumber from 'libphonenumber-js';
import { CreateBusinessOwnerFormProps } from './create-business-owner-form.types';
import { BusinessApiError } from '@/services/business-services/business-rtk-query';
import { DateTime } from 'luxon';
import * as FileSystem from 'expo-file-system';
import { translateErrorMessage } from '@/utils/error-handling/error-handling.utils';
import { ImagePickerAsset } from 'expo-image-picker';
import { router } from 'expo-router';
import * as changeCase from 'change-case';

/**
 * Form for creating a business owner.
 */
const CreateBusinessOwnerForm = ({
    isFormLoading,
}: CreateBusinessOwnerFormProps) => {
    const { theme } = useTheme();
    const styles = createBusinessOwnerFormStyles({ theme });
    const { t } = useTranslation();
    const {
        errors,
        handleBlur,
        handleChange,
        isSubmitting,
        submitForm,
        touched,
        values,
    } = useFormikContext<UserProgressState['createBusinessOwnerForm']>();
    const scrollViewRef = useRef<ScrollView>(null);
    const bottomButtons = useMemo(
        () => [
            <Button
                background="ctaPrimary"
                isLoading={isFormLoading}
                key={'1'}
                onPress={!isSubmitting ? submitForm : undefined}
            >
                <Text color="ctaPrimary">
                    {t('createBusinessOwnerScreen.nextButtonLabel')}
                </Text>
            </Button>,
        ],
        [isFormLoading, isSubmitting, submitForm, t]
    );
    const dispatch = useAppDispatch();

    const handleTermsOpen = useCallback(() => {
        router.push('/terms-and-conditions');
    }, []);

    const handlePrivacyOpen = useCallback(() => {
        router.push('/privacy-policy');
    }, []);

    const acceptTermsTransComponent = useMemo(
        () => ({
            openPrivacy: (
                <Text
                    color="ctaPrimary"
                    fontFamily="body.regular"
                    fontSize="body"
                    onPress={handlePrivacyOpen}
                    style={styles.ctaText}
                    testID="open-privacy-policy"
                />
            ),
            openTerms: (
                <Text
                    color="ctaPrimary"
                    fontFamily="body.regular"
                    fontSize="body"
                    onPress={handleTermsOpen}
                    style={styles.ctaText}
                    testID="open-terms-and-conditions"
                />
            ),
        }),
        [handlePrivacyOpen, handleTermsOpen, styles.ctaText]
    );

    useEffect(() => {
        // Scroll to top if there are errors so the user can the error when there is no picture uploaded, or any other errors
        isSubmitting &&
            Object.keys(errors).length &&
            scrollViewRef.current?.scrollTo({ y: 0 });
    }, [errors, isSubmitting]);

    const { data: countries } = useGetCountriesQuery({});
    const genderOptions = useMemo<RadioGroupOption[]>(
        () =>
            [
                {
                    label: t('form.maleGender'),
                    value: 'male',
                },
                {
                    label: t('form.femaleGender'),
                    value: 'female',
                },
            ].sort((a, b) =>
                a.label.localeCompare(b.label)
            ) as RadioGroupOption[],
        [t]
    );

    const memorizedCountries = useMemo(
        () => countries?.countries || [],
        [countries]
    );

    const handleTextInputChange =
        (fieldName: keyof UserProgressState['createBusinessOwnerForm']) =>
        (inputValue: string) => {
            handleChange(fieldName)(inputValue);
            dispatch(
                setCreateBusinessOwnerFormField({
                    field: fieldName,
                    value: inputValue,
                })
            );
        };

    const handleDateChange =
        (fieldName: keyof UserProgressState['createBusinessOwnerForm']) =>
        (date: Date) => {
            handleChange(fieldName)(date.toString());
            dispatch(
                setCreateBusinessOwnerFormField({
                    field: fieldName,
                    value: date.toString(),
                })
            );
        };

    const handleCheckboxChange =
        (fieldName: keyof UserProgressState['createBusinessOwnerForm']) =>
        (value: boolean) => {
            handleChange(fieldName)(`${value}`);
            dispatch(
                setCreateBusinessOwnerFormField({
                    field: fieldName,
                    value: `${value}`,
                })
            );
        };

    const handlePhotoChange =
        (fieldName: keyof UserProgressState['createBusinessOwnerForm']) =>
        async (photo: ImagePickerAsset | undefined) => {
            let photoValue = photo?.uri || '';
            if (
                (Platform.OS === 'android' || Platform.OS === 'ios') &&
                photo?.uri &&
                photo?.mimeType
            ) {
                const base64Img = await FileSystem.readAsStringAsync(
                    photo?.uri,
                    {
                        encoding: FileSystem?.EncodingType?.Base64,
                    }
                );

                photoValue = `data:${photo?.mimeType};base64,${base64Img}`;
            }
            handleChange(fieldName)(photoValue);
            dispatch(
                setCreateBusinessOwnerFormField({
                    field: fieldName,
                    value: photoValue,
                })
            );
        };

    return (
        <>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                ref={scrollViewRef}
                style={styles.rootContainer}
                testID="root-container"
            >
                <View style={styles.avatarContainer}>
                    <Avatar
                        image={values.profilePicture}
                        onChange={handlePhotoChange('profilePicture')}
                        testID={'photo-input'}
                    />

                    {!!errors.profilePicture && touched.profilePicture && (
                        <Text color="error">
                            {t('formValidations.photoRequired')}
                        </Text>
                    )}
                </View>

                <Input
                    autoComplete="given-name"
                    error={!!errors.firstname && touched.firstname}
                    errorMessage={errors.firstname}
                    label={t('createBusinessOwnerForm.firstnameLabel')}
                    onBlur={handleBlur('firstname')}
                    onChangeText={handleTextInputChange('firstname')}
                    placeholder={t(
                        'createBusinessOwnerForm.firstnamePlaceholder'
                    )}
                    type="text"
                    value={values.firstname}
                    variant="outlined"
                />

                <Input
                    autoComplete="family-name"
                    error={!!errors.lastname && touched.lastname}
                    errorMessage={errors.lastname}
                    label={t('createBusinessOwnerForm.lastnameLabel')}
                    onBlur={handleBlur('lastname')}
                    onChangeText={handleTextInputChange('lastname')}
                    placeholder={t(
                        'createBusinessOwnerForm.lastnamePlaceholder'
                    )}
                    type="text"
                    value={values.lastname}
                    variant="outlined"
                />

                <Input
                    autoComplete="username"
                    description={t(
                        'createBusinessOwnerForm.usernameDescription'
                    )}
                    error={!!errors.username && touched.username}
                    errorMessage={errors.username}
                    label={t('createBusinessOwnerForm.usernameLabel')}
                    onBlur={handleBlur('username')}
                    onChangeText={handleTextInputChange('username')}
                    placeholder={t(
                        'createBusinessOwnerForm.usernamePlaceholder'
                    )}
                    type="text"
                    value={values.username}
                    variant="outlined"
                />

                <Input
                    autoComplete="email"
                    error={!!errors.email && touched.email}
                    errorMessage={errors.email}
                    keyboardType="email-address"
                    label={t('createBusinessOwnerForm.emailLabel')}
                    onBlur={handleBlur('email')}
                    onChangeText={handleTextInputChange('email')}
                    placeholder={t('createBusinessOwnerForm.emailPlaceholder')}
                    type="text"
                    value={values.email}
                    variant="outlined"
                />

                <Input
                    behavior="open-radio-modal"
                    description={t('createBusinessOwnerForm.genderDescription')}
                    error={!!errors.gender && touched.gender}
                    errorMessage={errors.gender}
                    label={t('createBusinessOwnerForm.genderLabel')}
                    modalTitle={t('common.modalTitle')}
                    onChangeOption={handleTextInputChange('gender')}
                    options={genderOptions}
                    placeholder={t('common.inputSelectPlaceholder')}
                    type="dropdown"
                    value={values.gender}
                    variant="outlined"
                />

                <Input
                    error={!!errors.birthdate && touched.birthdate}
                    errorMessage={errors.birthdate}
                    label={t('createBusinessOwnerForm.birthdateLabel')}
                    onChange={handleDateChange('birthdate')}
                    placeholder={t('common.inputSelectPlaceholder')}
                    testID={'birthdate-input'}
                    type="date-picker"
                    value={
                        values.birthdate
                            ? new Date(values.birthdate)
                            : undefined
                    }
                    variant="outlined"
                />

                <Input
                    behavior="open-radio-modal"
                    error={!!errors.nationality && touched.nationality}
                    errorMessage={errors.nationality}
                    label={t('createBusinessOwnerForm.nationalityLabel')}
                    modalTitle={t(
                        'createBusinessOwnerForm.nationalityModalTitle'
                    )}
                    onChangeOption={handleTextInputChange('nationality')}
                    options={memorizedCountries.map(country => ({
                        label: country.name,
                        value: country.code,
                    }))}
                    placeholder={t('common.inputSelectPlaceholder')}
                    testID="nationality-input"
                    type="dropdown"
                    value={values.nationality}
                    variant="outlined"
                />

                <Input
                    autoComplete="password"
                    error={!!errors.password && touched.password}
                    errorMessage={errors.password}
                    label={t('createBusinessOwnerForm.passwordLabel')}
                    onBlur={handleBlur('password')}
                    onChangeText={handleTextInputChange('password')}
                    type="password"
                    value={values.password}
                    variant="outlined"
                />

                <Input
                    autoComplete="password"
                    error={!!errors.repeatPassword && touched.repeatPassword}
                    errorMessage={errors.repeatPassword}
                    label={t('createBusinessOwnerForm.repeatPasswordLabel')}
                    onBlur={handleBlur('repeatPassword')}
                    onChangeText={handleTextInputChange('repeatPassword')}
                    type="password"
                    value={values.repeatPassword}
                    variant="outlined"
                />

                <Input
                    autoComplete="tel"
                    error={!!errors.phoneNumber}
                    errorMessage={errors.phoneNumber}
                    LabelComponent={
                        <Text
                            color="body"
                            fontFamily="body.regular"
                            fontSize="body"
                        >
                            {t('createBusinessOwnerForm.phoneNumberLabel')}{' '}
                            <Text
                                color="paragraph"
                                fontFamily="body.regular"
                                fontSize="body"
                            >
                                ({changeCase.noCase(t('common.optional'))})
                            </Text>
                        </Text>
                    }
                    modalTitle={t(
                        'createBusinessOwnerForm.phoneNumberModalTitle'
                    )}
                    onChangePhone={handleTextInputChange('phoneNumber')}
                    options={memorizedCountries.map(country => ({
                        label: `${country.name} (${country.calling_code})`,
                        value: country.calling_code as `+${string}`,
                    }))}
                    placeholder={t(
                        'createBusinessOwnerForm.phoneNumberPlaceholder'
                    )}
                    testID={'phone-number-input'}
                    type="phone"
                    value={values.phoneNumber}
                    variant="outlined"
                />

                <ChoiceBox
                    isChecked={values.acceptTerms === 'true'}
                    onPress={handleCheckboxChange('acceptTerms')}
                    testID={'accept-terms-checkbox'}
                    tickVariant="checkmark"
                    type="checkbox"
                >
                    <Text
                        color="body"
                        fontFamily="body.regular"
                        fontSize="body"
                        style={styles.fitScreen}
                    >
                        <Trans
                            components={acceptTermsTransComponent}
                            i18nKey={'createBusinessOwnerForm.acceptTermsLabel'}
                        />
                    </Text>
                </ChoiceBox>

                <ChoiceBox
                    isChecked={values.acceptMarketing === 'true'}
                    onPress={handleCheckboxChange('acceptMarketing')}
                    tickVariant="checkmark"
                    type="checkbox"
                >
                    <Text
                        color="body"
                        fontFamily="body.regular"
                        fontSize="body"
                        style={styles.fitScreen}
                    >
                        {t('createBusinessOwnerForm.acceptMarketingLabel')}
                    </Text>
                </ChoiceBox>
            </ScrollView>

            <BottomButtons
                buttons={bottomButtons}
                useSafeArea={false}
            />
        </>
    );
};

const CreateBusinessOwnerFormik = () => {
    const initialFormValues = useSelector(selectCreateBusinessOwnerForm);
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string>();
    const dispatch = useAppDispatch();
    const isBusinessCreated = useSelector(selectIsBusinessCreated);
    const [isLoading, setIsLoading] = useState(false);

    const alphabetRegex = /^[a-zA-Z]*\s?$/;
    const usernameRegex = /^[a-zA-Z0-9_.]*\s?$/;
    const createBusinessOwnerSchema = Yup.object().shape({
        birthdate: Yup.date().required(
            t('formValidations.required', {
                fieldName: t('createBusinessOwnerForm.birthdateLabel'),
            })
        ),
        email: Yup.string()
            .email(t('formValidations.invalidEmail'))
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessOwnerForm.emailLabel'),
                })
            ),
        firstname: Yup.string()
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessOwnerForm.firstnameLabel'),
                })
            )
            .max(
                15,
                t('formValidations.maxCharacters', {
                    fieldName: t('createBusinessOwnerForm.firstnameLabel'),
                    length: 15,
                })
            )
            .min(
                3,
                t('formValidations.minCharacters', {
                    fieldName: t('createBusinessOwnerForm.firstnameLabel'),
                    length: 3,
                })
            )
            .matches(
                alphabetRegex,
                t('formValidations.invalidCharacters', {
                    fieldName: t('createBusinessOwnerForm.firstnameLabel'),
                })
            ),
        gender: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('createBusinessOwnerForm.genderLabel'),
            })
        ),
        lastname: Yup.string()
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessOwnerForm.lastnameLabel'),
                })
            )
            .max(
                15,
                t('formValidations.maxCharacters', {
                    fieldName: t('createBusinessOwnerForm.lastnameLabel'),
                    length: 15,
                })
            )
            .min(
                3,
                t('formValidations.minCharacters', {
                    fieldName: t('createBusinessOwnerForm.lastnameLabel'),
                    length: 3,
                })
            )
            .matches(
                alphabetRegex,
                t('formValidations.invalidCharacters', {
                    fieldName: t('createBusinessOwnerForm.lastnameLabel'),
                })
            ),
        nationality: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('createBusinessOwnerForm.nationalityLabel'),
            })
        ),
        password: Yup.string()
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessOwnerForm.passwordLabel'),
                })
            )
            .min(
                8,
                t('formValidations.minCharacters', {
                    fieldName: t('createBusinessOwnerForm.passwordLabel'),
                    length: 8,
                })
            ),
        phoneNumber: Yup.string().test('phone-number', (value, ctx) => {
            // Value comes as string always
            const parsedPhoneNumber = parsePhoneNumber(value || '');

            if (
                parsedPhoneNumber?.nationalNumber &&
                !parsedPhoneNumber.isValid()
            ) {
                return ctx.createError({
                    message: t('formValidations.invalidPhoneNumber'),
                });
            }

            return true;
        }),
        profilePicture: Yup.string().required(
            t('formValidations.photoRequired')
        ),
        repeatPassword: Yup.string()
            .oneOf([Yup.ref('password')], t('formValidations.passwordMatch'))
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessOwnerForm.repeatPasswordLabel'),
                })
            ),
        username: Yup.string()
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessOwnerForm.usernameLabel'),
                })
            )
            .max(
                15,
                t('formValidations.maxCharacters', {
                    fieldName: t('createBusinessOwnerForm.usernameLabel'),
                    length: 15,
                })
            )
            .matches(
                usernameRegex,
                t('formValidations.invalidCharacters', {
                    fieldName: t('createBusinessOwnerForm.usernameLabel'),
                })
            )
            .min(
                3,
                t('formValidations.minCharacters', {
                    fieldName: t('createBusinessOwnerForm.usernameLabel'),
                    length: 3,
                })
            ),
    });
    const [createBusinessOwner] = useCreateBusinessOwnerMutation({});

    const handleSubmit = useCallback(
        async (values: UserProgressState['createBusinessOwnerForm']) => {
            setErrorMessage('');

            if (isBusinessCreated) {
                setIsLoading(true);
                const businessOwner = await createBusinessOwner({
                    input: {
                        accept_marketing: values.acceptMarketing === 'true',
                        accept_terms: values.acceptTerms === 'true',
                        birthdate: DateTime.fromJSDate(
                            new Date(values.birthdate)
                        ).toISODate() as string,
                        business_pk: isBusinessCreated.business_pk as string,
                        email: values.email,
                        firstname: values.firstname,
                        gender: values.gender,
                        lastname: values.lastname,
                        nationality: values.nationality,
                        password: values.password,
                        phone: values.phoneNumber,
                        preferred_username: values.username,
                        profile_picture: values.profilePicture,
                        repeat_password: values.repeatPassword,
                    },
                });

                if (!businessOwner.error) {
                    dispatch(
                        setIsBusinessOwnerCreated({
                            cognito_user_id: businessOwner.data
                                ?.createBusinessOwner
                                ?.cognito_user_id as string,

                            email: values.email,
                            phone: values.phoneNumber,
                        })
                    );

                    router.replace('/confirm-email');
                } else {
                    console.error(
                        'Error creating business owner:',
                        JSON.stringify(businessOwner.error)
                    );
                    const error = businessOwner.error as BusinessApiError;
                    const translatedError = translateErrorMessage({
                        businessError: error,
                        name: error.name,
                        t,
                    });
                    setErrorMessage(translatedError);
                }
            } else {
                setErrorMessage(t('businessApiErrors.MustCreateBusinessFirst'));
            }
            setIsLoading(false);
        },
        [dispatch, createBusinessOwner, isBusinessCreated, setErrorMessage, t]
    );

    return (
        <>
            {errorMessage && (
                <Alert
                    presentationStyle="absolute"
                    type="error"
                >
                    {errorMessage}
                </Alert>
            )}

            <Formik
                initialValues={initialFormValues}
                onSubmit={handleSubmit}
                validationSchema={createBusinessOwnerSchema}
            >
                <CreateBusinessOwnerForm isFormLoading={isLoading} />
            </Formik>
        </>
    );
};

export { CreateBusinessOwnerFormik as CreateBusinessOwnerForm };
