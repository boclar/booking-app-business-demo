import { StorybookConfig } from '@storybook/react-webpack5';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const config: StorybookConfig = {
    stories: ['../../src/components/back-button/back-button.stories.tsx'],
    addons: [
        '@storybook/addon-essentials',
        {
            name: '@storybook/addon-react-native-web',
            options: {
                modulesToTranspile: ['react-native-reanimated'],
                babelPlugins: [
                    '@babel/plugin-proposal-export-namespace-from',
                    'react-native-reanimated/plugin',
                ],
            },
        },
    ],
    core: {
        builder: '@storybook/builder-webpack5',
    },
    framework: '@storybook/react-webpack5',
    typescript: {
        reactDocgen: 'react-docgen',
    },
    webpackFinal: async (config, { configType }) => {
        if (config.resolve) {
            config.resolve.plugins = [new TsconfigPathsPlugin()];
        }

        config.plugins?.push(new NodePolyfillPlugin());

        // Make storybook understand svg files
        if (config.module?.rules) {
            config.module.rules = config.module.rules.map((rule) => {
                const webpackRule = rule as any;
                if (webpackRule.test?.test('.svg')) {
                    const newRegexStr = webpackRule.test.source.replace('svg|', '');
                    const newRegex = new RegExp(newRegexStr, newRegexStr.flags);
                    return {
                        ...webpackRule,
                        test: newRegex,
                    };
                }

                return webpackRule;
            });

            config.target = ['web', 'es5'];

            config.module.rules.push({
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            });

            // Add a rule to handle TypeScript files
            config.module.rules.push({
                test: /node_modules\/@boclar\/booking-app-components\/.*\.(ts|tsx)$/,
                // exclude: /node_modules/,
                use: [
                    // {
                    //     loader: 'ts-loader',
                    //     options: {
                    //         transpileOnly: true,
                    //     },
                    // },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react',
                                '@babel/preset-typescript',
                            ],
                            plugins: [
                                '@babel/plugin-proposal-class-properties',
                                '@babel/plugin-proposal-object-rest-spread',
                                '@babel/plugin-transform-runtime',
                                'react-native-web'
                            ],
                        },
                    },
                ],
            });


            // config.module.rules.push({
            //     test: /\.(ts|tsx)$/,
            //     use: [
            //         {
            //             loader: require.resolve('ts-loader'),
            //             options: {
            //                 allowTsInNodeModules: true,
            //                 transpileOnly: true,
            //             }
            //         }
            //     ]
            // });

            // config.module.rules.push({
            //     test: /\.(ts|tsx)$/,
            //     exclude: /node_modules/,
            //     use: [
            //         {
            //             loader: 'babel-loader',
            //             options: {
            //                 presets: [
            //                     '@babel/preset-env',
            //                     '@babel/preset-react',
            //                     '@babel/preset-typescript',
            //                 ],
            //                 plugins: [
            //                     '@babel/plugin-proposal-class-properties',
            //                     '@babel/plugin-proposal-object-rest-spread',
            //                     '@babel/plugin-transform-runtime',
            //                     'react-native-web'
            //                 ],
            //             },
            //         },
            //         {
            //             loader: 'ts-loader',
            //             options: {
            //                 transpileOnly: true,
            //             },
            //         },
            //     ],
            // });

            // Add a rule to process TypeScript files within specific node_modules
            // config.module.rules.push({
            //     test: /\.(ts|tsx)$/,
            //     include: /node_modules\/@boclar\/booking-app-components/,
            //     use: [
            //         {
            //             loader: 'babel-loader',
            //             options: {
            //                 presets: [
            //                     '@babel/preset-env',
            //                     '@babel/preset-react',
            //                     '@babel/preset-typescript',
            //                 ],
            //                 plugins: [
            //                     '@babel/plugin-proposal-class-properties',
            //                     '@babel/plugin-proposal-object-rest-spread',
            //                     '@babel/plugin-transform-runtime',
            //                     'react-native-web'
            //
            //                 ],
            //             },
            //         },
            //         {
            //             loader: 'ts-loader',
            //             options: {
            //                 transpileOnly: true,
            //             },
            //         },
            //     ],
            // });
        }

        return config;
    },
};

export default config;
