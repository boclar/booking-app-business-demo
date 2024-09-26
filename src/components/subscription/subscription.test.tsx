import { Subscription } from './subscription';
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';
import { isRunningInExpoGo } from 'expo';
import { setupStore } from '@/redux/store';
import Purchases from 'react-native-purchases';
import { revenueCatOfferings } from './subscription.mock';
import { router } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { mswServer } from '../../../config/jest-mocks/msw.server';
import { graphql, HttpResponse } from 'msw';
import { Platform } from 'react-native';

jest.mock('expo', () => {
    const originalExpo = jest.requireActual('expo');
    return {
        ...originalExpo,
        isRunningInExpoGo: jest.fn(),
    };
});

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

jest.useFakeTimers();

const reduxStoreWithBusiness = setupStore({
    initialState: {
        user: {
            business: {
                PK: 'businessPK',
            },
        },
    },
});

const mockedIsRunningInExpoGo = isRunningInExpoGo as jest.Mock;
const mockedPurchases = Purchases as jest.Mocked<typeof Purchases>;

// Variables
const subscriptionId = 'subscription';
const cycleSwitchId = `${subscriptionId}-cycle-switch`;

describe('<Subscription />', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.replaceProperty(Platform, 'OS', 'ios');
        mockedIsRunningInExpoGo.mockReturnValue(false);
        mockedPurchases.getOfferings.mockResolvedValue(revenueCatOfferings);
    });

    it('should render subscription cards correctly', async () => {
        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await act(() => {
            jest.runAllTimers();
        });
        expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        expect(screen.getByText('Monthly')).toBeOnTheScreen();
    });

    it('should catch errors when fetching subscription plans', async () => {
        mockedPurchases.getOfferings.mockRejectedValueOnce({
            error: 'error',
        });

        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should not get offerings when running on a platform os different than ios or android', async () => {
        jest.replaceProperty(Platform, 'OS', 'web');
        mockedIsRunningInExpoGo.mockReturnValue(true);

        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        expect(Purchases.getOfferings).not.toHaveBeenCalled();
    });

    it('should change from monthly to yearly subscription', async () => {
        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const cycleSwitch = screen.getByTestId(cycleSwitchId);
        expect(cycleSwitch).toBeOnTheScreen();

        await act(async () => {
            fireEvent.press(cycleSwitch);
        });

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
            expect(screen.getByText('Yearly')).toBeOnTheScreen();
        });
    });

    it('should handle subscribe correctly', async () => {
        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const subscribeButtons = screen.getAllByText('Subscribe');
        const subscribeButton = subscribeButtons[0];

        await act(async () => {
            fireEvent.press(subscribeButton);
        });

        expect(router.replace).toHaveBeenCalledWith('/home');
    });

    it('should catch errors correctly when user is subscribing', async () => {
        mockedPurchases.purchasePackage.mockRejectedValueOnce({
            error: 'error',
        });

        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const subscribeButtons = screen.getAllByText('Subscribe');
        const subscribeButton = subscribeButtons[0];

        await act(async () => {
            fireEvent.press(subscribeButton);
        });

        expect(router.replace).not.toHaveBeenCalled();
        expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should not trigger any error when making a purchase but got cancelled', async () => {
        mockedPurchases.purchasePackage.mockRejectedValueOnce({
            userCancelled: true,
        });

        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const subscribeButtons = screen.getAllByText('Subscribe');
        const subscribeButton = subscribeButtons[0];

        await act(async () => {
            fireEvent.press(subscribeButton);
        });

        expect(router.replace).not.toHaveBeenCalled();
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should not trigger any error when business PK is not found', async () => {
        const reduxStoreWithoutBusiness = setupStore({
            initialState: {
                user: {
                    business: {},
                },
            },
        });

        render(
            <WithAuthContext store={reduxStoreWithoutBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const subscribeButtons = screen.getAllByText('Subscribe');
        const subscribeButton = subscribeButtons[0];

        await act(async () => {
            fireEvent.press(subscribeButton);
        });

        expect(router.replace).not.toHaveBeenCalled();
        expect(Sentry.captureMessage).toHaveBeenCalled();
    });

    it('should catch errors when subscribe request fails', async () => {
        mswServer.use(
            graphql.mutation('Subscribe', params => {
                return HttpResponse.json({
                    errors: [
                        {
                            message: 'Error subscribing',
                        },
                    ],
                });
            })
        );

        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const subscribeButtons = screen.getAllByText('Subscribe');
        const subscribeButton = subscribeButtons[0];

        await act(async () => {
            fireEvent.press(subscribeButton);
        });

        expect(router.replace).not.toHaveBeenCalled();
        expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should show discount price when available', async () => {
        render(
            <WithAuthContext store={reduxStoreWithBusiness}>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const subscriptionEssentialMonthlyCard = screen.getByTestId(
            `${subscriptionId}-essential_monthly`
        );

        expect(subscriptionEssentialMonthlyCard).toBeOnTheScreen();
        expect(screen.getByText('29.99')).toBeOnTheScreen();
        expect(screen.getByText('34.99')).toBeOnTheScreen();
    });
});
