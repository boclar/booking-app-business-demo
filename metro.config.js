// Learn more https://docs.expo.io/guides/customizing-metro
// const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');
const {generate} = require('@storybook/react-native/scripts/generate');
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withSentryConfig } = require("@sentry/react-native/metro");

generate({
    configPath: path.resolve(__dirname, './.storybook'),
});

/** @type {import('expo/metro-config').MetroConfig} */
// const config = getDefaultConfig(__dirname);
const config = getSentryExpoConfig(__dirname);

// Storybook requires these settings to be set
config.transformer.unstable_allowRequireContext = true;
config.resolver.sourceExts.push('mjs');

// Storybook web
config.resolver.resolverMainFields.unshift("sbmodern");

// React Native SVG Transformer
config.transformer.babelTransformerPath = require.resolve(
    'react-native-svg-transformer'
);
config.resolver.assetExts = config.resolver.assetExts.filter(
    ext => ext !== 'svg'
);
config.resolver.sourceExts.push('svg');

module.exports = withSentryConfig(config, {
    annotateReactComponents: true,
  });
