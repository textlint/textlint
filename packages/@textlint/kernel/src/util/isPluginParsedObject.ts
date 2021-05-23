import { TxtNode } from "@textlint/ast-node-types";

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * textlint plugin can return TxtNode or { text: string; ast: TxtNode }
 * Return true if it the `o` is { text: string; ast: TxtNode } that is called ParsedObject.
 * https://github.com/textlint/textlint/pull/650
 * @param o
 */
export function isPluginParsedObject(o: TxtNode | { text: string; ast: TxtNode }): o is { text: string; ast: TxtNode } {
    return typeof o === "object" && hasOwnProperty.call(o, "text") && hasOwnProperty.call(o, "ast");
}
