declare module TextLintFormatter {
    function format(results:TextLintResult[]):string;
    interface options {
        // formatter file name
        formatterName?: string;
    }
}