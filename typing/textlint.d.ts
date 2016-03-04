interface TextLintMessage {
    ruleId: string;
    message: string;
    // optional data
    data?: any;
    // location info
    line: number; // start with 1
    column: number;// start with 1
    // Text -> AST TxtNode(0-based columns) -> textlint -> TextLintMessage(**1-based columns**)
    severity?: number;
}
// lint result
interface TextLintResult {
    filePath:string;
    messages:TextLintMessage[];
}
// fix result
interface TextLintFixResult {
    filePath: string;
    output: string;
    applyingMessages: TextLintMessage[];
    remainingMessages: TextLintMessage[];
}
// Config - pass a object to config.js when initialize Config.
interface TextLintConfig {
    // rule directories path
    rulePaths?:string[];
    extensions?:string[];
    // formatter file name
    // e.g.) stylish.js => set "stylish"
    formatName?:string;
    // plugin package names
    plugins?: string[];
    // rules base directory that is related `rules`.
    rulesBaseDirectory?: string;
    // ".textlint" file path
    configFile?: string;
    // disabled rule package names
    // always should start with empty
    disabledRules?: string[],
    // preset package names
    // e.g.) ["preset-foo"]
    presets?: string[],
    // rules base directory that is related `rules`.
    rulesBaseDirectory?: string,
    // ".textlint" file path
    configFile?: string,
    // rules config object
    rulesConfig?: Object,
}