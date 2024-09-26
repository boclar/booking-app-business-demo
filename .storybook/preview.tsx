import React from 'react';
import type { Preview } from '@storybook/react';

const preview: Preview = {
    decorators: [
        (Story: React.FC) => (
                <Story />
        ),
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
};

export default preview;
