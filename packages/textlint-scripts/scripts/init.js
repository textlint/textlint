// LICENSE : MIT
"use strict";
var pkgToReadme = require("pkg-to-readme");
var path = require("path");
var confirmer = require("confirmer");
var fs = require("fs");
// Update README.md
var templatePath = path.resolve(__dirname, "..", "configs", "README.md.template");
Promise.resolve()
    .then(function() {
        if (!fs.existsSync(path.resolve("README.md"))) {
            return;
        }
        return confirmer("Would you overwrite README.md? (y/n)").then(function(result) {
            return result ? Promise.resolve() : Promise.reject(new Error("Not overwrite"));
        });
    })
    .then(function() {
        return pkgToReadme({
            template: templatePath
        });
    })
    .then(function() {
        console.log("Generated README.md");
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });
