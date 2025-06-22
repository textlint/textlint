// LICENSE : MIT
"use strict";

/**
 * Command line interface
 */
export { cli } from "./cli.js";

/* = New APIs */
/**
 * @see {https://textlint.org/docs/use-as-modules.html#new-apis}
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
export { createLinter, CreateLinterOptions } from "./createLinter.js";
export { loadTextlintrc, LoadTextlintrcOptions } from "./loader/TextlintrcLoader.js";
export { loadLinterFormatter, loadFixerFormatter } from "./formatter.js";
