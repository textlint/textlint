// rule config
import { ASTNodeTypes } from "@textlint/ast-node-types";
import { SeverityLevelTypes } from "./shared/type/SeverityLevel";
import { TextLintRuleCreator } from "./core/rule-creator-helper";

export interface TextlintRuleOptions {
    [index: string]: any;

    severity?: SeverityLevelTypes;
}

export interface TextlintPluginOptions {
    [index: string]: any;
}

export interface TextlintKernelConstructorOptions {
    /**
     * Suppress messages of severity:warning and severity:info
     */
    quiet?: boolean;
}

// config
export interface TextlintConfig {
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
    disabledRules?: string[];
    // preset package names
    // e.g.) ["preset-foo"]
    presets?: string[];
    // rules config object
    rulesConfig?: Object;
    /**
     * quite options
     */
    quiet?: boolean;
}

// TextLint AST Node
export interface TxtNode {
    type: keyof typeof ASTNodeTypes | string;
    raw: string;
    range: [number, number];
    loc: LineLocation;
    // parent is runtime information
    // Not need in AST
    parent?: TxtNode;
}

// Inline Node
export interface TxtTextNode extends TxtNode {
    value: string;
}

// Parent Node
export interface TxtParentNode extends TxtNode {
    children: TxtNode[] | TxtTextNode[];
}

export interface TxtRootNode extends TxtNode {
    type: "Document";
    children: TxtNode[];
}

export interface LineLocation {
    start: Position;
    end: Position;
}

export interface Position {
    line: number; // start with 1
    column: number; // start with 0
    // This is for compatibility with JavaScript AST.
    // https://gist.github.com/azu/8866b2cb9b7a933e01fe
}

// Plugin
export interface TextlintKernelProcessorConstructor extends Function {
    // TODO: support plugin config
    // https://github.com/textlint/textlint/issues/296
    new (options?: TextlintPluginOptions | boolean): TextlintKernelProcessor;

    availableExtensions(): Array<string>;
}

export declare class TextlintKernelProcessor {
    constructor(options?: TextlintPluginOptions | boolean);

    static availableExtensions(): Array<string>;

    processor(
        extension: string
    ): {
        preProcess(text: string, filePath?: string): TxtNode;
        postProcess(messages: Array<any>, filePath?: string): { messages: Array<any>; filePath: string };
    };
}

// textlint plugin module should export this interface
export interface TextlintPluginCreator {
    Processor: TextlintKernelProcessorConstructor;
}

export interface TextlintKernelPlugin {
    // plugin name as key
    pluginId: string;
    // plugin module
    // For example, `plugin: require("textlint-plugin-markdown")`
    plugin: TextlintPluginCreator;
    // plugin options
    options?: TextlintPluginOptions | boolean;
}

export interface TextlintKernelRule {
    // rule name as key
    ruleId: string;
    // rule module
    // For example, `rule: require("textlint-rule-example")`
    rule: TextLintRuleCreator;
    // rule options
    // Often rule option is written in .textlintrc
    options?: TextlintRuleOptions | boolean;
}

export interface TextlintKernelFilterRule {
    // filter rule name as key
    ruleId: string;
    // filter rule module instance
    rule: any;
    // filter rule options
    // Often rule option is written in .textlintrc
    options?: TextlintRuleOptions | boolean;
}

export interface TextlintKernelOptions {
    // file type
    // For example) .md
    ext: string;
    // file path
    filePath?: string;
    // plugins
    plugins?: TextlintKernelPlugin[];
    // rules
    rules?: TextlintKernelRule[];
    // filterRules
    filterRules?: TextlintKernelFilterRule[];
    // config base directory
    // It is a value of context.getConfigBaseDir.
    configBaseDir?: string;
}

// "range" is replaced by "text"
export class TextLintFixCommand {
    text: string;
    range: [number, number];
    isAbsolute: boolean;
}

export class TextlintMessage {
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
    // Text -> AST TxtNode(0-based columns) -> textlint -> TextlintMessage(**1-based columns**)
    line: number; // start with 1
    column: number; // start with 1
    // indexed-location
    index: number; // start with 0
    // Severity Level
    // See src/shared/type/SeverityLevel.js
    severity?: number;
}

// Linting result
export interface TextlintResult {
    filePath: string;
    messages: TextlintMessage[];
}

// Fixing result
export interface TextlintFixResult {
    filePath: string;
    // fixed content
    output: string;
    // all messages = pre-applyingMessages + remainingMessages
    // it is same with one of `TextlintResult`
    messages: TextlintMessage[];
    // applied fixable messages
    applyingMessages: TextlintMessage[];
    // original means original for applyingMessages and remainingMessages
    // pre-applyingMessages + remainingMessages
    remainingMessages: TextlintMessage[];
}
