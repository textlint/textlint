import esmA from "../textlint-rule-esm-a/index.js";
import esmB from "../textlint-rule-esm-b/index.js";
export default {
    rules: {
        "esm-a": esmA,
        "esm-b": esmB
    },
    rulesConfig: {
        "esm-a": true,
        "esm-b": true
    }
};
