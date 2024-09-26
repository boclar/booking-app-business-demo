import { DismissableScrollview } from './dismissable-scrollview';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';
import { Text } from '@boclar/booking-app-components';
import { Platform } from 'react-native';

// Variables
const dismissableScrollviewId = 'dismissable-scrollview';

describe('<DismissableScrollview />', () => {
    it('renders correctly', () => {
        renderWithContext(
            <DismissableScrollview testID={dismissableScrollviewId}>
                <Text>Test</Text>
            </DismissableScrollview>
        );
        expect(screen.getByText('Test')).toBeOnTheScreen();
        expect(screen.getByTestId(dismissableScrollviewId)).toBeOnTheScreen();
    });

    it('should not have either onScroll or simultaneousHandlers props when Platform.OS is web', () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'web');

        renderWithContext(
            <DismissableScrollview testID={dismissableScrollviewId}>
                <Text>Test</Text>
            </DismissableScrollview>
        );

        expect(screen.getByTestId(dismissableScrollviewId)).toHaveProp(
            'onScroll',
            undefined
        );
        expect(screen.getByTestId(dismissableScrollviewId)).toHaveProp(
            'simultaneousHandlers',
            undefined
        );

        platformSpy.restore();
    });

    it('should have onScroll and simultaneousHandlers props when Platform.OS is not web', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'ios');

        renderWithContext(
            <DismissableScrollview testID={dismissableScrollviewId}>
                <Text>Test</Text>
            </DismissableScrollview>
        );

        await act(() => {
            fireEvent.scroll(screen.getByTestId(dismissableScrollviewId), {
                nativeEvent: {
                    contentOffset: {
                        y: 50,
                    },
                },
            });
        });

        expect(screen.getByTestId(dismissableScrollviewId)).toHaveProp(
            'onScroll'
        );
        expect(screen.getByTestId(dismissableScrollviewId)).toHaveProp(
            'simultaneousHandlers'
        );

        platformSpy.restore();
    });
});
