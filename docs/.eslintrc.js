module.exports = {
    "plugins": [
        "markdown"
    ],
    "rules": {
        /*
        loose for document
         */
        "no-console": 0,
        "no-unused-vars": 0,
        "no-undef": 0,
        "no-empty-function": 0
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "../.eslintrc.js"
};
