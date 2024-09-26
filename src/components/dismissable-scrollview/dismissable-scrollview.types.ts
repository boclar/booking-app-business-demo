import { ComponentProps } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

export interface DismissableScrollviewProps
    extends Omit<
        ComponentProps<typeof ScrollView>,
        'onScroll' | 'simultaneousHandlers'
    > {}
