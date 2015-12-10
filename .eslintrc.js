module.exports = {
    "plugins": [
        "markdown"
    ],
    "rules": {
        "indent": [
            2,
            4
        ],
        "quotes": [
            2,
            "double"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ],
        "no-console": 0,
        "no-unused-vars": 0,
        "no-undef": 0
    },
    "ecmaFeatures": {
        "modules": true
    },
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended"
};