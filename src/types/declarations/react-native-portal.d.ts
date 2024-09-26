// Augment the module to add or extend specific types
import 'react-native-portal';

declare module 'react-native-portal' {
    import { ReactNode, FC } from 'react';

    interface BlackPortalProps {
        children: ReactNode;
        name: string;
    }

    // New component declaration
    const BlackPortal: FC<BlackPortalProps>;
}
