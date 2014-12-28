/**
 * Created by azu on 2014/12/26.
 */

interface TextLintMessage {
    id: string;
    message: string;
    line: number;
    column: number;
    severity?: number;
}
interface TextLintResult {
    filePath:string;
    messages:TextLintMessage[];
}