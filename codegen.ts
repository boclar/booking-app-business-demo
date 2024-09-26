import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: {
        [process.env.EXPO_PUBLIC_GRAPHQL_API_URL as string]: {
            headers: {
                'x-api-key': process.env.EXPO_PUBLIC_GRAPHQL_API_KEY as string,
            },
        },
    },
    documents: ['src/**/*.ts', 'src/**/*.tsx'],
    generates: {
        './src/types/business-api.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-resolvers',
                {
                    'typescript-rtk-query': {
                        exportHooks: true,
                        overrideExisting: true,
                        importBaseApiFrom: '../services/business-services/business-rtk-query',
                    },
                },
            ],
            config: {
                skipTypename: true,
            }
        },
    },
    watch: false,
};

export default config;
