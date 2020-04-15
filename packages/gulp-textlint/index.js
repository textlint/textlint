const log = require("fancy-log");
const PluginError = require("plugin-error");
const through = require("through2");
const TextLintEngine = require("textlint").TextLintEngine;

module.exports = function (options) {
    options = options || {};
    const textlint = new TextLintEngine(options);
    const filePaths = [];

    return through.obj(
        function (file, enc, cb) {
            filePaths.push(file.path);
            this.push(file);
            cb();
        },
        function (cb) {
            const that = this;
            textlint
                .executeOnFiles(filePaths)
                .then(function (results) {
                    if (textlint.isErrorResults(results)) {
                        log(textlint.formatResults(results));
                        that.emit("error", new PluginError("textlint", "Lint failed."));
                    }
                })
                .catch(function (error) {
                    that.emit("error", new PluginError("textlint", `Lint failed. \n${error.message}`));
                })
                .then(function () {
                    cb();
                });
        }
    );
};
