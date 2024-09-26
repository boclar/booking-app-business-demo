import { StyleSheet } from 'react-native';

export const customGestureDetectorStyles = () => {
    return StyleSheet.create({
        alert: {
            borderRadius: 4,
            paddingVertical: 16,
        },
        fitScreen: {
            flex: 1,
        },
    });
};
