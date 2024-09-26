import { setupStore } from '@/redux/store';
import { SubscribeResponseStatus } from '@/types/business-api';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

const subscribeScreenId = 'subscribe-screen';

describe('Subscribe screen', () => {
    it('renders screen correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app/(auth)/(subscribe)',
                overrides: {},
            },
            {
                initialUrl: '/subscribe',
                wrapper: WithAuthContext,
            }
        );
        await waitFor(() => {
            expect(screen).toHavePathname('/subscribe');
        });
    });

    it('should not render screen if business has active subscription', async () => {
        const store = setupStore({
            initialState: {
                user: {
                    business: {
                        subscription: {
                            status: SubscribeResponseStatus.Active,
                        },
                    },
                },
            },
        });
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WithAuthContext store={store}>{children}</WithAuthContext>
        );

        renderRouter(
            {
                appDir: 'src/app/(auth)',
                overrides: {},
            },
            {
                initialUrl: '/subscribe',
                wrapper,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/home');
        });
    });
});
