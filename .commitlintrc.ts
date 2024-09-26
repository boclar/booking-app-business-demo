import {UserConfig} from '@commitlint/types';

// Ignore commits with the following keywords
const branchesPrefixes = ['feature', 'release', 'hotfix', 'bugfix'];
const ignoresOptions = ['Merge', 'Revert', ...branchesPrefixes];

const Configuration: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    ignores: [(message: string) => ignoresOptions.some(ignore => message.includes(ignore))],
    rules: {
        // I want to enforce first word to be in lower case in body
        'header-case': [2, 'always', 'lower-case'],
        'header-max-length': [2, 'always', 125],
    }
};

export default Configuration;
