import { CreateBusinessOwnerForm } from './create-business-owner-form';
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';
import { persistor, setupStore } from '@/redux/store';
import { GlobalContext } from '@/components/global-context';
import { initialUserProgressState } from '@/redux/slices/userProgress.slices';
import { act } from 'expo-router/testing-library';
import * as BusinessApi from '@/types/business-api';
import * as StorageUtils from '@/utils/storage/storage.utils';
import * as ErrorHandlingUtils from '@/utils/error-handling/error-handling.utils';
import { DateTime } from 'luxon';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Variables
const rootContainerId = 'root-container';
const phoneNumberId = 'phone-number-input';
const birthdateId = 'birthdate-input';
const birthdateModalId = `${birthdateId}-modal-mobile`;
const acceptTermsId = 'accept-terms-checkbox';
const acceptTermsMarkId = `${acceptTermsId}-checkmark`;
const photoId = 'photo-input';
const nationalityId = 'nationality-input';

const validForm = {
    acceptMarketing: 'true',
    acceptTerms: 'true',
    birthdate: '2000-01-01',
    email: 'test@gmail.com',
    firstname: 'John',
    gender: 'male',
    lastname: 'Doe',
    nationality: 'US',
    password: 'password',
    phoneNumber: '+50689154759',
    profilePicture: 'https://picsum.photos/200',
    repeatPassword: 'password',
    username: 'john_doe',
};

jest.spyOn(StorageUtils, 'storeInAsyncStorage');
jest.spyOn(console, 'error');
const spyTranslateErrorUtil = jest.spyOn(
    ErrorHandlingUtils,
    'translateErrorMessage'
);

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        ...originalModule,
        router: {
            ...originalModule.router,
            replace: jest.fn(),
            push: jest.fn(),
        },
    };
});

jest.useFakeTimers();

const goNextPageFn = jest.fn();
const openTermsBtnId = 'open-terms-and-conditions';
const openPrivacyBtnId = 'open-privacy-policy';

describe('<CreateBusinessOwnerForm />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', async () => {
        renderWithContext(<CreateBusinessOwnerForm />);

        // Triggers nationality input change for passing coverage
        await act(async () => {
            fireEvent.press(screen.getByTestId(nationalityId));
        });

        await act(async () => {
            jest.runAllTimers();
        });

        await waitFor(() => {
            expect(screen.getByTestId(rootContainerId)).toBeOnTheScreen();
        });
    });

    it('submits the form with valid data', async () => {
        const store = setupStore({
            initialState: {
                userProgress: {
                    ...initialUserProgressState,
                    createBusinessOwnerForm: validForm,
                    isBusinessCreated: {
                        business_pk: 'test',
                    },
                },
            },
        });
        const createBusinessOwnerFn = jest.fn().mockResolvedValue({
            data: {
                cognito_user_id: 'test',
            },
            error: null,
        });

        const spyUseCreateBusinessOwnerMutation = jest
            .spyOn(BusinessApi, 'useCreateBusinessOwnerMutation')
            .mockReturnValue([createBusinessOwnerFn, {} as never]);

        render(
            <GlobalContext store={store}>
                <CreateBusinessOwnerForm />
            </GlobalContext>
        );

        // Wait for the form to be fully rendered
        await waitFor(() => {
            expect(screen.getByTestId(rootContainerId)).toBeOnTheScreen();
            expect(screen.getByText('Create business')).toBeOnTheScreen();
        });

        fireEvent.press(screen.getByText('Create business'));
        fireEvent.press(screen.getByText('Create business'));

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledTimes(1);
            // expect(spyStoreInAsyncStorage).toHaveBeenCalledTimes(1);
        });

        spyUseCreateBusinessOwnerMutation.mockRestore();
    });

    it('shows errors when submitting an invalid form', async () => {
        const createBusinessOwnerFn = jest.fn().mockResolvedValue({
            data: null,
            error: true,
        });
        const spyUseCreateBusinessOwnerMutation = jest
            .spyOn(BusinessApi, 'useCreateBusinessOwnerMutation')
            .mockReturnValue([createBusinessOwnerFn, {} as never]);

        const businessOwner = {
            acceptMarketing: '',
            acceptTerms: '',
            birthdate: '',
            email: '',
            firstname: '',
            gender: '',
            lastname: '',
            nationality: '',
            password: '',
            phoneNumber: '+18915',
            profilePicture: '',
            repeatPassword: '',
            username: '',
        };

        const store = setupStore({
            initialState: {
                userProgress: {
                    ...initialUserProgressState,
                    createBusinessOwnerForm: businessOwner,
                },
            },
        });

        render(
            <GlobalContext store={store}>
                <CreateBusinessOwnerForm />
            </GlobalContext>
        );

        // Wait for the form to be fully rendered
        await waitFor(() => {
            expect(screen.getByTestId(rootContainerId)).toBeOnTheScreen();
            expect(screen.getByText('Create business')).toBeOnTheScreen();
        });

        await act(async () => {
            fireEvent.press(screen.getByText('Create business'));
        });

        await waitFor(() => {
            expect(goNextPageFn).toHaveBeenCalledTimes(0);
            expect(
                screen.getByText('Date of birth is required')
            ).toBeOnTheScreen();
            expect(screen.getByText('Email is required')).toBeOnTheScreen();
            expect(
                screen.getByText('First name is required')
            ).toBeOnTheScreen();
            expect(screen.getByText('Gender is required')).toBeOnTheScreen();
            expect(screen.getByText('Last name is required')).toBeOnTheScreen();
            expect(screen.getByText('Password is required')).toBeOnTheScreen();
            expect(screen.getByText('Photo is required')).toBeOnTheScreen();
            expect(
                screen.getByText('Repeat password is required')
            ).toBeOnTheScreen();
            expect(screen.getByText('Username is required')).toBeOnTheScreen();
        });

        spyUseCreateBusinessOwnerMutation.mockRestore();
    });

    it('throws an error when the create business owner request fails', async () => {
        const spyConsoleError = jest.spyOn(console, 'error');
        const createBusinessOwnerFn = jest
            .fn()
            .mockRejectedValue(new Error('Test Error'));
        const spyUseCreateBusinessOwnerMutation = jest
            .spyOn(BusinessApi, 'useCreateBusinessOwnerMutation')
            .mockReturnValue([createBusinessOwnerFn, {} as never]);

        const store = setupStore({
            initialState: {
                userProgress: {
                    ...initialUserProgressState,
                    createBusinessOwnerForm: validForm,
                },
            },
        });

        render(
            <GlobalContext store={store}>
                <CreateBusinessOwnerForm />
            </GlobalContext>
        );

        await act(async () => {
            fireEvent.press(screen.getByText('Create business'));
        });

        await waitFor(() => {
            expect(spyConsoleError).toHaveBeenCalled();
        });

        spyUseCreateBusinessOwnerMutation.mockRestore();
        spyConsoleError.mockRestore();
    });

    it('shows an error when the create business owner request returns an error', async () => {
        const createBusinessOwnerFn = jest.fn().mockResolvedValue({
            data: null,
            error: {
                name: 'TestError',
            },
        });
        const spyUseCreateBusinessOwnerMutation = jest
            .spyOn(BusinessApi, 'useCreateBusinessOwnerMutation')
            .mockReturnValue([createBusinessOwnerFn, {} as never]);

        const store = setupStore({
            initialState: {
                userProgress: {
                    ...initialUserProgressState,
                    createBusinessOwnerForm: validForm,
                    isBusinessCreated: {
                        business_pk: 'test',
                    },
                },
            },
        });

        const { rerender } = render(
            <GlobalContext store={store}>
                <CreateBusinessOwnerForm />
            </GlobalContext>
        );

        await act(async () => {
            fireEvent.press(screen.getByText('Create business'));
        });

        await waitFor(() => {
            expect(goNextPageFn).toHaveBeenCalledTimes(0);
            expect(spyTranslateErrorUtil).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    name: 'TestError',
                })
            );
        });

        spyUseCreateBusinessOwnerMutation.mockRestore();
    });

    it('triggers handleTextInputChange when the phone input is changed', async () => {
        const store = setupStore({
            initialState: {
                userProgress: {
                    ...initialUserProgressState,
                    createBusinessOwnerForm: validForm,
                },
            },
        });

        render(
            <GlobalContext store={store}>
                <CreateBusinessOwnerForm />
            </GlobalContext>
        );

        await act(async () => {
            fireEvent.changeText(screen.getByTestId(phoneNumberId), '');
        });

        await waitFor(() => {
            expect(screen.getByTestId(phoneNumberId)).toHaveProp('value', '');
        });
    });

    it('triggers handleDateChange when the birthdate input is changed', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'ios');
        renderWithContext(<CreateBusinessOwnerForm />);

        await act(async () => {
            fireEvent(screen.getByTestId(birthdateId), 'press');
        });

        await act(async () => {
            fireEvent(
                screen.getByTestId(birthdateModalId),
                'onConfirm',
                new Date()
            );
        });

        const formattedDate = DateTime.fromISO(
            new Date().toISOString()
        ).toLocaleString(DateTime.DATE_FULL);
        await waitFor(() => {
            expect(screen.getByTestId(birthdateId)).toHaveProp(
                'value',
                formattedDate
            );
        });
        platformSpy.restore();
    });

    it('triggers handleCheckboxChange when the accept terms checkbox is changed', async () => {
        renderWithContext(<CreateBusinessOwnerForm />);

        await act(async () => {
            fireEvent(screen.getByTestId(acceptTermsId), 'press');
        });

        await act(async () => {
            expect(screen.getByTestId(acceptTermsMarkId)).toBeOnTheScreen();
        });
    });

    it('triggers handlePhotoChange when the photo input is changed', async () => {
        const { rerender } = renderWithContext(<CreateBusinessOwnerForm />);

        const mockPhoto = {
            height: 100,
            mimeType: 'image/jpeg',
            uri: 'file://path/to/photo.jpg',
            width: 100,
        };

        fireEvent(screen.getByTestId(photoId), 'onChange', mockPhoto);

        await act(async () => {
            rerender(
                <GlobalContext>
                    <CreateBusinessOwnerForm />,
                </GlobalContext>
            );
        });

        // Triggers the photo input change to remove the photo
        await act(async () => {
            fireEvent(screen.getByTestId(photoId), 'onChange', undefined);
        });

        expect(screen.getByTestId(photoId)).toBeOnTheScreen();
    });

    it('opens the terms and conditions screen correctly', async () => {
        renderWithContext(<CreateBusinessOwnerForm />);

        await act(async () => {
            fireEvent.press(screen.getByTestId(openTermsBtnId));
        });

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledTimes(1);
        });
    });

    it('opens the privacy policy screen correctly', async () => {
        renderWithContext(<CreateBusinessOwnerForm />);

        await act(async () => {
            fireEvent.press(screen.getByTestId(openPrivacyBtnId));
        });

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledTimes(1);
        });
    });
});
