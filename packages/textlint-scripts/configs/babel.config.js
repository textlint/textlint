const fs = require("fs");
const { useTypeScript, useESModules } = require("./conditions.js");
const NO_INLINE = !!process.env.NO_INLINE;
module.exports = {
    presets: useESModules
        // If use native ES Modules, don't transpile
        ? []
        // transpile for Node.js CJS
        : [
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
    plugins: NO_INLINE
        ? []
        : [
            // inline fs content
            "static-fs"
        ]
};
