import { ViewProps, ViewStyle } from 'react-native';

export interface ModalCloseIndicatorProps extends Omit<ViewProps, 'children'> {
    style?: ViewStyle;
}
