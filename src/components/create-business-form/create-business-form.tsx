import { ScrollView } from 'react-native';
import { CreateBusinessFormProps } from './create-business-form.types';
import { createBusinessFormStyles } from './create-business-form.styles';
import {
    capitalizeFirstLetter,
    Input,
    BottomButtons,
    Button,
    Text,
    PreviewDemoOption,
    useTheme,
    Alert,
    useAlert,
} from '@boclar/booking-app-components';
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import {
    useCreateBusinessMutation,
    useGetBusinessTypesQuery,
    useGetCountriesQuery,
    useGetCurrenciesQuery,
    useGetThemeStylesQuery,
    useGetTimezonesQuery,
} from '@/types/business-api';
import { appName, appUrl } from '@/constants/app.constants';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormikHandlers, FormikHelpers } from 'formik/dist/types';
import { RadioGroupOption } from '@boclar/booking-app-components/src/components/molecules/radio-group/radio-group.types';
import { useAppDispatch } from '@/redux/hooks';
import {
    selectCreateBusinessForm,
    setCreateBusinessFormField,
    setIsBusinessCreated,
    UserProgressState,
} from '@/redux/slices/userProgress.slices';
import { useSelector } from 'react-redux';
import { getLocales } from 'expo-localization';
import { BusinessApiError } from '@/services/business-services/business-rtk-query';
import { translateErrorMessage } from '@/utils/error-handling/error-handling.utils';
import * as Sentry from '@sentry/react-native';

/**
 * Form for creating a business with all the necessary fields
 */
const CreateBusinessForm = ({
    goNextPage,
    testInitialFormikValues,
}: CreateBusinessFormProps) => {
    const { theme } = useTheme();
    const styles = createBusinessFormStyles();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const createBusinessFormSelector = useSelector(selectCreateBusinessForm);
    const { data: businessTypesData, error: isBusinessTypesError } =
        useGetBusinessTypesQuery({});
    const { data: countriesData, error: isCountriesError } =
        useGetCountriesQuery({});
    const { data: currenciesData, error: isCurrenciesError } =
        useGetCurrenciesQuery({});
    const { data: timezonesData, error: isTimezonesError } =
        useGetTimezonesQuery({});
    const { data: themeStylesData, error: isThemeStyleError } =
        useGetThemeStylesQuery({});
    const [
        createBusiness,
        { error: createBusinessError, isError: isCreateBusinessError },
    ] = useCreateBusinessMutation();
    const { showAlert } = useAlert();

    const [isLoading, setIsLoading] = useState(false);

    const memorizedBusinessTypes = useMemo(() => {
        const businessTypes = businessTypesData?.businessTypes || [];

        return [...businessTypes].sort((a, b) => {
            if (a.id === 'other') return 1;

            return (
                t(`businessTypes.${a.id}` as never, {
                    defaultValue: a.name.toLowerCase(),
                })
                    // @ts-ignore - localeCompare is not recognized by TS
                    .localeCompare(
                        t(`businessTypes.${b.id}` as never, {
                            defaultValue: b.name.toLowerCase(),
                        })
                    )
            );
        });
    }, [businessTypesData, t]);
    const memorizedCountries = useMemo(
        () => countriesData?.countries || [],
        [countriesData]
    );

    const memorizedCurrencies = useMemo(
        () => currenciesData?.currencies || [],
        [currenciesData]
    );
    const memorizedTimezones = useMemo(
        () => timezonesData?.timezones || [],
        [timezonesData]
    );
    const memorizedThemeStyle = useMemo(
        () => themeStylesData?.themeStyles || [],
        [themeStylesData]
    );
    const [userLocale] = getLocales();
    const { regionCode } = userLocale;

    const getCurrencyByCountry = useCallback(
        (countryCode: string | null | undefined) => {
            const country = memorizedCountries.find(
                country => country.code === countryCode
            );

            const currency = memorizedCurrencies.find(
                currency => currency.iso.code === country?.currency
            );

            return currency?.iso.code || '';
        },
        [memorizedCountries, memorizedCurrencies]
    );

    const initialFormValues = useMemo(
        () => ({
            ...createBusinessFormSelector,
            country: createBusinessFormSelector.country || regionCode || '',
            currency:
                createBusinessFormSelector.currency ||
                getCurrencyByCountry(
                    createBusinessFormSelector.country || regionCode
                ),
        }),
        [createBusinessFormSelector, getCurrencyByCountry, regionCode]
    );

    const CreateBusinessOwnerSchema = Yup.object().shape({
        businessName: Yup.string()
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessForm.businessNameLabel'),
                })
            )
            .min(
                3,
                t('formValidations.minCharacters', {
                    fieldName: t('createBusinessForm.businessNameLabel'),
                    length: 3,
                })
            )
            .max(
                25,
                t('formValidations.maxCharacters', {
                    fieldName: t('createBusinessForm.businessNameLabel'),
                    length: 25,
                })
            ),
        businessType: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('createBusinessForm.businessTypeLabel'),
            })
        ),
        country: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('createBusinessForm.countryLabel'),
            })
        ),
        currency: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('createBusinessForm.currencyLabel'),
            })
        ),
        domain: Yup.string()
            .required(
                t('formValidations.required', {
                    fieldName: t('createBusinessForm.domainLabel'),
                })
            )
            .min(
                3,
                t('formValidations.minCharacters', {
                    fieldName: t('createBusinessForm.domainLabel'),
                    length: 3,
                })
            )
            .max(
                25,
                t('formValidations.maxCharacters', {
                    fieldName: t('createBusinessForm.domainLabel'),
                    length: 25,
                })
            )
            .test('isDomain', (value, ctx) => {
                if (value.toLowerCase().includes(appName.toLowerCase())) {
                    return ctx.createError({
                        message: t('formValidations.domainHasAppName', {
                            appName,
                            fieldName: t('createBusinessForm.domainLabel'),
                        }),
                    });
                }

                // Hyphens and letters only
                const domainRegex = /^[a-z-]+[a-z]$/gi;
                if (!domainRegex.test(value)) {
                    return ctx.createError({
                        message: t('formValidations.domainInvalidCharacters', {
                            fieldName: t('createBusinessForm.domainLabel'),
                        }),
                    });
                }

                return true;
            }),
        themeStyle: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('createBusinessForm.themeStyleLabel'),
            })
        ),
        timezone: Yup.string().required(
            t('formValidations.required', {
                fieldName: t('createBusinessForm.timezoneLabel'),
            })
        ),
    });

    const handleInputChange = useCallback(
        (
            handleInputChange: FormikHandlers['handleChange'],
            fieldName: keyof UserProgressState['createBusinessForm']
        ) =>
            (inputValue: string) => {
                handleInputChange(fieldName)(inputValue);
                dispatch(
                    setCreateBusinessFormField({
                        field: fieldName,
                        value: inputValue,
                    })
                );
            },
        [dispatch]
    );

    const handleCountryChange = useCallback(
        (
            handleInputChange: FormikHandlers['handleChange'],
            fieldName: keyof UserProgressState['createBusinessForm'],
            {
                setFieldValue,
            }: {
                setFieldValue: FormikHelpers<
                    UserProgressState['createBusinessForm']
                >['setFieldValue'];
            }
        ) =>
            (option: RadioGroupOption) => {
                handleInputChange(fieldName)(option.value);

                // Set currency based on selected country
                const currency = getCurrencyByCountry(option.value);
                setFieldValue('currency', currency);

                dispatch(
                    setCreateBusinessFormField({
                        field: fieldName,
                        value: option.value,
                    })
                );

                dispatch(
                    setCreateBusinessFormField({
                        field: 'currency',
                        value: currency,
                    })
                );
            },
        [dispatch, getCurrencyByCountry]
    );

    const handleRadioModalChange = useCallback(
        (
            handleInputChange: FormikHandlers['handleChange'],
            fieldName: keyof UserProgressState['createBusinessForm']
        ) =>
            (option: RadioGroupOption) => {
                handleInputChange(fieldName)(option.value);
                dispatch(
                    setCreateBusinessFormField({
                        field: fieldName,
                        value: option.value,
                    })
                );
            },
        [dispatch]
    );

    const handlePreviewModalChange = useCallback(
        (
            handleInputChange: FormikHandlers['handleChange'],
            fieldName: keyof UserProgressState['createBusinessForm']
        ) =>
            (option: PreviewDemoOption) => {
                handleInputChange(fieldName)(option.value);
                dispatch(
                    setCreateBusinessFormField({
                        field: fieldName,
                        value: option.value,
                    })
                );
            },
        [dispatch]
    );

    const handleSubmit = useCallback(
        async (values: UserProgressState['createBusinessForm']) => {
            try {
                setIsLoading(true);
                const business = await createBusiness({
                    input: {
                        business_type: values.businessType,
                        country: values.country,
                        currency: values.currency,
                        domain: values.domain,
                        name: values.businessName,
                        theme_style: values.themeStyle,
                        timezone: values.timezone,
                    },
                });

                if (!business.error) {
                    if (business.data?.createBusiness?.business_pk) {
                        dispatch(
                            setIsBusinessCreated({
                                business_pk:
                                    business.data.createBusiness.business_pk,
                            })
                        );
                        goNextPage();
                    } else {
                        showAlert({
                            message: t('appCrash.businessNotFound'),
                            title: t('appCrash.title'),
                        });
                        Sentry.captureMessage(
                            'Error when creating business: business_pk is missing'
                        );

                        return;
                    }
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Create business error:', error);
            }
        },
        [createBusiness, dispatch, goNextPage, showAlert, t]
    );

    const isErrorWithFetching =
        isBusinessTypesError ||
        isCountriesError ||
        isCurrenciesError ||
        isTimezonesError ||
        isThemeStyleError;

    if (isErrorWithFetching) {
        console.error('Error with fetching:', isErrorWithFetching);

        return null;
    }

    return (
        <>
            <Formik<UserProgressState['createBusinessForm']>
                initialValues={testInitialFormikValues || initialFormValues}
                onSubmit={handleSubmit}
                validateOnBlur
                validationSchema={CreateBusinessOwnerSchema}
            >
                {({
                    errors,
                    handleBlur,
                    handleChange,
                    isSubmitting,
                    setFieldValue,
                    submitForm,
                    touched,
                    values,
                }) => {
                    // Set currency based on selected country on first render
                    if (memorizedCountries.length) {
                        const currency = getCurrencyByCountry(values.country);
                        if (currency !== values.currency) {
                            setFieldValue('currency', currency);
                        }
                    }

                    const handleSubmit = () => {
                        !isSubmitting && submitForm();
                    };

                    const bottomButtons = () => {
                        return [
                            <Button
                                background={'ctaPrimary'}
                                isLoading={isLoading}
                                key="next"
                                loadingSpinnerColor={
                                    theme.color.text.ctaPrimary
                                }
                                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                                onPress={handleSubmit}
                                testID={'create-business-next-btn'}
                                variant={'filled'}
                            >
                                <Text
                                    color={'ctaPrimary'}
                                    fontFamily={'body.regular'}
                                    fontSize={'body'}
                                >
                                    {capitalizeFirstLetter(t('common.next'))}
                                </Text>
                            </Button>,
                        ];
                    };

                    return (
                        <>
                            {isCreateBusinessError && (
                                <>
                                    <Alert
                                        presentationStyle={'absolute'}
                                        type={'error'}
                                    >
                                        {translateErrorMessage({
                                            businessError:
                                                createBusinessError as BusinessApiError,
                                            name: (
                                                createBusinessError as BusinessApiError
                                            ).name,
                                            t,
                                        })}
                                    </Alert>
                                </>
                            )}

                            <ScrollView
                                contentContainerStyle={styles.contentContainer}
                                keyboardShouldPersistTaps="handled"
                                style={styles.rootContainer}
                                testID={'scroll-view'}
                            >
                                <Input
                                    description={t(
                                        'createBusinessForm.businessNameDescription'
                                    )}
                                    error={
                                        !!errors.businessName &&
                                        touched.businessName
                                    }
                                    errorMessage={errors.businessName}
                                    label={capitalizeFirstLetter(
                                        t(
                                            'createBusinessForm.businessNameLabel'
                                        )
                                    )}
                                    onBlur={handleBlur('businessName')}
                                    onChangeText={handleInputChange(
                                        handleChange,
                                        'businessName'
                                    )}
                                    placeholder={t(
                                        'createBusinessForm.businessNamePlaceholder'
                                    )}
                                    testID={'business-name-input'}
                                    type={'text'}
                                    value={values.businessName}
                                    variant={'outlined'}
                                />

                                <Input
                                    autoComplete="url"
                                    description={t(
                                        'createBusinessForm.domainDescription'
                                    )}
                                    error={!!errors.domain && touched.domain}
                                    errorMessage={errors.domain}
                                    label={capitalizeFirstLetter(
                                        t('createBusinessForm.domainLabel')
                                    )}
                                    onBlur={handleBlur('domain')}
                                    onChangeText={handleInputChange(
                                        handleChange,
                                        'domain'
                                    )}
                                    placeholder={t(
                                        'createBusinessForm.domainPlaceholder'
                                    )}
                                    prefix={appUrl}
                                    testID={'domain-input'}
                                    type={'prefix'}
                                    value={values.domain}
                                    variant={'outlined'}
                                />

                                <Input
                                    behavior={'open-radio-modal'}
                                    error={
                                        !!errors.businessType &&
                                        touched.businessType
                                    }
                                    errorMessage={errors.businessType}
                                    label={capitalizeFirstLetter(
                                        t(
                                            'createBusinessForm.businessTypeLabel'
                                        )
                                    )}
                                    modalTitle={capitalizeFirstLetter(
                                        t(
                                            'createBusinessForm.businessTypeModalTitle'
                                        )
                                    )}
                                    onChange={handleRadioModalChange(
                                        handleChange,
                                        'businessType'
                                    )}
                                    options={memorizedBusinessTypes.map(
                                        businessType => ({
                                            label: t(
                                                `businessTypes.${businessType.id}` as never,
                                                {
                                                    defaultValue:
                                                        businessType.name,
                                                }
                                            ),
                                            value: businessType.id,
                                        })
                                    )}
                                    placeholder={capitalizeFirstLetter(
                                        t('common.inputSelectPlaceholder')
                                    )}
                                    sorted={false}
                                    testID={'business-type-input'}
                                    type={'dropdown'}
                                    value={values.businessType}
                                    variant={'outlined'}
                                />

                                <Input
                                    behavior={'open-radio-modal'}
                                    description={t(
                                        'createBusinessForm.countryDescription'
                                    )}
                                    error={!!errors.country && touched.country}
                                    errorMessage={errors.country}
                                    label={capitalizeFirstLetter(
                                        t('createBusinessForm.countryLabel')
                                    )}
                                    modalTitle={capitalizeFirstLetter(
                                        t(
                                            'createBusinessForm.countryModalTitle'
                                        )
                                    )}
                                    onChange={handleCountryChange(
                                        handleChange,
                                        'country',
                                        {
                                            setFieldValue,
                                        }
                                    )}
                                    options={memorizedCountries.map(
                                        country => ({
                                            label: t(
                                                `countries.${country.code}` as never,
                                                {
                                                    defaultValue: country.name,
                                                }
                                            ),
                                            value: country.code,
                                        })
                                    )}
                                    placeholder={capitalizeFirstLetter(
                                        t('common.inputSelectPlaceholder')
                                    )}
                                    testID={'country-input'}
                                    type={'dropdown'}
                                    value={values.country}
                                    variant={'outlined'}
                                />

                                <Input
                                    behavior={'open-radio-modal'}
                                    description={t(
                                        'createBusinessForm.currencyDescription'
                                    )}
                                    error={
                                        !!errors.currency && touched.currency
                                    }
                                    errorMessage={errors.currency}
                                    label={capitalizeFirstLetter(
                                        t('createBusinessForm.currencyLabel')
                                    )}
                                    modalTitle={capitalizeFirstLetter(
                                        t(
                                            'createBusinessForm.currencyModalTitle'
                                        )
                                    )}
                                    onChange={handleRadioModalChange(
                                        handleChange,
                                        'currency'
                                    )}
                                    options={memorizedCurrencies.map(
                                        currency => ({
                                            label: `${currency.iso.code} - ${t(
                                                `currencies.${currency.iso.code}`,
                                                {
                                                    defaultValue: currency.name,
                                                }
                                            )} - ${
                                                currency.units?.major?.symbol
                                                    ? `(${currency.units.major.symbol})`
                                                    : ''
                                            }`,
                                            value: currency.iso.code,
                                        })
                                    )}
                                    placeholder={capitalizeFirstLetter(
                                        t('common.inputSelectPlaceholder')
                                    )}
                                    testID={'currency-input'}
                                    type={'dropdown'}
                                    value={values.currency}
                                    variant={'outlined'}
                                />

                                <Input
                                    behavior={'open-radio-modal'}
                                    description={t(
                                        'createBusinessForm.timezoneDescription'
                                    )}
                                    error={
                                        !!errors.timezone && touched.timezone
                                    }
                                    errorMessage={errors.timezone}
                                    label={capitalizeFirstLetter(
                                        t('createBusinessForm.timezoneLabel')
                                    )}
                                    modalTitle={capitalizeFirstLetter(
                                        t(
                                            'createBusinessForm.timezoneModalTitle'
                                        )
                                    )}
                                    onChange={handleRadioModalChange(
                                        handleChange,
                                        'timezone'
                                    )}
                                    options={memorizedTimezones.map(
                                        timezone => ({
                                            label: `(GMT ${timezone.gmt}) ${t(
                                                `timezones.${timezone.zoneName}` as never,
                                                {
                                                    defaultValue: timezone.name,
                                                }
                                            )}`,
                                            value: timezone.zoneName,
                                        })
                                    )}
                                    placeholder={capitalizeFirstLetter(
                                        t('common.inputSelectPlaceholder')
                                    )}
                                    testID={'timezone-input'}
                                    type={'dropdown'}
                                    value={values.timezone}
                                    variant={'outlined'}
                                />

                                <Input
                                    behavior={'open-preview-modal'}
                                    cancelButtonText={t('common.cancel')}
                                    description={t(
                                        'createBusinessForm.themeStyleDescription'
                                    )}
                                    error={
                                        !!errors.themeStyle &&
                                        touched.themeStyle
                                    }
                                    errorMessage={errors.themeStyle}
                                    imageRatio={211 / 429}
                                    label={capitalizeFirstLetter(
                                        t('createBusinessForm.themeStyleLabel')
                                    )}
                                    modalTitle={capitalizeFirstLetter(
                                        t(
                                            'createBusinessForm.themeStyleModalTitle'
                                        )
                                    )}
                                    onChange={handlePreviewModalChange(
                                        handleChange,
                                        'themeStyle'
                                    )}
                                    options={memorizedThemeStyle.map(
                                        option => ({
                                            image: require('../../assets/images/theme-style/preview.png'),
                                            label: option.name,
                                            value: option.code,
                                        })
                                    )}
                                    placeholder={capitalizeFirstLetter(
                                        t('common.inputSelectPlaceholder')
                                    )}
                                    selectButtonText={t('common.select')}
                                    testID={'theme-style-input'}
                                    type={'dropdown'}
                                    value={values.themeStyle}
                                    variant={'outlined'}
                                />
                            </ScrollView>

                            <BottomButtons
                                backgroundColor={'screen'}
                                buttons={bottomButtons()}
                                useSafeArea={false}
                            />
                        </>
                    );
                }}
            </Formik>
        </>
    );
};

export { CreateBusinessForm };
