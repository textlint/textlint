const prh = require("prh");
const fs = require("fs");
const path = require("path");
module.exports = function(text) {
    const dict = fs.readFileSync(path.join(__dirname, "prh.yml"), "utf-8");
    const engine = prh.fromYAML("", dict);
    return engine.makeChangeSet("", text);
};
