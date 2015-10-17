interface TextLintMessage {
    id: string;
    message: string;
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
// Config - pass a object to config.js when initialize Config.
interface TextLintConfig {
    rulePaths?:string[];
    extensions?:string[];
    formatName?:string;
}