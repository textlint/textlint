// Built-in node contracts from @textlint/ast-node-types/src/NodeType.ts.
// This is a deliberately maintained subset of interface validation, not a generated schema.
// Unknown node types and extra properties are intentionally not restricted.
const parentTypes = new Set([
    "Document",
    "Paragraph",
    "Header",
    "BlockQuote",
    "List",
    "ListItem",
    "Table",
    "TableRow",
    "TableCell",
    "Emphasis",
    "Strong",
    "Delete",
    "Link",
    "LinkReference"
]);
const textTypes = new Set(["Html", "Comment", "CodeBlock", "Str", "Code"]);
const resourceTypes = new Set(["Link", "Image", "Definition"]);
const referenceTypes = new Set(["LinkReference", "ImageReference", "Definition"]);
const typedReferences = new Set(["LinkReference", "ImageReference"]);
const alternativeTypes = new Set(["Image", "ImageReference"]);

function required(
    node: Record<string, unknown>,
    field: string,
    predicate: (value: unknown) => boolean,
    expected: string
) {
    if (!predicate(node[field])) {
        throw new Error(`invalid ${node.type}.${field}: expected ${expected}`);
    }
}

function optional(
    node: Record<string, unknown>,
    field: string,
    predicate: (value: unknown) => boolean,
    expected: string
) {
    if (node[field] !== null && node[field] !== undefined) {
        required(node, field, predicate, expected);
    }
}

const isString = (value: unknown) => typeof value === "string";
const isBoolean = (value: unknown) => typeof value === "boolean";
const isNumber = (value: unknown) => typeof value === "number";
const isReferenceType = (value: unknown) => value === "shortcut" || value === "collapsed" || value === "full";
const isTableAlign = (value: unknown) =>
    Array.isArray(value) &&
    value.every((align: unknown) => align === null || align === "left" || align === "right" || align === "center");

export function assertStrictNode(node: Record<string, unknown>) {
    const type = node.type;
    if (typeof type !== "string") {
        return; // The existing structural validator reports invalid types.
    }
    if (parentTypes.has(type)) {
        required(node, "children", Array.isArray, "an array");
    }
    if (textTypes.has(type)) {
        required(node, "value", isString, "a string");
    }
    if (type === "Header") {
        required(
            node,
            "depth",
            (depth) => typeof depth === "number" && Number.isInteger(depth) && depth >= 1 && depth <= 6,
            "an integer from 1 to 6"
        );
    }
    if (resourceTypes.has(type)) {
        required(node, "url", isString, "a string");
        optional(node, "title", isString, "a string or null");
    }
    if (referenceTypes.has(type)) {
        required(node, "identifier", isString, "a string");
        required(node, "label", isString, "a string");
    }
    if (typedReferences.has(type)) {
        required(node, "referenceType", isReferenceType, "shortcut, collapsed, or full");
    }
    if (alternativeTypes.has(type)) {
        optional(node, "alt", isString, "a string or null");
    }
    if (type === "List") {
        optional(node, "ordered", isBoolean, "a boolean or null");
        optional(node, "start", isNumber, "a number or null");
        optional(node, "spread", isBoolean, "a boolean or null");
    }
    if (type === "ListItem") {
        optional(node, "checked", isBoolean, "a boolean or null");
        optional(node, "spread", isBoolean, "a boolean or null");
    }
    if (type === "CodeBlock") {
        optional(node, "lang", isString, "a string or null");
        optional(node, "meta", isString, "a string or null");
    }
    if (type === "Table") {
        optional(node, "align", isTableAlign, "an array of left, right, center, or null");
    }
}
