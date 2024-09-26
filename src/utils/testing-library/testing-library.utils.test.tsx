import {
    renderRouterWithContext,
    renderWithContext,
    renderHookWithContext,
} from './testing-library.utils';
import { Text } from '@boclar/booking-app-components';
import { textMock } from '@boclar/booking-app-components/src/components/atoms/text/text.mock';
import { screen } from '@testing-library/react-native';
import { useLocale } from '@/hooks/useLocale/useLocale';
import { act } from 'expo-router/testing-library';

const textId = 'text';

describe('Testing Library Utils', () => {
    describe('renderWithContext', () => {
        it('renders correctly', async () => {
            renderWithContext(
                <Text
                    testID={textId}
                    {...textMock}
                >
                    Test
                </Text>
            );
            await act(async () => {
                expect(screen.getByTestId(textId)).toBeDefined();
            });
        });
    });

    describe('renderRouterWithContext', () => {
        it('renders correctly', () => {
            renderRouterWithContext({
                index: () => (
                    <Text
                        testID={textId}
                        {...textMock}
                    >
                        Test
                    </Text>
                ),
            });
            expect(screen.getByTestId(textId)).toBeDefined();
        });
    });

    describe('renderHookWithContext', () => {
        it('renders correctly', () => {
            const { result } = renderHookWithContext(() => useLocale());
            expect(result.current).toBeDefined();
        });
    });
});
