//noinspection TypeScriptCheckImport
import TxtAST from "./txtast";
// "range" is replaced by "text"
export class TextLintFixCommand {
    text: string;
    range: [number,number];
    isAbsolute: boolean;
}
export class TextLintMessage {
    // See src/shared/type/MessageType.js
    // Message Type
    type: string;
    // Rule Id
    ruleId: string;
    message: string;
    // optional data
    data?: any;
    // FixCommand
    fix?: TextLintFixCommand;
    // location info
    // Text -> AST TxtNode(0-based columns) -> textlint -> TextLintMessage(**1-based columns**)
    line: number; // start with 1
    column: number;// start with 1
    // indexed-location
    index: number;// start with 0
    // Severity Level
    // See src/shared/type/SeverityLevel.js
    severity?: number;
}
// Linting result
export interface TextLintResult {
    filePath: string;
    messages: TextLintMessage[];
}
// Fixing result
export interface TextLintFixResult {
    filePath: string;
    // fixed content
    output: string;
    // all messages = pre-applyingMessages + remainingMessages
    // it is same with one of `TextLintResult`
    messages: TextLintMessage[];
    // applied fixable messages
    applyingMessages: TextLintMessage[];
    // original means original for applyingMessages and remainingMessages
    // pre-applyingMessages + remainingMessages
    remainingMessages: TextLintMessage[];
}
// Config - pass a object to config.js when initialize Config.
export interface TextLintConfig {
    // rule directories path
    rulePaths?: string[];
    // filter by file extensions
    extensions?: string[];
    // formatter file name
    // e.g.) stylish.js => set "stylish"
    formatterName?: string;
    // plugin package names
    plugins?: string[];
    // base directory for loading {rule, config, plugin} modules
    rulesBaseDirectory?: string;
    // ".textlint" file path
    configFile?: string;
    // disabled rule package names
    // always should start with empty
    disabledRules?: string[],
    // preset package names
    // e.g.) ["preset-foo"]
    presets?: string[],
    // rules config object
    rulesConfig?: Object,
}

export interface RuleErrorOptions {
    /**
     * padding lineNumber
     * @type {number}
     */
    line: number;
    /**
     * padding column
     * @type {number}
     */
    column: number;
    /**
     * padding index
     * @type {number}
     */
    index: number;
    /**
     * fixCommand object
     * @type {TextLintFixCommand}
     */
    fix: Object;
}

export class RuleError {
    constructor(message: string, options: RuleErrorOptions);
}

export class TextLintRuleContext {
    id: string;
    config: TextLintConfig;
    RuleError: RuleError;
    /**
     * report function that is called in a rule
     * @param {TxtNode} node
     * @param {RuleError} ruleError error is a RuleError instance or any data
     */
    report: {(node: TxtAST.TxtNode, ruleError: RuleError): void};
    /**
     * Gets the source code for the given node.
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string|null} The text representing the AST node.
     */
    getSource: {(node, beforeCount?: number, afterCount?: number): string};
    getFilePath: {(): string};

    fixer: RuleFixer;
}
export class TextLintFilterRuleContext {
    id: string;
    config: TextLintConfig;
    RuleError: RuleError;
    /**
     * Gets the source code for the given node.
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string|null} The text representing the AST node.
     */
    getSource: {(node, beforeCount?: number, afterCount?: number): string};
    shouldIgnore: {(range: [number, number], options: { ruleId: string })};
    getFilePath: {(): string};
}
/**
 * Creates code fixing commands for rules.
 * It create command for fixing texts.
 * @constructor
 */
export class RuleFixer {
    /**
     * Creates a fix command that inserts text after the given node or token.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtAST.TxtNode} node The node or token to insert after.
     * @param {string} text The text to insert.
     * @returns {TextLintFixCommand} The fix command.
     */
    insertTextAfter(node: TxtAST.TxtNode, text: string): TextLintFixCommand;

    /**
     * Creates a fix command that inserts text after the specified range in the source text.
     * The fix is not applied until applyFixes() is called.
     * @param {int[]} range The range to replace, first item is start of range, second
     *      is end of range.
     * @param {string} text The text to insert.
     * @returns {TextLintFixCommand} The fix command.
     */
    insertTextAfterRange(range: [number, number], text: string): TextLintFixCommand;

    /**
     * Creates a fix command that inserts text before the given node or token.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtAST.TxtNode} node The node or token to insert before.
     * @param {string} text The text to insert.
     * @returns {TextLintFixCommand} The fix command.
     */
    insertTextBefore(node: TxtAST.TxtNode, text: string): TextLintFixCommand;

    /**
     * Creates a fix command that inserts text before the specified range in the source text.
     * The fix is not applied until applyFixes() is called.
     * @param {int[]} range The range to replace, first item is start of range, second
     *      is end of range.
     * @param {string} text The text to insert.
     * @returns {TextLintFixCommand} The fix command.
     */
    insertTextBeforeRange(range: [number, number], text: string): TextLintFixCommand;

    /**
     * Creates a fix command that replaces text at the node or token.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtAST.TxtNode} node The node or token to remove.
     * @param {string} text The text to insert.
     * @returns {TextLintFixCommand} The fix command.
     */
    replaceText(node: TxtAST.TxtNode, text: string): TextLintFixCommand;

    /**
     * Creates a fix command that replaces text at the specified range in the source text.
     * The fix is not applied until applyFixes() is called.
     * @param {int[]} range The range to replace, first item is start of range, second
     *      is end of range.
     * @param {string} text The text to insert.
     * @returns {TextLintFixCommand} The fix command.
     */
    replaceTextRange(range: [number, number], text: string): TextLintFixCommand;

    /**
     * Creates a fix command that removes the node or token from the source.
     * The fix is not applied until applyFixes() is called.
     * @param {TxtAST.TxtNode} node The node or token to remove.
     * @returns {TextLintFixCommand} The fix command.
     */
    remove(node: TxtAST.TxtNode): TextLintFixCommand;

    /**
     * Creates a fix command that removes the specified range of text from the source.
     * The fix is not applied until applyFixes() is called.
     * @param {int[]} range The range to remove, first item is start of range, second
     *      is end of range.
     * @returns {TextLintFixCommand} The fix command.
     */
    removeRange(range: [number,number]): TextLintFixCommand;

}
