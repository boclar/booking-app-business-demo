import { Avatar } from './avatar';
import { screen, waitFor } from '@testing-library/react-native';
import { renderWithContext } from '@/utils/testing-library/testing-library.utils';

// Variables
const avatarId = 'avatar';

describe('<Avatar />', () => {
    it('renders correctly', async () => {
        renderWithContext(<Avatar testID={avatarId} />);
        await waitFor(() => {
            expect(screen.getByTestId(avatarId)).toBeTruthy();
        });
    });
});
