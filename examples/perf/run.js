// LICENSE : MIT
"use strict";
// run as app
const cli = require("textlint").cli;
cli.execute(process.argv.concat(`${__dirname  }/md/`))
    .then(function (exit) {
        console.log(exit);
    })
    .catch(function (error) {
        console.error(error);
    });
