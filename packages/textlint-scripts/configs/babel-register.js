/**
 * Transpile by babel in runtime
 *
 * Note: This register does not type-check
 * `textlint-scripts test` type-checks TypeScript with `tsc` before running tests
 */
const fs = require("fs");
const paths = require("../configs/paths");
const useTypeScript = fs.existsSync(paths.appTsConfig);
const babelConfig = require("./babel.config");
require("@babel/register")({
    plugins: babelConfig.plugins,
    presets: babelConfig.presets,
    extensions: useTypeScript ? [".es6", ".es", ".jsx", ".js", ".mjs", ".ts"] : [".es6", ".es", ".jsx", ".js", ".mjs"]
});
