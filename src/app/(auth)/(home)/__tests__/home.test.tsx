import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';
import {
    act,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';

describe('Home screen', () => {
    it('renders screen correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app',
                overrides: {},
            },
            {
                initialUrl: '/home',
                wrapper: WithAuthContext,
            }
        );

        await act(async () => {
            expect(screen).toHavePathname('/home');
        });
    });
});
