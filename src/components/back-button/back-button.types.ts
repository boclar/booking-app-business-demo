import { ViewProps, ViewStyle } from 'react-native';

export interface BackButtonProps extends Pick<ViewProps, 'testID'> {
    /**
     * Callback to be called when the back button is pressed
     */
    onPress?: () => void;
    /**
     * Size of the back button
     * @default 24
     */
    size?: number;
    /**
     * Style to be applied to the back button parent pressable
     */
    style?: ViewStyle;
}
