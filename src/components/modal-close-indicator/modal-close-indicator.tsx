import { View } from 'react-native';
import { ModalCloseIndicatorProps } from './modal-close-indicator.types';
import { modalCloseIndicatorStyles } from './modal-close-indicator.styles';
import { useTheme } from '@boclar/booking-app-components';

/**
 * Renders a close indicator for a modal.
 */
const ModalCloseIndicator = ({ ...props }: ModalCloseIndicatorProps) => {
    const { theme } = useTheme();
    const styles = modalCloseIndicatorStyles({
        theme,
    });

    return (
        <View
            style={styles.rootContainer}
            {...props}
        />
    );
};

export { ModalCloseIndicator };
