## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description](#description)
- [Requirements](#requirements)
- [Installation](#installation)
- [Install Packages](#install-packages)
- [See components in action (Storybook)](#see-components-in-action-storybook)

## Description

This project consists of reusable components that can be used in any React Native application.

## Requirements

- This project is limited to the following versions:
    - "node": ">=20.0.0",
    - "yarn": "Use YARN instead of NPM",

## Installation

```
yarn install
yarn start
```

## Install Packages

Expo provides a command to install packages that ensure backwards compatibility. Avoid using yarn install or npm
install, at it is least strictly required.

```
npm expo install [package-name] --yarn
```

or 

```
yarn expo install [package-name]
```

## See components in action (Storybook)

You can see a list of components in action by running the following command:

`for web`

```
    yarn storybook:web
```

`for mobile`

```
    yarn storybook:android or npm run storybook:ios
```

## Generating translations files

There is a command you can use for automating the process of generating translation files, which will execute a custom
script, and use DEEPL as a translation service.

```
    yarn auto-translate
```

#### Update a specific key

Keys that are already in the document will not automatically be translated as they are already in the document. If you
want to update a specific key, you need to remove it from the en.json file and run the command again, and once key has
been deleted from all the files, you can add it back to the en.json file and run the command again.

This will cause the key to be considered as a new addition and will be translated.

For now, this will be disabled, and instead we are  executing a `fs` command that is removing all files from the locales, and generating them again.
