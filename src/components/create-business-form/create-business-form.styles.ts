import { StyleSheet } from 'react-native';

export const createBusinessFormStyles = () => {
    return StyleSheet.create({
        contentContainer: {
            gap: 24,
            paddingBottom: 40,
            paddingTop: 20,
        },
        rootContainer: {
            flex: 1,
            paddingHorizontal: 20,
        },
    });
};
