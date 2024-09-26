/* eslint-disable react-perf/jsx-no-new-object-as-prop */
import { NavigationHeader } from './navigation-header';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';
import { navigationHeaderMock } from '@/components/navigation-header/navigation-header.mock';
import { Text } from '@boclar/booking-app-components';
import { router } from 'expo-router';

// Variables
const navigationHeaderId = 'navigation-header';
const backButtonId = `${navigationHeaderId}-back-btn`;

jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
}));

describe('<NavigationHeader/>', () => {
    it('should render the navigation header with the title', () => {
        // Arrange
        renderWithContext(
            <NavigationHeader
                {...navigationHeaderMock}
                testID={navigationHeaderId}
            />
        );

        // Act
        const navigationHeader = screen.getByTestId(navigationHeaderId);

        // Assert
        expect(navigationHeader).toBeOnTheScreen();
        expect(screen.getByText(navigationHeaderMock.title)).toBeOnTheScreen();
        expect(screen.getByTestId(backButtonId)).toBeOnTheScreen();
    });

    it('should render the navigation header with the custom left header', () => {
        // Arrange
        renderWithContext(
            <NavigationHeader
                {...navigationHeaderMock}
                headerLeft={<Text>Custom left header</Text>}
                testID={navigationHeaderId}
            />
        );

        // Act
        const navigationHeader = screen.getByTestId(navigationHeaderId);

        // Assert
        expect(navigationHeader).toBeDefined();
    });

    it('should render the navigation header with the custom right header', () => {
        // Arrange
        renderWithContext(
            <NavigationHeader
                {...navigationHeaderMock}
                headerRight={<Text>Custom right header</Text>}
                testID={navigationHeaderId}
            />
        );

        // Act
        const navigationHeader = screen.getByTestId(navigationHeaderId);

        // Assert
        expect(navigationHeader).toBeDefined();
    });

    it('should not render the navigation header with the back button hidden', () => {
        // Arrange
        renderWithContext(
            <NavigationHeader
                {...navigationHeaderMock}
                backButtonVisible={false}
                testID={navigationHeaderId}
            />
        );

        // Assert
        expect(screen.queryByTestId(backButtonId)).not.toBeOnTheScreen();
    });

    it('should call the onBackPress function when the back button is pressed', () => {
        // Arrange
        const onBackPress = jest.fn();
        renderWithContext(
            <NavigationHeader
                {...navigationHeaderMock}
                onBackPress={onBackPress}
                testID={navigationHeaderId}
            />
        );

        // Act
        fireEvent.press(screen.getByTestId(backButtonId));

        // Assert
        expect(onBackPress).toHaveBeenCalled();
    });

    it('should call the router.back function when the back button is pressed', () => {
        // Arrange
        renderWithContext(
            <NavigationHeader
                {...navigationHeaderMock}
                testID={navigationHeaderId}
            />
        );

        // Act
        fireEvent.press(screen.getByTestId(backButtonId));

        // Assert
        expect(router.back).toHaveBeenCalled();
    });
});
