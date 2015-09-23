interface TextLintMessage {
    ruleId: string;
    message: string;
    line: number;
    column: number;
    severity?: number;
}
// lint result
interface TextLintResult {
    filePath:string;
    messages:TextLintMessage[];
}

// Config - pass a object to config.js when initialize Config.
interface TextLintConfig {
    rules: string[];
    rulesBaseDirectory?: string;
    configFile?: string;
    rulePaths?:string[];
    extensions?:string[];
    formatterName?:string;
}
