#!/usr/bin/env node
/* eslint-disable no-process-exit,no-console */
const spawn = require("cross-spawn");
const script = process.argv[2];
const args = process.argv.slice(3);

switch (script) {
    case "init":
    case "build":
    case "test":
        var result = spawn.sync(
            "node",
            [require.resolve("../scripts/" + script)].concat(args),
            {stdio: "inherit"}
        );
        process.exit(result.status);
        break;
    default:
        console.log("Unknown script \"" + script + "\".");
        console.log("Perhaps you need to update textlint-scripts?");
        break;
}
