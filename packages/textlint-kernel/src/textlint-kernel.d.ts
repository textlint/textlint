export interface TextlintKernelPlugin {
    // plugin name as key
    pluginId: string;
    // plugin processor instance
    plugin: Function;
    // plugin options
    // TODO: It is not implemented
    // options: Object | boolean;
}

export interface TextlintKernelRule {
    // rule name as key
    ruleId: string;
    // rule module instance
    rule: Function | Object;
    // rule options
    // Often rule option is written in .textlintrc
    options?: Object | boolean;
}

export interface TextlintKernelFilterRule {
    // filter rule name as key
    ruleId: string;
    // filter rule module instance
    rule: Function | Object;
    // filter rule options
    // Often rule option is written in .textlintrc
    options?: Object | boolean;
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
export class TextlintKernel {
    constructor(config: Object);

    lintText(text: string, options: TextlintKernelOptions): Promise<TextLintResult>;

    fixText(text: string, options: TextlintKernelOptions): Promise<TextLintResult>;
}
