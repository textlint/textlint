/**
 * Expose node:test as Mocha-style globals.
 *
 * `textlint-tester` and many existing rule tests use the global `describe` and `it`.
 * This file defines them on `globalThis` with `node:test`, so these tests keep working without Mocha.
 *
 * Supported Mocha-style features:
 * - describe/context, it/specify, before/after/beforeEach/afterEach
 * - `.only` and `.skip`
 * - callback style tests: `it("name", function (done) { ... })`
 * - `this.timeout()`, `this.slow()`, and `this.skip()` in test and hook functions
 */
const nodeTest = require("node:test");

const GLOBALS_FLAG = Symbol.for("textlint-scripts/node-test-globals");

/**
 * Create a `this` object for Mocha-style functions.
 * @param {import("node:test").TestContext | undefined} t
 */
const createMochaContext = (t) => {
    const context = {
        timeout() {
            // node:test cannot change the timeout of a running test.
            // Use `textlint-scripts test --test-timeout=<ms>` instead.
            return context;
        },
        slow() {
            return context;
        },
        skip(message) {
            if (t && typeof t.skip === "function") {
                t.skip(message);
            }
            const error = new Error("Skipped by this.skip()");
            error[GLOBALS_FLAG] = "skip";
            throw error;
        }
    };
    return context;
};

const isSkipSignal = (error) => Boolean(error && error[GLOBALS_FLAG] === "skip");

/**
 * Convert a Mocha-style function to a node:test function.
 * Mocha passes `done` as the first argument, while node:test passes the test context.
 * @param {Function | undefined} fn
 */
const wrapTestFunction = (fn) => {
    if (typeof fn !== "function") {
        return fn;
    }
    if (fn.length >= 1) {
        // Mocha callback style: function (done) { ... }
        // node:test treats a function with two parameters as callback style.
        return function (t, done) {
            const mochaDone = (error) => {
                if (isSkipSignal(error)) {
                    done();
                    return;
                }
                done(error);
            };
            try {
                fn.call(createMochaContext(t), mochaDone);
            } catch (error) {
                mochaDone(error);
            }
        };
    }
    return async function (t) {
        try {
            return await fn.call(createMochaContext(t));
        } catch (error) {
            if (isSkipSignal(error)) {
                return;
            }
            throw error;
        }
    };
};

/**
 * Accept both `(name, fn)` and `(fn)`, like Mocha.
 */
const normalizeArgs = (nameOrFn, fn) => {
    if (typeof nameOrFn === "function") {
        return [undefined, nameOrFn];
    }
    return [nameOrFn, fn];
};

const createTestFunction = (testFn) => {
    const wrapped = (name, fn) => testFn(name, wrapTestFunction(fn));
    wrapped.only = (name, fn) => testFn(name, { only: true }, wrapTestFunction(fn));
    wrapped.skip = (name, fn) => testFn(name, { skip: true }, wrapTestFunction(fn));
    return wrapped;
};

const createSuiteFunction = (suiteFn) => {
    // `this` in a Mocha suite function is the suite; support `this.timeout()` there.
    // If a suite function throws, node:test before v26 reports it but exits with code 0.
    // Report the error as a failing test in the suite, so the process exits with code 1 like Mocha.
    const wrapSuite = (fn) =>
        typeof fn === "function"
            ? (...args) => {
                  try {
                      return fn.call(createMochaContext(undefined), ...args);
                  } catch (error) {
                      nodeTest.it("suite function", () => {
                          throw error;
                      });
                  }
              }
            : fn;
    const wrapped = (name, fn) => suiteFn(name, wrapSuite(fn));
    wrapped.only = (name, fn) => suiteFn(name, { only: true }, wrapSuite(fn));
    wrapped.skip = (name, fn) => suiteFn(name, { skip: true }, wrapSuite(fn));
    return wrapped;
};

const createHookFunction = (hookFn) => (nameOrFn, fn) => {
    const [, hook] = normalizeArgs(nameOrFn, fn);
    return hookFn(wrapTestFunction(hook));
};

const defineGlobals = () => {
    if (globalThis[GLOBALS_FLAG]) {
        return;
    }
    const describe = createSuiteFunction(nodeTest.describe);
    const it = createTestFunction(nodeTest.it);
    const globals = {
        describe,
        context: describe,
        it,
        specify: it,
        before: createHookFunction(nodeTest.before),
        after: createHookFunction(nodeTest.after),
        beforeEach: createHookFunction(nodeTest.beforeEach),
        afterEach: createHookFunction(nodeTest.afterEach)
    };
    for (const [name, value] of Object.entries(globals)) {
        // Do not override globals defined by another test framework
        if (typeof globalThis[name] === "undefined") {
            globalThis[name] = value;
        }
    }
    globalThis[GLOBALS_FLAG] = true;
};

defineGlobals();
