// --require textlint-scripts/register
// Prevent duplicate registration
if (!global.__textlint_scripts_register_loaded) {
    global.__textlint_scripts_register_loaded = true;
    require("./configs/babel-register");
}
