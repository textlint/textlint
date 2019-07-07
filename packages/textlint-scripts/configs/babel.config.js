const fs = require("fs");
const paths = require("../configs/paths");
const useTypeScript = fs.existsSync(paths.appTsConfig);
module.exports = {
    presets: [
        [
            "@babel/env",
            {
                // For async/await support
                // https://babeljs.io/docs/en/babel-preset-env#targetsesmodules
                targets: {
                    esmodules: true
                }
            }
        ]
    ].concat(useTypeScript ? [["@babel/preset-typescript"]] : []),
    plugins: [
        // inline fs content
        "static-fs"
    ]
};
