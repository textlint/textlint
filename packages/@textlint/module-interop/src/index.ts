type ESModule<T> = {
    __esModule: true;
    default: T;
};

export function moduleInterop<T>(moduleExports: T): T {
    return moduleExports && (moduleExports as ESModule<T>).__esModule ? (moduleExports as ESModule<T>).default : moduleExports;
}
