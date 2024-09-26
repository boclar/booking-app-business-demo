import React from 'react';
import { ViewProps } from 'react-native';

export interface NavigationHeaderProps extends Pick<ViewProps, 'testID'> {
    /**
     * Whether the back button should be visible
     */
    backButtonVisible?: boolean;
    /**
     * Background color of the header
     */
    backgroundColor?: string;
    /**
     * Component to be rendered on the left side of the header
     */
    headerLeft?: React.ReactNode;
    /**
     * Component to be rendered on the right side of the header
     */
    headerRight?: React.ReactNode;
    /**
     * Callback function to be called when the back button is pressed
     * @default () => router.back()
     */
    onBackPress?: () => void;
    /**
     * Title of the header
     */
    title: string;
}
