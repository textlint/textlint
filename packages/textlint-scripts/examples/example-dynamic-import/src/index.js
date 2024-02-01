export default function (context, options = {}) {
    const { Syntax, RuleError, report, getSource } = context;
    return {
        async [Syntax.Document](node) {
            const { esmWorker } = await import("./esm-worker.mjs");
            const result = await esmWorker();
            const text = getSource(node);
            if (/valid/.test(text)) {
                return;
            }
            report(node, new RuleError(`esmWorker result: ${result}`));
        }
    };
}
