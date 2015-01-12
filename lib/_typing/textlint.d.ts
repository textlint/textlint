interface TextLintMessage {
    id: string;
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
    rulePaths?:string[];
    extensions?:string[];
    formatName?:string;
}
