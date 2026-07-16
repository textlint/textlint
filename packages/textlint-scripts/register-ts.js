// --require textlint-scripts/register-ts
// Prevent duplicate registration.
// Node.js require cache handles most cases, but in monorepos with symlinked
// node_modules or npm link, the same logical module may resolve to different
// absolute paths, bypassing the cache. This global flag covers that edge case.
if (!global.__textlint_scripts_register_ts_loaded) {
    require("./configs/ts-node-register");
    global.__textlint_scripts_register_ts_loaded = true;
}
