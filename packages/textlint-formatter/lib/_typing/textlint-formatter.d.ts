declare module TextLintFormatter {
    function format(results:TextLintResult[]):string;
    // createFormatter(options)
    interface options {
        // formatter file name
        formatterName?: string;
    }
}