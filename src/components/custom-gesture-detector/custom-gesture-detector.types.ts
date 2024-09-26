import { ViewProps } from 'react-native';

export interface CustomGestureDetectorProps
    extends Pick<ViewProps, 'testID' | 'children'> {}
