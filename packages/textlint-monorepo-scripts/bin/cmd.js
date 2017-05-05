#!/usr/bin/env node
const spawn = require("cross-spawn");
const script = process.argv[2];
const args = process.argv.slice(3);
/* eslint-disable */
switch (script) {
    case "build-js":
    case "build-ts":
    case "test":
        const result = spawn.sync(
            "node",
            [require.resolve("../scripts/" + script)].concat(args),
            { stdio: "inherit" }
        );
        process.exit(result.status);
        break;
    default:
        console.log("Unknown script " + script + ".");
        console.log("Perhaps you need to update textlint-scripts?");
        break;
}
