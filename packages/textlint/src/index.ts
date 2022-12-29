// LICENSE : MIT
"use strict";

// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md

/**
 * Command line interface
 */
export { cli } from "./cli";
/**
 * @deprecated use New APIs
 */
export { textlint } from "./textlint";

/**
 * TextLintEngine is a wrapper around `textlint` for linting **multiple** files
 * include formatter, detecting utils
 * You can see engine/textlint-engine-core.js for more detail
 * @deprecated use New APIs
 */
export { TextLintEngine } from "./textlint-engine";

/**
 * TextFixEngine is a wrapper around `textlint` for linting **multiple** files
 * include formatter, detecting utils
 * You can see engine/textlint-engine-core.js for more detail
 * @deprecated use New APIs
 */
export { TextFixEngine } from "./textfix-engine";

/**
 * Core API for linting a **single** text or file.
 * @deprecated use New APIs or @textlint/kernel
 */
export { TextLintCore } from "./textlint-core";

/* = New APIs */
/**
 * Basic Usage
 * @example
 *
 * ```js
 *  import { createLinter, loadTextlintrc, loadLinterFormatter } from "textlint";
 *  const descriptor = await loadTextlintrc();
 *  const linter = createLinter({
 *      descriptor
 *  });
 *  const results = await linter.lintFiles(["*.md"]);
 *  const formatter = await loadLinterFormatter({ formatterName: "stylish" })
 *  const output = formatter.format(results);
 *  console.log(output);
 *  ```
 */
export { createLinter, CreateLinterOptions } from "./createTextlint";
export { loadTextlintrc, LoadTextlintrcOptions } from "./loader/TextlintrcLoader";
export { loadLinterFormatter, loadFixerFormatter } from "./formatter";
