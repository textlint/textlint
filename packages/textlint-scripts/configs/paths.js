const fs = require("node:fs");
const path = require("node:path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
module.exports = {
    appTsConfig: resolveApp("tsconfig.json")
};
