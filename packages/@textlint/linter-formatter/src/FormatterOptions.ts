/**
 * Get the content of the linted source by `filePath` of the result.
 *
 * The result does not have the content of the source.
 * A formatter that needs the content gets it from this function.
 * It returns `undefined` if the caller does not have the content.
 * For example, the content of stdin or of `lintText()` is not in a file.
 */
export type FormatterGetSource = (filePath: string) => string | undefined;
export interface FormatterOptions {
    color?: boolean;
    /**
     * Get the content of the linted source.
     * It is `undefined` if the caller does not provide the content.
     */
    getSource?: FormatterGetSource;
}
