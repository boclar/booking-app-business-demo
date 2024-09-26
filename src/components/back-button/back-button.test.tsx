import { BackButton } from './back-button';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';
import { act } from 'expo-router/testing-library';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
}));

// Variables
const backButtonId = 'backButton';

describe('<BackButton />', () => {
    it('renders correctly', async () => {
        renderWithContext(<BackButton testID={backButtonId} />);

        await act(async () => {
            expect(screen.getByTestId(backButtonId)).toBeOnTheScreen();
        });
    });

    it('calls the onPress function when the back button is pressed', () => {
        const onPress = jest.fn();
        renderWithContext(
            <BackButton
                onPress={onPress}
                testID={backButtonId}
            />
        );
        fireEvent.press(screen.getByTestId(backButtonId));
        expect(onPress).toHaveBeenCalled();
    });

    it('calls the router.back function when the back button is pressed', () => {
        renderWithContext(<BackButton testID={backButtonId} />);
        fireEvent.press(screen.getByTestId(backButtonId));
        expect(router.back).toHaveBeenCalled();
    });
});
