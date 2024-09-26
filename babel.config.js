// process.env.EXPO_ROUTER_APP_ROOT = './src/app';

module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            '@babel/plugin-proposal-export-default-from',
            'react-native-reanimated/plugin',
            '@babel/plugin-transform-block-scoping',
        ],
        env: {
            test: {
                plugins: ['require-context-hook'],
            },
        },
    };
};
