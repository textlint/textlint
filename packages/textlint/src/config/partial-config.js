// MIT © 2017 azu
"use strict";
import Config from "./config";
export default class PartialConfig extends Config {
    constructor(rawOptions) {
        super(rawOptions);
        this._rawOptions = rawOptions;
    }

    load() {
        return Config.loadConfig(this._rawOptions);
    }
}
