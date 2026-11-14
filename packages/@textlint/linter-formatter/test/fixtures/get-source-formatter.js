// A custom formatter that outputs the content from getSource
module.exports = function (results, options) {
    return results.map((result) => options.getSource(result.filePath)).join("\n");
};
