// LICENSE : MIT
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var path = require('path');
var objectAssign = require('object-assign');
var loadConfig = require('./config-loader');
/**
 * Get rule keys from textlintrc config object.
 * @param rulesConfig
 * @returns {string[]}
 */
function availableRuleKeys(rulesConfig) {
    return Object.keys(rulesConfig).filter(function (key) {
        // ignore `false` value
        return typeof rulesConfig[key] === 'object' || rulesConfig[key] === true;
    });
}
/**
 * @type {TextLintConfig}
 */
var defaultOptions = {
    // rule package names
    rules: [],
    // rules base directory that is related `rules`.
    rulesBaseDirectory: null,
    // ".textlint" file path
    configFile: null,
    // rules config object
    rulesConfig: {},
    // rule directories
    rulePaths: [],
    extensions: ['.md', '.mdk', '.markdown', '.mkdn', '.txt'],
    // formatter-file-name
    // e.g.) stylish.js => set "stylish"
    formatterName: 'stylish'
};

var Config = (function () {
    /**
     * initialize with options.
     * @param {TextLintConfig} options the option object is defined as TextLintConfig.
     * @returns {Config}
     * @constructor
     */

    function Config(options) {
        _classCallCheck(this, Config);

        if (typeof options !== 'object') {
            return objectAssign(this, defaultOptions);
        }
        // TODO: add `noUseConfig` option
        // configFile is optional
        var userConfig = loadConfig(options.configFile);
        /**
         * @type {object}
         */
        this.rulesConfig = userConfig.rules ? userConfig.rules : defaultOptions.rulesConfig;
        /**
         * @type {string|null} path to .textlintrc file.
         */
        this.configFile = userConfig.config ? userConfig.config : options.configFile;
        // rule names
        var ruleKeys = availableRuleKeys(this.rulesConfig);
        /**
         * @type {string[]}
         */
        this.rules = options.rules ? options.rules : defaultOptions.rules;
        this.rules = this.rules.concat(ruleKeys);
        /**
         * @type {string[]}
         */
        this.extensions = options.extensions ? options.extensions : defaultOptions.extensions;
        /**
         * @type {string[]}
         */
        this.rulePaths = options.rulePaths ? options.rulePaths : defaultOptions.rulePaths;
        /**
         * @type {string}
         */
        this.formatterName = options.formatterName ? options.formatterName : defaultOptions.formatterName;
    }

    /**
     * Create config object form command line options
     * See options.js
     * @param {object} cliOptions the options is command line option object. @see options.js
     * @returns {Config}
     */

    _createClass(Config, [{
        key: 'toJSON',
        value: function toJSON() {
            var r = Object.create(null);
            var that = this;
            Object.keys(this).forEach(function (key) {
                if (!that.hasOwnProperty(key)) {
                    return;
                }
                var value = that[key];
                if (value == null) {
                    return;
                }
                r[key] = typeof value.toJSON !== 'undefined' ? value.toJSON() : value;
            });
            return r;
        }
    }]);

    return Config;
})();

Config.initWithCLIOptions = function (cliOptions) {
    var options = {};
    options.extensions = cliOptions.ext ? cliOptions.ext : defaultOptions.extensions;
    options.rules = cliOptions.rule ? cliOptions.rule : defaultOptions.rules;
    options.configFile = cliOptions.config ? cliOptions.config : defaultOptions.configFile;
    options.rulePaths = cliOptions.rulesdir ? cliOptions.rulesdir : defaultOptions.rulePaths;
    options.formatterName = cliOptions.format ? cliOptions.format : defaultOptions.formatterName;
    return new Config(options);
};
module.exports = Config;
//# sourceMappingURL=config.js.map