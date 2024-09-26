import { CreateBusinessForm } from './create-business-form';
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';
import { act } from 'expo-router/testing-library';
import * as BusinessApi from '@/types/business-api';
import { setupStore } from '@/redux/store';
import { GlobalContext } from '@/components/global-context';
import * as Localization from 'expo-localization';
import * as Sentry from '@sentry/react-native';

// Variables
const scrollViewId = 'scroll-view';
const submitButtonId = 'create-business-next-btn';
const businessTypeInputId = 'business-type-input';
const businessTypeRadioModalId = 'business-type-input-radio-modal-radio-group';
const businessTypeRadioFirstModalOptionId =
    'business-type-input-radio-modal-radio-group-option-label-0';
const countryInputId = 'country-input';
const domainInputId = 'domain-input';
const themeInputId = 'theme-style-input';

const goNextPageFn = jest.fn();

jest.mock('expo-localization', () => {
    const originalModule = jest.requireActual('expo-localization');

    return {
        ...originalModule,
        getLocales: jest.fn(() => [
            {
                currencyCode: 'CRC',
                currencySymbol: '₡',
                decimalSeparator: ',',
                digitGroupingSeparator: '.',
                languageCode: 'en',
                languageTag: 'es-CR',
                measurementSystem: 'metric',
                regionCode: 'CR',
                temperatureUnit: 'celsius',
                textDirection: 'ltr',
            },
        ]),
    };
});

jest.mock('formik', () => ({
    ...jest.requireActual('formik'),
    useFormikContext: jest.fn(),
}));

jest.restoreAllMocks();
jest.useFakeTimers();

describe('<CreateBusinessForm />', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    it('renders correctly', async () => {
        renderWithContext(<CreateBusinessForm goNextPage={goNextPageFn} />);

        await waitFor(() => {
            expect(screen.getByTestId(scrollViewId)).toBeOnTheScreen();
        });
    });

    it('shows errors when submitting with empty fields', async () => {
        renderWithContext(<CreateBusinessForm goNextPage={goNextPageFn} />);

        // Submit form
        await act(async () => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });

        await waitFor(() => {
            expect(
                screen.getByText('Business name is required')
            ).toBeOnTheScreen();
            expect(
                screen.getByText('Business type is required')
            ).toBeOnTheScreen();

            // These fields should be already filled
            expect(
                screen.queryByText('Country is required')
            ).not.toBeOnTheScreen();

            expect(screen.getByText('Timezone is required')).toBeOnTheScreen();
            expect(screen.getByText('Domain is required')).toBeOnTheScreen();
            expect(screen.getByText('Theme is required')).toBeOnTheScreen();
        });
    });

    it('submits the form with valid data', async () => {
        const store = setupStore({
            initialState: {
                userProgress: {
                    createBusinessForm: {
                        businessName: 'Test Business',
                        businessType: 'Other',
                        country: 'CR',
                        currency: 'CRC',
                        domain: 'test-business',
                        language: 'es',
                        themeStyle: 'i-love-black',
                        timezone: 'US/Central',
                    },
                },
            },
        });

        const createBusinessFn = jest.fn().mockResolvedValue({
            data: {
                createBusiness: {
                    business_pk: 'test-business-pk',
                },
            },
            error: null,
        });

        const useCreateBusinessMutationSpy = jest
            .spyOn(BusinessApi, 'useCreateBusinessMutation')
            .mockReturnValue([createBusinessFn, {} as never]);

        render(
            <GlobalContext store={store}>
                <CreateBusinessForm goNextPage={goNextPageFn} />,
            </GlobalContext>
        );

        // Make sure form is only called once
        await act(() => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });

        await waitFor(() => {
            expect(createBusinessFn).toHaveBeenCalledTimes(1);
            expect(goNextPageFn).toHaveBeenCalledTimes(1);
        });
        useCreateBusinessMutationSpy.mockRestore();
    });

    it('should register an error if business pk cannot be set in redux after being created ', async () => {
        const store = setupStore({
            initialState: {
                userProgress: {
                    createBusinessForm: {
                        businessName: 'Test Business',
                        businessType: 'Other',
                        country: 'CR',
                        currency: 'CRC',
                        domain: 'test-business',
                        language: 'es',
                        themeStyle: 'i-love-black',
                        timezone: 'US/Central',
                    },
                },
            },
        });

        const createBusinessFn = jest.fn().mockResolvedValue({
            data: {
                createBusiness: {},
            },
            error: null,
        });

        const useCreateBusinessMutationSpy = jest
            .spyOn(BusinessApi, 'useCreateBusinessMutation')
            .mockReturnValue([createBusinessFn, {} as never]);

        render(
            <GlobalContext store={store}>
                <CreateBusinessForm goNextPage={goNextPageFn} />,
            </GlobalContext>
        );

        // Make sure form is only called once
        await act(() => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });

        await waitFor(() => {
            expect(createBusinessFn).toHaveBeenCalledTimes(1);
            expect(goNextPageFn).not.toHaveBeenCalledTimes(1);
            expect(Sentry.captureMessage).toHaveBeenNthCalledWith(
                1,
                'Error when creating business: business_pk is missing'
            );
        });
        useCreateBusinessMutationSpy.mockRestore();
    });

    it('form submission fails on request error', async () => {
        const store = setupStore({
            initialState: {
                userProgress: {
                    createBusinessForm: {
                        businessName: 'Test Business',
                        businessType: 'Other',
                        country: 'CR',
                        currency: 'CRC',
                        domain: 'test-business',
                        language: 'es',
                        themeStyle: 'i-love-black',
                        timezone: 'US/Central',
                    },
                },
            },
        });

        const createBusinessFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                name: 'BusinessDomainAlreadyExists',
            },
        });
        jest.spyOn(BusinessApi, 'useCreateBusinessMutation').mockReturnValue([
            createBusinessFn,
            {
                error: {
                    name: 'BusinessDomainAlreadyExists',
                },
                isError: true,
            } as never,
        ]);

        render(
            <GlobalContext store={store}>
                <CreateBusinessForm goNextPage={goNextPageFn} />,
            </GlobalContext>
        );

        // Submit form
        await act(async () => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });

        await waitFor(() => {
            expect(createBusinessFn).toHaveBeenCalledTimes(1);
            expect(goNextPageFn).not.toHaveBeenCalledTimes(1);
        });
    });

    it('shows errors on invalid domain', async () => {
        const formInitialSate = {
            businessName: 'Test Business',
            businessType: 'Other',
            country: 'CR',
            currency: 'CRC',
            domain: `BoClaR`,
            language: 'es',
            themeStyle: 'i-love-black',
            timezone: 'US/Central',
        };
        const store = setupStore({
            initialState: {
                userProgress: {
                    createBusinessForm: formInitialSate,
                },
            },
        });

        render(
            <GlobalContext store={store}>
                <CreateBusinessForm goNextPage={goNextPageFn} />,
            </GlobalContext>
        );

        // Assertion #1
        await act(async () => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });
        await waitFor(() => {
            expect(
                screen.getByText("Domain should not contain the word 'Boclar'")
            ).toBeOnTheScreen();
        });

        // // Assertion #2
        await act(async () => {
            fireEvent.changeText(screen.getByTestId(domainInputId), 'test-');
        });
        await act(async () => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });
        expect(
            screen.getByText('Domain must contain only letters and hyphens')
        ).toBeOnTheScreen();
    });

    it('lets users choose a country', async () => {
        renderWithContext(<CreateBusinessForm goNextPage={goNextPageFn} />);

        await act(async () => {
            fireEvent(screen.getByTestId(countryInputId), 'onChange', {
                label: 'Australia',
                value: 'AU',
            });
        });

        await waitFor(() => {
            expect(screen.getByTestId(countryInputId).props.value).toBe(
                'Australia'
            );
        });
    });

    it('triggers handleRadioModalChange when clicking on the radio modal', async () => {
        renderWithContext(<CreateBusinessForm goNextPage={goNextPageFn} />);

        await act(async () => {
            fireEvent.press(screen.getByTestId(businessTypeInputId));
        });

        await act(async () => {
            await waitFor(() => {
                jest.runOnlyPendingTimers();
            });
        });

        await act(async () => {
            await waitFor(() => {
                expect(
                    screen.getByTestId(businessTypeRadioModalId).props.data[
                        screen.getByTestId(businessTypeRadioModalId).props.data
                            .length - 1
                    ].label
                ).toBe('Other');
                expect(
                    screen.getByTestId(businessTypeRadioFirstModalOptionId)
                ).toBeOnTheScreen();
            });
        });

        await act(async () => {
            fireEvent.press(
                screen.getByTestId(businessTypeRadioFirstModalOptionId)
            );
        });

        await act(async () => {
            expect(screen.getByTestId(businessTypeInputId).props.value).toBe(
                'Barber shop'
            );
        });
    });

    it('triggers handlePreviewModalChange when clicking on the preview modal', async () => {
        renderWithContext(<CreateBusinessForm goNextPage={goNextPageFn} />);

        await act(async () => {
            fireEvent.press(screen.getByTestId(themeInputId));
        });

        await act(async () => {
            fireEvent.press(screen.getByText('Select'));
        });

        await act(async () => {
            expect(screen.getByTestId(themeInputId).props.value).toBe(
                'Brand Colors'
            );
        });
    });

    it('shows an error when no country is selected', async () => {
        jest.spyOn(Localization, 'getLocales').mockReturnValue([
            {
                currencyCode: 'CRC',
                currencySymbol: '₡',
                decimalSeparator: ',',
                digitGroupingSeparator: '.',
                languageCode: 'en',
                languageTag: 'es-CR',
                measurementSystem: 'metric',
                regionCode: '',
                temperatureUnit: 'celsius',
                textDirection: 'ltr',
            },
        ]);

        const store = setupStore({
            initialState: {
                userProgress: {
                    createBusinessForm: {
                        businessName: '',
                        businessType: '',
                        country: '',
                        currency: '',
                        domain: '',
                        language: '',
                        themeStyle: '',
                        timezone: '',
                    },
                },
            },
        });

        render(
            <GlobalContext store={store}>
                <CreateBusinessForm goNextPage={goNextPageFn} />,
            </GlobalContext>
        );

        await act(() => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });

        await waitFor(() => {
            expect(screen.getByText('Country is required')).toBeOnTheScreen();
        });
    });

    it('does not render anything if at least one request fails', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => void 0);
        const spyGetCountriesQuery = jest
            .spyOn(BusinessApi, 'useGetCountriesQuery')
            .mockImplementation(() => ({
                data: null,
                error: {
                    name: 'RequestError',
                },
                isLoading: false,
                refetch: jest.fn(),
            }));

        renderWithContext(<CreateBusinessForm goNextPage={goNextPageFn} />);

        await waitFor(() => {
            expect(screen.queryByTestId(scrollViewId)).toBeNull();
        });
        spyGetCountriesQuery.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('triggers catch block when createBusiness throws an error', async () => {
        const store = setupStore({
            initialState: {
                userProgress: {
                    createBusinessForm: {
                        businessName: 'Test Business',
                        businessType: 'Other',
                        country: 'CR',
                        currency: 'CRC',
                        domain: 'test-business',
                        language: 'es',
                        themeStyle: 'i-love-black',
                        timezone: 'US/Central',
                    },
                },
            },
        });

        const createBusinessFn = jest
            .fn()
            .mockRejectedValue(new Error('Test Error'));
        const spyCreateBusiness = jest
            .spyOn(BusinessApi, 'useCreateBusinessMutation')
            .mockReturnValue([createBusinessFn, {} as never]);
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => void 0);

        render(
            <GlobalContext store={store}>
                <CreateBusinessForm goNextPage={goNextPageFn} />,
            </GlobalContext>
        );

        await act(async () => {
            fireEvent.press(screen.getByTestId(submitButtonId));
        });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
        spyCreateBusiness.mockRestore();
    });
});
