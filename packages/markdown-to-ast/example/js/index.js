// LICENSE : MIT
"use strict";
var input = document.getElementById("js-input"),
    output = document.getElementById("js-output");
var parser = require("../../").parse;
input.addEventListener("keyup", function (event) {
    var value = event.target.value;
    var AST = parser(value);
    output.value = JSON.stringify(AST, null, 4);
});