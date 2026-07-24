const fs = require("node:fs");
const paths = require("../configs/paths");
const useTypeScript = fs.existsSync(paths.appTsConfig);
const NO_INLINE = !!process.env.NO_INLINE;
module.exports = {
    presets: [
        [
            "@babel/env",
            {
                targets: {
                    // Same version with textlint's supported Node.js version
                    node: "18.14.0"
                },
                // It will be defaulted in Babel 8
                // https://babeljs.io/docs/babel-preset-env#bugfixes
                bugfixes: true,
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
