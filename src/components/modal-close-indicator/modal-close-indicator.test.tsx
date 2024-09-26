import { ModalCloseIndicator } from './modal-close-indicator';
import { modalCloseIndicatorMock } from './modal-close-indicator.mock';
import { screen } from '@testing-library/react-native';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';

// Variables
const modalCloseIndicatorId = 'modal-close-indicator';

describe('<ModalCloseIndicator />', (): void => {
    it('renders correctly', (): void => {
        renderWithContext(
            <ModalCloseIndicator testID={modalCloseIndicatorId} />
        );
        expect(screen.getByTestId(modalCloseIndicatorId)).toBeOnTheScreen();
    });
});
