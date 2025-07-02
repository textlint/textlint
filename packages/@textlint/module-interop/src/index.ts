export function moduleInterop<T>(moduleExports: T): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return moduleExports && (moduleExports as any).__esModule ? (moduleExports as any).default : moduleExports;
}
