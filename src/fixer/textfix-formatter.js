// LICENSE : MIT
"use strict";
const textlintCreateFormatter = require("textlint-formatter");
import compat from "./formatters/compats";
export default function createFormatter(formatterConfig) {
    if (formatterConfig.formatterName) {
        return textlintCreateFormatter(formatterConfig);
    }
    return compat;
}
