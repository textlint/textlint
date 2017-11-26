import { Config } from "./config/config";
/**
 * TextLintEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
export declare class TextLintEngine {
    /**
     * TextLintEngine is a adaptor of TextLintEngineCore.
     * @param {Config|Object} [config]
     * @returns {TextLintEngineCore}
     */
    constructor(config: Partial<Config>);
}
