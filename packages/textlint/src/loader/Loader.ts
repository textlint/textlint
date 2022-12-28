import type { TextlintKernelDescriptor } from "@textlint/kernel";

export type TextlintLoader = () => Promise<TextlintKernelDescriptor>;
