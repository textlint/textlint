interface TextLintMessage {
    id: string;
    message: string;
    line: number; // start with 1
    column: number;// start with 0
    // This is for compatibility with JavaScript AST.
    // https://gist.github.com/azu/8866b2cb9b7a933e01fe
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