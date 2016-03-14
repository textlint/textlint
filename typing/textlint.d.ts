// "range" is replaced by "text"
interface TextLintFixCommand {
    text: string;
    range: [number,number],
}
interface TextLintMessage {
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
    // severity
    /*
     "info": 0,
     "warning": 1,
     "error": 2
     */
    severity?: number;
}
// Linting result
interface TextLintResult {
    filePath:string;
    messages:TextLintMessage[];
}
// Fixing result
interface TextLintFixResult {
    filePath: string;
    // fixed content
    output: string;
    applyingMessages: TextLintMessage[];
    remainingMessages: TextLintMessage[];
}
// Config - pass a object to config.js when initialize Config.
interface TextLintConfig {
    // rule directories path
    rulePaths?:string[];
    // filter file extensions
    extensions?:string[];
    // formatter file name
    // e.g.) stylish.js => set "stylish"
    formatterName?:string;
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
