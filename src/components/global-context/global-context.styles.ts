import { GlobalContextProps } from './global-context.types';
import { StyleSheet } from 'react-native';

interface GlobalContextStylesProps {
    props: Omit<GlobalContextProps, 'children'>;
}

export const globalContextStyles = (params: GlobalContextStylesProps) =>
    StyleSheet.create({
        container: {
            borderRadius: params ? 0 : 0,
        },
    });
