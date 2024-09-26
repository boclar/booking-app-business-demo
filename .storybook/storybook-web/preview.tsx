import type { Preview } from '@storybook/react';
import React from 'react';
import { GlobalContext } from '../../src/components/global-context/global-context';

const preview: Preview = {
    decorators: [
        (Story: React.FC) => (
            <GlobalContext>
                <Story />
            </GlobalContext>
        ),
    ],
    parameters: {
        controls: {
            expanded: true,
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },

};

export default preview;
