import { isPluginParsedObject } from "./isPluginParsedObject";
import type { TextlintPluginProcessor } from "@textlint/types";
import { TxtNode } from "@textlint/ast-node-types";

type PreProcess = ReturnType<TextlintPluginProcessor["processor"]>["preProcess"];
/**
 * Parse text by plugin
 * If parse error is occurred, return an Error
 * @param preProcess
 * @param sourceText
 * @param filePath
 */
export const parseByPlugin = async ({
    preProcess,
    sourceText,
    filePath
}: {
    preProcess: PreProcess;
    sourceText: string;
    filePath?: string;
}): Promise<{ text: string; ast: TxtNode } | Error> => {
    try {
        const preProcessResult = await preProcess(sourceText, filePath);
        const isParsedObject = isPluginParsedObject(preProcessResult);
        const textForAST = isParsedObject ? preProcessResult.text : sourceText;
        const ast = isParsedObject ? preProcessResult.ast : preProcessResult;
        return {
            text: textForAST,
            ast
        };
    } catch (error) {
        // Parse error
        return error instanceof Error ? error : new Error(String(error));
    }
};
