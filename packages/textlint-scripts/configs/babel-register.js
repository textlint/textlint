/**
 * Transpile by babel in runtime
 *
 * Note: This register does not type-check
 * Please use --require textlint-scripts/register-ts instead of it
 */
const fs = require("fs");
const paths = require("../configs/paths");
const useTypeScript = fs.existsSync(paths.appTsConfig);
const babelConfig = require("./babel.config");
require("@babel/register")({
    plugins: babelConfig.plugins,
    presets: babelConfig.presets,
    extensions: useTypeScript
        ? [".es6", ".es", ".jsx", ".js", ".cjs", ".mjs", ".ts", ".mts", ".cts"]
        : [".es6", ".es", ".jsx", ".js", ".cjs", ".mjs"]
});
