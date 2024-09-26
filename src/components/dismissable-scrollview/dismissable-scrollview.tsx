import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
} from 'react-native';
import { DismissableScrollviewProps as DismissibleScrollviewProps } from './dismissable-scrollview.types';
import React, { useState } from 'react';
import { GestureHandlerRefContext } from '@react-navigation/stack';
import { ScrollView } from 'react-native-gesture-handler';

/**
 * A scrollview that can be dismissed by dragging down from the top when it is displayed in a modal
 */
const DismissableScrollview = ({
    children,
    ...props
}: DismissibleScrollviewProps) => {
    const [isOnTop, setIsOnTop] = useState(true);

    const onScrollViewScroll = (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        const offset = event.nativeEvent.contentOffset.y;
        const newValue = offset <= 20;

        isOnTop !== newValue && setIsOnTop(newValue);
    };

    return (
        <GestureHandlerRefContext.Consumer>
            {ref => (
                <ScrollView
                    bounces={false}
                    onScroll={
                        Platform.OS !== 'web' ? onScrollViewScroll : undefined
                    }
                    scrollEventThrottle={16}
                    simultaneousHandlers={
                        Platform.OS !== 'web' && isOnTop ? ref : undefined
                    }
                    {...props}
                >
                    {children}
                </ScrollView>
            )}
        </GestureHandlerRefContext.Consumer>
    );
};

export { DismissableScrollview };
