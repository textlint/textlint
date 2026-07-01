// --require textlint-scripts/register-ts
// Prevent duplicate registration
if (!global.__textlint_scripts_register_ts_loaded) {
    global.__textlint_scripts_register_ts_loaded = true;
    require("./configs/ts-node-register");
}
