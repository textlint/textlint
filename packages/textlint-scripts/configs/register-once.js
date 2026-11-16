/**
 * Install a runtime transpiler hook at most once per process.
 *
 * `babel-register` and `ts-node-register` both hook `.ts` files.
 * When both are installed, ts-node type-checks the JavaScript that Babel emitted
 * and fails with errors such as "TS7006: Parameter 'e' implicitly has an 'any' type".
 * This happens when `textlint-scripts test` (which requires babel-register)
 * is combined with `--require textlint-scripts/register-ts` in `.mocharc.*`.
 *
 * The first register wins and later ones do nothing.
 * The flag lives on `globalThis` so that it is shared even when
 * textlint-scripts is loaded from different paths in the same process.
 * See https://github.com/textlint/textlint/issues/781
 */
const kRegistered = Symbol.for("textlint-scripts/register");

/**
 * @param {string} name name of the register, kept for debugging
 * @param {() => void} register function that installs the hook
 */
module.exports = function registerOnce(name, register) {
    if (globalThis[kRegistered]) {
        return;
    }
    register();
    // Set the flag after `register()` so that a failed register is retried and throws again
    globalThis[kRegistered] = name;
};
