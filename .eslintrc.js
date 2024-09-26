module.exports = {
    env: {
        browser: true,
        jest: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-native/all',
        // 'prettier',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:testing-library/react',
    ],
    root: true,
    plugins: [
        '@typescript-eslint',
        'react',
        'react-native',
        'perfectionist',
        'jest',
        'testing-library',
        'unused-imports',
        'i18next',
        'react-perf',
        'react-hooks',
        'sort-destructure-keys',
    ],
    rules: {
        'comma-dangle': [
            'error',
            {
                arrays: 'only-multiline',
                objects: 'only-multiline',
                imports: 'only-multiline',
                exports: 'only-multiline',
                functions: 'only-multiline',
            },
        ],
        '@typescript-eslint/array-type': ['error', { default: 'array' }],
        '@typescript-eslint/ban-ts-comment': [
            'error',
            {
                minimumDescriptionLength: 25,
                'ts-check': 'allow-with-description',
                'ts-expect-error': 'allow-with-description',
                'ts-ignore': 'allow-with-description',
                'ts-nocheck': 'allow-with-description',
            },
        ],
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-explicit-any': [
            'error',
            { ignoreRestArgs: true },
        ],
        'newline-before-return': 'error',
        'no-console': ['error', { allow: ['error', 'warn'] }],
        'no-duplicate-imports': 'error',
        'no-empty-function': 'error',
        'sort-keys': ['error', 'asc', { natural: true }],
        'no-case-declarations': 'off',
        'react-native/split-platform-components': 'off',
        // Enforce consistent usage of destructuring assignment of props, state, and context
        'react/destructuring-assignment': ['error', 'always'],
        // Enforces consistent naming for boolean props
        'react/boolean-prop-naming': 'error',
        // Enforce consistent linebreaks in curly braces in JSX attributes and expressions
        'react/jsx-curly-newline': 'off',
        // Enforce props indentation in JSX
        'react/jsx-indent-props': ['error', 4],
        // Require or prevent a new line after jsx elements and expressions.
        'react/jsx-newline': 'error',
        // Disallow extra closing tags for components without children
        'react/self-closing-comp': 'error',
        // // Enforce component methods order
        'react/sort-comp': 'error',
        // Enforce event handler naming conventions in JSX
        'react/jsx-handler-names': 'error',
        // Enforce shorthand or standard form for React fragments
        'react/jsx-fragments': ['error', 'syntax'],
        // Enforce boolean attributes notation in JSX
        'react/jsx-boolean-value': ['error', 'never'],
        // Disallow React to be incorrectly marked as unused
        'react/jsx-uses-react': 'off',
        // Detect raw text outside of Text component
        'react-native/no-raw-text': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'perfectionist/sort-interfaces': [
            'error',
            {
                type: 'natural',
                order: 'asc',
            },
        ],
        // Disallow passing of children as props
        'react/no-children-prop': 'error',
        // Enforce props alphabetical sorting
        'react/jsx-sort-props': [
            'error',
            {
                callbacksLast: false,
                shorthandFirst: false,
                multiline: 'ignore',
                ignoreCase: true,
                noSortAlphabetically: false,
                reservedFirst: false,
                locale: 'auto',
            },
        ],
        // Enforce sorted import declarations within modules
        'sort-imports': [
            'error',
            {
                ignoreCase: true,
                ignoreDeclarationSort: true,
                ignoreMemberSort: true,
                memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
                allowSeparatedGroups: false,
            },
        ],
        // Sort interfaces and types alphabetically
        '@typescript-eslint/member-ordering': [
            'error',
            {
                default: {
                    memberTypes: [
                        'signature',
                        'field',
                        'constructor',
                        'method',
                    ],
                    order: 'alphabetically',
                },
            },
        ],
        // Require StyleSheet keys to be sorted
        'react-native/sort-styles': ['error', 'asc'],
        'no-restricted-imports': ['warn', {
            paths: [
                {
                    name: 'react-native',
                    importNames: ['Text', 'TextProps', 'Button', 'ButtonProps'],
                    message: 'Please import from `components` instead',
                },
            ],
        }],
        'prefer-destructuring': ['error', {
            'array': true,
            'object': true,
        }, {
            'enforceForRenamedProperties': false,
        }],
        'jest/consistent-test-it': ['error', { 'fn': 'it' }],
        // Require the use of `===` and `!==`
        eqeqeq: ['error', 'smart'],
        'jest/no-conditional-expect': 'off',
        'jest/expect-expect': 'error',
        'react/jsx-max-props-per-line': ['error', { 'maximum': 1, 'when': 'always' }],
        'unused-imports/no-unused-imports': 'error',
        'multiline-comment-style': ['error', 'starred-block'],
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react-perf/jsx-no-new-object-as-prop': 'error',
        'react-perf/jsx-no-new-array-as-prop': 'error',
        'react-perf/jsx-no-new-function-as-prop': 'error',
        'react-perf/jsx-no-jsx-as-prop': 'off',
        'sort-destructure-keys/sort-destructure-keys': [2, { 'caseSensitive': false }],
        'testing-library/no-wait-for-multiple-assertions': 'off',
        'testing-library/no-unnecessary-act': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: ['/*', '!/src/', '*.json'],
};
