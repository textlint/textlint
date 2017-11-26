import { Config } from "./config/config";
/**
 * TextFixEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
export declare class TextFixEngine {
    /**
     * TextFixEngine is a adaptor of TextLintEngineCore.
     * @param {Config|Object} [config]
     * @returns {TextLintEngineCore}
     */
    constructor(config: Config | object);
}
