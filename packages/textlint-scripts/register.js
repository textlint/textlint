// --require textlint-scripts/register
// Prevent duplicate registration.
// Node.js require cache handles most cases, but in monorepos with symlinked
// node_modules or npm link, the same logical module may resolve to different
// absolute paths, bypassing the cache. This global flag covers that edge case.
if (!global.__textlint_scripts_register_loaded) {
    require("./configs/babel-register");
    global.__textlint_scripts_register_loaded = true;
}
