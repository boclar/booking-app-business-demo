import 'dotenv/config';
import type { IGraphQLConfig } from 'graphql-config';
import { loadEnvConfig } from '@next/env';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const config: IGraphQLConfig = {
    schema: [
        {
            [process.env.EXPO_PUBLIC_GRAPHQL_API_URL as string]: {
                headers: {
                    'x-api-key': process.env.EXPO_PUBLIC_GRAPHQL_API_KEY as string,
                },
            },
        },
    ],
    documents: [
        'src/**/*.ts',
        'src/**/*.tsx',
    ],
};
export default config;
