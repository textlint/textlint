const fs = require("fs");
const paths = require("../configs/paths");
const useTypeScript = fs.existsSync(paths.appTsConfig);
const NO_INLINE = !!process.env.NO_INLINE;
module.exports = {
    presets: [
        [
            "@babel/env",
            {
                // For async/await support
                // https://babeljs.io/docs/en/babel-preset-env#targetsesmodules
                targets: {
                    esmodules: true
                },
                // Allow to use native `import()` for loading ESM modules
                // https://github.com/babel/babel/issues/10194
                // TODO: It will not required in Babel 8
                exclude: ["proposal-dynamic-import"]
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
