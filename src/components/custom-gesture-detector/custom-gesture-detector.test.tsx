import { CustomGestureDetector } from './custom-gesture-detector';
import { act, screen, waitFor } from '@testing-library/react-native';
import {
    renderWithAuthContext,
    WithAuthContext,
} from '@/utils/testing-library/testing-library.utils';
import {
    fireGestureHandler,
    getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { TapGesture } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/tapGesture';
import { State } from 'react-native-gesture-handler';
import * as ExpoRouter from 'expo-router';
import * as UseAuthHook from '@/hooks/use-auth/use-auth.hooks';
import { AuthenticationContextProps } from '@/context/authentication/authentication.context';

// Mock usePathname hook
jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        ...originalModule,
        router: {
            navigate: jest.fn(),
        },
        usePathname: jest.fn(() => '/'),
    };
});

// Variables
const customGestureDetectorId = 'custom-gesture-detector';

jest.useFakeTimers();

const customWrapper = ({ children }: { children: React.ReactNode }) => (
    <WithAuthContext>{children}</WithAuthContext>
);

describe('<CustomGestureDetector />', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(UseAuthHook, 'useAuth').mockReturnValue({
            isLogged: true,
        } as AuthenticationContextProps);
    });

    afterAll(() => {
        jest.runAllTimers();
    });

    it('renders correctly', async () => {
        jest.spyOn(ExpoRouter, 'usePathname').mockReturnValue('/report-issue');

        renderWithAuthContext(
            <CustomGestureDetector testID={customGestureDetectorId} />,
            {
                wrapper: customWrapper,
            }
        );

        await waitFor(() => {
            expect(
                screen.getByTestId(customGestureDetectorId)
            ).toBeOnTheScreen();
        });
    });

    it('navigates to report issue screen on double tap', async () => {
        renderWithAuthContext(
            <CustomGestureDetector testID={customGestureDetectorId} />,
            {
                wrapper: customWrapper,
            }
        );

        await waitFor(async () => {
            await act(async () => {
                fireGestureHandler<TapGesture>(
                    getByGestureTestId('double-tap'),
                    [
                        { state: State.BEGAN, numberOfPointers: 1 },
                        { state: State.ACTIVE, numberOfPointers: 1 },
                        { numberOfPointers: 1 },
                        { numberOfPointers: 1 },
                        { state: State.END, numberOfPointers: 1 },
                    ]
                );
                expect(ExpoRouter.router.navigate).toHaveBeenCalledWith(
                    '/report-issue'
                );
            });
            expect(ExpoRouter.router.navigate).toHaveBeenCalledWith(
                '/report-issue'
            );
        });
    });

    it('should still render the gesture detector when the user is not logged in', async () => {
        jest.spyOn(UseAuthHook, 'useAuth').mockReturnValue({
            isLogged: false,
        } as AuthenticationContextProps);

        renderWithAuthContext(
            <CustomGestureDetector testID={customGestureDetectorId} />
        );

        await waitFor(() => {
            expect(
                screen.queryByTestId(customGestureDetectorId)
            ).toBeOnTheScreen();
        });
    });
});
