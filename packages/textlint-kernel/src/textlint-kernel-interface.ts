// rule config
import { ASTNodeTypes } from "@textlint/ast-node-types"
import { SeverityLevelTypes } from "./shared/type/SeverityLevel";

export interface TextLintRuleOptions {
    [index: string]: any;

    severity: SeverityLevelTypes
}

// config
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
    value: string
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
    column: number;// start with 0
    // This is for compatibility with JavaScript AST.
    // https://gist.github.com/azu/8866b2cb9b7a933e01fe
}

// Plugin
export interface TextlintKernelProcessorConstructor extends Function {
    // TODO: support plugin config
    // https://github.com/textlint/textlint/issues/296
    new(config: any): TextlintKernelProcessor;

    availableExtensions(): Array<string>;
}

export declare class TextlintKernelProcessor {
    private config: any;

    constructor(config: any);

    static availableExtensions(): Array<string>;

    processor(extension: string): {
        preProcess(text: string, filePath?: string): TxtNode,
        postProcess(messages: Array<any>, filePath?: string): { messages: Array<any>, filePath: string }
    };
}

export interface TextlintKernelPlugin {
    // plugin name as key
    pluginId: string;
    // plugin processor instance
    plugin: {
        Processor: TextlintKernelProcessorConstructor
    };
    // plugin options
    // TODO: It is not implemented
    // options: Object | boolean;
}

export interface TextlintKernelRule {
    // rule name as key
    ruleId: string;
    // rule module instance
    rule: any;
    // rule options
    // Often rule option is written in .textlintrc
    options?: TextLintRuleOptions | boolean;
}

export interface TextlintKernelFilterRule {
    // filter rule name as key
    ruleId: string;
    // filter rule module instance
    rule: any;
    // filter rule options
    // Often rule option is written in .textlintrc
    options?: TextLintRuleOptions | boolean;
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

// entry
export declare class TextlintKernel {
    constructor(config?: Object);

    lintText(text: string, options: TextlintKernelOptions): Promise<TextLintResult>;

    fixText(text: string, options: TextlintKernelOptions): Promise<TextLintResult>;
}
