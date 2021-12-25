import type {
    TextlintRuleContextReportFunctionArgs,
    TextlintRuleError,
    TextlintRuleErrorPadding,
    TextlintSourceCode
} from "@textlint/types";
import { TxtNode } from "@textlint/ast-node-types";
import assert from "assert";
import { throwIfTesting } from "@textlint/feature-flag";

export interface ReportMessage {
    ruleId: string;
    node: any;
    severity: number;
    ruleError: TextlintRuleError;
}

// relative padding location info
export type SourceLocationPaddingIR =
    | {
          range: [startIndex: number, endIndex: number];
      }
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
};

const createPaddingIR = (padding: TextlintRuleErrorPadding): SourceLocationPaddingIR => {
    if ("loc" in padding && typeof padding.loc === "object") {
        return padding.loc;
    }
    // when use {index}
    if (padding.index !== undefined) {
        const paddingIndex = padding.index;
        return {
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

    return {
        line: 0,
        column: 0
    };
};
/**
 * Adjust `fix` command range
 * if `fix.isAbsolute` is not absolute position, adjust the position from the `node`.
 */
export const toAbsoluteFixCommand = ({ node, ruleError }: { node: TxtNode; ruleError: TextlintRuleError }) => {
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
            range: [nodeRange[0] + ruleError.fix.range[0], nodeRange[0] + ruleError.fix.range[1]] as [number, number],
            text: ruleError.fix.text
        }
    };
};
export const toAbsoluteLocation = ({
    source,
    node,
    paddingIR
}: {
    source: TextlintSourceCode;
    node: TxtNode;
    paddingIR: SourceLocationPaddingIR;
}) => {
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
        const absoluteRange = [absoluteIndex, absoluteIndex + 1] as [number, number];
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
        const absoluteRange = [nodeRange[0] + paddingIR.range[0], nodeRange[1] + paddingIR.range[1]] as [
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
    return {
        range: node.range,
        loc: node.loc
    };
};

export default class SourceLocation {
    private source: TextlintSourceCode;

    constructor(source: TextlintSourceCode) {
        this.source = source;
    }

    /**
     * adjust node's location with error's padding location.
     */
    adjust(reportArgs: Pick<TextlintRuleContextReportFunctionArgs, "node" | "ruleError" | "ruleId">): {
        line: number;
        column: number;
    } {
        const { node, ruleError } = reportArgs;
        const padding = ruleError;
        assertReportArgs(reportArgs);
        const paddingIR = createPaddingIR(padding);
        return toAbsoluteLocation({
            source: this.source,
            node,
            paddingIR
        }).loc.start;
    }
}
