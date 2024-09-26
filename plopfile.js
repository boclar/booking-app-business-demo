module.exports = plop => {
    plop.setGenerator('generate:component', {
        description: 'Generate a component',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'What is the component name?:',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: 'src/components/{{dashCase name}}',
                templateFiles: 'config/plop-templates/component/*',
                base: 'config/plop-templates/component/',
            },
        ],
    });

    plop.setGenerator('generate:screen', {
        description: 'Generate a screen',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'What is the screen name?:',
            },
            {
                type: 'path',
                name: 'path',
                message:
                    'Path in src/app directory? (e.g. (no-auth)/(login), onboarding, (auth)):',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: 'src/app/{{path}}',
                templateFiles: 'config/plop-templates/screen/**',
                base: 'config/plop-templates/screen/',
            },
        ],
    });

    // plop.setGenerator('generate:util', {
    //     description: 'Generate a screen',
    //     prompts: [
    //         {
    //             type: 'input',
    //             name: 'name',
    //             message: 'What is the screen name?:',
    //         },
    //         {
    //             type: 'path',
    //             name: 'path',
    //             message: 'Path in src/app directory? (e.g. (no-auth)/(login), onboarding, (auth)):'
    //         }
    //     ],
    //     actions: [
    //         {
    //             type: 'addMany',
    //             destination: 'src/app/{{path}}',
    //             templateFiles: 'config/plop-templates/screen/**',
    //             base: 'config/plop-templates/screen/',
    //         },
    //     ],
    // });

    plop.setGenerator('generate:plural-generic', {
        description: 'Generate a plural generic structure',
        prompts: [
            {
                type: 'list',
                name: 'type',
                message:
                    'What is the type of generated structure you want to create?',
                choices: ['Util', 'Hook'],
            },
            {
                type: 'input',
                name: 'name',
                message: 'What is the generated structure name?',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: 'src/{{dashCase type}}s/{{dashCase name}}',
                templateFiles:
                    'config/plop-templates/plural-generic-structure/*',
                base: 'config/plop-templates/plural-generic-structure/',
            },
        ],
    });

    plop.setGenerator('generate:singular-generic', {
        description: 'Generate a singular generic structure',
        prompts: [
            {
                type: 'list',
                name: 'type',
                message:
                    'What is the type of generated structure you want to create?',
                choices: ['Context'],
            },
            {
                type: 'input',
                name: 'name',
                message: 'What is the generated structure name?',
            },
        ],
        actions: [
            {
                type: 'addMany',
                destination: 'src/{{dashCase type}}/{{dashCase name}}',
                templateFiles:
                    'config/plop-templates/singular-generic-structure/*',
                base: 'config/plop-templates/singular-generic-structure/',
            },
        ],
    });
};
