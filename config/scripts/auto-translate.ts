require('dotenv').config();
import { promisify } from 'util';
const exec = promisify(require('child_process').exec);
import { languages } from '../../src/constants/languages.constants';

const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_API_URL;
const graphqlApiKey = process.env.EXPO_PUBLIC_GRAPHQL_API_KEY;
const deeplApiKey = process.env.EXPO_PUBLIC_DEEPL_API_KEY;

if (!graphqlUrl) throw new Error('Graphql Api Url is not defined in .env file.');
if (!graphqlApiKey) throw new Error('Graphql Api Key is not defined in .env file.');
if (!deeplApiKey) throw new Error('Deepl Api Key is not defined in .env file.');

const automateFileTranslation = async () => {
    // Delete all files in src/locales except en.json. This is to ensure all translations are up-to-format.
    const fs = require('fs');
    const path = require('path');
    const directory = 'src/locales';
    fs.readdir(directory, (err: any, files: any) => {
            if (err) throw err;
            for (const file of files) {
                if (file !== 'en.json') {
                    fs.unlink(path.join
                    (directory, file), (err: any) => {
                        if (err) throw err;
                    });
                }
            }
        },
    );

    const countryCodesList = languages
        .filter((item: object) => (item as any).code !== 'en')
        .map((item: object) => (item as any).code);

    let i18nResources: { [key: string]: any } = {};
    for (const code of countryCodesList) {
        const cmd = `npx i18n-auto-translation --apiProvider=deepl-pro --key=${deeplApiKey} --from=en --to=${code} --filePath=src/locales/en.json`;
        try {
            const { stdout, stderr } = await exec(cmd);
            console.info('stdout:', stdout);
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        } catch (error: any) {
            console.error(`error: ${error?.message}`);
        }
    }

};

automateFileTranslation();
