import { GlobalContext } from './global-context';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from '@boclar/booking-app-components';
import { Platform } from 'react-native';
import * as Constants from '@/constants/app.constants';

describe('<GlobalContext />', () => {
    it('renders correctly', async () => {
        const isJestEnvSpy = jest
            .spyOn(Constants, 'isJestEnv')
            .mockReturnValue(false);

        render(
            <GlobalContext>
                <Text
                    color={'body'}
                    fontFamily={'body.regular'}
                    fontSize={'body'}
                >
                    Global Context
                </Text>
            </GlobalContext>
        );
        await waitFor(() => {
            expect(screen.getByText('Global Context')).toBeTruthy();
        });

        isJestEnvSpy.mockRestore();
    });

    it('renders desktop theme', async () => {
        const isJestEnvSpy = jest
            .spyOn(Constants, 'isJestEnv')
            .mockReturnValue(true);

        const originalPlatformOS = Platform.OS;
        Platform.OS = 'web';

        render(
            <GlobalContext>
                <Text>Global Context</Text>
            </GlobalContext>
        );

        await waitFor(() => {
            expect(screen.getByText('Global Context')).toBeTruthy();
        });
        Platform.OS = originalPlatformOS;

        isJestEnvSpy.mockRestore();
    });
});
