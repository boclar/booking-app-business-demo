import { BackButtonProps } from './back-button.types';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@boclar/booking-app-components';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

/**
 * Back button component
 */
const BackButton = ({ onPress, size = 24, style, testID }: BackButtonProps) => {
    const { theme } = useTheme();

    const goBack = useCallback(() => {
        router.back();
    }, []);

    const handleGoBack = onPress ? onPress : goBack;

    return (
        <Pressable
            onPress={handleGoBack}
            style={style}
            testID={testID}
        >
            <ArrowLeft
                color={theme.color.text.screenHeaderTitle}
                onPress={handleGoBack}
                size={size}
            />
        </Pressable>
    );
};

export { BackButton };
