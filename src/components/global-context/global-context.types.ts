import React from 'react';
import { store } from '@/redux/store';

export interface GlobalContextProps {
    /**
     * The children to be wrapped by the global context.
     */
    children: React.ReactNode;
    /**
     * The store to be used by the global context. Used for testing purposes.
     */
    store?: typeof store;
}
