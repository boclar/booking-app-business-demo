import {
    render,
    screen,
    waitFor,
    act,
    fireEvent,
} from '@testing-library/react-native';
import { Subscription } from './subscription.web';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';
import { setupStore } from '@/redux/store';
import * as BusinessApi from '@/types/business-api';
import { router } from 'expo-router';
import { mswServer } from '../../../config/jest-mocks/msw.server';
import * as Sentry from '@sentry/react-native';
import { http } from 'msw';

jest.useFakeTimers();

interface PaypalButtonsProps {
    createSubscription: (data: any, actions: any) => void;
    onApprove: (data: any) => void;
}

jest.mock('@paypal/react-paypal-js', () => {
    const originalModule = jest.requireActual('@paypal/react-paypal-js');
    const Pressable = require('react-native').Pressable;
    return {
        ...originalModule,
        PayPalScriptProvider: ({ children }: { children: React.ReactNode }) =>
            children,
        PayPalButtons: (props: PaypalButtonsProps) => {
            const handleCreateSubscription = async () => {
                const actions = {
                    subscription: {
                        create: jest.fn(),
                    },
                };

                try {
                    await props.createSubscription({}, actions);
                    await props.onApprove({});
                } catch (error) {
                    console.error('[JEST] Error subscribing', error);
                }
            };

            return (
                <Pressable
                    onPress={handleCreateSubscription}
                    testID="paypal-button"
                >
                    Test Paypal Button
                </Pressable>
            );
        },
    };
});

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');

    return {
        ...originalModule,
        router: {
            replace: jest.fn(),
        },
    };
});

const reduxStoreWithBusiness = setupStore({
    initialState: {
        user: {
            business: {
                PK: 'business',
            },
        },
    },
});

const subscriptionId = 'subscription';
const subscriptionCycleSwitchId = `${subscriptionId}-cycle-switch`;
const paypalButtonId = 'paypal-button';

describe('<Subscription /> for web', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        const subscribeFn = jest.fn().mockResolvedValue({
            data: {},
            error: null,
        });
        jest.spyOn(BusinessApi, 'useSubscribeMutation').mockReturnValue([
            subscribeFn,
            {},
        ] as any);
    });

    it('should render component correctly', async () => {
        render(
            <WithAuthContext>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
            expect(screen.getByText('Monthly')).toBeOnTheScreen();
        });
    });

    it('should change subscription cycle', async () => {
        render(
            <WithAuthContext>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
            expect(screen.getByText('Monthly')).toBeOnTheScreen();
        });

        await act(() => {
            fireEvent.press(screen.getByTestId(subscriptionCycleSwitchId));
        });

        await waitFor(() => {
            expect(screen.getByText('Yearly')).toBeOnTheScreen();
        });
    });

    it('should allow user to subscribe', async () => {
        const subscribeFn = jest.fn().mockResolvedValue({
            data: {},
            error: null,
        });
        jest.spyOn(BusinessApi, 'useSubscribeMutation').mockReturnValue([
            subscribeFn,
            {},
        ] as any);

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

        await act(() => {
            fireEvent.press(subscribeButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId(paypalButtonId)).toBeOnTheScreen();
            fireEvent.press(screen.getByTestId(paypalButtonId));
        });

        expect(subscribeFn).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledTimes(1);
    });

    it('should register an error if not possible to subscribe due to business pk', async () => {
        render(
            <WithAuthContext>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
        });

        const subscribeButtons = screen.getAllByText('Subscribe');
        const subscribeButton = subscribeButtons[0];

        await act(() => {
            fireEvent.press(subscribeButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId(paypalButtonId)).toBeOnTheScreen();
            fireEvent.press(screen.getByTestId(paypalButtonId));
        });

        expect(Sentry.captureMessage).toHaveBeenCalled();
    });

    it('should catch errors if not possible to get subscription plans from Paypal', async () => {
        mswServer.use(
            http.get(
                'https://api-m.sandbox.paypal.com/v1/billing/plans',
                ({ request }) => {
                    throw new Error('Error getting subscription plans');
                }
            )
        );

        render(
            <WithAuthContext>
                <Subscription testID={subscriptionId} />
            </WithAuthContext>
        );

        await waitFor(() => {
            expect(screen.getByTestId(subscriptionId)).toBeOnTheScreen();
            expect(screen.getByText('Monthly')).toBeOnTheScreen();
        });

        expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    });

    it('should register an error if subscription fails while approving', async () => {
        const subscribeFn = jest.fn().mockResolvedValue({
            data: {},
            error: new Error('Error subscribing'),
        });
        const useSubscribeMutationMock = jest
            .spyOn(BusinessApi, 'useSubscribeMutation')
            .mockReturnValue([subscribeFn, {}] as any);

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

        await act(() => {
            fireEvent.press(subscribeButton);
        });

        await waitFor(() => {
            expect(screen.getByTestId(paypalButtonId)).toBeOnTheScreen();
            fireEvent.press(screen.getByTestId(paypalButtonId));
        });

        expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        useSubscribeMutationMock.mockRestore();
    });
});
