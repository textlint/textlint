import type {
    TextlintRuleContextReportFunctionArgs,
    TextlintRuleError,
    TextlintRuleErrorLocation,
    TextlintRuleErrorPadding,
    TextlintSourceCode
} from "@textlint/types";
import { TxtNode } from "@textlint/ast-node-types";
import assert from "assert";
import { throwIfTesting } from "@textlint/feature-flag";
import { isTextlintRuleErrorLocation } from "../context/TextlintRuleLocator";

export interface ReportMessage {
    ruleId: string;
    node: any;
    severity: number;
    ruleError: TextlintRuleError;
}

// relative padding location info
export type SourceLocationPaddingIR =
    | TextlintRuleErrorLocation
    | {
          // if no padding, line and column will be 0
          line: number;
          column: number;
      };

const assertReportArgs = (reportArgs: Pick<TextlintRuleContextReportFunctionArgs, "node" | "ruleError" | "ruleId">) => {
    const { ruleError, ruleId } = reportArgs;
    const errorPrefix = `[${ruleId}]` || "";
    const padding = ruleError;

    /*
         FIXME: It is old and un-document way
         new RuleError("message", index);
         */
    if (typeof padding === "number") {
        throw new Error(`${errorPrefix} This is un-document way:
report(node, new RuleError("message", index);

Please use { index }: 

report(node, new RuleError("message", {
    index: paddingLineColumn
});
`);
    }
    // when running from textlint-tester, assert
    if (padding.line === undefined && padding.column !== undefined) {
        // FIXME: Backward compatible <= textlint.5.5
        throwIfTesting(`${errorPrefix} Have to use a sets with "line" and "column".
See FAQ: https://github.com/textlint/textlint/blob/master/docs/faq/line-column-or-index.md            

report(node, new RuleError("message", {
    line: paddingLineNumber,
    column: paddingLineColumn
});

OR use "index" property insteadof only "column".

report(node, new RuleError("message", {
    index: paddingLineColumn
});
`);
    }

    // When either one of {column, line} or {index} is not used, throw error
    if ((padding.line !== undefined || padding.column !== undefined) && padding.index !== undefined) {
        // Introduced textlint 5.6
        // https://github.com/textlint/textlint/releases/tag/5.6.0
        // Always throw Error
        throw new Error(`${errorPrefix} Have to use one of {line, column} or {index}.
You should use either one:

use "line" and "column" property

report(node, new RuleError("message", {
    line: paddingLineNumber,
    column: paddingLineColumn
});

OR 

use "index" property

report(node, new RuleError("message", {
    index: paddingIndexValue
});
`);
    }

    // NaN check
    if (padding.line !== undefined && Number.isNaN(padding.line)) {
        throw new Error("reported { line } is NaN");
    }
    if (padding.column !== undefined && Number.isNaN(padding.column)) {
        throw new Error("reported { column } is NaN");
    }
    if (padding.index !== undefined && Number.isNaN(padding.index)) {
        throw new Error("reported { index } is NaN");
    }
    // invalid loc check
    if (padding.loc !== undefined) {
        assert.ok(isTextlintRuleErrorLocation(padding.loc), "reported { loc } is invalid format.");
    }
};

/**
 * Create intermediate represent to resolve location
 * `loc` property is pass threw
 * Convert `index` to IR
 * Convert `column` and `line` to IR
 * @param padding
 */
const createPaddingIR = (padding: TextlintRuleErrorPadding): SourceLocationPaddingIR | null => {
    if ("loc" in padding && typeof padding.loc === "object") {
        return padding.loc;
    }
    // when use {index}
    if (padding.index !== undefined) {
        const paddingIndex = padding.index;
        return {
            type: "TextlintRuleErrorLocation",
            isAbsolute: false,
            range: [paddingIndex, paddingIndex + 1]
        };
    }
    // when use {line, column}
    if (padding.line !== undefined && padding.column !== undefined) {
        // when report with padding {line, column}, message.column should be 0 + padding.column.
        // In other word, padding line > 0 and message.column start with 0.
        return {
            line: Math.max(padding.line, 0),
            column: Math.max(padding.column, 0)
        };
    }
    // when use { line } only
    if (padding.line !== undefined && padding.line > 0) {
        return {
            line: Math.max(padding.line, 0),
            column: 0
        };
    }
    /*
     when use { column } only
     FIXME: backward compatible @ un-document
     Remove next version 6?
     ```
     new RuleError({
        column: index
     });
     ```
     */
    if (padding.column !== undefined && padding.column > 0) {
        return {
            line: 0,
            column: Math.max(padding.column, 0)
        };
    }
    // No Padding
    return null;
};
const toAbsoluteLocation = ({
    source,
    node,
    paddingIR
}: {
    source: TextlintSourceCode;
    node: TxtNode;
    paddingIR: SourceLocationPaddingIR | null;
}) => {
    if (!paddingIR) {
        return {
            range: node.range,
            loc: node.loc
        };
    }
    const nodeRange = node.range;
    const line = node.loc.start.line;
    const column = node.loc.start.column;
    // When { line, column } padding
    if ("line" in paddingIR && "column" in paddingIR) {
        const absoluteStartPosition = {
            line: line + paddingIR.line,
            column: column + paddingIR.column
        };
        const absoluteIndex = source.positionToIndex(absoluteStartPosition);
        if (Number.isNaN(absoluteIndex)) {
            throw new Error("absoluteIndex is NaN in { line, column }");
        }
        const absoluteRange = [absoluteIndex, absoluteIndex + 1] as const;
        const absoluteLocation = source.rangeToLocation(absoluteRange);
        if (Number.isNaN(absoluteLocation)) {
            throw new Error("absoluteLocation is NaN in { line, column }");
        }
        return {
            range: absoluteRange,
            loc: absoluteLocation
        };
    }
    // When { range } padding
    if ("range" in paddingIR) {
        const absoluteRange = [nodeRange[0] + paddingIR.range[0], nodeRange[0] + paddingIR.range[1]] as [
            number,
            number
        ];
        const absoluteLocation = source.rangeToLocation(absoluteRange);
        if (Number.isNaN(absoluteLocation)) {
            throw new Error("absoluteLocation is NaN in { range }");
        }
        return {
            range: absoluteRange,
            loc: absoluteLocation
        };
    }
    // When { loc } padding
    if ("loc" in paddingIR) {
        // relative from node start position
        const absoluteStartPosition = {
            line: line + paddingIR.loc.start.line,
            column: column + paddingIR.loc.start.column
        };
        const absoluteEndPosition = {
            line: line + paddingIR.loc.end.line,
            column: column + paddingIR.loc.end.column
        };
        const absoluteLocation = source.locationToRange({
            start: absoluteStartPosition,
            end: absoluteEndPosition
        });
        const absoluteRange = absoluteLocation;
        if (Number.isNaN(absoluteRange[0]) || Number.isNaN(absoluteRange[1])) {
            throw new Error("absoluteLocation is NaN in { loc }");
        }
        return {
            range: absoluteRange,
            loc: {
                start: {
                    line: absoluteStartPosition.line,
                    column: absoluteStartPosition.column
                },
                end: {
                    line: absoluteEndPosition.line,
                    column: absoluteEndPosition.column
                }
            }
        };
    }
    return {
        range: node.range,
        loc: node.loc
    };
};

/**
 * Adjust `fix` command range
 * if `fix.isAbsolute` is not absolute position, adjust the position from the `node`.
 */
export const resolveFixCommandLocation = ({ node, ruleError }: { node: TxtNode; ruleError: TextlintRuleError }) => {
    const nodeRange = node.range;
    // if not found `fix`, return empty object
    if (ruleError.fix === undefined) {
        return {}; // TODO: it should be undefined?
    }
    assert.ok(typeof ruleError.fix === "object", "fix should be FixCommand object");
    // if absolute position return self
    if (ruleError.fix.isAbsolute) {
        return {
            // remove other property that is not related `fix`
            // the return object will be merged by `Object.assign`
            fix: {
                range: ruleError.fix.range,
                text: ruleError.fix.text
            }
        };
    }
    // if relative position return adjusted position
    return {
        // fix(command) is relative from node's range
        fix: {
            range: [nodeRange[0] + ruleError.fix.range[0], nodeRange[0] + ruleError.fix.range[1]] as const,
            text: ruleError.fix.text
        }
    };
};

export type ResolveLocationResult = {
    range: readonly [startIndex: number, endIndex: number];
    loc: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
};
/**
 * resolve `loc`(includes deprecated `index`, `column`, `line`) to absolute location
 * @param args
 */
export const resolveLocation = (
    args: {
        source: TextlintSourceCode;
    } & Pick<TextlintRuleContextReportFunctionArgs, "node" | "ruleError" | "ruleId">
): ResolveLocationResult => {
    const { node, ruleError } = args;
    assertReportArgs(args);
    const paddingIR = createPaddingIR(ruleError);
    return toAbsoluteLocation({
        source: args.source,
        node,
        paddingIR
    });
};
