(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw ((f.code = "MODULE_NOT_FOUND"), f);
            }
            var l = (n[o] = { exports: {} });
            t[o][0].call(
                l.exports,
                function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                },
                l,
                l.exports,
                e,
                t,
                n,
                r
            );
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})(
    {
        1: [
            function(require, module, exports) {
                // LICENSE : MIT
                "use strict";
                var input = document.getElementById("js-input"),
                    output = document.getElementById("js-output");
                var parser = require("../../").parse;
                input.addEventListener("keyup", function(event) {
                    var value = event.target.value;
                    var AST = parser(value);
                    output.value = JSON.stringify(AST, null, 4);
                });
            },
            { "../../": 3 }
        ],
        2: [
            function(require, module, exports) {
                // LICENSE : MIT
                "use strict";
                // Replace key to value mapping
                // This is not for Constants.
                var exports = {
                    root: "Document",
                    paragraph: "Paragraph",
                    blockquote: "BlockQuote",
                    listItem: "ListItem",
                    list: "List",
                    Bullet: "Bullet", // no need?
                    heading: "Header",
                    code: "CodeBlock",
                    HtmlBlock: "Html",
                    ReferenceDef: "ReferenceDef",
                    thematicBreak: "HorizontalRule",
                    // inline block
                    text: "Str",
                    break: "Break",
                    emphasis: "Emphasis",
                    strong: "Strong",
                    html: "Html",
                    link: "Link",
                    image: "Image",
                    inlineCode: "Code",
                    yaml: "Yaml"
                };
                module.exports = exports;
            },
            {}
        ],
        3: [
            function(require, module, exports) {
                /*eslint-disable */
                // LICENSE : MIT

                "use strict";
                var traverse = require("traverse");
                var StructuredSource = require("structured-source");
                var debug = require("debug")("markdown-to-ast");
                var remarkAbstract = require("remark");
                var remark = remarkAbstract();
                /**
 * parse markdown text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
                function parse(text) {
                    var ast = remark.parse(text);
                    var SyntaxMap = require("./mapping/markdown-syntax-map");
                    var src = new StructuredSource(text);
                    traverse(ast).forEach(function(node) {
                        if (this.notLeaf) {
                            if (node.type) {
                                var replacedType = SyntaxMap[node.type];
                                if (!replacedType) {
                                    debug("replacedType : " + replacedType + " , node.type: " + node.type);
                                } else {
                                    node.type = replacedType;
                                }
                            }
                            // map `range`, `loc` and `raw` to node
                            if (node.position) {
                                var position = node.position;
                                var positionCompensated = {
                                    start: { line: position.start.line, column: position.start.column - 1 },
                                    end: { line: position.end.line, column: position.end.column - 1 }
                                };
                                var range = src.locationToRange(positionCompensated);
                                node.loc = positionCompensated;
                                node.range = range;
                                node.raw = text.slice(range[0], range[1]);
                                // Compatible for https://github.com/wooorm/unist, but hidden
                                Object.defineProperty(node, "position", {
                                    enumerable: false,
                                    configurable: false,
                                    writable: false,
                                    value: position
                                });
                            }
                        }
                    });
                    return ast;
                }
                module.exports = {
                    parse: parse,
                    Syntax: require("./union-syntax")
                };
            },
            {
                "./mapping/markdown-syntax-map": 2,
                "./union-syntax": 4,
                debug: 21,
                remark: 40,
                "structured-source": 44,
                traverse: 46
            }
        ],
        4: [
            function(require, module, exports) {
                // LICENSE : MIT
                "use strict";
                // public key interface
                var exports = {
                    Document: "Document", // must
                    Paragraph: "Paragraph",
                    BlockQuote: "BlockQuote",
                    ListItem: "ListItem",
                    List: "List",
                    Header: "Header",
                    CodeBlock: "CodeBlock",
                    HtmlBlock: "HtmlBlock",
                    ReferenceDef: "ReferenceDef",
                    HorizontalRule: "HorizontalRule",
                    // inline
                    Str: "Str", // must
                    Break: "Break", // must
                    Emphasis: "Emphasis",
                    Strong: "Strong",
                    Html: "Html",
                    Link: "Link",
                    Image: "Image",
                    Code: "Code"
                };
                module.exports = exports;
            },
            {}
        ],
        5: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module bail
 * @fileoverview Throw a given error.
 */

                "use strict";

                /**
 * Throw a given error.
 *
 * @example
 *   bail();
 *
 * @example
 *   bail(new Error('failure'));
 *   // Error: failure
 *   //     at repl:1:6
 *   //     at REPLServer.defaultEval (repl.js:154:27)
 *   //     ...
 *
 * @param {Error?} [err] - Optional error.
 * @throws {Error} - `err`, when given.
 */
                function bail(err) {
                    if (err) {
                        throw err;
                    }
                }

                /*
 * Expose.
 */

                module.exports = bail;
            },
            {}
        ],
        6: [
            function(require, module, exports) {
                "use strict";

                exports.toByteArray = toByteArray;
                exports.fromByteArray = fromByteArray;

                var lookup = [];
                var revLookup = [];
                var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;

                function init() {
                    var i;
                    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                    var len = code.length;

                    for (i = 0; i < len; i++) {
                        lookup[i] = code[i];
                    }

                    for (i = 0; i < len; ++i) {
                        revLookup[code.charCodeAt(i)] = i;
                    }
                    revLookup["-".charCodeAt(0)] = 62;
                    revLookup["_".charCodeAt(0)] = 63;
                }

                init();

                function toByteArray(b64) {
                    var i, j, l, tmp, placeHolders, arr;
                    var len = b64.length;

                    if (len % 4 > 0) {
                        throw new Error("Invalid string. Length must be a multiple of 4");
                    }

                    // the number of equal signs (place holders)
                    // if there are two placeholders, than the two characters before it
                    // represent one byte
                    // if there is only one, then the three characters before it represent 2 bytes
                    // this is just a cheap hack to not do indexOf twice
                    placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;

                    // base64 is 4/3 + up to two characters of the original data
                    arr = new Arr(len * 3 / 4 - placeHolders);

                    // if there are placeholders, only get up to the last complete 4 chars
                    l = placeHolders > 0 ? len - 4 : len;

                    var L = 0;

                    for (i = 0, j = 0; i < l; i += 4, j += 3) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 18) |
                            (revLookup[b64.charCodeAt(i + 1)] << 12) |
                            (revLookup[b64.charCodeAt(i + 2)] << 6) |
                            revLookup[b64.charCodeAt(i + 3)];
                        arr[L++] = (tmp & 0xff0000) >> 16;
                        arr[L++] = (tmp & 0xff00) >> 8;
                        arr[L++] = tmp & 0xff;
                    }

                    if (placeHolders === 2) {
                        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
                        arr[L++] = tmp & 0xff;
                    } else if (placeHolders === 1) {
                        tmp =
                            (revLookup[b64.charCodeAt(i)] << 10) |
                            (revLookup[b64.charCodeAt(i + 1)] << 4) |
                            (revLookup[b64.charCodeAt(i + 2)] >> 2);
                        arr[L++] = (tmp >> 8) & 0xff;
                        arr[L++] = tmp & 0xff;
                    }

                    return arr;
                }

                function tripletToBase64(num) {
                    return (
                        lookup[(num >> 18) & 0x3f] +
                        lookup[(num >> 12) & 0x3f] +
                        lookup[(num >> 6) & 0x3f] +
                        lookup[num & 0x3f]
                    );
                }

                function encodeChunk(uint8, start, end) {
                    var tmp;
                    var output = [];
                    for (var i = start; i < end; i += 3) {
                        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                        output.push(tripletToBase64(tmp));
                    }
                    return output.join("");
                }

                function fromByteArray(uint8) {
                    var tmp;
                    var len = uint8.length;
                    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
                    var output = "";
                    var parts = [];
                    var maxChunkLength = 16383; // must be multiple of 3

                    // go through the array every three bytes, we'll deal with trailing stuff later
                    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                        parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
                    }

                    // pad the end with zeros, but make sure to not forget the extra bytes
                    if (extraBytes === 1) {
                        tmp = uint8[len - 1];
                        output += lookup[tmp >> 2];
                        output += lookup[(tmp << 4) & 0x3f];
                        output += "==";
                    } else if (extraBytes === 2) {
                        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                        output += lookup[tmp >> 10];
                        output += lookup[(tmp >> 4) & 0x3f];
                        output += lookup[(tmp << 2) & 0x3f];
                        output += "=";
                    }

                    parts.push(output);

                    return parts.join("");
                }
            },
            {}
        ],
        7: [
            function(require, module, exports) {
                "use strict";

                /*
  Copyright (C) 2014 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

                function compare(v1, v2) {
                    return v1 < v2;
                }

                function upperBound(array, value, comp) {
                    if (comp === undefined) comp = compare;
                    return (function() {
                        var len = array.length;
                        var i = 0;

                        while (len) {
                            var diff = len >>> 1;
                            var cursor = i + diff;
                            if (comp(value, array[cursor])) {
                                len = diff;
                            } else {
                                i = cursor + 1;
                                len -= diff + 1;
                            }
                        }
                        return i;
                    })();
                }

                function lowerBound(array, value, comp) {
                    if (comp === undefined) comp = compare;
                    return (function() {
                        var len = array.length;
                        var i = 0;

                        while (len) {
                            var diff = len >>> 1;
                            var cursor = i + diff;
                            if (comp(array[cursor], value)) {
                                i = cursor + 1;
                                len -= diff + 1;
                            } else {
                                len = diff;
                            }
                        }
                        return i;
                    })();
                }

                function binarySearch(array, value, comp) {
                    if (comp === undefined) comp = compare;
                    return (function() {
                        var cursor = lowerBound(array, value, comp);
                        return cursor !== array.length && !comp(value, array[cursor]);
                    })();
                }

                exports.compare = compare;
                exports.lowerBound = lowerBound;
                exports.upperBound = upperBound;
                exports.binarySearch = binarySearch;
            },
            {}
        ],
        8: [
            function(require, module, exports) {
                (function(global) {
                    /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
                    /* eslint-disable no-proto */

                    "use strict";

                    var base64 = require("base64-js");
                    var ieee754 = require("ieee754");
                    var isArray = require("isarray");

                    exports.Buffer = Buffer;
                    exports.SlowBuffer = SlowBuffer;
                    exports.INSPECT_MAX_BYTES = 50;
                    Buffer.poolSize = 8192; // not used by this implementation

                    var rootParent = {};

                    /**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
                    Buffer.TYPED_ARRAY_SUPPORT =
                        global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();

                    function typedArraySupport() {
                        try {
                            var arr = new Uint8Array(1);
                            arr.foo = function() {
                                return 42;
                            };
                            return (
                                arr.foo() === 42 && // typed array instances can be augmented
                                typeof arr.subarray === "function" && // chrome 9-10 lack `subarray`
                                arr.subarray(1, 1).byteLength === 0
                            ); // ie10 has broken `subarray`
                        } catch (e) {
                            return false;
                        }
                    }

                    function kMaxLength() {
                        return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
                    }

                    /**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */
                    function Buffer(arg) {
                        if (!(this instanceof Buffer)) {
                            // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
                            if (arguments.length > 1) return new Buffer(arg, arguments[1]);
                            return new Buffer(arg);
                        }

                        if (!Buffer.TYPED_ARRAY_SUPPORT) {
                            this.length = 0;
                            this.parent = undefined;
                        }

                        // Common case.
                        if (typeof arg === "number") {
                            return fromNumber(this, arg);
                        }

                        // Slightly less common case.
                        if (typeof arg === "string") {
                            return fromString(this, arg, arguments.length > 1 ? arguments[1] : "utf8");
                        }

                        // Unusual.
                        return fromObject(this, arg);
                    }

                    // TODO: Legacy, not needed anymore. Remove in next major version.
                    Buffer._augment = function(arr) {
                        arr.__proto__ = Buffer.prototype;
                        return arr;
                    };

                    function fromNumber(that, length) {
                        that = allocate(that, length < 0 ? 0 : checked(length) | 0);
                        if (!Buffer.TYPED_ARRAY_SUPPORT) {
                            for (var i = 0; i < length; i++) {
                                that[i] = 0;
                            }
                        }
                        return that;
                    }

                    function fromString(that, string, encoding) {
                        if (typeof encoding !== "string" || encoding === "") encoding = "utf8";

                        // Assumption: byteLength() return value is always < kMaxLength.
                        var length = byteLength(string, encoding) | 0;
                        that = allocate(that, length);

                        that.write(string, encoding);
                        return that;
                    }

                    function fromObject(that, object) {
                        if (Buffer.isBuffer(object)) return fromBuffer(that, object);

                        if (isArray(object)) return fromArray(that, object);

                        if (object == null) {
                            throw new TypeError("must start with number, buffer, array or string");
                        }

                        if (typeof ArrayBuffer !== "undefined") {
                            if (object.buffer instanceof ArrayBuffer) {
                                return fromTypedArray(that, object);
                            }
                            if (object instanceof ArrayBuffer) {
                                return fromArrayBuffer(that, object);
                            }
                        }

                        if (object.length) return fromArrayLike(that, object);

                        return fromJsonObject(that, object);
                    }

                    function fromBuffer(that, buffer) {
                        var length = checked(buffer.length) | 0;
                        that = allocate(that, length);
                        buffer.copy(that, 0, 0, length);
                        return that;
                    }

                    function fromArray(that, array) {
                        var length = checked(array.length) | 0;
                        that = allocate(that, length);
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255;
                        }
                        return that;
                    }

                    // Duplicate of fromArray() to keep fromArray() monomorphic.
                    function fromTypedArray(that, array) {
                        var length = checked(array.length) | 0;
                        that = allocate(that, length);
                        // Truncating the elements is probably not what people expect from typed
                        // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
                        // of the old Buffer constructor.
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255;
                        }
                        return that;
                    }

                    function fromArrayBuffer(that, array) {
                        array.byteLength; // this throws if `array` is not a valid ArrayBuffer

                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            // Return an augmented `Uint8Array` instance, for best performance
                            that = new Uint8Array(array);
                            that.__proto__ = Buffer.prototype;
                        } else {
                            // Fallback: Return an object instance of the Buffer class
                            that = fromTypedArray(that, new Uint8Array(array));
                        }
                        return that;
                    }

                    function fromArrayLike(that, array) {
                        var length = checked(array.length) | 0;
                        that = allocate(that, length);
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255;
                        }
                        return that;
                    }

                    // Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
                    // Returns a zero-length buffer for inputs that don't conform to the spec.
                    function fromJsonObject(that, object) {
                        var array;
                        var length = 0;

                        if (object.type === "Buffer" && isArray(object.data)) {
                            array = object.data;
                            length = checked(array.length) | 0;
                        }
                        that = allocate(that, length);

                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255;
                        }
                        return that;
                    }

                    if (Buffer.TYPED_ARRAY_SUPPORT) {
                        Buffer.prototype.__proto__ = Uint8Array.prototype;
                        Buffer.__proto__ = Uint8Array;
                        if (typeof Symbol !== "undefined" && Symbol.species && Buffer[Symbol.species] === Buffer) {
                            // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
                            Object.defineProperty(Buffer, Symbol.species, {
                                value: null,
                                configurable: true
                            });
                        }
                    } else {
                        // pre-set for values that may exist in the future
                        Buffer.prototype.length = undefined;
                        Buffer.prototype.parent = undefined;
                    }

                    function allocate(that, length) {
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            // Return an augmented `Uint8Array` instance, for best performance
                            that = new Uint8Array(length);
                            that.__proto__ = Buffer.prototype;
                        } else {
                            // Fallback: Return an object instance of the Buffer class
                            that.length = length;
                        }

                        var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
                        if (fromPool) that.parent = rootParent;

                        return that;
                    }

                    function checked(length) {
                        // Note: cannot use `length < kMaxLength` here because that fails when
                        // length is NaN (which is otherwise coerced to zero.)
                        if (length >= kMaxLength()) {
                            throw new RangeError(
                                "Attempt to allocate Buffer larger than maximum " +
                                    "size: 0x" +
                                    kMaxLength().toString(16) +
                                    " bytes"
                            );
                        }
                        return length | 0;
                    }

                    function SlowBuffer(subject, encoding) {
                        if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding);

                        var buf = new Buffer(subject, encoding);
                        delete buf.parent;
                        return buf;
                    }

                    Buffer.isBuffer = function isBuffer(b) {
                        return !!(b != null && b._isBuffer);
                    };

                    Buffer.compare = function compare(a, b) {
                        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                            throw new TypeError("Arguments must be Buffers");
                        }

                        if (a === b) return 0;

                        var x = a.length;
                        var y = b.length;

                        var i = 0;
                        var len = Math.min(x, y);
                        while (i < len) {
                            if (a[i] !== b[i]) break;

                            ++i;
                        }

                        if (i !== len) {
                            x = a[i];
                            y = b[i];
                        }

                        if (x < y) return -1;
                        if (y < x) return 1;
                        return 0;
                    };

                    Buffer.isEncoding = function isEncoding(encoding) {
                        switch (String(encoding).toLowerCase()) {
                            case "hex":
                            case "utf8":
                            case "utf-8":
                            case "ascii":
                            case "binary":
                            case "base64":
                            case "raw":
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return true;
                            default:
                                return false;
                        }
                    };

                    Buffer.concat = function concat(list, length) {
                        if (!isArray(list)) throw new TypeError("list argument must be an Array of Buffers.");

                        if (list.length === 0) {
                            return new Buffer(0);
                        }

                        var i;
                        if (length === undefined) {
                            length = 0;
                            for (i = 0; i < list.length; i++) {
                                length += list[i].length;
                            }
                        }

                        var buf = new Buffer(length);
                        var pos = 0;
                        for (i = 0; i < list.length; i++) {
                            var item = list[i];
                            item.copy(buf, pos);
                            pos += item.length;
                        }
                        return buf;
                    };

                    function byteLength(string, encoding) {
                        if (typeof string !== "string") string = "" + string;

                        var len = string.length;
                        if (len === 0) return 0;

                        // Use a for loop to avoid recursion
                        var loweredCase = false;
                        for (;;) {
                            switch (encoding) {
                                case "ascii":
                                case "binary":
                                // Deprecated
                                case "raw":
                                case "raws":
                                    return len;
                                case "utf8":
                                case "utf-8":
                                    return utf8ToBytes(string).length;
                                case "ucs2":
                                case "ucs-2":
                                case "utf16le":
                                case "utf-16le":
                                    return len * 2;
                                case "hex":
                                    return len >>> 1;
                                case "base64":
                                    return base64ToBytes(string).length;
                                default:
                                    if (loweredCase) return utf8ToBytes(string).length; // assume utf8
                                    encoding = ("" + encoding).toLowerCase();
                                    loweredCase = true;
                            }
                        }
                    }
                    Buffer.byteLength = byteLength;

                    function slowToString(encoding, start, end) {
                        var loweredCase = false;

                        start = start | 0;
                        end = end === undefined || end === Infinity ? this.length : end | 0;

                        if (!encoding) encoding = "utf8";
                        if (start < 0) start = 0;
                        if (end > this.length) end = this.length;
                        if (end <= start) return "";

                        while (true) {
                            switch (encoding) {
                                case "hex":
                                    return hexSlice(this, start, end);

                                case "utf8":
                                case "utf-8":
                                    return utf8Slice(this, start, end);

                                case "ascii":
                                    return asciiSlice(this, start, end);

                                case "binary":
                                    return binarySlice(this, start, end);

                                case "base64":
                                    return base64Slice(this, start, end);

                                case "ucs2":
                                case "ucs-2":
                                case "utf16le":
                                case "utf-16le":
                                    return utf16leSlice(this, start, end);

                                default:
                                    if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                                    encoding = (encoding + "").toLowerCase();
                                    loweredCase = true;
                            }
                        }
                    }

                    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
                    // Buffer instances.
                    Buffer.prototype._isBuffer = true;

                    Buffer.prototype.toString = function toString() {
                        var length = this.length | 0;
                        if (length === 0) return "";
                        if (arguments.length === 0) return utf8Slice(this, 0, length);
                        return slowToString.apply(this, arguments);
                    };

                    Buffer.prototype.equals = function equals(b) {
                        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                        if (this === b) return true;
                        return Buffer.compare(this, b) === 0;
                    };

                    Buffer.prototype.inspect = function inspect() {
                        var str = "";
                        var max = exports.INSPECT_MAX_BYTES;
                        if (this.length > 0) {
                            str = this.toString("hex", 0, max)
                                .match(/.{2}/g)
                                .join(" ");
                            if (this.length > max) str += " ... ";
                        }
                        return "<Buffer " + str + ">";
                    };

                    Buffer.prototype.compare = function compare(b) {
                        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                        if (this === b) return 0;
                        return Buffer.compare(this, b);
                    };

                    Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
                        if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff;
                        else if (byteOffset < -0x80000000) byteOffset = -0x80000000;
                        byteOffset >>= 0;

                        if (this.length === 0) return -1;
                        if (byteOffset >= this.length) return -1;

                        // Negative offsets start from the end of the buffer
                        if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0);

                        if (typeof val === "string") {
                            if (val.length === 0) return -1; // special case: looking for empty string always fails
                            return String.prototype.indexOf.call(this, val, byteOffset);
                        }
                        if (Buffer.isBuffer(val)) {
                            return arrayIndexOf(this, val, byteOffset);
                        }
                        if (typeof val === "number") {
                            if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === "function") {
                                return Uint8Array.prototype.indexOf.call(this, val, byteOffset);
                            }
                            return arrayIndexOf(this, [val], byteOffset);
                        }

                        function arrayIndexOf(arr, val, byteOffset) {
                            var foundIndex = -1;
                            for (var i = 0; byteOffset + i < arr.length; i++) {
                                if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
                                    if (foundIndex === -1) foundIndex = i;
                                    if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex;
                                } else {
                                    foundIndex = -1;
                                }
                            }
                            return -1;
                        }

                        throw new TypeError("val must be string, number or Buffer");
                    };

                    function hexWrite(buf, string, offset, length) {
                        offset = Number(offset) || 0;
                        var remaining = buf.length - offset;
                        if (!length) {
                            length = remaining;
                        } else {
                            length = Number(length);
                            if (length > remaining) {
                                length = remaining;
                            }
                        }

                        // must be an even number of digits
                        var strLen = string.length;
                        if (strLen % 2 !== 0) throw new Error("Invalid hex string");

                        if (length > strLen / 2) {
                            length = strLen / 2;
                        }
                        for (var i = 0; i < length; i++) {
                            var parsed = parseInt(string.substr(i * 2, 2), 16);
                            if (isNaN(parsed)) throw new Error("Invalid hex string");
                            buf[offset + i] = parsed;
                        }
                        return i;
                    }

                    function utf8Write(buf, string, offset, length) {
                        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
                    }

                    function asciiWrite(buf, string, offset, length) {
                        return blitBuffer(asciiToBytes(string), buf, offset, length);
                    }

                    function binaryWrite(buf, string, offset, length) {
                        return asciiWrite(buf, string, offset, length);
                    }

                    function base64Write(buf, string, offset, length) {
                        return blitBuffer(base64ToBytes(string), buf, offset, length);
                    }

                    function ucs2Write(buf, string, offset, length) {
                        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
                    }

                    Buffer.prototype.write = function write(string, offset, length, encoding) {
                        // Buffer#write(string)
                        if (offset === undefined) {
                            encoding = "utf8";
                            length = this.length;
                            offset = 0;
                            // Buffer#write(string, encoding)
                        } else if (length === undefined && typeof offset === "string") {
                            encoding = offset;
                            length = this.length;
                            offset = 0;
                            // Buffer#write(string, offset[, length][, encoding])
                        } else if (isFinite(offset)) {
                            offset = offset | 0;
                            if (isFinite(length)) {
                                length = length | 0;
                                if (encoding === undefined) encoding = "utf8";
                            } else {
                                encoding = length;
                                length = undefined;
                            }
                            // legacy write(string, encoding, offset, length) - remove in v0.13
                        } else {
                            var swap = encoding;
                            encoding = offset;
                            offset = length | 0;
                            length = swap;
                        }

                        var remaining = this.length - offset;
                        if (length === undefined || length > remaining) length = remaining;

                        if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                            throw new RangeError("attempt to write outside buffer bounds");
                        }

                        if (!encoding) encoding = "utf8";

                        var loweredCase = false;
                        for (;;) {
                            switch (encoding) {
                                case "hex":
                                    return hexWrite(this, string, offset, length);

                                case "utf8":
                                case "utf-8":
                                    return utf8Write(this, string, offset, length);

                                case "ascii":
                                    return asciiWrite(this, string, offset, length);

                                case "binary":
                                    return binaryWrite(this, string, offset, length);

                                case "base64":
                                    // Warning: maxLength not taken into account in base64Write
                                    return base64Write(this, string, offset, length);

                                case "ucs2":
                                case "ucs-2":
                                case "utf16le":
                                case "utf-16le":
                                    return ucs2Write(this, string, offset, length);

                                default:
                                    if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                                    encoding = ("" + encoding).toLowerCase();
                                    loweredCase = true;
                            }
                        }
                    };

                    Buffer.prototype.toJSON = function toJSON() {
                        return {
                            type: "Buffer",
                            data: Array.prototype.slice.call(this._arr || this, 0)
                        };
                    };

                    function base64Slice(buf, start, end) {
                        if (start === 0 && end === buf.length) {
                            return base64.fromByteArray(buf);
                        } else {
                            return base64.fromByteArray(buf.slice(start, end));
                        }
                    }

                    function utf8Slice(buf, start, end) {
                        end = Math.min(buf.length, end);
                        var res = [];

                        var i = start;
                        while (i < end) {
                            var firstByte = buf[i];
                            var codePoint = null;
                            var bytesPerSequence =
                                firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1;

                            if (i + bytesPerSequence <= end) {
                                var secondByte, thirdByte, fourthByte, tempCodePoint;

                                switch (bytesPerSequence) {
                                    case 1:
                                        if (firstByte < 0x80) {
                                            codePoint = firstByte;
                                        }
                                        break;
                                    case 2:
                                        secondByte = buf[i + 1];
                                        if ((secondByte & 0xc0) === 0x80) {
                                            tempCodePoint = ((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f);
                                            if (tempCodePoint > 0x7f) {
                                                codePoint = tempCodePoint;
                                            }
                                        }
                                        break;
                                    case 3:
                                        secondByte = buf[i + 1];
                                        thirdByte = buf[i + 2];
                                        if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
                                            tempCodePoint =
                                                ((firstByte & 0xf) << 0xc) |
                                                ((secondByte & 0x3f) << 0x6) |
                                                (thirdByte & 0x3f);
                                            if (
                                                tempCodePoint > 0x7ff &&
                                                (tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)
                                            ) {
                                                codePoint = tempCodePoint;
                                            }
                                        }
                                        break;
                                    case 4:
                                        secondByte = buf[i + 1];
                                        thirdByte = buf[i + 2];
                                        fourthByte = buf[i + 3];
                                        if (
                                            (secondByte & 0xc0) === 0x80 &&
                                            (thirdByte & 0xc0) === 0x80 &&
                                            (fourthByte & 0xc0) === 0x80
                                        ) {
                                            tempCodePoint =
                                                ((firstByte & 0xf) << 0x12) |
                                                ((secondByte & 0x3f) << 0xc) |
                                                ((thirdByte & 0x3f) << 0x6) |
                                                (fourthByte & 0x3f);
                                            if (tempCodePoint > 0xffff && tempCodePoint < 0x110000) {
                                                codePoint = tempCodePoint;
                                            }
                                        }
                                }
                            }

                            if (codePoint === null) {
                                // we did not generate a valid codePoint so insert a
                                // replacement char (U+FFFD) and advance only 1 byte
                                codePoint = 0xfffd;
                                bytesPerSequence = 1;
                            } else if (codePoint > 0xffff) {
                                // encode to utf16 (surrogate pair dance)
                                codePoint -= 0x10000;
                                res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
                                codePoint = 0xdc00 | (codePoint & 0x3ff);
                            }

                            res.push(codePoint);
                            i += bytesPerSequence;
                        }

                        return decodeCodePointsArray(res);
                    }

                    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
                    // the lowest limit is Chrome, with 0x10000 args.
                    // We go 1 magnitude less, for safety
                    var MAX_ARGUMENTS_LENGTH = 0x1000;

                    function decodeCodePointsArray(codePoints) {
                        var len = codePoints.length;
                        if (len <= MAX_ARGUMENTS_LENGTH) {
                            return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
                        }

                        // Decode in chunks to avoid "call stack size exceeded".
                        var res = "";
                        var i = 0;
                        while (i < len) {
                            res += String.fromCharCode.apply(String, codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH)));
                        }
                        return res;
                    }

                    function asciiSlice(buf, start, end) {
                        var ret = "";
                        end = Math.min(buf.length, end);

                        for (var i = start; i < end; i++) {
                            ret += String.fromCharCode(buf[i] & 0x7f);
                        }
                        return ret;
                    }

                    function binarySlice(buf, start, end) {
                        var ret = "";
                        end = Math.min(buf.length, end);

                        for (var i = start; i < end; i++) {
                            ret += String.fromCharCode(buf[i]);
                        }
                        return ret;
                    }

                    function hexSlice(buf, start, end) {
                        var len = buf.length;

                        if (!start || start < 0) start = 0;
                        if (!end || end < 0 || end > len) end = len;

                        var out = "";
                        for (var i = start; i < end; i++) {
                            out += toHex(buf[i]);
                        }
                        return out;
                    }

                    function utf16leSlice(buf, start, end) {
                        var bytes = buf.slice(start, end);
                        var res = "";
                        for (var i = 0; i < bytes.length; i += 2) {
                            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
                        }
                        return res;
                    }

                    Buffer.prototype.slice = function slice(start, end) {
                        var len = this.length;
                        start = ~~start;
                        end = end === undefined ? len : ~~end;

                        if (start < 0) {
                            start += len;
                            if (start < 0) start = 0;
                        } else if (start > len) {
                            start = len;
                        }

                        if (end < 0) {
                            end += len;
                            if (end < 0) end = 0;
                        } else if (end > len) {
                            end = len;
                        }

                        if (end < start) end = start;

                        var newBuf;
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            newBuf = this.subarray(start, end);
                            newBuf.__proto__ = Buffer.prototype;
                        } else {
                            var sliceLen = end - start;
                            newBuf = new Buffer(sliceLen, undefined);
                            for (var i = 0; i < sliceLen; i++) {
                                newBuf[i] = this[i + start];
                            }
                        }

                        if (newBuf.length) newBuf.parent = this.parent || this;

                        return newBuf;
                    };

                    /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
                    function checkOffset(offset, ext, length) {
                        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
                        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
                    }

                    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkOffset(offset, byteLength, this.length);

                        var val = this[offset];
                        var mul = 1;
                        var i = 0;
                        while (++i < byteLength && (mul *= 0x100)) {
                            val += this[offset + i] * mul;
                        }

                        return val;
                    };

                    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) {
                            checkOffset(offset, byteLength, this.length);
                        }

                        var val = this[offset + --byteLength];
                        var mul = 1;
                        while (byteLength > 0 && (mul *= 0x100)) {
                            val += this[offset + --byteLength] * mul;
                        }

                        return val;
                    };

                    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 1, this.length);
                        return this[offset];
                    };

                    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        return this[offset] | (this[offset + 1] << 8);
                    };

                    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        return (this[offset] << 8) | this[offset + 1];
                    };

                    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);

                        return (
                            (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16)) +
                            this[offset + 3] * 0x1000000
                        );
                    };

                    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);

                        return (
                            this[offset] * 0x1000000 +
                            ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3])
                        );
                    };

                    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkOffset(offset, byteLength, this.length);

                        var val = this[offset];
                        var mul = 1;
                        var i = 0;
                        while (++i < byteLength && (mul *= 0x100)) {
                            val += this[offset + i] * mul;
                        }
                        mul *= 0x80;

                        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

                        return val;
                    };

                    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkOffset(offset, byteLength, this.length);

                        var i = byteLength;
                        var mul = 1;
                        var val = this[offset + --i];
                        while (i > 0 && (mul *= 0x100)) {
                            val += this[offset + --i] * mul;
                        }
                        mul *= 0x80;

                        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

                        return val;
                    };

                    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 1, this.length);
                        if (!(this[offset] & 0x80)) return this[offset];
                        return (0xff - this[offset] + 1) * -1;
                    };

                    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        var val = this[offset] | (this[offset + 1] << 8);
                        return val & 0x8000 ? val | 0xffff0000 : val;
                    };

                    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 2, this.length);
                        var val = this[offset + 1] | (this[offset] << 8);
                        return val & 0x8000 ? val | 0xffff0000 : val;
                    };

                    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);

                        return (
                            this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24)
                        );
                    };

                    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);

                        return (
                            (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]
                        );
                    };

                    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return ieee754.read(this, offset, true, 23, 4);
                    };

                    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 4, this.length);
                        return ieee754.read(this, offset, false, 23, 4);
                    };

                    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 8, this.length);
                        return ieee754.read(this, offset, true, 52, 8);
                    };

                    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                        if (!noAssert) checkOffset(offset, 8, this.length);
                        return ieee754.read(this, offset, false, 52, 8);
                    };

                    function checkInt(buf, value, offset, ext, max, min) {
                        if (!Buffer.isBuffer(buf)) throw new TypeError("buffer must be a Buffer instance");
                        if (value > max || value < min) throw new RangeError("value is out of bounds");
                        if (offset + ext > buf.length) throw new RangeError("index out of range");
                    }

                    Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);

                        var mul = 1;
                        var i = 0;
                        this[offset] = value & 0xff;
                        while (++i < byteLength && (mul *= 0x100)) {
                            this[offset + i] = (value / mul) & 0xff;
                        }

                        return offset + byteLength;
                    };

                    Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);

                        var i = byteLength - 1;
                        var mul = 1;
                        this[offset + i] = value & 0xff;
                        while (--i >= 0 && (mul *= 0x100)) {
                            this[offset + i] = (value / mul) & 0xff;
                        }

                        return offset + byteLength;
                    };

                    Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
                        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                        this[offset] = value & 0xff;
                        return offset + 1;
                    };

                    function objectWriteUInt16(buf, value, offset, littleEndian) {
                        if (value < 0) value = 0xffff + value + 1;
                        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
                            buf[offset + i] =
                                (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                                ((littleEndian ? i : 1 - i) * 8);
                        }
                    }

                    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value & 0xff;
                            this[offset + 1] = value >>> 8;
                        } else {
                            objectWriteUInt16(this, value, offset, true);
                        }
                        return offset + 2;
                    };

                    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 8;
                            this[offset + 1] = value & 0xff;
                        } else {
                            objectWriteUInt16(this, value, offset, false);
                        }
                        return offset + 2;
                    };

                    function objectWriteUInt32(buf, value, offset, littleEndian) {
                        if (value < 0) value = 0xffffffff + value + 1;
                        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
                            buf[offset + i] = (value >>> ((littleEndian ? i : 3 - i) * 8)) & 0xff;
                        }
                    }

                    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset + 3] = value >>> 24;
                            this[offset + 2] = value >>> 16;
                            this[offset + 1] = value >>> 8;
                            this[offset] = value & 0xff;
                        } else {
                            objectWriteUInt32(this, value, offset, true);
                        }
                        return offset + 4;
                    };

                    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 24;
                            this[offset + 1] = value >>> 16;
                            this[offset + 2] = value >>> 8;
                            this[offset + 3] = value & 0xff;
                        } else {
                            objectWriteUInt32(this, value, offset, false);
                        }
                        return offset + 4;
                    };

                    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1);

                            checkInt(this, value, offset, byteLength, limit - 1, -limit);
                        }

                        var i = 0;
                        var mul = 1;
                        var sub = value < 0 ? 1 : 0;
                        this[offset] = value & 0xff;
                        while (++i < byteLength && (mul *= 0x100)) {
                            this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
                        }

                        return offset + byteLength;
                    };

                    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1);

                            checkInt(this, value, offset, byteLength, limit - 1, -limit);
                        }

                        var i = byteLength - 1;
                        var mul = 1;
                        var sub = value < 0 ? 1 : 0;
                        this[offset + i] = value & 0xff;
                        while (--i >= 0 && (mul *= 0x100)) {
                            this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
                        }

                        return offset + byteLength;
                    };

                    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
                        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                        if (value < 0) value = 0xff + value + 1;
                        this[offset] = value & 0xff;
                        return offset + 1;
                    };

                    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value & 0xff;
                            this[offset + 1] = value >>> 8;
                        } else {
                            objectWriteUInt16(this, value, offset, true);
                        }
                        return offset + 2;
                    };

                    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 8;
                            this[offset + 1] = value & 0xff;
                        } else {
                            objectWriteUInt16(this, value, offset, false);
                        }
                        return offset + 2;
                    };

                    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value & 0xff;
                            this[offset + 1] = value >>> 8;
                            this[offset + 2] = value >>> 16;
                            this[offset + 3] = value >>> 24;
                        } else {
                            objectWriteUInt32(this, value, offset, true);
                        }
                        return offset + 4;
                    };

                    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
                        if (value < 0) value = 0xffffffff + value + 1;
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = value >>> 24;
                            this[offset + 1] = value >>> 16;
                            this[offset + 2] = value >>> 8;
                            this[offset + 3] = value & 0xff;
                        } else {
                            objectWriteUInt32(this, value, offset, false);
                        }
                        return offset + 4;
                    };

                    function checkIEEE754(buf, value, offset, ext, max, min) {
                        if (offset + ext > buf.length) throw new RangeError("index out of range");
                        if (offset < 0) throw new RangeError("index out of range");
                    }

                    function writeFloat(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
                        }
                        ieee754.write(buf, value, offset, littleEndian, 23, 4);
                        return offset + 4;
                    }

                    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, true, noAssert);
                    };

                    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, false, noAssert);
                    };

                    function writeDouble(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
                        }
                        ieee754.write(buf, value, offset, littleEndian, 52, 8);
                        return offset + 8;
                    }

                    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, true, noAssert);
                    };

                    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, false, noAssert);
                    };

                    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
                    Buffer.prototype.copy = function copy(target, targetStart, start, end) {
                        if (!start) start = 0;
                        if (!end && end !== 0) end = this.length;
                        if (targetStart >= target.length) targetStart = target.length;
                        if (!targetStart) targetStart = 0;
                        if (end > 0 && end < start) end = start;

                        // Copy 0 bytes; we're done
                        if (end === start) return 0;
                        if (target.length === 0 || this.length === 0) return 0;

                        // Fatal error conditions
                        if (targetStart < 0) {
                            throw new RangeError("targetStart out of bounds");
                        }
                        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
                        if (end < 0) throw new RangeError("sourceEnd out of bounds");

                        // Are we oob?
                        if (end > this.length) end = this.length;
                        if (target.length - targetStart < end - start) {
                            end = target.length - targetStart + start;
                        }

                        var len = end - start;
                        var i;

                        if (this === target && start < targetStart && targetStart < end) {
                            // descending copy from end
                            for (i = len - 1; i >= 0; i--) {
                                target[i + targetStart] = this[i + start];
                            }
                        } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                            // ascending copy from start
                            for (i = 0; i < len; i++) {
                                target[i + targetStart] = this[i + start];
                            }
                        } else {
                            Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
                        }

                        return len;
                    };

                    // fill(value, start=0, end=buffer.length)
                    Buffer.prototype.fill = function fill(value, start, end) {
                        if (!value) value = 0;
                        if (!start) start = 0;
                        if (!end) end = this.length;

                        if (end < start) throw new RangeError("end < start");

                        // Fill 0 bytes; we're done
                        if (end === start) return;
                        if (this.length === 0) return;

                        if (start < 0 || start >= this.length) throw new RangeError("start out of bounds");
                        if (end < 0 || end > this.length) throw new RangeError("end out of bounds");

                        var i;
                        if (typeof value === "number") {
                            for (i = start; i < end; i++) {
                                this[i] = value;
                            }
                        } else {
                            var bytes = utf8ToBytes(value.toString());
                            var len = bytes.length;
                            for (i = start; i < end; i++) {
                                this[i] = bytes[i % len];
                            }
                        }

                        return this;
                    };

                    // HELPER FUNCTIONS
                    // ================

                    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

                    function base64clean(str) {
                        // Node strips out invalid characters like \n and \t from the string, base64-js does not
                        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
                        // Node converts strings with length < 2 to ''
                        if (str.length < 2) return "";
                        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
                        while (str.length % 4 !== 0) {
                            str = str + "=";
                        }
                        return str;
                    }

                    function stringtrim(str) {
                        if (str.trim) return str.trim();
                        return str.replace(/^\s+|\s+$/g, "");
                    }

                    function toHex(n) {
                        if (n < 16) return "0" + n.toString(16);
                        return n.toString(16);
                    }

                    function utf8ToBytes(string, units) {
                        units = units || Infinity;
                        var codePoint;
                        var length = string.length;
                        var leadSurrogate = null;
                        var bytes = [];

                        for (var i = 0; i < length; i++) {
                            codePoint = string.charCodeAt(i);

                            // is surrogate component
                            if (codePoint > 0xd7ff && codePoint < 0xe000) {
                                // last char was a lead
                                if (!leadSurrogate) {
                                    // no lead yet
                                    if (codePoint > 0xdbff) {
                                        // unexpected trail
                                        if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                                        continue;
                                    } else if (i + 1 === length) {
                                        // unpaired lead
                                        if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                                        continue;
                                    }

                                    // valid lead
                                    leadSurrogate = codePoint;

                                    continue;
                                }

                                // 2 leads in a row
                                if (codePoint < 0xdc00) {
                                    if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                                    leadSurrogate = codePoint;
                                    continue;
                                }

                                // valid surrogate pair
                                codePoint = (((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) + 0x10000;
                            } else if (leadSurrogate) {
                                // valid bmp char, but last char was a lead
                                if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                            }

                            leadSurrogate = null;

                            // encode utf8
                            if (codePoint < 0x80) {
                                if ((units -= 1) < 0) break;
                                bytes.push(codePoint);
                            } else if (codePoint < 0x800) {
                                if ((units -= 2) < 0) break;
                                bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80);
                            } else if (codePoint < 0x10000) {
                                if ((units -= 3) < 0) break;
                                bytes.push(
                                    (codePoint >> 0xc) | 0xe0,
                                    ((codePoint >> 0x6) & 0x3f) | 0x80,
                                    (codePoint & 0x3f) | 0x80
                                );
                            } else if (codePoint < 0x110000) {
                                if ((units -= 4) < 0) break;
                                bytes.push(
                                    (codePoint >> 0x12) | 0xf0,
                                    ((codePoint >> 0xc) & 0x3f) | 0x80,
                                    ((codePoint >> 0x6) & 0x3f) | 0x80,
                                    (codePoint & 0x3f) | 0x80
                                );
                            } else {
                                throw new Error("Invalid code point");
                            }
                        }

                        return bytes;
                    }

                    function asciiToBytes(str) {
                        var byteArray = [];
                        for (var i = 0; i < str.length; i++) {
                            // Node's code seems to be doing this and not & 0x7F..
                            byteArray.push(str.charCodeAt(i) & 0xff);
                        }
                        return byteArray;
                    }

                    function utf16leToBytes(str, units) {
                        var c, hi, lo;
                        var byteArray = [];
                        for (var i = 0; i < str.length; i++) {
                            if ((units -= 2) < 0) break;

                            c = str.charCodeAt(i);
                            hi = c >> 8;
                            lo = c % 256;
                            byteArray.push(lo);
                            byteArray.push(hi);
                        }

                        return byteArray;
                    }

                    function base64ToBytes(str) {
                        return base64.toByteArray(base64clean(str));
                    }

                    function blitBuffer(src, dst, offset, length) {
                        for (var i = 0; i < length; i++) {
                            if (i + offset >= dst.length || i >= src.length) break;
                            dst[i + offset] = src[i];
                        }
                        return i;
                    }
                }.call(
                    this,
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}
                ));
            },
            { "base64-js": 6, ieee754: 25, isarray: 9 }
        ],
        9: [
            function(require, module, exports) {
                var toString = {}.toString;

                module.exports =
                    Array.isArray ||
                    function(arr) {
                        return toString.call(arr) == "[object Array]";
                    };
            },
            {}
        ],
        10: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module ccount
 * @fileoverview Count characters.
 */

                "use strict";

                /**
 * Count how many characters `character` occur in `value`.
 *
 * @example
 *   ccount('foo(bar(baz)', '(') // 2
 *   ccount('foo(bar(baz)', ')') // 1
 *
 * @param {string} value - Content, coerced to string.
 * @param {string} character - Single character to look
 *   for.
 * @return {number} - Count.
 * @throws {Error} - when `character` is not a single
 *   character.
 */
                function ccount(value, character) {
                    var index = -1;
                    var count = 0;
                    var length;

                    value = String(value);
                    length = value.length;

                    if (typeof character !== "string" || character.length !== 1) {
                        throw new Error("Expected character");
                    }

                    while (++index < length) {
                        if (value.charAt(index) === character) {
                            count++;
                        }
                    }

                    return count;
                }

                /*
 * Expose.
 */

                module.exports = ccount;
            },
            {}
        ],
        11: [
            function(require, module, exports) {
                module.exports = {
                    nbsp: " ",
                    iexcl: "¡",
                    cent: "¢",
                    pound: "£",
                    curren: "¤",
                    yen: "¥",
                    brvbar: "¦",
                    sect: "§",
                    uml: "¨",
                    copy: "©",
                    ordf: "ª",
                    laquo: "«",
                    not: "¬",
                    shy: "­",
                    reg: "®",
                    macr: "¯",
                    deg: "°",
                    plusmn: "±",
                    sup2: "²",
                    sup3: "³",
                    acute: "´",
                    micro: "µ",
                    para: "¶",
                    middot: "·",
                    cedil: "¸",
                    sup1: "¹",
                    ordm: "º",
                    raquo: "»",
                    frac14: "¼",
                    frac12: "½",
                    frac34: "¾",
                    iquest: "¿",
                    Agrave: "À",
                    Aacute: "Á",
                    Acirc: "Â",
                    Atilde: "Ã",
                    Auml: "Ä",
                    Aring: "Å",
                    AElig: "Æ",
                    Ccedil: "Ç",
                    Egrave: "È",
                    Eacute: "É",
                    Ecirc: "Ê",
                    Euml: "Ë",
                    Igrave: "Ì",
                    Iacute: "Í",
                    Icirc: "Î",
                    Iuml: "Ï",
                    ETH: "Ð",
                    Ntilde: "Ñ",
                    Ograve: "Ò",
                    Oacute: "Ó",
                    Ocirc: "Ô",
                    Otilde: "Õ",
                    Ouml: "Ö",
                    times: "×",
                    Oslash: "Ø",
                    Ugrave: "Ù",
                    Uacute: "Ú",
                    Ucirc: "Û",
                    Uuml: "Ü",
                    Yacute: "Ý",
                    THORN: "Þ",
                    szlig: "ß",
                    agrave: "à",
                    aacute: "á",
                    acirc: "â",
                    atilde: "ã",
                    auml: "ä",
                    aring: "å",
                    aelig: "æ",
                    ccedil: "ç",
                    egrave: "è",
                    eacute: "é",
                    ecirc: "ê",
                    euml: "ë",
                    igrave: "ì",
                    iacute: "í",
                    icirc: "î",
                    iuml: "ï",
                    eth: "ð",
                    ntilde: "ñ",
                    ograve: "ò",
                    oacute: "ó",
                    ocirc: "ô",
                    otilde: "õ",
                    ouml: "ö",
                    divide: "÷",
                    oslash: "ø",
                    ugrave: "ù",
                    uacute: "ú",
                    ucirc: "û",
                    uuml: "ü",
                    yacute: "ý",
                    thorn: "þ",
                    yuml: "ÿ",
                    fnof: "ƒ",
                    Alpha: "Α",
                    Beta: "Β",
                    Gamma: "Γ",
                    Delta: "Δ",
                    Epsilon: "Ε",
                    Zeta: "Ζ",
                    Eta: "Η",
                    Theta: "Θ",
                    Iota: "Ι",
                    Kappa: "Κ",
                    Lambda: "Λ",
                    Mu: "Μ",
                    Nu: "Ν",
                    Xi: "Ξ",
                    Omicron: "Ο",
                    Pi: "Π",
                    Rho: "Ρ",
                    Sigma: "Σ",
                    Tau: "Τ",
                    Upsilon: "Υ",
                    Phi: "Φ",
                    Chi: "Χ",
                    Psi: "Ψ",
                    Omega: "Ω",
                    alpha: "α",
                    beta: "β",
                    gamma: "γ",
                    delta: "δ",
                    epsilon: "ε",
                    zeta: "ζ",
                    eta: "η",
                    theta: "θ",
                    iota: "ι",
                    kappa: "κ",
                    lambda: "λ",
                    mu: "μ",
                    nu: "ν",
                    xi: "ξ",
                    omicron: "ο",
                    pi: "π",
                    rho: "ρ",
                    sigmaf: "ς",
                    sigma: "σ",
                    tau: "τ",
                    upsilon: "υ",
                    phi: "φ",
                    chi: "χ",
                    psi: "ψ",
                    omega: "ω",
                    thetasym: "ϑ",
                    upsih: "ϒ",
                    piv: "ϖ",
                    bull: "•",
                    hellip: "…",
                    prime: "′",
                    Prime: "″",
                    oline: "‾",
                    frasl: "⁄",
                    weierp: "℘",
                    image: "ℑ",
                    real: "ℜ",
                    trade: "™",
                    alefsym: "ℵ",
                    larr: "←",
                    uarr: "↑",
                    rarr: "→",
                    darr: "↓",
                    harr: "↔",
                    crarr: "↵",
                    lArr: "⇐",
                    uArr: "⇑",
                    rArr: "⇒",
                    dArr: "⇓",
                    hArr: "⇔",
                    forall: "∀",
                    part: "∂",
                    exist: "∃",
                    empty: "∅",
                    nabla: "∇",
                    isin: "∈",
                    notin: "∉",
                    ni: "∋",
                    prod: "∏",
                    sum: "∑",
                    minus: "−",
                    lowast: "∗",
                    radic: "√",
                    prop: "∝",
                    infin: "∞",
                    ang: "∠",
                    and: "∧",
                    or: "∨",
                    cap: "∩",
                    cup: "∪",
                    int: "∫",
                    there4: "∴",
                    sim: "∼",
                    cong: "≅",
                    asymp: "≈",
                    ne: "≠",
                    equiv: "≡",
                    le: "≤",
                    ge: "≥",
                    sub: "⊂",
                    sup: "⊃",
                    nsub: "⊄",
                    sube: "⊆",
                    supe: "⊇",
                    oplus: "⊕",
                    otimes: "⊗",
                    perp: "⊥",
                    sdot: "⋅",
                    lceil: "⌈",
                    rceil: "⌉",
                    lfloor: "⌊",
                    rfloor: "⌋",
                    lang: "〈",
                    rang: "〉",
                    loz: "◊",
                    spades: "♠",
                    clubs: "♣",
                    hearts: "♥",
                    diams: "♦",
                    quot: '"',
                    amp: "&",
                    lt: "<",
                    gt: ">",
                    OElig: "Œ",
                    oelig: "œ",
                    Scaron: "Š",
                    scaron: "š",
                    Yuml: "Ÿ",
                    circ: "ˆ",
                    tilde: "˜",
                    ensp: " ",
                    emsp: " ",
                    thinsp: " ",
                    zwnj: "‌",
                    zwj: "‍",
                    lrm: "‎",
                    rlm: "‏",
                    ndash: "–",
                    mdash: "—",
                    lsquo: "‘",
                    rsquo: "’",
                    sbquo: "‚",
                    ldquo: "“",
                    rdquo: "”",
                    bdquo: "„",
                    dagger: "†",
                    Dagger: "‡",
                    permil: "‰",
                    lsaquo: "‹",
                    rsaquo: "›",
                    euro: "€"
                };
            },
            {}
        ],
        12: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module character-entities-html4
 * @fileoverview HTML4 character entity information.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Expose.
 */

                module.exports = require("./index.json");
            },
            { "./index.json": 11 }
        ],
        13: [
            function(require, module, exports) {
                module.exports = {
                    AElig: "Æ",
                    AMP: "&",
                    Aacute: "Á",
                    Acirc: "Â",
                    Agrave: "À",
                    Aring: "Å",
                    Atilde: "Ã",
                    Auml: "Ä",
                    COPY: "©",
                    Ccedil: "Ç",
                    ETH: "Ð",
                    Eacute: "É",
                    Ecirc: "Ê",
                    Egrave: "È",
                    Euml: "Ë",
                    GT: ">",
                    Iacute: "Í",
                    Icirc: "Î",
                    Igrave: "Ì",
                    Iuml: "Ï",
                    LT: "<",
                    Ntilde: "Ñ",
                    Oacute: "Ó",
                    Ocirc: "Ô",
                    Ograve: "Ò",
                    Oslash: "Ø",
                    Otilde: "Õ",
                    Ouml: "Ö",
                    QUOT: '"',
                    REG: "®",
                    THORN: "Þ",
                    Uacute: "Ú",
                    Ucirc: "Û",
                    Ugrave: "Ù",
                    Uuml: "Ü",
                    Yacute: "Ý",
                    aacute: "á",
                    acirc: "â",
                    acute: "´",
                    aelig: "æ",
                    agrave: "à",
                    amp: "&",
                    aring: "å",
                    atilde: "ã",
                    auml: "ä",
                    brvbar: "¦",
                    ccedil: "ç",
                    cedil: "¸",
                    cent: "¢",
                    copy: "©",
                    curren: "¤",
                    deg: "°",
                    divide: "÷",
                    eacute: "é",
                    ecirc: "ê",
                    egrave: "è",
                    eth: "ð",
                    euml: "ë",
                    frac12: "½",
                    frac14: "¼",
                    frac34: "¾",
                    gt: ">",
                    iacute: "í",
                    icirc: "î",
                    iexcl: "¡",
                    igrave: "ì",
                    iquest: "¿",
                    iuml: "ï",
                    laquo: "«",
                    lt: "<",
                    macr: "¯",
                    micro: "µ",
                    middot: "·",
                    nbsp: " ",
                    not: "¬",
                    ntilde: "ñ",
                    oacute: "ó",
                    ocirc: "ô",
                    ograve: "ò",
                    ordf: "ª",
                    ordm: "º",
                    oslash: "ø",
                    otilde: "õ",
                    ouml: "ö",
                    para: "¶",
                    plusmn: "±",
                    pound: "£",
                    quot: '"',
                    raquo: "»",
                    reg: "®",
                    sect: "§",
                    shy: "­",
                    sup1: "¹",
                    sup2: "²",
                    sup3: "³",
                    szlig: "ß",
                    thorn: "þ",
                    times: "×",
                    uacute: "ú",
                    ucirc: "û",
                    ugrave: "ù",
                    uml: "¨",
                    uuml: "ü",
                    yacute: "ý",
                    yen: "¥",
                    yuml: "ÿ"
                };
            },
            {}
        ],
        14: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module character-entities-legacy
 * @fileoverview HTML legacy character entity information.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Expose.
 */

                module.exports = require("./index.json");
            },
            { "./index.json": 13 }
        ],
        15: [
            function(require, module, exports) {
                module.exports = {
                    AElig: "Æ",
                    AMP: "&",
                    Aacute: "Á",
                    Abreve: "Ă",
                    Acirc: "Â",
                    Acy: "А",
                    Afr: "𝔄",
                    Agrave: "À",
                    Alpha: "Α",
                    Amacr: "Ā",
                    And: "⩓",
                    Aogon: "Ą",
                    Aopf: "𝔸",
                    ApplyFunction: "⁡",
                    Aring: "Å",
                    Ascr: "𝒜",
                    Assign: "≔",
                    Atilde: "Ã",
                    Auml: "Ä",
                    Backslash: "∖",
                    Barv: "⫧",
                    Barwed: "⌆",
                    Bcy: "Б",
                    Because: "∵",
                    Bernoullis: "ℬ",
                    Beta: "Β",
                    Bfr: "𝔅",
                    Bopf: "𝔹",
                    Breve: "˘",
                    Bscr: "ℬ",
                    Bumpeq: "≎",
                    CHcy: "Ч",
                    COPY: "©",
                    Cacute: "Ć",
                    Cap: "⋒",
                    CapitalDifferentialD: "ⅅ",
                    Cayleys: "ℭ",
                    Ccaron: "Č",
                    Ccedil: "Ç",
                    Ccirc: "Ĉ",
                    Cconint: "∰",
                    Cdot: "Ċ",
                    Cedilla: "¸",
                    CenterDot: "·",
                    Cfr: "ℭ",
                    Chi: "Χ",
                    CircleDot: "⊙",
                    CircleMinus: "⊖",
                    CirclePlus: "⊕",
                    CircleTimes: "⊗",
                    ClockwiseContourIntegral: "∲",
                    CloseCurlyDoubleQuote: "”",
                    CloseCurlyQuote: "’",
                    Colon: "∷",
                    Colone: "⩴",
                    Congruent: "≡",
                    Conint: "∯",
                    ContourIntegral: "∮",
                    Copf: "ℂ",
                    Coproduct: "∐",
                    CounterClockwiseContourIntegral: "∳",
                    Cross: "⨯",
                    Cscr: "𝒞",
                    Cup: "⋓",
                    CupCap: "≍",
                    DD: "ⅅ",
                    DDotrahd: "⤑",
                    DJcy: "Ђ",
                    DScy: "Ѕ",
                    DZcy: "Џ",
                    Dagger: "‡",
                    Darr: "↡",
                    Dashv: "⫤",
                    Dcaron: "Ď",
                    Dcy: "Д",
                    Del: "∇",
                    Delta: "Δ",
                    Dfr: "𝔇",
                    DiacriticalAcute: "´",
                    DiacriticalDot: "˙",
                    DiacriticalDoubleAcute: "˝",
                    DiacriticalGrave: "`",
                    DiacriticalTilde: "˜",
                    Diamond: "⋄",
                    DifferentialD: "ⅆ",
                    Dopf: "𝔻",
                    Dot: "¨",
                    DotDot: "⃜",
                    DotEqual: "≐",
                    DoubleContourIntegral: "∯",
                    DoubleDot: "¨",
                    DoubleDownArrow: "⇓",
                    DoubleLeftArrow: "⇐",
                    DoubleLeftRightArrow: "⇔",
                    DoubleLeftTee: "⫤",
                    DoubleLongLeftArrow: "⟸",
                    DoubleLongLeftRightArrow: "⟺",
                    DoubleLongRightArrow: "⟹",
                    DoubleRightArrow: "⇒",
                    DoubleRightTee: "⊨",
                    DoubleUpArrow: "⇑",
                    DoubleUpDownArrow: "⇕",
                    DoubleVerticalBar: "∥",
                    DownArrow: "↓",
                    DownArrowBar: "⤓",
                    DownArrowUpArrow: "⇵",
                    DownBreve: "̑",
                    DownLeftRightVector: "⥐",
                    DownLeftTeeVector: "⥞",
                    DownLeftVector: "↽",
                    DownLeftVectorBar: "⥖",
                    DownRightTeeVector: "⥟",
                    DownRightVector: "⇁",
                    DownRightVectorBar: "⥗",
                    DownTee: "⊤",
                    DownTeeArrow: "↧",
                    Downarrow: "⇓",
                    Dscr: "𝒟",
                    Dstrok: "Đ",
                    ENG: "Ŋ",
                    ETH: "Ð",
                    Eacute: "É",
                    Ecaron: "Ě",
                    Ecirc: "Ê",
                    Ecy: "Э",
                    Edot: "Ė",
                    Efr: "𝔈",
                    Egrave: "È",
                    Element: "∈",
                    Emacr: "Ē",
                    EmptySmallSquare: "◻",
                    EmptyVerySmallSquare: "▫",
                    Eogon: "Ę",
                    Eopf: "𝔼",
                    Epsilon: "Ε",
                    Equal: "⩵",
                    EqualTilde: "≂",
                    Equilibrium: "⇌",
                    Escr: "ℰ",
                    Esim: "⩳",
                    Eta: "Η",
                    Euml: "Ë",
                    Exists: "∃",
                    ExponentialE: "ⅇ",
                    Fcy: "Ф",
                    Ffr: "𝔉",
                    FilledSmallSquare: "◼",
                    FilledVerySmallSquare: "▪",
                    Fopf: "𝔽",
                    ForAll: "∀",
                    Fouriertrf: "ℱ",
                    Fscr: "ℱ",
                    GJcy: "Ѓ",
                    GT: ">",
                    Gamma: "Γ",
                    Gammad: "Ϝ",
                    Gbreve: "Ğ",
                    Gcedil: "Ģ",
                    Gcirc: "Ĝ",
                    Gcy: "Г",
                    Gdot: "Ġ",
                    Gfr: "𝔊",
                    Gg: "⋙",
                    Gopf: "𝔾",
                    GreaterEqual: "≥",
                    GreaterEqualLess: "⋛",
                    GreaterFullEqual: "≧",
                    GreaterGreater: "⪢",
                    GreaterLess: "≷",
                    GreaterSlantEqual: "⩾",
                    GreaterTilde: "≳",
                    Gscr: "𝒢",
                    Gt: "≫",
                    HARDcy: "Ъ",
                    Hacek: "ˇ",
                    Hat: "^",
                    Hcirc: "Ĥ",
                    Hfr: "ℌ",
                    HilbertSpace: "ℋ",
                    Hopf: "ℍ",
                    HorizontalLine: "─",
                    Hscr: "ℋ",
                    Hstrok: "Ħ",
                    HumpDownHump: "≎",
                    HumpEqual: "≏",
                    IEcy: "Е",
                    IJlig: "Ĳ",
                    IOcy: "Ё",
                    Iacute: "Í",
                    Icirc: "Î",
                    Icy: "И",
                    Idot: "İ",
                    Ifr: "ℑ",
                    Igrave: "Ì",
                    Im: "ℑ",
                    Imacr: "Ī",
                    ImaginaryI: "ⅈ",
                    Implies: "⇒",
                    Int: "∬",
                    Integral: "∫",
                    Intersection: "⋂",
                    InvisibleComma: "⁣",
                    InvisibleTimes: "⁢",
                    Iogon: "Į",
                    Iopf: "𝕀",
                    Iota: "Ι",
                    Iscr: "ℐ",
                    Itilde: "Ĩ",
                    Iukcy: "І",
                    Iuml: "Ï",
                    Jcirc: "Ĵ",
                    Jcy: "Й",
                    Jfr: "𝔍",
                    Jopf: "𝕁",
                    Jscr: "𝒥",
                    Jsercy: "Ј",
                    Jukcy: "Є",
                    KHcy: "Х",
                    KJcy: "Ќ",
                    Kappa: "Κ",
                    Kcedil: "Ķ",
                    Kcy: "К",
                    Kfr: "𝔎",
                    Kopf: "𝕂",
                    Kscr: "𝒦",
                    LJcy: "Љ",
                    LT: "<",
                    Lacute: "Ĺ",
                    Lambda: "Λ",
                    Lang: "⟪",
                    Laplacetrf: "ℒ",
                    Larr: "↞",
                    Lcaron: "Ľ",
                    Lcedil: "Ļ",
                    Lcy: "Л",
                    LeftAngleBracket: "⟨",
                    LeftArrow: "←",
                    LeftArrowBar: "⇤",
                    LeftArrowRightArrow: "⇆",
                    LeftCeiling: "⌈",
                    LeftDoubleBracket: "⟦",
                    LeftDownTeeVector: "⥡",
                    LeftDownVector: "⇃",
                    LeftDownVectorBar: "⥙",
                    LeftFloor: "⌊",
                    LeftRightArrow: "↔",
                    LeftRightVector: "⥎",
                    LeftTee: "⊣",
                    LeftTeeArrow: "↤",
                    LeftTeeVector: "⥚",
                    LeftTriangle: "⊲",
                    LeftTriangleBar: "⧏",
                    LeftTriangleEqual: "⊴",
                    LeftUpDownVector: "⥑",
                    LeftUpTeeVector: "⥠",
                    LeftUpVector: "↿",
                    LeftUpVectorBar: "⥘",
                    LeftVector: "↼",
                    LeftVectorBar: "⥒",
                    Leftarrow: "⇐",
                    Leftrightarrow: "⇔",
                    LessEqualGreater: "⋚",
                    LessFullEqual: "≦",
                    LessGreater: "≶",
                    LessLess: "⪡",
                    LessSlantEqual: "⩽",
                    LessTilde: "≲",
                    Lfr: "𝔏",
                    Ll: "⋘",
                    Lleftarrow: "⇚",
                    Lmidot: "Ŀ",
                    LongLeftArrow: "⟵",
                    LongLeftRightArrow: "⟷",
                    LongRightArrow: "⟶",
                    Longleftarrow: "⟸",
                    Longleftrightarrow: "⟺",
                    Longrightarrow: "⟹",
                    Lopf: "𝕃",
                    LowerLeftArrow: "↙",
                    LowerRightArrow: "↘",
                    Lscr: "ℒ",
                    Lsh: "↰",
                    Lstrok: "Ł",
                    Lt: "≪",
                    Map: "⤅",
                    Mcy: "М",
                    MediumSpace: " ",
                    Mellintrf: "ℳ",
                    Mfr: "𝔐",
                    MinusPlus: "∓",
                    Mopf: "𝕄",
                    Mscr: "ℳ",
                    Mu: "Μ",
                    NJcy: "Њ",
                    Nacute: "Ń",
                    Ncaron: "Ň",
                    Ncedil: "Ņ",
                    Ncy: "Н",
                    NegativeMediumSpace: "​",
                    NegativeThickSpace: "​",
                    NegativeThinSpace: "​",
                    NegativeVeryThinSpace: "​",
                    NestedGreaterGreater: "≫",
                    NestedLessLess: "≪",
                    NewLine: "\n",
                    Nfr: "𝔑",
                    NoBreak: "⁠",
                    NonBreakingSpace: " ",
                    Nopf: "ℕ",
                    Not: "⫬",
                    NotCongruent: "≢",
                    NotCupCap: "≭",
                    NotDoubleVerticalBar: "∦",
                    NotElement: "∉",
                    NotEqual: "≠",
                    NotEqualTilde: "≂̸",
                    NotExists: "∄",
                    NotGreater: "≯",
                    NotGreaterEqual: "≱",
                    NotGreaterFullEqual: "≧̸",
                    NotGreaterGreater: "≫̸",
                    NotGreaterLess: "≹",
                    NotGreaterSlantEqual: "⩾̸",
                    NotGreaterTilde: "≵",
                    NotHumpDownHump: "≎̸",
                    NotHumpEqual: "≏̸",
                    NotLeftTriangle: "⋪",
                    NotLeftTriangleBar: "⧏̸",
                    NotLeftTriangleEqual: "⋬",
                    NotLess: "≮",
                    NotLessEqual: "≰",
                    NotLessGreater: "≸",
                    NotLessLess: "≪̸",
                    NotLessSlantEqual: "⩽̸",
                    NotLessTilde: "≴",
                    NotNestedGreaterGreater: "⪢̸",
                    NotNestedLessLess: "⪡̸",
                    NotPrecedes: "⊀",
                    NotPrecedesEqual: "⪯̸",
                    NotPrecedesSlantEqual: "⋠",
                    NotReverseElement: "∌",
                    NotRightTriangle: "⋫",
                    NotRightTriangleBar: "⧐̸",
                    NotRightTriangleEqual: "⋭",
                    NotSquareSubset: "⊏̸",
                    NotSquareSubsetEqual: "⋢",
                    NotSquareSuperset: "⊐̸",
                    NotSquareSupersetEqual: "⋣",
                    NotSubset: "⊂⃒",
                    NotSubsetEqual: "⊈",
                    NotSucceeds: "⊁",
                    NotSucceedsEqual: "⪰̸",
                    NotSucceedsSlantEqual: "⋡",
                    NotSucceedsTilde: "≿̸",
                    NotSuperset: "⊃⃒",
                    NotSupersetEqual: "⊉",
                    NotTilde: "≁",
                    NotTildeEqual: "≄",
                    NotTildeFullEqual: "≇",
                    NotTildeTilde: "≉",
                    NotVerticalBar: "∤",
                    Nscr: "𝒩",
                    Ntilde: "Ñ",
                    Nu: "Ν",
                    OElig: "Œ",
                    Oacute: "Ó",
                    Ocirc: "Ô",
                    Ocy: "О",
                    Odblac: "Ő",
                    Ofr: "𝔒",
                    Ograve: "Ò",
                    Omacr: "Ō",
                    Omega: "Ω",
                    Omicron: "Ο",
                    Oopf: "𝕆",
                    OpenCurlyDoubleQuote: "“",
                    OpenCurlyQuote: "‘",
                    Or: "⩔",
                    Oscr: "𝒪",
                    Oslash: "Ø",
                    Otilde: "Õ",
                    Otimes: "⨷",
                    Ouml: "Ö",
                    OverBar: "‾",
                    OverBrace: "⏞",
                    OverBracket: "⎴",
                    OverParenthesis: "⏜",
                    PartialD: "∂",
                    Pcy: "П",
                    Pfr: "𝔓",
                    Phi: "Φ",
                    Pi: "Π",
                    PlusMinus: "±",
                    Poincareplane: "ℌ",
                    Popf: "ℙ",
                    Pr: "⪻",
                    Precedes: "≺",
                    PrecedesEqual: "⪯",
                    PrecedesSlantEqual: "≼",
                    PrecedesTilde: "≾",
                    Prime: "″",
                    Product: "∏",
                    Proportion: "∷",
                    Proportional: "∝",
                    Pscr: "𝒫",
                    Psi: "Ψ",
                    QUOT: '"',
                    Qfr: "𝔔",
                    Qopf: "ℚ",
                    Qscr: "𝒬",
                    RBarr: "⤐",
                    REG: "®",
                    Racute: "Ŕ",
                    Rang: "⟫",
                    Rarr: "↠",
                    Rarrtl: "⤖",
                    Rcaron: "Ř",
                    Rcedil: "Ŗ",
                    Rcy: "Р",
                    Re: "ℜ",
                    ReverseElement: "∋",
                    ReverseEquilibrium: "⇋",
                    ReverseUpEquilibrium: "⥯",
                    Rfr: "ℜ",
                    Rho: "Ρ",
                    RightAngleBracket: "⟩",
                    RightArrow: "→",
                    RightArrowBar: "⇥",
                    RightArrowLeftArrow: "⇄",
                    RightCeiling: "⌉",
                    RightDoubleBracket: "⟧",
                    RightDownTeeVector: "⥝",
                    RightDownVector: "⇂",
                    RightDownVectorBar: "⥕",
                    RightFloor: "⌋",
                    RightTee: "⊢",
                    RightTeeArrow: "↦",
                    RightTeeVector: "⥛",
                    RightTriangle: "⊳",
                    RightTriangleBar: "⧐",
                    RightTriangleEqual: "⊵",
                    RightUpDownVector: "⥏",
                    RightUpTeeVector: "⥜",
                    RightUpVector: "↾",
                    RightUpVectorBar: "⥔",
                    RightVector: "⇀",
                    RightVectorBar: "⥓",
                    Rightarrow: "⇒",
                    Ropf: "ℝ",
                    RoundImplies: "⥰",
                    Rrightarrow: "⇛",
                    Rscr: "ℛ",
                    Rsh: "↱",
                    RuleDelayed: "⧴",
                    SHCHcy: "Щ",
                    SHcy: "Ш",
                    SOFTcy: "Ь",
                    Sacute: "Ś",
                    Sc: "⪼",
                    Scaron: "Š",
                    Scedil: "Ş",
                    Scirc: "Ŝ",
                    Scy: "С",
                    Sfr: "𝔖",
                    ShortDownArrow: "↓",
                    ShortLeftArrow: "←",
                    ShortRightArrow: "→",
                    ShortUpArrow: "↑",
                    Sigma: "Σ",
                    SmallCircle: "∘",
                    Sopf: "𝕊",
                    Sqrt: "√",
                    Square: "□",
                    SquareIntersection: "⊓",
                    SquareSubset: "⊏",
                    SquareSubsetEqual: "⊑",
                    SquareSuperset: "⊐",
                    SquareSupersetEqual: "⊒",
                    SquareUnion: "⊔",
                    Sscr: "𝒮",
                    Star: "⋆",
                    Sub: "⋐",
                    Subset: "⋐",
                    SubsetEqual: "⊆",
                    Succeeds: "≻",
                    SucceedsEqual: "⪰",
                    SucceedsSlantEqual: "≽",
                    SucceedsTilde: "≿",
                    SuchThat: "∋",
                    Sum: "∑",
                    Sup: "⋑",
                    Superset: "⊃",
                    SupersetEqual: "⊇",
                    Supset: "⋑",
                    THORN: "Þ",
                    TRADE: "™",
                    TSHcy: "Ћ",
                    TScy: "Ц",
                    Tab: "\t",
                    Tau: "Τ",
                    Tcaron: "Ť",
                    Tcedil: "Ţ",
                    Tcy: "Т",
                    Tfr: "𝔗",
                    Therefore: "∴",
                    Theta: "Θ",
                    ThickSpace: "  ",
                    ThinSpace: " ",
                    Tilde: "∼",
                    TildeEqual: "≃",
                    TildeFullEqual: "≅",
                    TildeTilde: "≈",
                    Topf: "𝕋",
                    TripleDot: "⃛",
                    Tscr: "𝒯",
                    Tstrok: "Ŧ",
                    Uacute: "Ú",
                    Uarr: "↟",
                    Uarrocir: "⥉",
                    Ubrcy: "Ў",
                    Ubreve: "Ŭ",
                    Ucirc: "Û",
                    Ucy: "У",
                    Udblac: "Ű",
                    Ufr: "𝔘",
                    Ugrave: "Ù",
                    Umacr: "Ū",
                    UnderBar: "_",
                    UnderBrace: "⏟",
                    UnderBracket: "⎵",
                    UnderParenthesis: "⏝",
                    Union: "⋃",
                    UnionPlus: "⊎",
                    Uogon: "Ų",
                    Uopf: "𝕌",
                    UpArrow: "↑",
                    UpArrowBar: "⤒",
                    UpArrowDownArrow: "⇅",
                    UpDownArrow: "↕",
                    UpEquilibrium: "⥮",
                    UpTee: "⊥",
                    UpTeeArrow: "↥",
                    Uparrow: "⇑",
                    Updownarrow: "⇕",
                    UpperLeftArrow: "↖",
                    UpperRightArrow: "↗",
                    Upsi: "ϒ",
                    Upsilon: "Υ",
                    Uring: "Ů",
                    Uscr: "𝒰",
                    Utilde: "Ũ",
                    Uuml: "Ü",
                    VDash: "⊫",
                    Vbar: "⫫",
                    Vcy: "В",
                    Vdash: "⊩",
                    Vdashl: "⫦",
                    Vee: "⋁",
                    Verbar: "‖",
                    Vert: "‖",
                    VerticalBar: "∣",
                    VerticalLine: "|",
                    VerticalSeparator: "❘",
                    VerticalTilde: "≀",
                    VeryThinSpace: " ",
                    Vfr: "𝔙",
                    Vopf: "𝕍",
                    Vscr: "𝒱",
                    Vvdash: "⊪",
                    Wcirc: "Ŵ",
                    Wedge: "⋀",
                    Wfr: "𝔚",
                    Wopf: "𝕎",
                    Wscr: "𝒲",
                    Xfr: "𝔛",
                    Xi: "Ξ",
                    Xopf: "𝕏",
                    Xscr: "𝒳",
                    YAcy: "Я",
                    YIcy: "Ї",
                    YUcy: "Ю",
                    Yacute: "Ý",
                    Ycirc: "Ŷ",
                    Ycy: "Ы",
                    Yfr: "𝔜",
                    Yopf: "𝕐",
                    Yscr: "𝒴",
                    Yuml: "Ÿ",
                    ZHcy: "Ж",
                    Zacute: "Ź",
                    Zcaron: "Ž",
                    Zcy: "З",
                    Zdot: "Ż",
                    ZeroWidthSpace: "​",
                    Zeta: "Ζ",
                    Zfr: "ℨ",
                    Zopf: "ℤ",
                    Zscr: "𝒵",
                    aacute: "á",
                    abreve: "ă",
                    ac: "∾",
                    acE: "∾̳",
                    acd: "∿",
                    acirc: "â",
                    acute: "´",
                    acy: "а",
                    aelig: "æ",
                    af: "⁡",
                    afr: "𝔞",
                    agrave: "à",
                    alefsym: "ℵ",
                    aleph: "ℵ",
                    alpha: "α",
                    amacr: "ā",
                    amalg: "⨿",
                    amp: "&",
                    and: "∧",
                    andand: "⩕",
                    andd: "⩜",
                    andslope: "⩘",
                    andv: "⩚",
                    ang: "∠",
                    ange: "⦤",
                    angle: "∠",
                    angmsd: "∡",
                    angmsdaa: "⦨",
                    angmsdab: "⦩",
                    angmsdac: "⦪",
                    angmsdad: "⦫",
                    angmsdae: "⦬",
                    angmsdaf: "⦭",
                    angmsdag: "⦮",
                    angmsdah: "⦯",
                    angrt: "∟",
                    angrtvb: "⊾",
                    angrtvbd: "⦝",
                    angsph: "∢",
                    angst: "Å",
                    angzarr: "⍼",
                    aogon: "ą",
                    aopf: "𝕒",
                    ap: "≈",
                    apE: "⩰",
                    apacir: "⩯",
                    ape: "≊",
                    apid: "≋",
                    apos: "'",
                    approx: "≈",
                    approxeq: "≊",
                    aring: "å",
                    ascr: "𝒶",
                    ast: "*",
                    asymp: "≈",
                    asympeq: "≍",
                    atilde: "ã",
                    auml: "ä",
                    awconint: "∳",
                    awint: "⨑",
                    bNot: "⫭",
                    backcong: "≌",
                    backepsilon: "϶",
                    backprime: "‵",
                    backsim: "∽",
                    backsimeq: "⋍",
                    barvee: "⊽",
                    barwed: "⌅",
                    barwedge: "⌅",
                    bbrk: "⎵",
                    bbrktbrk: "⎶",
                    bcong: "≌",
                    bcy: "б",
                    bdquo: "„",
                    becaus: "∵",
                    because: "∵",
                    bemptyv: "⦰",
                    bepsi: "϶",
                    bernou: "ℬ",
                    beta: "β",
                    beth: "ℶ",
                    between: "≬",
                    bfr: "𝔟",
                    bigcap: "⋂",
                    bigcirc: "◯",
                    bigcup: "⋃",
                    bigodot: "⨀",
                    bigoplus: "⨁",
                    bigotimes: "⨂",
                    bigsqcup: "⨆",
                    bigstar: "★",
                    bigtriangledown: "▽",
                    bigtriangleup: "△",
                    biguplus: "⨄",
                    bigvee: "⋁",
                    bigwedge: "⋀",
                    bkarow: "⤍",
                    blacklozenge: "⧫",
                    blacksquare: "▪",
                    blacktriangle: "▴",
                    blacktriangledown: "▾",
                    blacktriangleleft: "◂",
                    blacktriangleright: "▸",
                    blank: "␣",
                    blk12: "▒",
                    blk14: "░",
                    blk34: "▓",
                    block: "█",
                    bne: "=⃥",
                    bnequiv: "≡⃥",
                    bnot: "⌐",
                    bopf: "𝕓",
                    bot: "⊥",
                    bottom: "⊥",
                    bowtie: "⋈",
                    boxDL: "╗",
                    boxDR: "╔",
                    boxDl: "╖",
                    boxDr: "╓",
                    boxH: "═",
                    boxHD: "╦",
                    boxHU: "╩",
                    boxHd: "╤",
                    boxHu: "╧",
                    boxUL: "╝",
                    boxUR: "╚",
                    boxUl: "╜",
                    boxUr: "╙",
                    boxV: "║",
                    boxVH: "╬",
                    boxVL: "╣",
                    boxVR: "╠",
                    boxVh: "╫",
                    boxVl: "╢",
                    boxVr: "╟",
                    boxbox: "⧉",
                    boxdL: "╕",
                    boxdR: "╒",
                    boxdl: "┐",
                    boxdr: "┌",
                    boxh: "─",
                    boxhD: "╥",
                    boxhU: "╨",
                    boxhd: "┬",
                    boxhu: "┴",
                    boxminus: "⊟",
                    boxplus: "⊞",
                    boxtimes: "⊠",
                    boxuL: "╛",
                    boxuR: "╘",
                    boxul: "┘",
                    boxur: "└",
                    boxv: "│",
                    boxvH: "╪",
                    boxvL: "╡",
                    boxvR: "╞",
                    boxvh: "┼",
                    boxvl: "┤",
                    boxvr: "├",
                    bprime: "‵",
                    breve: "˘",
                    brvbar: "¦",
                    bscr: "𝒷",
                    bsemi: "⁏",
                    bsim: "∽",
                    bsime: "⋍",
                    bsol: "\\",
                    bsolb: "⧅",
                    bsolhsub: "⟈",
                    bull: "•",
                    bullet: "•",
                    bump: "≎",
                    bumpE: "⪮",
                    bumpe: "≏",
                    bumpeq: "≏",
                    cacute: "ć",
                    cap: "∩",
                    capand: "⩄",
                    capbrcup: "⩉",
                    capcap: "⩋",
                    capcup: "⩇",
                    capdot: "⩀",
                    caps: "∩︀",
                    caret: "⁁",
                    caron: "ˇ",
                    ccaps: "⩍",
                    ccaron: "č",
                    ccedil: "ç",
                    ccirc: "ĉ",
                    ccups: "⩌",
                    ccupssm: "⩐",
                    cdot: "ċ",
                    cedil: "¸",
                    cemptyv: "⦲",
                    cent: "¢",
                    centerdot: "·",
                    cfr: "𝔠",
                    chcy: "ч",
                    check: "✓",
                    checkmark: "✓",
                    chi: "χ",
                    cir: "○",
                    cirE: "⧃",
                    circ: "ˆ",
                    circeq: "≗",
                    circlearrowleft: "↺",
                    circlearrowright: "↻",
                    circledR: "®",
                    circledS: "Ⓢ",
                    circledast: "⊛",
                    circledcirc: "⊚",
                    circleddash: "⊝",
                    cire: "≗",
                    cirfnint: "⨐",
                    cirmid: "⫯",
                    cirscir: "⧂",
                    clubs: "♣",
                    clubsuit: "♣",
                    colon: ":",
                    colone: "≔",
                    coloneq: "≔",
                    comma: ",",
                    commat: "@",
                    comp: "∁",
                    compfn: "∘",
                    complement: "∁",
                    complexes: "ℂ",
                    cong: "≅",
                    congdot: "⩭",
                    conint: "∮",
                    copf: "𝕔",
                    coprod: "∐",
                    copy: "©",
                    copysr: "℗",
                    crarr: "↵",
                    cross: "✗",
                    cscr: "𝒸",
                    csub: "⫏",
                    csube: "⫑",
                    csup: "⫐",
                    csupe: "⫒",
                    ctdot: "⋯",
                    cudarrl: "⤸",
                    cudarrr: "⤵",
                    cuepr: "⋞",
                    cuesc: "⋟",
                    cularr: "↶",
                    cularrp: "⤽",
                    cup: "∪",
                    cupbrcap: "⩈",
                    cupcap: "⩆",
                    cupcup: "⩊",
                    cupdot: "⊍",
                    cupor: "⩅",
                    cups: "∪︀",
                    curarr: "↷",
                    curarrm: "⤼",
                    curlyeqprec: "⋞",
                    curlyeqsucc: "⋟",
                    curlyvee: "⋎",
                    curlywedge: "⋏",
                    curren: "¤",
                    curvearrowleft: "↶",
                    curvearrowright: "↷",
                    cuvee: "⋎",
                    cuwed: "⋏",
                    cwconint: "∲",
                    cwint: "∱",
                    cylcty: "⌭",
                    dArr: "⇓",
                    dHar: "⥥",
                    dagger: "†",
                    daleth: "ℸ",
                    darr: "↓",
                    dash: "‐",
                    dashv: "⊣",
                    dbkarow: "⤏",
                    dblac: "˝",
                    dcaron: "ď",
                    dcy: "д",
                    dd: "ⅆ",
                    ddagger: "‡",
                    ddarr: "⇊",
                    ddotseq: "⩷",
                    deg: "°",
                    delta: "δ",
                    demptyv: "⦱",
                    dfisht: "⥿",
                    dfr: "𝔡",
                    dharl: "⇃",
                    dharr: "⇂",
                    diam: "⋄",
                    diamond: "⋄",
                    diamondsuit: "♦",
                    diams: "♦",
                    die: "¨",
                    digamma: "ϝ",
                    disin: "⋲",
                    div: "÷",
                    divide: "÷",
                    divideontimes: "⋇",
                    divonx: "⋇",
                    djcy: "ђ",
                    dlcorn: "⌞",
                    dlcrop: "⌍",
                    dollar: "$",
                    dopf: "𝕕",
                    dot: "˙",
                    doteq: "≐",
                    doteqdot: "≑",
                    dotminus: "∸",
                    dotplus: "∔",
                    dotsquare: "⊡",
                    doublebarwedge: "⌆",
                    downarrow: "↓",
                    downdownarrows: "⇊",
                    downharpoonleft: "⇃",
                    downharpoonright: "⇂",
                    drbkarow: "⤐",
                    drcorn: "⌟",
                    drcrop: "⌌",
                    dscr: "𝒹",
                    dscy: "ѕ",
                    dsol: "⧶",
                    dstrok: "đ",
                    dtdot: "⋱",
                    dtri: "▿",
                    dtrif: "▾",
                    duarr: "⇵",
                    duhar: "⥯",
                    dwangle: "⦦",
                    dzcy: "џ",
                    dzigrarr: "⟿",
                    eDDot: "⩷",
                    eDot: "≑",
                    eacute: "é",
                    easter: "⩮",
                    ecaron: "ě",
                    ecir: "≖",
                    ecirc: "ê",
                    ecolon: "≕",
                    ecy: "э",
                    edot: "ė",
                    ee: "ⅇ",
                    efDot: "≒",
                    efr: "𝔢",
                    eg: "⪚",
                    egrave: "è",
                    egs: "⪖",
                    egsdot: "⪘",
                    el: "⪙",
                    elinters: "⏧",
                    ell: "ℓ",
                    els: "⪕",
                    elsdot: "⪗",
                    emacr: "ē",
                    empty: "∅",
                    emptyset: "∅",
                    emptyv: "∅",
                    emsp13: " ",
                    emsp14: " ",
                    emsp: " ",
                    eng: "ŋ",
                    ensp: " ",
                    eogon: "ę",
                    eopf: "𝕖",
                    epar: "⋕",
                    eparsl: "⧣",
                    eplus: "⩱",
                    epsi: "ε",
                    epsilon: "ε",
                    epsiv: "ϵ",
                    eqcirc: "≖",
                    eqcolon: "≕",
                    eqsim: "≂",
                    eqslantgtr: "⪖",
                    eqslantless: "⪕",
                    equals: "=",
                    equest: "≟",
                    equiv: "≡",
                    equivDD: "⩸",
                    eqvparsl: "⧥",
                    erDot: "≓",
                    erarr: "⥱",
                    escr: "ℯ",
                    esdot: "≐",
                    esim: "≂",
                    eta: "η",
                    eth: "ð",
                    euml: "ë",
                    euro: "€",
                    excl: "!",
                    exist: "∃",
                    expectation: "ℰ",
                    exponentiale: "ⅇ",
                    fallingdotseq: "≒",
                    fcy: "ф",
                    female: "♀",
                    ffilig: "ﬃ",
                    fflig: "ﬀ",
                    ffllig: "ﬄ",
                    ffr: "𝔣",
                    filig: "ﬁ",
                    fjlig: "fj",
                    flat: "♭",
                    fllig: "ﬂ",
                    fltns: "▱",
                    fnof: "ƒ",
                    fopf: "𝕗",
                    forall: "∀",
                    fork: "⋔",
                    forkv: "⫙",
                    fpartint: "⨍",
                    frac12: "½",
                    frac13: "⅓",
                    frac14: "¼",
                    frac15: "⅕",
                    frac16: "⅙",
                    frac18: "⅛",
                    frac23: "⅔",
                    frac25: "⅖",
                    frac34: "¾",
                    frac35: "⅗",
                    frac38: "⅜",
                    frac45: "⅘",
                    frac56: "⅚",
                    frac58: "⅝",
                    frac78: "⅞",
                    frasl: "⁄",
                    frown: "⌢",
                    fscr: "𝒻",
                    gE: "≧",
                    gEl: "⪌",
                    gacute: "ǵ",
                    gamma: "γ",
                    gammad: "ϝ",
                    gap: "⪆",
                    gbreve: "ğ",
                    gcirc: "ĝ",
                    gcy: "г",
                    gdot: "ġ",
                    ge: "≥",
                    gel: "⋛",
                    geq: "≥",
                    geqq: "≧",
                    geqslant: "⩾",
                    ges: "⩾",
                    gescc: "⪩",
                    gesdot: "⪀",
                    gesdoto: "⪂",
                    gesdotol: "⪄",
                    gesl: "⋛︀",
                    gesles: "⪔",
                    gfr: "𝔤",
                    gg: "≫",
                    ggg: "⋙",
                    gimel: "ℷ",
                    gjcy: "ѓ",
                    gl: "≷",
                    glE: "⪒",
                    gla: "⪥",
                    glj: "⪤",
                    gnE: "≩",
                    gnap: "⪊",
                    gnapprox: "⪊",
                    gne: "⪈",
                    gneq: "⪈",
                    gneqq: "≩",
                    gnsim: "⋧",
                    gopf: "𝕘",
                    grave: "`",
                    gscr: "ℊ",
                    gsim: "≳",
                    gsime: "⪎",
                    gsiml: "⪐",
                    gt: ">",
                    gtcc: "⪧",
                    gtcir: "⩺",
                    gtdot: "⋗",
                    gtlPar: "⦕",
                    gtquest: "⩼",
                    gtrapprox: "⪆",
                    gtrarr: "⥸",
                    gtrdot: "⋗",
                    gtreqless: "⋛",
                    gtreqqless: "⪌",
                    gtrless: "≷",
                    gtrsim: "≳",
                    gvertneqq: "≩︀",
                    gvnE: "≩︀",
                    hArr: "⇔",
                    hairsp: " ",
                    half: "½",
                    hamilt: "ℋ",
                    hardcy: "ъ",
                    harr: "↔",
                    harrcir: "⥈",
                    harrw: "↭",
                    hbar: "ℏ",
                    hcirc: "ĥ",
                    hearts: "♥",
                    heartsuit: "♥",
                    hellip: "…",
                    hercon: "⊹",
                    hfr: "𝔥",
                    hksearow: "⤥",
                    hkswarow: "⤦",
                    hoarr: "⇿",
                    homtht: "∻",
                    hookleftarrow: "↩",
                    hookrightarrow: "↪",
                    hopf: "𝕙",
                    horbar: "―",
                    hscr: "𝒽",
                    hslash: "ℏ",
                    hstrok: "ħ",
                    hybull: "⁃",
                    hyphen: "‐",
                    iacute: "í",
                    ic: "⁣",
                    icirc: "î",
                    icy: "и",
                    iecy: "е",
                    iexcl: "¡",
                    iff: "⇔",
                    ifr: "𝔦",
                    igrave: "ì",
                    ii: "ⅈ",
                    iiiint: "⨌",
                    iiint: "∭",
                    iinfin: "⧜",
                    iiota: "℩",
                    ijlig: "ĳ",
                    imacr: "ī",
                    image: "ℑ",
                    imagline: "ℐ",
                    imagpart: "ℑ",
                    imath: "ı",
                    imof: "⊷",
                    imped: "Ƶ",
                    in: "∈",
                    incare: "℅",
                    infin: "∞",
                    infintie: "⧝",
                    inodot: "ı",
                    int: "∫",
                    intcal: "⊺",
                    integers: "ℤ",
                    intercal: "⊺",
                    intlarhk: "⨗",
                    intprod: "⨼",
                    iocy: "ё",
                    iogon: "į",
                    iopf: "𝕚",
                    iota: "ι",
                    iprod: "⨼",
                    iquest: "¿",
                    iscr: "𝒾",
                    isin: "∈",
                    isinE: "⋹",
                    isindot: "⋵",
                    isins: "⋴",
                    isinsv: "⋳",
                    isinv: "∈",
                    it: "⁢",
                    itilde: "ĩ",
                    iukcy: "і",
                    iuml: "ï",
                    jcirc: "ĵ",
                    jcy: "й",
                    jfr: "𝔧",
                    jmath: "ȷ",
                    jopf: "𝕛",
                    jscr: "𝒿",
                    jsercy: "ј",
                    jukcy: "є",
                    kappa: "κ",
                    kappav: "ϰ",
                    kcedil: "ķ",
                    kcy: "к",
                    kfr: "𝔨",
                    kgreen: "ĸ",
                    khcy: "х",
                    kjcy: "ќ",
                    kopf: "𝕜",
                    kscr: "𝓀",
                    lAarr: "⇚",
                    lArr: "⇐",
                    lAtail: "⤛",
                    lBarr: "⤎",
                    lE: "≦",
                    lEg: "⪋",
                    lHar: "⥢",
                    lacute: "ĺ",
                    laemptyv: "⦴",
                    lagran: "ℒ",
                    lambda: "λ",
                    lang: "⟨",
                    langd: "⦑",
                    langle: "⟨",
                    lap: "⪅",
                    laquo: "«",
                    larr: "←",
                    larrb: "⇤",
                    larrbfs: "⤟",
                    larrfs: "⤝",
                    larrhk: "↩",
                    larrlp: "↫",
                    larrpl: "⤹",
                    larrsim: "⥳",
                    larrtl: "↢",
                    lat: "⪫",
                    latail: "⤙",
                    late: "⪭",
                    lates: "⪭︀",
                    lbarr: "⤌",
                    lbbrk: "❲",
                    lbrace: "{",
                    lbrack: "[",
                    lbrke: "⦋",
                    lbrksld: "⦏",
                    lbrkslu: "⦍",
                    lcaron: "ľ",
                    lcedil: "ļ",
                    lceil: "⌈",
                    lcub: "{",
                    lcy: "л",
                    ldca: "⤶",
                    ldquo: "“",
                    ldquor: "„",
                    ldrdhar: "⥧",
                    ldrushar: "⥋",
                    ldsh: "↲",
                    le: "≤",
                    leftarrow: "←",
                    leftarrowtail: "↢",
                    leftharpoondown: "↽",
                    leftharpoonup: "↼",
                    leftleftarrows: "⇇",
                    leftrightarrow: "↔",
                    leftrightarrows: "⇆",
                    leftrightharpoons: "⇋",
                    leftrightsquigarrow: "↭",
                    leftthreetimes: "⋋",
                    leg: "⋚",
                    leq: "≤",
                    leqq: "≦",
                    leqslant: "⩽",
                    les: "⩽",
                    lescc: "⪨",
                    lesdot: "⩿",
                    lesdoto: "⪁",
                    lesdotor: "⪃",
                    lesg: "⋚︀",
                    lesges: "⪓",
                    lessapprox: "⪅",
                    lessdot: "⋖",
                    lesseqgtr: "⋚",
                    lesseqqgtr: "⪋",
                    lessgtr: "≶",
                    lesssim: "≲",
                    lfisht: "⥼",
                    lfloor: "⌊",
                    lfr: "𝔩",
                    lg: "≶",
                    lgE: "⪑",
                    lhard: "↽",
                    lharu: "↼",
                    lharul: "⥪",
                    lhblk: "▄",
                    ljcy: "љ",
                    ll: "≪",
                    llarr: "⇇",
                    llcorner: "⌞",
                    llhard: "⥫",
                    lltri: "◺",
                    lmidot: "ŀ",
                    lmoust: "⎰",
                    lmoustache: "⎰",
                    lnE: "≨",
                    lnap: "⪉",
                    lnapprox: "⪉",
                    lne: "⪇",
                    lneq: "⪇",
                    lneqq: "≨",
                    lnsim: "⋦",
                    loang: "⟬",
                    loarr: "⇽",
                    lobrk: "⟦",
                    longleftarrow: "⟵",
                    longleftrightarrow: "⟷",
                    longmapsto: "⟼",
                    longrightarrow: "⟶",
                    looparrowleft: "↫",
                    looparrowright: "↬",
                    lopar: "⦅",
                    lopf: "𝕝",
                    loplus: "⨭",
                    lotimes: "⨴",
                    lowast: "∗",
                    lowbar: "_",
                    loz: "◊",
                    lozenge: "◊",
                    lozf: "⧫",
                    lpar: "(",
                    lparlt: "⦓",
                    lrarr: "⇆",
                    lrcorner: "⌟",
                    lrhar: "⇋",
                    lrhard: "⥭",
                    lrm: "‎",
                    lrtri: "⊿",
                    lsaquo: "‹",
                    lscr: "𝓁",
                    lsh: "↰",
                    lsim: "≲",
                    lsime: "⪍",
                    lsimg: "⪏",
                    lsqb: "[",
                    lsquo: "‘",
                    lsquor: "‚",
                    lstrok: "ł",
                    lt: "<",
                    ltcc: "⪦",
                    ltcir: "⩹",
                    ltdot: "⋖",
                    lthree: "⋋",
                    ltimes: "⋉",
                    ltlarr: "⥶",
                    ltquest: "⩻",
                    ltrPar: "⦖",
                    ltri: "◃",
                    ltrie: "⊴",
                    ltrif: "◂",
                    lurdshar: "⥊",
                    luruhar: "⥦",
                    lvertneqq: "≨︀",
                    lvnE: "≨︀",
                    mDDot: "∺",
                    macr: "¯",
                    male: "♂",
                    malt: "✠",
                    maltese: "✠",
                    map: "↦",
                    mapsto: "↦",
                    mapstodown: "↧",
                    mapstoleft: "↤",
                    mapstoup: "↥",
                    marker: "▮",
                    mcomma: "⨩",
                    mcy: "м",
                    mdash: "—",
                    measuredangle: "∡",
                    mfr: "𝔪",
                    mho: "℧",
                    micro: "µ",
                    mid: "∣",
                    midast: "*",
                    midcir: "⫰",
                    middot: "·",
                    minus: "−",
                    minusb: "⊟",
                    minusd: "∸",
                    minusdu: "⨪",
                    mlcp: "⫛",
                    mldr: "…",
                    mnplus: "∓",
                    models: "⊧",
                    mopf: "𝕞",
                    mp: "∓",
                    mscr: "𝓂",
                    mstpos: "∾",
                    mu: "μ",
                    multimap: "⊸",
                    mumap: "⊸",
                    nGg: "⋙̸",
                    nGt: "≫⃒",
                    nGtv: "≫̸",
                    nLeftarrow: "⇍",
                    nLeftrightarrow: "⇎",
                    nLl: "⋘̸",
                    nLt: "≪⃒",
                    nLtv: "≪̸",
                    nRightarrow: "⇏",
                    nVDash: "⊯",
                    nVdash: "⊮",
                    nabla: "∇",
                    nacute: "ń",
                    nang: "∠⃒",
                    nap: "≉",
                    napE: "⩰̸",
                    napid: "≋̸",
                    napos: "ŉ",
                    napprox: "≉",
                    natur: "♮",
                    natural: "♮",
                    naturals: "ℕ",
                    nbsp: " ",
                    nbump: "≎̸",
                    nbumpe: "≏̸",
                    ncap: "⩃",
                    ncaron: "ň",
                    ncedil: "ņ",
                    ncong: "≇",
                    ncongdot: "⩭̸",
                    ncup: "⩂",
                    ncy: "н",
                    ndash: "–",
                    ne: "≠",
                    neArr: "⇗",
                    nearhk: "⤤",
                    nearr: "↗",
                    nearrow: "↗",
                    nedot: "≐̸",
                    nequiv: "≢",
                    nesear: "⤨",
                    nesim: "≂̸",
                    nexist: "∄",
                    nexists: "∄",
                    nfr: "𝔫",
                    ngE: "≧̸",
                    nge: "≱",
                    ngeq: "≱",
                    ngeqq: "≧̸",
                    ngeqslant: "⩾̸",
                    nges: "⩾̸",
                    ngsim: "≵",
                    ngt: "≯",
                    ngtr: "≯",
                    nhArr: "⇎",
                    nharr: "↮",
                    nhpar: "⫲",
                    ni: "∋",
                    nis: "⋼",
                    nisd: "⋺",
                    niv: "∋",
                    njcy: "њ",
                    nlArr: "⇍",
                    nlE: "≦̸",
                    nlarr: "↚",
                    nldr: "‥",
                    nle: "≰",
                    nleftarrow: "↚",
                    nleftrightarrow: "↮",
                    nleq: "≰",
                    nleqq: "≦̸",
                    nleqslant: "⩽̸",
                    nles: "⩽̸",
                    nless: "≮",
                    nlsim: "≴",
                    nlt: "≮",
                    nltri: "⋪",
                    nltrie: "⋬",
                    nmid: "∤",
                    nopf: "𝕟",
                    not: "¬",
                    notin: "∉",
                    notinE: "⋹̸",
                    notindot: "⋵̸",
                    notinva: "∉",
                    notinvb: "⋷",
                    notinvc: "⋶",
                    notni: "∌",
                    notniva: "∌",
                    notnivb: "⋾",
                    notnivc: "⋽",
                    npar: "∦",
                    nparallel: "∦",
                    nparsl: "⫽⃥",
                    npart: "∂̸",
                    npolint: "⨔",
                    npr: "⊀",
                    nprcue: "⋠",
                    npre: "⪯̸",
                    nprec: "⊀",
                    npreceq: "⪯̸",
                    nrArr: "⇏",
                    nrarr: "↛",
                    nrarrc: "⤳̸",
                    nrarrw: "↝̸",
                    nrightarrow: "↛",
                    nrtri: "⋫",
                    nrtrie: "⋭",
                    nsc: "⊁",
                    nsccue: "⋡",
                    nsce: "⪰̸",
                    nscr: "𝓃",
                    nshortmid: "∤",
                    nshortparallel: "∦",
                    nsim: "≁",
                    nsime: "≄",
                    nsimeq: "≄",
                    nsmid: "∤",
                    nspar: "∦",
                    nsqsube: "⋢",
                    nsqsupe: "⋣",
                    nsub: "⊄",
                    nsubE: "⫅̸",
                    nsube: "⊈",
                    nsubset: "⊂⃒",
                    nsubseteq: "⊈",
                    nsubseteqq: "⫅̸",
                    nsucc: "⊁",
                    nsucceq: "⪰̸",
                    nsup: "⊅",
                    nsupE: "⫆̸",
                    nsupe: "⊉",
                    nsupset: "⊃⃒",
                    nsupseteq: "⊉",
                    nsupseteqq: "⫆̸",
                    ntgl: "≹",
                    ntilde: "ñ",
                    ntlg: "≸",
                    ntriangleleft: "⋪",
                    ntrianglelefteq: "⋬",
                    ntriangleright: "⋫",
                    ntrianglerighteq: "⋭",
                    nu: "ν",
                    num: "#",
                    numero: "№",
                    numsp: " ",
                    nvDash: "⊭",
                    nvHarr: "⤄",
                    nvap: "≍⃒",
                    nvdash: "⊬",
                    nvge: "≥⃒",
                    nvgt: ">⃒",
                    nvinfin: "⧞",
                    nvlArr: "⤂",
                    nvle: "≤⃒",
                    nvlt: "<⃒",
                    nvltrie: "⊴⃒",
                    nvrArr: "⤃",
                    nvrtrie: "⊵⃒",
                    nvsim: "∼⃒",
                    nwArr: "⇖",
                    nwarhk: "⤣",
                    nwarr: "↖",
                    nwarrow: "↖",
                    nwnear: "⤧",
                    oS: "Ⓢ",
                    oacute: "ó",
                    oast: "⊛",
                    ocir: "⊚",
                    ocirc: "ô",
                    ocy: "о",
                    odash: "⊝",
                    odblac: "ő",
                    odiv: "⨸",
                    odot: "⊙",
                    odsold: "⦼",
                    oelig: "œ",
                    ofcir: "⦿",
                    ofr: "𝔬",
                    ogon: "˛",
                    ograve: "ò",
                    ogt: "⧁",
                    ohbar: "⦵",
                    ohm: "Ω",
                    oint: "∮",
                    olarr: "↺",
                    olcir: "⦾",
                    olcross: "⦻",
                    oline: "‾",
                    olt: "⧀",
                    omacr: "ō",
                    omega: "ω",
                    omicron: "ο",
                    omid: "⦶",
                    ominus: "⊖",
                    oopf: "𝕠",
                    opar: "⦷",
                    operp: "⦹",
                    oplus: "⊕",
                    or: "∨",
                    orarr: "↻",
                    ord: "⩝",
                    order: "ℴ",
                    orderof: "ℴ",
                    ordf: "ª",
                    ordm: "º",
                    origof: "⊶",
                    oror: "⩖",
                    orslope: "⩗",
                    orv: "⩛",
                    oscr: "ℴ",
                    oslash: "ø",
                    osol: "⊘",
                    otilde: "õ",
                    otimes: "⊗",
                    otimesas: "⨶",
                    ouml: "ö",
                    ovbar: "⌽",
                    par: "∥",
                    para: "¶",
                    parallel: "∥",
                    parsim: "⫳",
                    parsl: "⫽",
                    part: "∂",
                    pcy: "п",
                    percnt: "%",
                    period: ".",
                    permil: "‰",
                    perp: "⊥",
                    pertenk: "‱",
                    pfr: "𝔭",
                    phi: "φ",
                    phiv: "ϕ",
                    phmmat: "ℳ",
                    phone: "☎",
                    pi: "π",
                    pitchfork: "⋔",
                    piv: "ϖ",
                    planck: "ℏ",
                    planckh: "ℎ",
                    plankv: "ℏ",
                    plus: "+",
                    plusacir: "⨣",
                    plusb: "⊞",
                    pluscir: "⨢",
                    plusdo: "∔",
                    plusdu: "⨥",
                    pluse: "⩲",
                    plusmn: "±",
                    plussim: "⨦",
                    plustwo: "⨧",
                    pm: "±",
                    pointint: "⨕",
                    popf: "𝕡",
                    pound: "£",
                    pr: "≺",
                    prE: "⪳",
                    prap: "⪷",
                    prcue: "≼",
                    pre: "⪯",
                    prec: "≺",
                    precapprox: "⪷",
                    preccurlyeq: "≼",
                    preceq: "⪯",
                    precnapprox: "⪹",
                    precneqq: "⪵",
                    precnsim: "⋨",
                    precsim: "≾",
                    prime: "′",
                    primes: "ℙ",
                    prnE: "⪵",
                    prnap: "⪹",
                    prnsim: "⋨",
                    prod: "∏",
                    profalar: "⌮",
                    profline: "⌒",
                    profsurf: "⌓",
                    prop: "∝",
                    propto: "∝",
                    prsim: "≾",
                    prurel: "⊰",
                    pscr: "𝓅",
                    psi: "ψ",
                    puncsp: " ",
                    qfr: "𝔮",
                    qint: "⨌",
                    qopf: "𝕢",
                    qprime: "⁗",
                    qscr: "𝓆",
                    quaternions: "ℍ",
                    quatint: "⨖",
                    quest: "?",
                    questeq: "≟",
                    quot: '"',
                    rAarr: "⇛",
                    rArr: "⇒",
                    rAtail: "⤜",
                    rBarr: "⤏",
                    rHar: "⥤",
                    race: "∽̱",
                    racute: "ŕ",
                    radic: "√",
                    raemptyv: "⦳",
                    rang: "⟩",
                    rangd: "⦒",
                    range: "⦥",
                    rangle: "⟩",
                    raquo: "»",
                    rarr: "→",
                    rarrap: "⥵",
                    rarrb: "⇥",
                    rarrbfs: "⤠",
                    rarrc: "⤳",
                    rarrfs: "⤞",
                    rarrhk: "↪",
                    rarrlp: "↬",
                    rarrpl: "⥅",
                    rarrsim: "⥴",
                    rarrtl: "↣",
                    rarrw: "↝",
                    ratail: "⤚",
                    ratio: "∶",
                    rationals: "ℚ",
                    rbarr: "⤍",
                    rbbrk: "❳",
                    rbrace: "}",
                    rbrack: "]",
                    rbrke: "⦌",
                    rbrksld: "⦎",
                    rbrkslu: "⦐",
                    rcaron: "ř",
                    rcedil: "ŗ",
                    rceil: "⌉",
                    rcub: "}",
                    rcy: "р",
                    rdca: "⤷",
                    rdldhar: "⥩",
                    rdquo: "”",
                    rdquor: "”",
                    rdsh: "↳",
                    real: "ℜ",
                    realine: "ℛ",
                    realpart: "ℜ",
                    reals: "ℝ",
                    rect: "▭",
                    reg: "®",
                    rfisht: "⥽",
                    rfloor: "⌋",
                    rfr: "𝔯",
                    rhard: "⇁",
                    rharu: "⇀",
                    rharul: "⥬",
                    rho: "ρ",
                    rhov: "ϱ",
                    rightarrow: "→",
                    rightarrowtail: "↣",
                    rightharpoondown: "⇁",
                    rightharpoonup: "⇀",
                    rightleftarrows: "⇄",
                    rightleftharpoons: "⇌",
                    rightrightarrows: "⇉",
                    rightsquigarrow: "↝",
                    rightthreetimes: "⋌",
                    ring: "˚",
                    risingdotseq: "≓",
                    rlarr: "⇄",
                    rlhar: "⇌",
                    rlm: "‏",
                    rmoust: "⎱",
                    rmoustache: "⎱",
                    rnmid: "⫮",
                    roang: "⟭",
                    roarr: "⇾",
                    robrk: "⟧",
                    ropar: "⦆",
                    ropf: "𝕣",
                    roplus: "⨮",
                    rotimes: "⨵",
                    rpar: ")",
                    rpargt: "⦔",
                    rppolint: "⨒",
                    rrarr: "⇉",
                    rsaquo: "›",
                    rscr: "𝓇",
                    rsh: "↱",
                    rsqb: "]",
                    rsquo: "’",
                    rsquor: "’",
                    rthree: "⋌",
                    rtimes: "⋊",
                    rtri: "▹",
                    rtrie: "⊵",
                    rtrif: "▸",
                    rtriltri: "⧎",
                    ruluhar: "⥨",
                    rx: "℞",
                    sacute: "ś",
                    sbquo: "‚",
                    sc: "≻",
                    scE: "⪴",
                    scap: "⪸",
                    scaron: "š",
                    sccue: "≽",
                    sce: "⪰",
                    scedil: "ş",
                    scirc: "ŝ",
                    scnE: "⪶",
                    scnap: "⪺",
                    scnsim: "⋩",
                    scpolint: "⨓",
                    scsim: "≿",
                    scy: "с",
                    sdot: "⋅",
                    sdotb: "⊡",
                    sdote: "⩦",
                    seArr: "⇘",
                    searhk: "⤥",
                    searr: "↘",
                    searrow: "↘",
                    sect: "§",
                    semi: ";",
                    seswar: "⤩",
                    setminus: "∖",
                    setmn: "∖",
                    sext: "✶",
                    sfr: "𝔰",
                    sfrown: "⌢",
                    sharp: "♯",
                    shchcy: "щ",
                    shcy: "ш",
                    shortmid: "∣",
                    shortparallel: "∥",
                    shy: "­",
                    sigma: "σ",
                    sigmaf: "ς",
                    sigmav: "ς",
                    sim: "∼",
                    simdot: "⩪",
                    sime: "≃",
                    simeq: "≃",
                    simg: "⪞",
                    simgE: "⪠",
                    siml: "⪝",
                    simlE: "⪟",
                    simne: "≆",
                    simplus: "⨤",
                    simrarr: "⥲",
                    slarr: "←",
                    smallsetminus: "∖",
                    smashp: "⨳",
                    smeparsl: "⧤",
                    smid: "∣",
                    smile: "⌣",
                    smt: "⪪",
                    smte: "⪬",
                    smtes: "⪬︀",
                    softcy: "ь",
                    sol: "/",
                    solb: "⧄",
                    solbar: "⌿",
                    sopf: "𝕤",
                    spades: "♠",
                    spadesuit: "♠",
                    spar: "∥",
                    sqcap: "⊓",
                    sqcaps: "⊓︀",
                    sqcup: "⊔",
                    sqcups: "⊔︀",
                    sqsub: "⊏",
                    sqsube: "⊑",
                    sqsubset: "⊏",
                    sqsubseteq: "⊑",
                    sqsup: "⊐",
                    sqsupe: "⊒",
                    sqsupset: "⊐",
                    sqsupseteq: "⊒",
                    squ: "□",
                    square: "□",
                    squarf: "▪",
                    squf: "▪",
                    srarr: "→",
                    sscr: "𝓈",
                    ssetmn: "∖",
                    ssmile: "⌣",
                    sstarf: "⋆",
                    star: "☆",
                    starf: "★",
                    straightepsilon: "ϵ",
                    straightphi: "ϕ",
                    strns: "¯",
                    sub: "⊂",
                    subE: "⫅",
                    subdot: "⪽",
                    sube: "⊆",
                    subedot: "⫃",
                    submult: "⫁",
                    subnE: "⫋",
                    subne: "⊊",
                    subplus: "⪿",
                    subrarr: "⥹",
                    subset: "⊂",
                    subseteq: "⊆",
                    subseteqq: "⫅",
                    subsetneq: "⊊",
                    subsetneqq: "⫋",
                    subsim: "⫇",
                    subsub: "⫕",
                    subsup: "⫓",
                    succ: "≻",
                    succapprox: "⪸",
                    succcurlyeq: "≽",
                    succeq: "⪰",
                    succnapprox: "⪺",
                    succneqq: "⪶",
                    succnsim: "⋩",
                    succsim: "≿",
                    sum: "∑",
                    sung: "♪",
                    sup1: "¹",
                    sup2: "²",
                    sup3: "³",
                    sup: "⊃",
                    supE: "⫆",
                    supdot: "⪾",
                    supdsub: "⫘",
                    supe: "⊇",
                    supedot: "⫄",
                    suphsol: "⟉",
                    suphsub: "⫗",
                    suplarr: "⥻",
                    supmult: "⫂",
                    supnE: "⫌",
                    supne: "⊋",
                    supplus: "⫀",
                    supset: "⊃",
                    supseteq: "⊇",
                    supseteqq: "⫆",
                    supsetneq: "⊋",
                    supsetneqq: "⫌",
                    supsim: "⫈",
                    supsub: "⫔",
                    supsup: "⫖",
                    swArr: "⇙",
                    swarhk: "⤦",
                    swarr: "↙",
                    swarrow: "↙",
                    swnwar: "⤪",
                    szlig: "ß",
                    target: "⌖",
                    tau: "τ",
                    tbrk: "⎴",
                    tcaron: "ť",
                    tcedil: "ţ",
                    tcy: "т",
                    tdot: "⃛",
                    telrec: "⌕",
                    tfr: "𝔱",
                    there4: "∴",
                    therefore: "∴",
                    theta: "θ",
                    thetasym: "ϑ",
                    thetav: "ϑ",
                    thickapprox: "≈",
                    thicksim: "∼",
                    thinsp: " ",
                    thkap: "≈",
                    thksim: "∼",
                    thorn: "þ",
                    tilde: "˜",
                    times: "×",
                    timesb: "⊠",
                    timesbar: "⨱",
                    timesd: "⨰",
                    tint: "∭",
                    toea: "⤨",
                    top: "⊤",
                    topbot: "⌶",
                    topcir: "⫱",
                    topf: "𝕥",
                    topfork: "⫚",
                    tosa: "⤩",
                    tprime: "‴",
                    trade: "™",
                    triangle: "▵",
                    triangledown: "▿",
                    triangleleft: "◃",
                    trianglelefteq: "⊴",
                    triangleq: "≜",
                    triangleright: "▹",
                    trianglerighteq: "⊵",
                    tridot: "◬",
                    trie: "≜",
                    triminus: "⨺",
                    triplus: "⨹",
                    trisb: "⧍",
                    tritime: "⨻",
                    trpezium: "⏢",
                    tscr: "𝓉",
                    tscy: "ц",
                    tshcy: "ћ",
                    tstrok: "ŧ",
                    twixt: "≬",
                    twoheadleftarrow: "↞",
                    twoheadrightarrow: "↠",
                    uArr: "⇑",
                    uHar: "⥣",
                    uacute: "ú",
                    uarr: "↑",
                    ubrcy: "ў",
                    ubreve: "ŭ",
                    ucirc: "û",
                    ucy: "у",
                    udarr: "⇅",
                    udblac: "ű",
                    udhar: "⥮",
                    ufisht: "⥾",
                    ufr: "𝔲",
                    ugrave: "ù",
                    uharl: "↿",
                    uharr: "↾",
                    uhblk: "▀",
                    ulcorn: "⌜",
                    ulcorner: "⌜",
                    ulcrop: "⌏",
                    ultri: "◸",
                    umacr: "ū",
                    uml: "¨",
                    uogon: "ų",
                    uopf: "𝕦",
                    uparrow: "↑",
                    updownarrow: "↕",
                    upharpoonleft: "↿",
                    upharpoonright: "↾",
                    uplus: "⊎",
                    upsi: "υ",
                    upsih: "ϒ",
                    upsilon: "υ",
                    upuparrows: "⇈",
                    urcorn: "⌝",
                    urcorner: "⌝",
                    urcrop: "⌎",
                    uring: "ů",
                    urtri: "◹",
                    uscr: "𝓊",
                    utdot: "⋰",
                    utilde: "ũ",
                    utri: "▵",
                    utrif: "▴",
                    uuarr: "⇈",
                    uuml: "ü",
                    uwangle: "⦧",
                    vArr: "⇕",
                    vBar: "⫨",
                    vBarv: "⫩",
                    vDash: "⊨",
                    vangrt: "⦜",
                    varepsilon: "ϵ",
                    varkappa: "ϰ",
                    varnothing: "∅",
                    varphi: "ϕ",
                    varpi: "ϖ",
                    varpropto: "∝",
                    varr: "↕",
                    varrho: "ϱ",
                    varsigma: "ς",
                    varsubsetneq: "⊊︀",
                    varsubsetneqq: "⫋︀",
                    varsupsetneq: "⊋︀",
                    varsupsetneqq: "⫌︀",
                    vartheta: "ϑ",
                    vartriangleleft: "⊲",
                    vartriangleright: "⊳",
                    vcy: "в",
                    vdash: "⊢",
                    vee: "∨",
                    veebar: "⊻",
                    veeeq: "≚",
                    vellip: "⋮",
                    verbar: "|",
                    vert: "|",
                    vfr: "𝔳",
                    vltri: "⊲",
                    vnsub: "⊂⃒",
                    vnsup: "⊃⃒",
                    vopf: "𝕧",
                    vprop: "∝",
                    vrtri: "⊳",
                    vscr: "𝓋",
                    vsubnE: "⫋︀",
                    vsubne: "⊊︀",
                    vsupnE: "⫌︀",
                    vsupne: "⊋︀",
                    vzigzag: "⦚",
                    wcirc: "ŵ",
                    wedbar: "⩟",
                    wedge: "∧",
                    wedgeq: "≙",
                    weierp: "℘",
                    wfr: "𝔴",
                    wopf: "𝕨",
                    wp: "℘",
                    wr: "≀",
                    wreath: "≀",
                    wscr: "𝓌",
                    xcap: "⋂",
                    xcirc: "◯",
                    xcup: "⋃",
                    xdtri: "▽",
                    xfr: "𝔵",
                    xhArr: "⟺",
                    xharr: "⟷",
                    xi: "ξ",
                    xlArr: "⟸",
                    xlarr: "⟵",
                    xmap: "⟼",
                    xnis: "⋻",
                    xodot: "⨀",
                    xopf: "𝕩",
                    xoplus: "⨁",
                    xotime: "⨂",
                    xrArr: "⟹",
                    xrarr: "⟶",
                    xscr: "𝓍",
                    xsqcup: "⨆",
                    xuplus: "⨄",
                    xutri: "△",
                    xvee: "⋁",
                    xwedge: "⋀",
                    yacute: "ý",
                    yacy: "я",
                    ycirc: "ŷ",
                    ycy: "ы",
                    yen: "¥",
                    yfr: "𝔶",
                    yicy: "ї",
                    yopf: "𝕪",
                    yscr: "𝓎",
                    yucy: "ю",
                    yuml: "ÿ",
                    zacute: "ź",
                    zcaron: "ž",
                    zcy: "з",
                    zdot: "ż",
                    zeetrf: "ℨ",
                    zeta: "ζ",
                    zfr: "𝔷",
                    zhcy: "ж",
                    zigrarr: "⇝",
                    zopf: "𝕫",
                    zscr: "𝓏",
                    zwj: "‍",
                    zwnj: "‌"
                };
            },
            {}
        ],
        16: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module character-entities
 * @fileoverview HTML character entity information.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Expose.
 */

                module.exports = require("./index.json");
            },
            { "./index.json": 15 }
        ],
        17: [
            function(require, module, exports) {
                module.exports = {
                    "0": "�",
                    "128": "€",
                    "130": "‚",
                    "131": "ƒ",
                    "132": "„",
                    "133": "…",
                    "134": "†",
                    "135": "‡",
                    "136": "ˆ",
                    "137": "‰",
                    "138": "Š",
                    "139": "‹",
                    "140": "Œ",
                    "142": "Ž",
                    "145": "‘",
                    "146": "’",
                    "147": "“",
                    "148": "”",
                    "149": "•",
                    "150": "–",
                    "151": "—",
                    "152": "˜",
                    "153": "™",
                    "154": "š",
                    "155": "›",
                    "156": "œ",
                    "158": "ž",
                    "159": "Ÿ"
                };
            },
            {}
        ],
        18: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module character-reference-invalid
 * @fileoverview HTML invalid numeric character reference information.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Expose.
 */

                module.exports = require("./index.json");
            },
            { "./index.json": 17 }
        ],
        19: [
            function(require, module, exports) {
                (function(Buffer) {
                    var clone = (function() {
                        "use strict";

                        /**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/
                        function clone(parent, circular, depth, prototype) {
                            var filter;
                            if (typeof circular === "object") {
                                depth = circular.depth;
                                prototype = circular.prototype;
                                filter = circular.filter;
                                circular = circular.circular;
                            }
                            // maintain two arrays for circular references, where corresponding parents
                            // and children have the same index
                            var allParents = [];
                            var allChildren = [];

                            var useBuffer = typeof Buffer != "undefined";

                            if (typeof circular == "undefined") circular = true;

                            if (typeof depth == "undefined") depth = Infinity;

                            // recurse this function so we don't reset allParents and allChildren
                            function _clone(parent, depth) {
                                // cloning null always returns null
                                if (parent === null) return null;

                                if (depth == 0) return parent;

                                var child;
                                var proto;
                                if (typeof parent != "object") {
                                    return parent;
                                }

                                if (clone.__isArray(parent)) {
                                    child = [];
                                } else if (clone.__isRegExp(parent)) {
                                    child = new RegExp(parent.source, __getRegExpFlags(parent));
                                    if (parent.lastIndex) child.lastIndex = parent.lastIndex;
                                } else if (clone.__isDate(parent)) {
                                    child = new Date(parent.getTime());
                                } else if (useBuffer && Buffer.isBuffer(parent)) {
                                    child = new Buffer(parent.length);
                                    parent.copy(child);
                                    return child;
                                } else {
                                    if (typeof prototype == "undefined") {
                                        proto = Object.getPrototypeOf(parent);
                                        child = Object.create(proto);
                                    } else {
                                        child = Object.create(prototype);
                                        proto = prototype;
                                    }
                                }

                                if (circular) {
                                    var index = allParents.indexOf(parent);

                                    if (index != -1) {
                                        return allChildren[index];
                                    }
                                    allParents.push(parent);
                                    allChildren.push(child);
                                }

                                for (var i in parent) {
                                    var attrs;
                                    if (proto) {
                                        attrs = Object.getOwnPropertyDescriptor(proto, i);
                                    }

                                    if (attrs && attrs.set == null) {
                                        continue;
                                    }
                                    child[i] = _clone(parent[i], depth - 1);
                                }

                                return child;
                            }

                            return _clone(parent, depth);
                        }

                        /**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
                        clone.clonePrototype = function clonePrototype(parent) {
                            if (parent === null) return null;

                            var c = function() {};
                            c.prototype = parent;
                            return new c();
                        };

                        // private utility functions

                        function __objToStr(o) {
                            return Object.prototype.toString.call(o);
                        }
                        clone.__objToStr = __objToStr;

                        function __isDate(o) {
                            return typeof o === "object" && __objToStr(o) === "[object Date]";
                        }
                        clone.__isDate = __isDate;

                        function __isArray(o) {
                            return typeof o === "object" && __objToStr(o) === "[object Array]";
                        }
                        clone.__isArray = __isArray;

                        function __isRegExp(o) {
                            return typeof o === "object" && __objToStr(o) === "[object RegExp]";
                        }
                        clone.__isRegExp = __isRegExp;

                        function __getRegExpFlags(re) {
                            var flags = "";
                            if (re.global) flags += "g";
                            if (re.ignoreCase) flags += "i";
                            if (re.multiline) flags += "m";
                            return flags;
                        }
                        clone.__getRegExpFlags = __getRegExpFlags;

                        return clone;
                    })();

                    if (typeof module === "object" && module.exports) {
                        module.exports = clone;
                    }
                }.call(this, require("buffer").Buffer));
            },
            { buffer: 8 }
        ],
        20: [
            function(require, module, exports) {
                "use strict";

                /*
 * Constants.
 */

                var WHITE_SPACE_COLLAPSABLE = /\s+/g;
                var SPACE = " ";

                /**
 * Replace multiple white-space characters with a single space.
 *
 * @example
 *   collapse(' \t\nbar \nbaz\t'); // ' bar baz '
 *
 * @param {string} value - Value with uncollapsed white-space,
 *   coerced to string.
 * @return {string} - Value with collapsed white-space.
 */
                function collapse(value) {
                    return String(value).replace(WHITE_SPACE_COLLAPSABLE, SPACE);
                }

                /*
 * Expose.
 */

                module.exports = collapse;
            },
            {}
        ],
        21: [
            function(require, module, exports) {
                /**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

                exports = module.exports = require("./debug");
                exports.log = log;
                exports.formatArgs = formatArgs;
                exports.save = save;
                exports.load = load;
                exports.useColors = useColors;
                exports.storage =
                    "undefined" != typeof chrome && "undefined" != typeof chrome.storage
                        ? chrome.storage.local
                        : localstorage();

                /**
 * Colors.
 */

                exports.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"];

                /**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

                function useColors() {
                    // is webkit? http://stackoverflow.com/a/16459606/376773
                    return (
                        "WebkitAppearance" in document.documentElement.style ||
                        // is firebug? http://stackoverflow.com/a/398120/376773
                        (window.console && (console.firebug || (console.exception && console.table))) ||
                        // is firefox >= v31?
                        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
                        (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31)
                    );
                }

                /**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

                exports.formatters.j = function(v) {
                    return JSON.stringify(v);
                };

                /**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

                function formatArgs() {
                    var args = arguments;
                    var useColors = this.useColors;

                    args[0] =
                        (useColors ? "%c" : "") +
                        this.namespace +
                        (useColors ? " %c" : " ") +
                        args[0] +
                        (useColors ? "%c " : " ") +
                        "+" +
                        exports.humanize(this.diff);

                    if (!useColors) return args;

                    var c = "color: " + this.color;
                    args = [args[0], c, "color: inherit"].concat(Array.prototype.slice.call(args, 1));

                    // the final "%c" is somewhat tricky, because there could be other
                    // arguments passed either before or after the %c, so we need to
                    // figure out the correct index to insert the CSS into
                    var index = 0;
                    var lastC = 0;
                    args[0].replace(/%[a-z%]/g, function(match) {
                        if ("%%" === match) return;
                        index++;
                        if ("%c" === match) {
                            // we only are interested in the *last* %c
                            // (the user may have provided their own)
                            lastC = index;
                        }
                    });

                    args.splice(lastC, 0, c);
                    return args;
                }

                /**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

                function log() {
                    // this hackery is required for IE8/9, where
                    // the `console.log` function doesn't have 'apply'
                    return (
                        "object" === typeof console &&
                        console.log &&
                        Function.prototype.apply.call(console.log, console, arguments)
                    );
                }

                /**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

                function save(namespaces) {
                    try {
                        if (null == namespaces) {
                            exports.storage.removeItem("debug");
                        } else {
                            exports.storage.debug = namespaces;
                        }
                    } catch (e) {}
                }

                /**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

                function load() {
                    var r;
                    try {
                        r = exports.storage.debug;
                    } catch (e) {}
                    return r;
                }

                /**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

                exports.enable(load());

                /**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

                function localstorage() {
                    try {
                        return window.localStorage;
                    } catch (e) {}
                }
            },
            { "./debug": 22 }
        ],
        22: [
            function(require, module, exports) {
                /**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

                exports = module.exports = debug;
                exports.coerce = coerce;
                exports.disable = disable;
                exports.enable = enable;
                exports.enabled = enabled;
                exports.humanize = require("ms");

                /**
 * The currently active debug mode names, and names to skip.
 */

                exports.names = [];
                exports.skips = [];

                /**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

                exports.formatters = {};

                /**
 * Previously assigned color.
 */

                var prevColor = 0;

                /**
 * Previous log timestamp.
 */

                var prevTime;

                /**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

                function selectColor() {
                    return exports.colors[prevColor++ % exports.colors.length];
                }

                /**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

                function debug(namespace) {
                    // define the `disabled` version
                    function disabled() {}
                    disabled.enabled = false;

                    // define the `enabled` version
                    function enabled() {
                        var self = enabled;

                        // set `diff` timestamp
                        var curr = +new Date();
                        var ms = curr - (prevTime || curr);
                        self.diff = ms;
                        self.prev = prevTime;
                        self.curr = curr;
                        prevTime = curr;

                        // add the `color` if not set
                        if (null == self.useColors) self.useColors = exports.useColors();
                        if (null == self.color && self.useColors) self.color = selectColor();

                        var args = Array.prototype.slice.call(arguments);

                        args[0] = exports.coerce(args[0]);

                        if ("string" !== typeof args[0]) {
                            // anything else let's inspect with %o
                            args = ["%o"].concat(args);
                        }

                        // apply any `formatters` transformations
                        var index = 0;
                        args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
                            // if we encounter an escaped % then don't increase the array index
                            if (match === "%%") return match;
                            index++;
                            var formatter = exports.formatters[format];
                            if ("function" === typeof formatter) {
                                var val = args[index];
                                match = formatter.call(self, val);

                                // now we need to remove `args[index]` since it's inlined in the `format`
                                args.splice(index, 1);
                                index--;
                            }
                            return match;
                        });

                        if ("function" === typeof exports.formatArgs) {
                            args = exports.formatArgs.apply(self, args);
                        }
                        var logFn = enabled.log || exports.log || console.log.bind(console);
                        logFn.apply(self, args);
                    }
                    enabled.enabled = true;

                    var fn = exports.enabled(namespace) ? enabled : disabled;

                    fn.namespace = namespace;

                    return fn;
                }

                /**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

                function enable(namespaces) {
                    exports.save(namespaces);

                    var split = (namespaces || "").split(/[\s,]+/);
                    var len = split.length;

                    for (var i = 0; i < len; i++) {
                        if (!split[i]) continue; // ignore empty strings
                        namespaces = split[i].replace(/\*/g, ".*?");
                        if (namespaces[0] === "-") {
                            exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
                        } else {
                            exports.names.push(new RegExp("^" + namespaces + "$"));
                        }
                    }
                }

                /**
 * Disable debug output.
 *
 * @api public
 */

                function disable() {
                    exports.enable("");
                }

                /**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

                function enabled(name) {
                    var i, len;
                    for (i = 0, len = exports.skips.length; i < len; i++) {
                        if (exports.skips[i].test(name)) {
                            return false;
                        }
                    }
                    for (i = 0, len = exports.names.length; i < len; i++) {
                        if (exports.names[i].test(name)) {
                            return true;
                        }
                    }
                    return false;
                }

                /**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

                function coerce(val) {
                    if (val instanceof Error) return val.stack || val.message;
                    return val;
                }
            },
            { ms: 29 }
        ],
        23: [
            function(require, module, exports) {
                // Copyright Joyent, Inc. and other Node contributors.
                //
                // Permission is hereby granted, free of charge, to any person obtaining a
                // copy of this software and associated documentation files (the
                // "Software"), to deal in the Software without restriction, including
                // without limitation the rights to use, copy, modify, merge, publish,
                // distribute, sublicense, and/or sell copies of the Software, and to permit
                // persons to whom the Software is furnished to do so, subject to the
                // following conditions:
                //
                // The above copyright notice and this permission notice shall be included
                // in all copies or substantial portions of the Software.
                //
                // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
                // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
                // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
                // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
                // USE OR OTHER DEALINGS IN THE SOFTWARE.

                function EventEmitter() {
                    this._events = this._events || {};
                    this._maxListeners = this._maxListeners || undefined;
                }
                module.exports = EventEmitter;

                // Backwards-compat with node 0.10.x
                EventEmitter.EventEmitter = EventEmitter;

                EventEmitter.prototype._events = undefined;
                EventEmitter.prototype._maxListeners = undefined;

                // By default EventEmitters will print a warning if more than 10 listeners are
                // added to it. This is a useful default which helps finding memory leaks.
                EventEmitter.defaultMaxListeners = 10;

                // Obviously not all Emitters should be limited to 10. This function allows
                // that to be increased. Set to zero for unlimited.
                EventEmitter.prototype.setMaxListeners = function(n) {
                    if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
                    this._maxListeners = n;
                    return this;
                };

                EventEmitter.prototype.emit = function(type) {
                    var er, handler, len, args, i, listeners;

                    if (!this._events) this._events = {};

                    // If there is no 'error' event listener then throw.
                    if (type === "error") {
                        if (!this._events.error || (isObject(this._events.error) && !this._events.error.length)) {
                            er = arguments[1];
                            if (er instanceof Error) {
                                throw er; // Unhandled 'error' event
                            }
                            throw TypeError('Uncaught, unspecified "error" event.');
                        }
                    }

                    handler = this._events[type];

                    if (isUndefined(handler)) return false;

                    if (isFunction(handler)) {
                        switch (arguments.length) {
                            // fast cases
                            case 1:
                                handler.call(this);
                                break;
                            case 2:
                                handler.call(this, arguments[1]);
                                break;
                            case 3:
                                handler.call(this, arguments[1], arguments[2]);
                                break;
                            // slower
                            default:
                                args = Array.prototype.slice.call(arguments, 1);
                                handler.apply(this, args);
                        }
                    } else if (isObject(handler)) {
                        args = Array.prototype.slice.call(arguments, 1);
                        listeners = handler.slice();
                        len = listeners.length;
                        for (i = 0; i < len; i++) listeners[i].apply(this, args);
                    }

                    return true;
                };

                EventEmitter.prototype.addListener = function(type, listener) {
                    var m;

                    if (!isFunction(listener)) throw TypeError("listener must be a function");

                    if (!this._events) this._events = {};

                    // To avoid recursion in the case that type === "newListener"! Before
                    // adding it to the listeners, first emit "newListener".
                    if (this._events.newListener)
                        this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);

                    if (!this._events[type])
                        // Optimize the case of one listener. Don't need the extra array object.
                        this._events[type] = listener;
                    else if (isObject(this._events[type]))
                        // If we've already got an array, just append.
                        this._events[type].push(listener);
                    else
                        // Adding the second element, need to change to array.
                        this._events[type] = [this._events[type], listener];

                    // Check for listener leak
                    if (isObject(this._events[type]) && !this._events[type].warned) {
                        if (!isUndefined(this._maxListeners)) {
                            m = this._maxListeners;
                        } else {
                            m = EventEmitter.defaultMaxListeners;
                        }

                        if (m && m > 0 && this._events[type].length > m) {
                            this._events[type].warned = true;
                            console.error(
                                "(node) warning: possible EventEmitter memory " +
                                    "leak detected. %d listeners added. " +
                                    "Use emitter.setMaxListeners() to increase limit.",
                                this._events[type].length
                            );
                            if (typeof console.trace === "function") {
                                // not supported in IE 10
                                console.trace();
                            }
                        }
                    }

                    return this;
                };

                EventEmitter.prototype.on = EventEmitter.prototype.addListener;

                EventEmitter.prototype.once = function(type, listener) {
                    if (!isFunction(listener)) throw TypeError("listener must be a function");

                    var fired = false;

                    function g() {
                        this.removeListener(type, g);

                        if (!fired) {
                            fired = true;
                            listener.apply(this, arguments);
                        }
                    }

                    g.listener = listener;
                    this.on(type, g);

                    return this;
                };

                // emits a 'removeListener' event iff the listener was removed
                EventEmitter.prototype.removeListener = function(type, listener) {
                    var list, position, length, i;

                    if (!isFunction(listener)) throw TypeError("listener must be a function");

                    if (!this._events || !this._events[type]) return this;

                    list = this._events[type];
                    length = list.length;
                    position = -1;

                    if (list === listener || (isFunction(list.listener) && list.listener === listener)) {
                        delete this._events[type];
                        if (this._events.removeListener) this.emit("removeListener", type, listener);
                    } else if (isObject(list)) {
                        for (i = length; i-- > 0; ) {
                            if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
                                position = i;
                                break;
                            }
                        }

                        if (position < 0) return this;

                        if (list.length === 1) {
                            list.length = 0;
                            delete this._events[type];
                        } else {
                            list.splice(position, 1);
                        }

                        if (this._events.removeListener) this.emit("removeListener", type, listener);
                    }

                    return this;
                };

                EventEmitter.prototype.removeAllListeners = function(type) {
                    var key, listeners;

                    if (!this._events) return this;

                    // not listening for removeListener, no need to emit
                    if (!this._events.removeListener) {
                        if (arguments.length === 0) this._events = {};
                        else if (this._events[type]) delete this._events[type];
                        return this;
                    }

                    // emit removeListener for all listeners on all events
                    if (arguments.length === 0) {
                        for (key in this._events) {
                            if (key === "removeListener") continue;
                            this.removeAllListeners(key);
                        }
                        this.removeAllListeners("removeListener");
                        this._events = {};
                        return this;
                    }

                    listeners = this._events[type];

                    if (isFunction(listeners)) {
                        this.removeListener(type, listeners);
                    } else if (listeners) {
                        // LIFO order
                        while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
                    }
                    delete this._events[type];

                    return this;
                };

                EventEmitter.prototype.listeners = function(type) {
                    var ret;
                    if (!this._events || !this._events[type]) ret = [];
                    else if (isFunction(this._events[type])) ret = [this._events[type]];
                    else ret = this._events[type].slice();
                    return ret;
                };

                EventEmitter.prototype.listenerCount = function(type) {
                    if (this._events) {
                        var evlistener = this._events[type];

                        if (isFunction(evlistener)) return 1;
                        else if (evlistener) return evlistener.length;
                    }
                    return 0;
                };

                EventEmitter.listenerCount = function(emitter, type) {
                    return emitter.listenerCount(type);
                };

                function isFunction(arg) {
                    return typeof arg === "function";
                }

                function isNumber(arg) {
                    return typeof arg === "number";
                }

                function isObject(arg) {
                    return typeof arg === "object" && arg !== null;
                }

                function isUndefined(arg) {
                    return arg === void 0;
                }
            },
            {}
        ],
        24: [
            function(require, module, exports) {
                "use strict";

                var hasOwn = Object.prototype.hasOwnProperty;
                var toStr = Object.prototype.toString;

                var isArray = function isArray(arr) {
                    if (typeof Array.isArray === "function") {
                        return Array.isArray(arr);
                    }

                    return toStr.call(arr) === "[object Array]";
                };

                var isPlainObject = function isPlainObject(obj) {
                    if (!obj || toStr.call(obj) !== "[object Object]") {
                        return false;
                    }

                    var hasOwnConstructor = hasOwn.call(obj, "constructor");
                    var hasIsPrototypeOf =
                        obj.constructor &&
                        obj.constructor.prototype &&
                        hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
                    // Not own constructor property must be Object
                    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
                        return false;
                    }

                    // Own properties are enumerated firstly, so to speed up,
                    // if last one is own, then all properties are own.
                    var key;
                    for (key in obj) {
                        /**/
                    }

                    return typeof key === "undefined" || hasOwn.call(obj, key);
                };

                module.exports = function extend() {
                    var options,
                        name,
                        src,
                        copy,
                        copyIsArray,
                        clone,
                        target = arguments[0],
                        i = 1,
                        length = arguments.length,
                        deep = false;

                    // Handle a deep copy situation
                    if (typeof target === "boolean") {
                        deep = target;
                        target = arguments[1] || {};
                        // skip the boolean and the target
                        i = 2;
                    } else if ((typeof target !== "object" && typeof target !== "function") || target == null) {
                        target = {};
                    }

                    for (; i < length; ++i) {
                        options = arguments[i];
                        // Only deal with non-null/undefined values
                        if (options != null) {
                            // Extend the base object
                            for (name in options) {
                                src = target[name];
                                copy = options[name];

                                // Prevent never-ending loop
                                if (target !== copy) {
                                    // Recurse if we're merging plain objects or arrays
                                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                                        if (copyIsArray) {
                                            copyIsArray = false;
                                            clone = src && isArray(src) ? src : [];
                                        } else {
                                            clone = src && isPlainObject(src) ? src : {};
                                        }

                                        // Never move original objects, clone them
                                        target[name] = extend(deep, clone, copy);

                                        // Don't bring in undefined values
                                    } else if (typeof copy !== "undefined") {
                                        target[name] = copy;
                                    }
                                }
                            }
                        }
                    }

                    // Return the modified object
                    return target;
                };
            },
            {}
        ],
        25: [
            function(require, module, exports) {
                exports.read = function(buffer, offset, isLE, mLen, nBytes) {
                    var e, m;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var nBits = -7;
                    var i = isLE ? nBytes - 1 : 0;
                    var d = isLE ? -1 : 1;
                    var s = buffer[offset + i];

                    i += d;

                    e = s & ((1 << -nBits) - 1);
                    s >>= -nBits;
                    nBits += eLen;
                    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

                    m = e & ((1 << -nBits) - 1);
                    e >>= -nBits;
                    nBits += mLen;
                    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

                    if (e === 0) {
                        e = 1 - eBias;
                    } else if (e === eMax) {
                        return m ? NaN : (s ? -1 : 1) * Infinity;
                    } else {
                        m = m + Math.pow(2, mLen);
                        e = e - eBias;
                    }
                    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
                };

                exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
                    var e, m, c;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                    var i = isLE ? 0 : nBytes - 1;
                    var d = isLE ? 1 : -1;
                    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

                    value = Math.abs(value);

                    if (isNaN(value) || value === Infinity) {
                        m = isNaN(value) ? 1 : 0;
                        e = eMax;
                    } else {
                        e = Math.floor(Math.log(value) / Math.LN2);
                        if (value * (c = Math.pow(2, -e)) < 1) {
                            e--;
                            c *= 2;
                        }
                        if (e + eBias >= 1) {
                            value += rt / c;
                        } else {
                            value += rt * Math.pow(2, 1 - eBias);
                        }
                        if (value * c >= 2) {
                            e++;
                            c /= 2;
                        }

                        if (e + eBias >= eMax) {
                            m = 0;
                            e = eMax;
                        } else if (e + eBias >= 1) {
                            m = (value * c - 1) * Math.pow(2, mLen);
                            e = e + eBias;
                        } else {
                            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                            e = 0;
                        }
                    }

                    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

                    e = (e << mLen) | m;
                    eLen += mLen;
                    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

                    buffer[offset + i - d] |= s * 128;
                };
            },
            {}
        ],
        26: [
            function(require, module, exports) {
                if (typeof Object.create === "function") {
                    // implementation from standard node.js 'util' module
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        ctor.prototype = Object.create(superCtor.prototype, {
                            constructor: {
                                value: ctor,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                    };
                } else {
                    // old school shim for old browsers
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        var TempCtor = function() {};
                        TempCtor.prototype = superCtor.prototype;
                        ctor.prototype = new TempCtor();
                        ctor.prototype.constructor = ctor;
                    };
                }
            },
            {}
        ],
        27: [
            function(require, module, exports) {
                "use strict";

                /**
 * Get the count of the longest repeating streak of
 * `character` in `value`.
 *
 * @example
 *   longestStreak('` foo `` bar `', '`') // 2
 *
 * @param {string} value - Content, coerced to string.
 * @param {string} character - Single character to look
 *   for.
 * @return {number} - Number of characters at the place
 *   where `character` occurs in its longest streak in
 *   `value`.
 * @throws {Error} - when `character` is not a single
 *   character.
 */
                function longestStreak(value, character) {
                    var count = 0;
                    var maximum = 0;
                    var index = -1;
                    var length;

                    value = String(value);
                    length = value.length;

                    if (typeof character !== "string" || character.length !== 1) {
                        throw new Error("Expected character");
                    }

                    while (++index < length) {
                        if (value.charAt(index) === character) {
                            count++;

                            if (count > maximum) {
                                maximum = count;
                            }
                        } else {
                            count = 0;
                        }
                    }

                    return maximum;
                }

                /*
 * Expose.
 */

                module.exports = longestStreak;
            },
            {}
        ],
        28: [
            function(require, module, exports) {
                "use strict";

                /*
 * Useful expressions.
 */

                var EXPRESSION_DOT = /\./;
                var EXPRESSION_LAST_DOT = /\.[^.]*$/;

                /*
 * Allowed alignment values.
 */

                var LEFT = "l";
                var RIGHT = "r";
                var CENTER = "c";
                var DOT = ".";
                var NULL = "";

                var ALLIGNMENT = [LEFT, RIGHT, CENTER, DOT, NULL];

                /*
 * Characters.
 */

                var COLON = ":";
                var DASH = "-";
                var PIPE = "|";
                var SPACE = " ";
                var NEW_LINE = "\n";

                /**
 * Get the length of `value`.
 *
 * @param {string} value
 * @return {number}
 */
                function lengthNoop(value) {
                    return String(value).length;
                }

                /**
 * Get a string consisting of `length` `character`s.
 *
 * @param {number} length
 * @param {string} [character=' ']
 * @return {string}
 */
                function pad(length, character) {
                    return Array(length + 1).join(character || SPACE);
                }

                /**
 * Get the position of the last dot in `value`.
 *
 * @param {string} value
 * @return {number}
 */
                function dotindex(value) {
                    var match = EXPRESSION_LAST_DOT.exec(value);

                    return match ? match.index + 1 : value.length;
                }

                /**
 * Create a table from a matrix of strings.
 *
 * @param {Array.<Array.<string>>} table
 * @param {Object?} options
 * @param {boolean?} [options.rule=true]
 * @param {string?} [options.delimiter=" | "]
 * @param {string?} [options.start="| "]
 * @param {string?} [options.end=" |"]
 * @param {Array.<string>?} options.align
 * @param {function(string)?} options.stringLength
 * @return {string} Pretty table
 */
                function markdownTable(table, options) {
                    var settings = options || {};
                    var delimiter = settings.delimiter;
                    var start = settings.start;
                    var end = settings.end;
                    var alignment = settings.align;
                    var calculateStringLength = settings.stringLength || lengthNoop;
                    var cellCount = 0;
                    var rowIndex = -1;
                    var rowLength = table.length;
                    var sizes = [];
                    var align;
                    var rule;
                    var rows;
                    var row;
                    var cells;
                    var index;
                    var position;
                    var size;
                    var value;
                    var spacing;
                    var before;
                    var after;

                    alignment = alignment ? alignment.concat() : [];

                    if (delimiter === null || delimiter === undefined) {
                        delimiter = SPACE + PIPE + SPACE;
                    }

                    if (start === null || start === undefined) {
                        start = PIPE + SPACE;
                    }

                    if (end === null || end === undefined) {
                        end = SPACE + PIPE;
                    }

                    while (++rowIndex < rowLength) {
                        row = table[rowIndex];

                        index = -1;

                        if (row.length > cellCount) {
                            cellCount = row.length;
                        }

                        while (++index < cellCount) {
                            position = row[index] ? dotindex(row[index]) : null;

                            if (!sizes[index]) {
                                sizes[index] = 3;
                            }

                            if (position > sizes[index]) {
                                sizes[index] = position;
                            }
                        }
                    }

                    if (typeof alignment === "string") {
                        alignment = pad(cellCount, alignment).split("");
                    }

                    /*
     * Make sure only valid alignments are used.
     */

                    index = -1;

                    while (++index < cellCount) {
                        align = alignment[index];

                        if (typeof align === "string") {
                            align = align.charAt(0).toLowerCase();
                        }

                        if (ALLIGNMENT.indexOf(align) === -1) {
                            align = NULL;
                        }

                        alignment[index] = align;
                    }

                    rowIndex = -1;
                    rows = [];

                    while (++rowIndex < rowLength) {
                        row = table[rowIndex];

                        index = -1;
                        cells = [];

                        while (++index < cellCount) {
                            value = row[index];

                            if (value === null || value === undefined) {
                                value = "";
                            } else {
                                value = String(value);
                            }

                            if (alignment[index] !== DOT) {
                                cells[index] = value;
                            } else {
                                position = dotindex(value);

                                size =
                                    sizes[index] +
                                    (EXPRESSION_DOT.test(value) ? 0 : 1) -
                                    (calculateStringLength(value) - position);

                                cells[index] = value + pad(size - 1);
                            }
                        }

                        rows[rowIndex] = cells;
                    }

                    sizes = [];
                    rowIndex = -1;

                    while (++rowIndex < rowLength) {
                        cells = rows[rowIndex];

                        index = -1;

                        while (++index < cellCount) {
                            value = cells[index];

                            if (!sizes[index]) {
                                sizes[index] = 3;
                            }

                            size = calculateStringLength(value);

                            if (size > sizes[index]) {
                                sizes[index] = size;
                            }
                        }
                    }

                    rowIndex = -1;

                    while (++rowIndex < rowLength) {
                        cells = rows[rowIndex];

                        index = -1;

                        while (++index < cellCount) {
                            value = cells[index];

                            position = sizes[index] - (calculateStringLength(value) || 0);
                            spacing = pad(position);

                            if (alignment[index] === RIGHT || alignment[index] === DOT) {
                                value = spacing + value;
                            } else if (alignment[index] !== CENTER) {
                                value = value + spacing;
                            } else {
                                position = position / 2;

                                if (position % 1 === 0) {
                                    before = position;
                                    after = position;
                                } else {
                                    before = position + 0.5;
                                    after = position - 0.5;
                                }

                                value = pad(before) + value + pad(after);
                            }

                            cells[index] = value;
                        }

                        rows[rowIndex] = cells.join(delimiter);
                    }

                    if (settings.rule !== false) {
                        index = -1;
                        rule = [];

                        while (++index < cellCount) {
                            align = alignment[index];

                            /*
             * When `align` is left, don't add colons.
             */

                            value = align === RIGHT || align === NULL ? DASH : COLON;
                            value += pad(sizes[index] - 2, DASH);
                            value += align !== LEFT && align !== NULL ? COLON : DASH;

                            rule[index] = value;
                        }

                        rows.splice(1, 0, rule.join(delimiter));
                    }

                    return start + rows.join(end + NEW_LINE + start) + end;
                }

                /*
 * Expose `markdownTable`.
 */

                module.exports = markdownTable;
            },
            {}
        ],
        29: [
            function(require, module, exports) {
                /**
 * Helpers.
 */

                var s = 1000;
                var m = s * 60;
                var h = m * 60;
                var d = h * 24;
                var y = d * 365.25;

                /**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

                module.exports = function(val, options) {
                    options = options || {};
                    if ("string" == typeof val) return parse(val);
                    return options.long ? long(val) : short(val);
                };

                /**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

                function parse(str) {
                    str = "" + str;
                    if (str.length > 10000) return;
                    var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                        str
                    );
                    if (!match) return;
                    var n = parseFloat(match[1]);
                    var type = (match[2] || "ms").toLowerCase();
                    switch (type) {
                        case "years":
                        case "year":
                        case "yrs":
                        case "yr":
                        case "y":
                            return n * y;
                        case "days":
                        case "day":
                        case "d":
                            return n * d;
                        case "hours":
                        case "hour":
                        case "hrs":
                        case "hr":
                        case "h":
                            return n * h;
                        case "minutes":
                        case "minute":
                        case "mins":
                        case "min":
                        case "m":
                            return n * m;
                        case "seconds":
                        case "second":
                        case "secs":
                        case "sec":
                        case "s":
                            return n * s;
                        case "milliseconds":
                        case "millisecond":
                        case "msecs":
                        case "msec":
                        case "ms":
                            return n;
                    }
                }

                /**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

                function short(ms) {
                    if (ms >= d) return Math.round(ms / d) + "d";
                    if (ms >= h) return Math.round(ms / h) + "h";
                    if (ms >= m) return Math.round(ms / m) + "m";
                    if (ms >= s) return Math.round(ms / s) + "s";
                    return ms + "ms";
                }

                /**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

                function long(ms) {
                    return (
                        plural(ms, d, "day") ||
                        plural(ms, h, "hour") ||
                        plural(ms, m, "minute") ||
                        plural(ms, s, "second") ||
                        ms + " ms"
                    );
                }

                /**
 * Pluralization helper.
 */

                function plural(ms, n, name) {
                    if (ms < n) return;
                    if (ms < n * 1.5) return Math.floor(ms / n) + " " + name;
                    return Math.ceil(ms / n) + " " + name + "s";
                }
            },
            {}
        ],
        30: [
            function(require, module, exports) {
                var wrappy = require("wrappy");
                module.exports = wrappy(once);

                once.proto = once(function() {
                    Object.defineProperty(Function.prototype, "once", {
                        value: function() {
                            return once(this);
                        },
                        configurable: true
                    });
                });

                function once(fn) {
                    var f = function() {
                        if (f.called) return f.value;
                        f.called = true;
                        return (f.value = fn.apply(this, arguments));
                    };
                    f.called = false;
                    return f;
                }
            },
            { wrappy: 57 }
        ],
        31: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module parse-entities
 * @fileoverview Parse HTML character references: fast, spec-compliant,
 *   positional information.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Dependencies.
 */

                var characterEntities = require("character-entities");
                var legacy = require("character-entities-legacy");
                var invalid = require("character-reference-invalid");

                /*
 * Methods.
 */

                var fromCharCode = String.fromCharCode;
                var has = Object.prototype.hasOwnProperty;
                var noop = Function.prototype;

                /*
 * Reference types.
 */

                var NAMED = "named";
                var HEXADECIMAL = "hexadecimal";
                var DECIMAL = "decimal";

                /*
 * Map of bases.
 */

                var BASE = {};

                BASE[HEXADECIMAL] = 16;
                BASE[DECIMAL] = 10;

                /*
 * Warning messages.
 */

                var NUMERIC_REFERENCE = "Numeric character references";
                var NAMED_REFERENCE = "Named character references";
                var TERMINATED = " must be terminated by a semicolon";
                var VOID = " cannot be empty";

                var NAMED_NOT_TERMINATED = 1;
                var NUMERIC_NOT_TERMINATED = 2;
                var NAMED_EMPTY = 3;
                var NUMERIC_EMPTY = 4;
                var NAMED_UNKNOWN = 5;
                var NUMERIC_DISALLOWED = 6;
                var NUMERIC_PROHIBITED = 7;

                var MESSAGES = {};

                MESSAGES[NAMED_NOT_TERMINATED] = NAMED_REFERENCE + TERMINATED;
                MESSAGES[NUMERIC_NOT_TERMINATED] = NUMERIC_REFERENCE + TERMINATED;
                MESSAGES[NAMED_EMPTY] = NAMED_REFERENCE + VOID;
                MESSAGES[NUMERIC_EMPTY] = NUMERIC_REFERENCE + VOID;
                MESSAGES[NAMED_UNKNOWN] = NAMED_REFERENCE + " must be known";
                MESSAGES[NUMERIC_DISALLOWED] = NUMERIC_REFERENCE + " cannot be disallowed";
                MESSAGES[NUMERIC_PROHIBITED] =
                    NUMERIC_REFERENCE + " cannot be outside the " + "permissible Unicode range";

                /*
 * Characters.
 */

                var REPLACEMENT = "\uFFFD";
                var FORM_FEED = "\f";
                var AMPERSAND = "&";
                var OCTOTHORP = "#";
                var SEMICOLON = ";";
                var NEWLINE = "\n";
                var X_LOWER = "x";
                var X_UPPER = "X";
                var SPACE = " ";
                var LESS_THAN = "<";
                var EQUAL = "=";
                var EMPTY = "";
                var TAB = "\t";

                /**
 * Get the character-code at the first indice in
 * `character`.
 *
 * @param {string} character - Value.
 * @return {number} - Character-code at the first indice
 *   in `character`.
 */
                function charCode(character) {
                    return character.charCodeAt(0);
                }

                /**
 * Check whether `character` is a decimal.
 *
 * @param {string} character - Value.
 * @return {boolean} - Whether `character` is a decimal.
 */
                function isDecimal(character) {
                    var code = charCode(character);

                    return code >= 48 /* 0 */ && code <= 57 /* 9 */;
                }

                /**
 * Check whether `character` is a hexadecimal.
 *
 * @param {string} character - Value.
 * @return {boolean} - Whether `character` is a
 *   hexadecimal.
 */
                function isHexadecimal(character) {
                    var code = charCode(character);

                    return (
                        (code >= 48 /* 0 */ && code <= 57) /* 9 */ ||
                        (code >= 65 /* A */ && code <= 70) /* F */ ||
                        (code >= 97 /* a */ && code <= 102) /* f */
                    );
                }

                /**
 * Check whether `character` is an alphanumeric.
 *
 * @param {string} character - Value.
 * @return {boolean} - Whether `character` is an
 *   alphanumeric.
 */
                function isAlphanumeric(character) {
                    var code = charCode(character);

                    return (
                        (code >= 48 /* 0 */ && code <= 57) /* 9 */ ||
                        (code >= 65 /* A */ && code <= 90) /* Z */ ||
                        (code >= 97 /* a */ && code <= 122) /* z */
                    );
                }

                /**
 * Check whether `character` is outside the permissible
 * unicode range.
 *
 * @param {number} characterCode - Value.
 * @return {boolean} - Whether `character` is an
 *   outside the permissible unicode range.
 */
                function isProhibited(characterCode) {
                    return (characterCode >= 0xd800 && characterCode <= 0xdfff) || characterCode > 0x10ffff;
                }

                /**
 * Check whether `character` is disallowed.
 *
 * @param {number} characterCode - Value.
 * @return {boolean} - Whether `character` is disallowed.
 */
                function isWarning(characterCode) {
                    return (
                        (characterCode >= 0x0001 && characterCode <= 0x0008) ||
                        (characterCode >= 0x000d && characterCode <= 0x001f) ||
                        (characterCode >= 0x007f && characterCode <= 0x009f) ||
                        (characterCode >= 0xfdd0 && characterCode <= 0xfdef) ||
                        characterCode === 0x000b ||
                        characterCode === 0xfffe ||
                        characterCode === 0xffff ||
                        characterCode === 0x1fffe ||
                        characterCode === 0x1ffff ||
                        characterCode === 0x2fffe ||
                        characterCode === 0x2ffff ||
                        characterCode === 0x3fffe ||
                        characterCode === 0x3ffff ||
                        characterCode === 0x4fffe ||
                        characterCode === 0x4ffff ||
                        characterCode === 0x5fffe ||
                        characterCode === 0x5ffff ||
                        characterCode === 0x6fffe ||
                        characterCode === 0x6ffff ||
                        characterCode === 0x7fffe ||
                        characterCode === 0x7ffff ||
                        characterCode === 0x8fffe ||
                        characterCode === 0x8ffff ||
                        characterCode === 0x9fffe ||
                        characterCode === 0x9ffff ||
                        characterCode === 0xafffe ||
                        characterCode === 0xaffff ||
                        characterCode === 0xbfffe ||
                        characterCode === 0xbffff ||
                        characterCode === 0xcfffe ||
                        characterCode === 0xcffff ||
                        characterCode === 0xdfffe ||
                        characterCode === 0xdffff ||
                        characterCode === 0xefffe ||
                        characterCode === 0xeffff ||
                        characterCode === 0xffffe ||
                        characterCode === 0xfffff ||
                        characterCode === 0x10fffe ||
                        characterCode === 0x10ffff
                    );
                }

                /*
 * Map of types to tests. Each type of character reference
 * accepts different characters. This test is used to
 * detect whether a reference has ended (as the semicolon
 * is not strictly needed).
 */

                var TESTS = {};

                TESTS[NAMED] = isAlphanumeric;
                TESTS[DECIMAL] = isDecimal;
                TESTS[HEXADECIMAL] = isHexadecimal;

                /**
 * Parse entities.
 *
 * @param {string} value - Value to tokenise.
 * @param {Object?} [settings] - Configuration.
 */
                function parse(value, settings) {
                    var additional = settings.additional;
                    var handleText = settings.text;
                    var handleReference = settings.reference;
                    var handleWarning = settings.warning;
                    var textContext = settings.textContext;
                    var referenceContext = settings.referenceContext;
                    var warningContext = settings.warningContext;
                    var pos = settings.position;
                    var indent = settings.indent || [];
                    var length = value.length;
                    var index = 0;
                    var lines = -1;
                    var column = pos.column || 1;
                    var line = pos.line || 1;
                    var queue = EMPTY;
                    var result = [];
                    var entityCharacters;
                    var terminated;
                    var characters;
                    var character;
                    var reference;
                    var following;
                    var warning;
                    var reason;
                    var output;
                    var entity;
                    var begin;
                    var start;
                    var type;
                    var test;
                    var prev;
                    var next;
                    var diff;
                    var end;

                    /**
     * Get current position.
     *
     * @return {Object} - Positional information of a
     *   single point.
     */
                    function now() {
                        return {
                            line: line,
                            column: column,
                            offset: index + (pos.offset || 0)
                        };
                    }

                    /**
     * “Throw” a parse-error: a warning.
     *
     * @param {number} code - Identifier of reason for
     *   failing.
     * @param {number} offset - Offset in characters from
     *   the current position point at which the
     *   parse-error ocurred, cannot point past newlines.
     */
                    function parseError(code, offset) {
                        var position = now();

                        position.column += offset;
                        position.offset += offset;

                        handleWarning.call(warningContext, MESSAGES[code], position, code);
                    }

                    /**
     * Get character at position.
     *
     * @param {number} position - Indice of character in `value`.
     * @return {string} - Character at `position` in
     *   `value`.
     */
                    function at(position) {
                        return value.charAt(position);
                    }

                    /**
     * Flush `queue` (normal text). Macro invoked before
     * each entity and at the end of `value`.
     *
     * Does nothing when `queue` is empty.
     */
                    function flush() {
                        if (queue) {
                            result.push(queue);

                            if (handleText) {
                                handleText.call(textContext, queue, {
                                    start: prev,
                                    end: now()
                                });
                            }

                            queue = EMPTY;
                        }
                    }

                    /*
     * Cache the current point.
     */

                    prev = now();

                    /*
     * Wrap `handleWarning`.
     */

                    warning = handleWarning ? parseError : noop;

                    /*
     * Ensure the algorithm walks over the first character
     * and the end (inclusive).
     */

                    index--;
                    length++;

                    while (++index < length) {
                        /*
         * If the previous character was a newline.
         */

                        if (character === NEWLINE) {
                            column = indent[lines] || 1;
                        }

                        character = at(index);

                        /*
         * Handle anything other than an ampersand,
         * including newlines and EOF.
         */

                        if (character !== AMPERSAND) {
                            if (character === NEWLINE) {
                                line++;
                                lines++;
                                column = 0;
                            }

                            if (character) {
                                queue += character;
                                column++;
                            } else {
                                flush();
                            }
                        } else {
                            following = at(index + 1);

                            /*
             * The behaviour depends on the identity of the next character.
             */

                            if (
                                following === TAB ||
                                following === NEWLINE ||
                                following === FORM_FEED ||
                                following === SPACE ||
                                following === LESS_THAN ||
                                following === AMPERSAND ||
                                following === EMPTY ||
                                (additional && following === additional)
                            ) {
                                /*
                 * Not a character reference. No characters
                 * are consumed, and nothing is returned.
                 * This is not an error, either.
                 */

                                queue += character;
                                column++;

                                continue;
                            }

                            start = begin = end = index + 1;

                            /*
             * Numerical entity.
             */

                            if (following !== OCTOTHORP) {
                                type = NAMED;
                            } else {
                                end = ++begin;

                                /*
                 * The behaviour further depends on the
                 * character after the U+0023 NUMBER SIGN.
                 */

                                following = at(end);

                                if (following === X_LOWER || following === X_UPPER) {
                                    /*
                     * ASCII hex digits.
                     */

                                    type = HEXADECIMAL;
                                    end = ++begin;
                                } else {
                                    /*
                     * ASCII digits.
                     */

                                    type = DECIMAL;
                                }
                            }

                            entityCharacters = entity = characters = EMPTY;
                            test = TESTS[type];
                            end--;

                            while (++end < length) {
                                following = at(end);

                                if (!test(following)) {
                                    break;
                                }

                                characters += following;

                                /*
                 * Check if we can match a legacy named
                 * reference.  If so, we cache that as the
                 * last viable named reference.  This
                 * ensures we do not need to walk backwards
                 * later.
                 */

                                if (type === NAMED && has.call(legacy, characters)) {
                                    entityCharacters = characters;
                                    entity = legacy[characters];
                                }
                            }

                            terminated = at(end) === SEMICOLON;

                            if (terminated) {
                                end++;

                                if (type === NAMED && has.call(characterEntities, characters)) {
                                    entityCharacters = characters;
                                    entity = characterEntities[characters];
                                }
                            }

                            diff = 1 + end - start;

                            if (!characters) {
                                /*
                 * An empty (possible) entity is valid, unless
                 * its numeric (thus an ampersand followed by
                 * an octothorp).
                 */

                                if (type !== NAMED) {
                                    warning(NUMERIC_EMPTY, diff);
                                }
                            } else if (type === NAMED) {
                                /*
                 * An ampersand followed by anything
                 * unknown, and not terminated, is invalid.
                 */

                                if (terminated && !entity) {
                                    warning(NAMED_UNKNOWN, 1);
                                } else {
                                    /*
                     * If theres something after an entity
                     * name which is not known, cap the
                     * reference.
                     */

                                    if (entityCharacters !== characters) {
                                        end = begin + entityCharacters.length;
                                        diff = 1 + end - begin;
                                        terminated = false;
                                    }

                                    /*
                     * If the reference is not terminated,
                     * warn.
                     */

                                    if (!terminated) {
                                        reason = entityCharacters ? NAMED_NOT_TERMINATED : NAMED_EMPTY;

                                        if (!settings.attribute) {
                                            warning(reason, diff);
                                        } else {
                                            following = at(end);

                                            if (following === EQUAL) {
                                                warning(reason, diff);
                                                entity = null;
                                            } else if (isAlphanumeric(following)) {
                                                entity = null;
                                            } else {
                                                warning(reason, diff);
                                            }
                                        }
                                    }
                                }

                                reference = entity;
                            } else {
                                if (!terminated) {
                                    /*
                     * All non-terminated numeric entities are
                     * not rendered, and trigger a warning.
                     */

                                    warning(NUMERIC_NOT_TERMINATED, diff);
                                }

                                /*
                 * When terminated and number, parse as
                 * either hexadecimal or decimal.
                 */

                                reference = parseInt(characters, BASE[type]);

                                /*
                 * Trigger a warning when the parsed number
                 * is prohibited, and replace with
                 * replacement character.
                 */

                                if (isProhibited(reference)) {
                                    warning(NUMERIC_PROHIBITED, diff);

                                    reference = REPLACEMENT;
                                } else if (reference in invalid) {
                                    /*
                     * Trigger a warning when the parsed number
                     * is disallowed, and replace by an
                     * alternative.
                     */

                                    warning(NUMERIC_DISALLOWED, diff);

                                    reference = invalid[reference];
                                } else {
                                    /*
                     * Parse the number.
                     */

                                    output = EMPTY;

                                    /*
                     * Trigger a warning when the parsed
                     * number should not be used.
                     */

                                    if (isWarning(reference)) {
                                        warning(NUMERIC_DISALLOWED, diff);
                                    }

                                    /*
                     * Stringify the number.
                     */

                                    if (reference > 0xffff) {
                                        reference -= 0x10000;
                                        output += fromCharCode(((reference >>> 10) & 0x3ff) | 0xd800);

                                        reference = 0xdc00 | (reference & 0x3ff);
                                    }

                                    reference = output + fromCharCode(reference);
                                }
                            }

                            /*
             * If we could not find a reference, queue the
             * checked characters (as normal characters),
             * and move the pointer to their end. This is
             * possible because we can be certain neither
             * newlines nor ampersands are included.
             */

                            if (!reference) {
                                characters = value.slice(start - 1, end);
                                queue += characters;
                                column += characters.length;
                                index = end - 1;
                            } else {
                                /*
                 * Found it! First eat the queued
                 * characters as normal text, then eat
                 * an entity.
                 */

                                flush();

                                prev = now();
                                index = end - 1;
                                column += end - start + 1;
                                result.push(reference);
                                next = now();
                                next.offset++;

                                if (handleReference) {
                                    handleReference.call(
                                        referenceContext,
                                        reference,
                                        {
                                            start: prev,
                                            end: next
                                        },
                                        value.slice(start - 1, end)
                                    );
                                }

                                prev = next;
                            }
                        }
                    }

                    /*
     * Return the reduced nodes, and any possible warnings.
     */

                    return result.join(EMPTY);
                }

                var defaults = {
                    warning: null,
                    reference: null,
                    text: null,
                    warningContext: null,
                    referenceContext: null,
                    textContext: null,
                    position: {},
                    additional: null,
                    attribute: false
                };

                /**
 * Wrap to ensure clean parameters are given to `parse`.
 *
 * @param {string} value - Value with entities.
 * @param {Object?} [options] - Configuration.
 */
                function wrapper(value, options) {
                    var settings = {};
                    var key;

                    if (!options) {
                        options = {};
                    }

                    for (key in defaults) {
                        settings[key] = options[key] || defaults[key];
                    }

                    if (settings.position.indent || settings.position.start) {
                        settings.indent = settings.position.indent || [];
                        settings.position = settings.position.start;
                    }

                    return parse(value, settings);
                }

                /*
 * Expose.
 */

                module.exports = wrapper;
            },
            { "character-entities": 16, "character-entities-legacy": 14, "character-reference-invalid": 18 }
        ],
        32: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:parse
 * @fileoverview Markdown parser.
 */

                "use strict";

                /* eslint-env commonjs */

                /* Dependencies. */
                var unherit = require("unherit");
                var Parser = require("./lib/parser.js");

                /**
 * Attacher.
 *
 * @param {unified} processor - Unified processor.
 */
                function parse(processor) {
                    processor.Parser = unherit(Parser);
                }

                /* Patch `Parser`. */
                parse.Parser = Parser;

                /* Expose */
                module.exports = parse;
            },
            { "./lib/parser.js": 36, unherit: 49 }
        ],
        33: [
            function(require, module, exports) {
                module.exports = [
                    "article",
                    "header",
                    "aside",
                    "hgroup",
                    "blockquote",
                    "hr",
                    "iframe",
                    "body",
                    "li",
                    "map",
                    "button",
                    "object",
                    "canvas",
                    "ol",
                    "caption",
                    "output",
                    "col",
                    "p",
                    "colgroup",
                    "pre",
                    "dd",
                    "progress",
                    "div",
                    "section",
                    "dl",
                    "table",
                    "td",
                    "dt",
                    "tbody",
                    "embed",
                    "textarea",
                    "fieldset",
                    "tfoot",
                    "figcaption",
                    "th",
                    "figure",
                    "thead",
                    "footer",
                    "tr",
                    "form",
                    "ul",
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                    "video",
                    "script",
                    "style"
                ];
            },
            {}
        ],
        34: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:parse:defaults
 * @fileoverview Default options for `parse`.
 */

                "use strict";

                /* eslint-env commonjs */

                module.exports = {
                    position: true,
                    gfm: true,
                    yaml: true,
                    commonmark: false,
                    footnotes: false,
                    pedantic: false,
                    breaks: false
                };
            },
            {}
        ],
        35: [
            function(require, module, exports) {
                module.exports = {
                    default: ["\\", "`", "*", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!", "_", ">"],
                    gfm: ["\\", "`", "*", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!", "_", ">", "~", "|"],
                    commonmark: [
                        "\\",
                        "`",
                        "*",
                        "{",
                        "}",
                        "[",
                        "]",
                        "(",
                        ")",
                        "#",
                        "+",
                        "-",
                        ".",
                        "!",
                        "_",
                        ">",
                        "~",
                        "|",
                        "\n",
                        '"',
                        "$",
                        "%",
                        "&",
                        "'",
                        ",",
                        "/",
                        ":",
                        ";",
                        "<",
                        "=",
                        "?",
                        "@",
                        "^"
                    ]
                };
            },
            {}
        ],
        36: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:parser
 * @fileoverview Markdown parser.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Dependencies.
 */

                var decode = require("parse-entities");
                var repeat = require("repeat-string");
                var trim = require("trim");
                var trimTrailingLines = require("trim-trailing-lines");
                var extend = require("extend");
                var vfileLocation = require("vfile-location");
                var removePosition = require("unist-util-remove-position");
                var collapseWhiteSpace = require("collapse-white-space");
                var defaultOptions = require("./defaults.js");
                var escapes = require("./escapes.json");
                var blockElements = require("./block-elements.json");

                /*
 * Methods.
 */

                var has = {}.hasOwnProperty;

                /*
 * Numeric constants.
 */

                var SPACE_SIZE = 1;
                var TAB_SIZE = 4;
                var CODE_INDENT_LENGTH = 4;
                var MIN_FENCE_COUNT = 3;
                var MAX_ATX_COUNT = 6;
                var MAX_LINE_HEADING_INDENT = 3;
                var THEMATIC_BREAK_MARKER_COUNT = 3;
                var MIN_CLOSING_HTML_NEWLINE_COUNT = 2;
                var MIN_BREAK_LENGTH = 2;
                var MIN_TABLE_COLUMNS = 2;
                var MIN_TABLE_ROWS = 2;

                /*
 * Error messages.
 */

                var ERR_INFINITE_LOOP = "Infinite loop";
                var ERR_MISSING_LOCATOR = "Missing locator: ";
                var ERR_INCORRECTLY_EATEN =
                    "Incorrectly eaten value: please report this " + "warning on http://git.io/vg5Ft";

                /*
 * Expressions.
 */

                var EXPRESSION_BULLET = /^([ \t]*)([*+-]|\d+[.)])( {1,4}(?! )| |\t|$|(?=\n))([^\n]*)/;
                var EXPRESSION_PEDANTIC_BULLET = /^([ \t]*)([*+-]|\d+[.)])([ \t]+)/;
                var EXPRESSION_INITIAL_INDENT = /^( {1,4}|\t)?/gm;
                var EXPRESSION_INITIAL_TAB = /^( {4}|\t)?/gm;
                var EXPRESSION_HTML_LINK_OPEN = /^<a /i;
                var EXPRESSION_HTML_LINK_CLOSE = /^<\/a>/i;
                var EXPRESSION_LOOSE_LIST_ITEM = /\n\n(?!\s*$)/;
                var EXPRESSION_TASK_ITEM = /^\[([\ \t]|x|X)\][\ \t]/;
                var EXPRESSION_LINE_BREAKS = /\r\n|\r/g;

                /*
 * Characters.
 */

                var C_BACKSLASH = "\\";
                var C_UNDERSCORE = "_";
                var C_ASTERISK = "*";
                var C_TICK = "`";
                var C_AT_SIGN = "@";
                var C_HASH = "#";
                var C_PLUS = "+";
                var C_DASH = "-";
                var C_DOT = ".";
                var C_PIPE = "|";
                var C_DOUBLE_QUOTE = '"';
                var C_SINGLE_QUOTE = "'";
                var C_COMMA = ",";
                var C_SLASH = "/";
                var C_COLON = ":";
                var C_SEMI_COLON = ";";
                var C_QUESTION_MARK = "?";
                var C_CARET = "^";
                var C_EQUALS = "=";
                var C_EXCLAMATION_MARK = "!";
                var C_TILDE = "~";
                var C_LT = "<";
                var C_GT = ">";
                var C_BRACKET_OPEN = "[";
                var C_BRACKET_CLOSE = "]";
                var C_PAREN_OPEN = "(";
                var C_PAREN_CLOSE = ")";
                var C_SPACE = " ";
                var C_FORM_FEED = "\f";
                var C_NEWLINE = "\n";
                var C_CARRIAGE_RETURN = "\r";
                var C_TAB = "\t";
                var C_VERTICAL_TAB = "\v";
                var C_NO_BREAK_SPACE = "\u00a0";
                var C_OGHAM_SPACE = "\u1680";
                var C_MONGOLIAN_VOWEL_SEPARATOR = "\u180e";
                var C_EN_QUAD = "\u2000";
                var C_EM_QUAD = "\u2001";
                var C_EN_SPACE = "\u2002";
                var C_EM_SPACE = "\u2003";
                var C_THREE_PER_EM_SPACE = "\u2004";
                var C_FOUR_PER_EM_SPACE = "\u2005";
                var C_SIX_PER_EM_SPACE = "\u2006";
                var C_FIGURE_SPACE = "\u2007";
                var C_PUNCTUATION_SPACE = "\u2008";
                var C_THIN_SPACE = "\u2009";
                var C_HAIR_SPACE = "\u200a";
                var C_LINE_SEPARATOR = "​\u2028";
                var C_PARAGRAPH_SEPARATOR = "​\u2029";
                var C_NARROW_NO_BREAK_SPACE = "\u202f";
                var C_IDEOGRAPHIC_SPACE = "\u3000";
                var C_ZERO_WIDTH_NO_BREAK_SPACE = "\ufeff";
                var C_X_LOWER = "x";

                /*
 * Character codes.
 */

                var CC_A_LOWER = "a".charCodeAt(0);
                var CC_A_UPPER = "A".charCodeAt(0);
                var CC_Z_LOWER = "z".charCodeAt(0);
                var CC_Z_UPPER = "Z".charCodeAt(0);
                var CC_0 = "0".charCodeAt(0);
                var CC_9 = "9".charCodeAt(0);

                /*
 * Protocols.
 */

                var HTTP_PROTOCOL = "http://";
                var HTTPS_PROTOCOL = "https://";
                var MAILTO_PROTOCOL = "mailto:";

                var PROTOCOLS = [HTTP_PROTOCOL, HTTPS_PROTOCOL, MAILTO_PROTOCOL];

                var PROTOCOLS_LENGTH = PROTOCOLS.length;

                /*
 * Textual constants.
 */

                var YAML_FENCE = repeat(C_DASH, 3);
                var CODE_INDENT = repeat(C_SPACE, CODE_INDENT_LENGTH);
                var EMPTY = "";
                var BLOCK = "block";
                var INLINE = "inline";
                var COMMENT_START = "<!--";
                var COMMENT_END = "-->";
                var CDATA_START = "<![CDATA[";
                var CDATA_END = "]]>";
                var COMMENT_END_CHAR = COMMENT_END.charAt(0);
                var CDATA_END_CHAR = CDATA_END.charAt(0);
                var COMMENT_START_LENGTH = COMMENT_START.length;
                var COMMENT_END_LENGTH = COMMENT_END.length;
                var CDATA_START_LENGTH = CDATA_START.length;
                var CDATA_END_LENGTH = CDATA_END.length;

                /*
 * Node types.
 */

                var T_THEMATIC_BREAK = "thematicBreak";
                var T_HTML = "html";
                var T_YAML = "yaml";
                var T_TABLE = "table";
                var T_TABLE_CELL = "tableCell";
                var T_TABLE_HEADER = "tableRow";
                var T_TABLE_ROW = "tableRow";
                var T_PARAGRAPH = "paragraph";
                var T_TEXT = "text";
                var T_CODE = "code";
                var T_LIST = "list";
                var T_LIST_ITEM = "listItem";
                var T_DEFINITION = "definition";
                var T_FOOTNOTE_DEFINITION = "footnoteDefinition";
                var T_HEADING = "heading";
                var T_BLOCKQUOTE = "blockquote";
                var T_LINK = "link";
                var T_IMAGE = "image";
                var T_FOOTNOTE = "footnote";
                var T_STRONG = "strong";
                var T_EMPHASIS = "emphasis";
                var T_DELETE = "delete";
                var T_INLINE_CODE = "inlineCode";
                var T_BREAK = "break";
                var T_ROOT = "root";

                /*
 * Available table alignments.
 */

                var TABLE_ALIGN_LEFT = "left";
                var TABLE_ALIGN_CENTER = "center";
                var TABLE_ALIGN_RIGHT = "right";
                var TABLE_ALIGN_NONE = null;

                /*
 * Available reference types.
 */

                var REFERENCE_TYPE_SHORTCUT = "shortcut";
                var REFERENCE_TYPE_COLLAPSED = "collapsed";
                var REFERENCE_TYPE_FULL = "full";

                /*
 * A map of characters, and their column length,
 * which can be used as indentation.
 */

                var INDENTATION_CHARACTERS = {};

                INDENTATION_CHARACTERS[C_SPACE] = SPACE_SIZE;
                INDENTATION_CHARACTERS[C_TAB] = TAB_SIZE;

                /*
 * A map of characters, which can be used to mark emphasis.
 */

                var EMPHASIS_MARKERS = {};

                EMPHASIS_MARKERS[C_ASTERISK] = true;
                EMPHASIS_MARKERS[C_UNDERSCORE] = true;

                /*
 * A map of characters, which can be used to mark rules.
 */

                var RULE_MARKERS = {};

                RULE_MARKERS[C_ASTERISK] = true;
                RULE_MARKERS[C_UNDERSCORE] = true;
                RULE_MARKERS[C_DASH] = true;

                /*
 * A map of characters which can be used to mark
 * list-items.
 */

                var LIST_UNORDERED_MARKERS = {};

                LIST_UNORDERED_MARKERS[C_ASTERISK] = true;
                LIST_UNORDERED_MARKERS[C_PLUS] = true;
                LIST_UNORDERED_MARKERS[C_DASH] = true;

                /*
 * A map of characters which can be used to mark
 * list-items after a digit.
 */

                var LIST_ORDERED_MARKERS = {};

                LIST_ORDERED_MARKERS[C_DOT] = true;

                /*
 * A map of characters which can be used to mark
 * list-items after a digit.
 */

                var LIST_ORDERED_COMMONMARK_MARKERS = {};

                LIST_ORDERED_COMMONMARK_MARKERS[C_DOT] = true;
                LIST_ORDERED_COMMONMARK_MARKERS[C_PAREN_CLOSE] = true;

                /*
 * A map of characters, which can be used to mark link
 * and image titles.
 */

                var LINK_TITLE_MARKERS = {};

                LINK_TITLE_MARKERS[C_DOUBLE_QUOTE] = C_DOUBLE_QUOTE;
                LINK_TITLE_MARKERS[C_SINGLE_QUOTE] = C_SINGLE_QUOTE;

                /*
 * A map of characters, which can be used to mark link
 * and image titles in commonmark-mode.
 */

                var COMMONMARK_LINK_TITLE_MARKERS = {};

                COMMONMARK_LINK_TITLE_MARKERS[C_DOUBLE_QUOTE] = C_DOUBLE_QUOTE;
                COMMONMARK_LINK_TITLE_MARKERS[C_SINGLE_QUOTE] = C_SINGLE_QUOTE;
                COMMONMARK_LINK_TITLE_MARKERS[C_PAREN_OPEN] = C_PAREN_CLOSE;

                /*
 * A map of characters which can be used to mark setext
 * headers, mapping to their corresponding depth.
 */

                var SETEXT_MARKERS = {};

                SETEXT_MARKERS[C_EQUALS] = 1;
                SETEXT_MARKERS[C_DASH] = 2;

                /*
 * A map of two functions which can create list items.
 */

                var LIST_ITEM_MAP = {};

                LIST_ITEM_MAP.true = renderPedanticListItem;
                LIST_ITEM_MAP.false = renderNormalListItem;

                /**
 * Check whether `character` is alphabetic.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is alphabetic.
 */
                function isAlphabetic(character) {
                    var code = character.charCodeAt(0);

                    return (code >= CC_A_LOWER && code <= CC_Z_LOWER) || (code >= CC_A_UPPER && code <= CC_Z_UPPER);
                }

                /**
 * Check whether `character` is numeric.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is numeric.
 */
                function isNumeric(character) {
                    var code = character.charCodeAt(0);

                    return code >= CC_0 && code <= CC_9;
                }

                /**
 * Check whether `character` is a word character.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is a word
 *   character.
 */
                function isWordCharacter(character) {
                    return character === C_UNDERSCORE || isAlphabetic(character) || isNumeric(character);
                }

                /**
 * Check whether `character` is white-space.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is white-space.
 */
                function isWhiteSpace(character) {
                    return (
                        character === C_SPACE ||
                        character === C_FORM_FEED ||
                        character === C_NEWLINE ||
                        character === C_CARRIAGE_RETURN ||
                        character === C_TAB ||
                        character === C_VERTICAL_TAB ||
                        character === C_NO_BREAK_SPACE ||
                        character === C_OGHAM_SPACE ||
                        character === C_MONGOLIAN_VOWEL_SEPARATOR ||
                        character === C_EN_QUAD ||
                        character === C_EM_QUAD ||
                        character === C_EN_SPACE ||
                        character === C_EM_SPACE ||
                        character === C_THREE_PER_EM_SPACE ||
                        character === C_FOUR_PER_EM_SPACE ||
                        character === C_SIX_PER_EM_SPACE ||
                        character === C_FIGURE_SPACE ||
                        character === C_PUNCTUATION_SPACE ||
                        character === C_THIN_SPACE ||
                        character === C_HAIR_SPACE ||
                        character === C_LINE_SEPARATOR ||
                        character === C_PARAGRAPH_SEPARATOR ||
                        character === C_NARROW_NO_BREAK_SPACE ||
                        character === C_IDEOGRAPHIC_SPACE ||
                        character === C_ZERO_WIDTH_NO_BREAK_SPACE
                    );
                }

                /**
 * Check whether `character` can be inside an unquoted
 * attribute value.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   an unquoted attribute value.
 */
                function isUnquotedAttributeCharacter(character) {
                    return (
                        character !== C_DOUBLE_QUOTE &&
                        character !== C_SINGLE_QUOTE &&
                        character !== C_EQUALS &&
                        character !== C_LT &&
                        character !== C_GT &&
                        character !== C_TICK
                    );
                }

                /**
 * Check whether `character` can be inside a double-quoted
 * attribute value.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   a double-quoted attribute value.
 */
                function isDoubleQuotedAttributeCharacter(character) {
                    return character !== C_DOUBLE_QUOTE;
                }

                isDoubleQuotedAttributeCharacter.delimiter = C_DOUBLE_QUOTE;

                /**
 * Check whether `character` can be inside a single-quoted
 * attribute value.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` can be inside
 *   a single-quoted attribute value.
 */
                function isSingleQuotedAttributeCharacter(character) {
                    return character !== C_SINGLE_QUOTE;
                }

                isSingleQuotedAttributeCharacter.delimiter = C_SINGLE_QUOTE;

                /**
 * Check whether `character` can be inside an enclosed
 * URI.
 *
 * @property {string} delimiter - Closing delimiter.
 * @param {string} character - Character to test.
 * @return {boolean} - Whether `character` can be inside
 *   an enclosed URI.
 */
                function isEnclosedURLCharacter(character) {
                    return character !== C_GT && character !== C_BRACKET_OPEN && character !== C_BRACKET_CLOSE;
                }

                isEnclosedURLCharacter.delimiter = C_GT;

                /**
 * Check whether `character` can be inside an unclosed
 * URI.
 *
 * @param {string} character - Character to test.
 * @return {boolean} - Whether `character` can be inside
 *   an unclosed URI.
 */
                function isUnclosedURLCharacter(character) {
                    return character !== C_BRACKET_OPEN && character !== C_BRACKET_CLOSE && !isWhiteSpace(character);
                }

                /**
 * Normalize an identifier.  Collapses multiple white space
 * characters into a single space, and removes casing.
 *
 * @example
 *   normalizeIdentifier('FOO\t bar'); // 'foo bar'
 *
 * @param {string} value - Content to normalize.
 * @return {string} - Normalized content.
 */
                function normalize(value) {
                    return collapseWhiteSpace(value).toLowerCase();
                }

                /**
 * Construct a state `toggler`: a function which inverses
 * `property` in context based on its current value.
 * The by `toggler` returned function restores that value.
 *
 * @example
 *   var context = {};
 *   var key = 'foo';
 *   var val = true;
 *   context[key] = val;
 *   context.enter = toggle(key, val);
 *   context[key]; // true
 *   var exit = context.enter();
 *   context[key]; // false
 *   var nested = context.enter();
 *   context[key]; // false
 *   nested();
 *   context[key]; // false
 *   exit();
 *   context[key]; // true
 *
 * @param {string} key - Property to toggle.
 * @param {boolean} state - It's default state.
 * @return {function(): function()} - Enter.
 */
                function toggle(key, state) {
                    /**
     * Construct a toggler for the bound `key`.
     *
     * @return {Function} - Exit state.
     */
                    function enter() {
                        var self = this;
                        var current = self[key];

                        self[key] = !state;

                        /**
         * State canceler, cancels the state, if allowed.
         */
                        function exit() {
                            self[key] = current;
                        }

                        return exit;
                    }

                    return enter;
                }

                /*
 * Define nodes of a type which can be merged.
 */

                var MERGEABLE_NODES = {};

                /**
 * Check whether a node is mergeable with adjacent nodes.
 *
 * @param {Object} node - Node to check.
 * @return {boolean} - Whether `node` is mergable.
 */
                function mergeable(node) {
                    var start;
                    var end;

                    if (node.type !== "text" || !node.position) {
                        return true;
                    }

                    start = node.position.start;
                    end = node.position.end;

                    /*
     * Only merge nodes which occupy the same size as their
     * `value`.
     */

                    return start.line !== end.line || end.column - start.column === node.value.length;
                }

                /**
 * Merge two text nodes: `node` into `prev`.
 *
 * @param {Object} prev - Preceding sibling.
 * @param {Object} node - Following sibling.
 * @return {Object} - `prev`.
 */
                MERGEABLE_NODES.text = function(prev, node) {
                    prev.value += node.value;

                    return prev;
                };

                /**
 * Merge two blockquotes: `node` into `prev`, unless in
 * CommonMark mode.
 *
 * @param {Object} prev - Preceding sibling.
 * @param {Object} node - Following sibling.
 * @return {Object} - `prev`, or `node` in CommonMark mode.
 */
                MERGEABLE_NODES.blockquote = function(prev, node) {
                    if (this.options.commonmark) {
                        return node;
                    }

                    prev.children = prev.children.concat(node.children);

                    return prev;
                };

                /**
 * Factory to create an entity decoder.
 *
 * @param {Object} context - Context to attach to, e.g.,
 *   a parser.
 * @return {Function} - See `decode`.
 */
                function decodeFactory(context) {
                    /**
     * Normalize `position` to add an `indent`.
     *
     * @param {Position} position - Reference
     * @return {Position} - Augmented with `indent`.
     */
                    function normalize(position) {
                        return {
                            start: position,
                            indent: context.getIndent(position.line)
                        };
                    }

                    /**
     * Handle a warning.
     *
     * @this {VFile} - Virtual file.
     * @param {string} reason - Reason for warning.
     * @param {Position} position - Place of warning.
     * @param {number} code - Code for warning.
     */
                    function handleWarning(reason, position, code) {
                        if (code === 3) {
                            return;
                        }

                        context.file.warn(reason, position);
                    }

                    /**
     * Decode `value` (at `position`) into text-nodes.
     *
     * @param {string} value - Value to parse.
     * @param {Position} position - Position to start parsing at.
     * @param {Function} handler - Node handler.
     */
                    function decoder(value, position, handler) {
                        decode(value, {
                            position: normalize(position),
                            warning: handleWarning,
                            text: handler,
                            reference: handler,
                            textContext: context,
                            referenceContext: context
                        });
                    }

                    /**
     * Decode `value` (at `position`) into a string.
     *
     * @param {string} value - Value to parse.
     * @param {Position} position - Position to start
     *   parsing at.
     * @return {string} - Plain-text.
     */
                    function decodeRaw(value, position) {
                        return decode(value, {
                            position: normalize(position),
                            warning: handleWarning
                        });
                    }

                    decoder.raw = decodeRaw;

                    return decoder;
                }

                /**
 * Factory to de-escape a value, based on a list at `key`
 * in `scope`.
 *
 * @example
 *   var scope = {escape: ['a']}
 *   var descape = descapeFactory(scope, 'escape');
 *
 * @param {Object} scope - List of escapable characters.
 * @param {string} key - Key in `map` at which the list
 *   exists.
 * @return {function(string): string} - Function which
 *   takes a value and returns its unescaped version.
 */
                function descapeFactory(scope, key) {
                    /**
     * De-escape a string using the expression at `key`
     * in `scope`.
     *
     * @example
     *   var scope = {escape: ['a']}
     *   var descape = descapeFactory(scope, 'escape');
     *   descape('\a \b'); // 'a \b'
     *
     * @param {string} value - Escaped string.
     * @return {string} - Unescaped string.
     */
                    function descape(value) {
                        var prev = 0;
                        var index = value.indexOf(C_BACKSLASH);
                        var escape = scope[key];
                        var queue = [];
                        var character;

                        while (index !== -1) {
                            queue.push(value.slice(prev, index));
                            prev = index + 1;
                            character = value.charAt(prev);

                            /*
             * If the following character is not a valid escape,
             * add the slash.
             */

                            if (!character || escape.indexOf(character) === -1) {
                                queue.push(C_BACKSLASH);
                            }

                            index = value.indexOf(C_BACKSLASH, prev);
                        }

                        queue.push(value.slice(prev));

                        return queue.join(EMPTY);
                    }

                    return descape;
                }

                /**
 * Gets indentation information for a line.
 *
 * @example
 *   getIndent('  foo');
 *   // {indent: 2, stops: {1: 0, 2: 1}}
 *
 *   getIndent('\tfoo');
 *   // {indent: 4, stops: {4: 0}}
 *
 *   getIndent('  \tfoo');
 *   // {indent: 4, stops: {1: 0, 2: 1, 4: 2}}
 *
 *   getIndent('\t  foo')
 *   // {indent: 6, stops: {4: 0, 5: 1, 6: 2}}
 *
 * @param {string} value - Indented line.
 * @return {Object} - Indetation information.
 */
                function getIndent(value) {
                    var index = 0;
                    var indent = 0;
                    var character = value.charAt(index);
                    var stops = {};
                    var size;

                    while (character in INDENTATION_CHARACTERS) {
                        size = INDENTATION_CHARACTERS[character];

                        indent += size;

                        if (size > 1) {
                            indent = Math.floor(indent / size) * size;
                        }

                        stops[indent] = index;

                        character = value.charAt(++index);
                    }

                    return {
                        indent: indent,
                        stops: stops
                    };
                }

                /**
 * Remove the minimum indent from every line in `value`.
 * Supports both tab, spaced, and mixed indentation (as
 * well as possible).
 *
 * @example
 *   removeIndentation('  foo'); // 'foo'
 *   removeIndentation('    foo', 2); // '  foo'
 *   removeIndentation('\tfoo', 2); // '  foo'
 *   removeIndentation('  foo\n bar'); // ' foo\n bar'
 *
 * @param {string} value - Value to trim.
 * @param {number?} [maximum] - Maximum indentation
 *   to remove.
 * @return {string} - Unindented `value`.
 */
                function removeIndentation(value, maximum) {
                    var values = value.split(C_NEWLINE);
                    var position = values.length + 1;
                    var minIndent = Infinity;
                    var matrix = [];
                    var index;
                    var indentation;
                    var stops;
                    var padding;

                    values.unshift(repeat(C_SPACE, maximum) + C_EXCLAMATION_MARK);

                    while (position--) {
                        indentation = getIndent(values[position]);

                        matrix[position] = indentation.stops;

                        if (trim(values[position]).length === 0) {
                            continue;
                        }

                        if (indentation.indent) {
                            if (indentation.indent > 0 && indentation.indent < minIndent) {
                                minIndent = indentation.indent;
                            }
                        } else {
                            minIndent = Infinity;

                            break;
                        }
                    }

                    if (minIndent !== Infinity) {
                        position = values.length;

                        while (position--) {
                            stops = matrix[position];
                            index = minIndent;

                            while (index && !(index in stops)) {
                                index--;
                            }

                            if (trim(values[position]).length !== 0 && minIndent && index !== minIndent) {
                                padding = C_TAB;
                            } else {
                                padding = EMPTY;
                            }

                            values[position] = padding + values[position].slice(index in stops ? stops[index] + 1 : 0);
                        }
                    }

                    values.shift();

                    return values.join(C_NEWLINE);
                }

                /**
 * Tokenise a line.
 *
 * @example
 *   tokenizeNewline(eat, '\n\n');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {boolean?} - `true` when matching.
 */
                function tokenizeNewline(eat, value, silent) {
                    var character = value.charAt(0);
                    var length;
                    var subvalue;
                    var queue;
                    var index;

                    if (character !== C_NEWLINE) {
                        return;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    index = 1;
                    length = value.length;
                    subvalue = C_NEWLINE;
                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (!isWhiteSpace(character)) {
                            break;
                        }

                        queue += character;

                        if (character === C_NEWLINE) {
                            subvalue += queue;
                            queue = EMPTY;
                        }

                        index++;
                    }

                    eat(subvalue);
                }

                /**
 * Tokenise an indented code block.
 *
 * @example
 *   tokenizeIndentedCode(eat, '\tfoo');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `code` node.
 */
                function tokenizeIndentedCode(eat, value, silent) {
                    var self = this;
                    var index = -1;
                    var length = value.length;
                    var character;
                    var subvalue = EMPTY;
                    var content = EMPTY;
                    var subvalueQueue = EMPTY;
                    var contentQueue = EMPTY;
                    var blankQueue;
                    var indent;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (indent) {
                            indent = false;

                            subvalue += subvalueQueue;
                            content += contentQueue;
                            subvalueQueue = contentQueue = EMPTY;

                            if (character === C_NEWLINE) {
                                subvalueQueue = contentQueue = character;
                            } else {
                                subvalue += character;
                                content += character;

                                while (++index < length) {
                                    character = value.charAt(index);

                                    if (!character || character === C_NEWLINE) {
                                        contentQueue = subvalueQueue = character;
                                        break;
                                    }

                                    subvalue += character;
                                    content += character;
                                }
                            }
                        } else if (
                            character === C_SPACE &&
                            value.charAt(index + 1) === C_SPACE &&
                            value.charAt(index + 2) === C_SPACE &&
                            value.charAt(index + 3) === C_SPACE
                        ) {
                            subvalueQueue += CODE_INDENT;
                            index += 3;
                            indent = true;
                        } else if (character === C_TAB) {
                            subvalueQueue += character;
                            indent = true;
                        } else {
                            blankQueue = EMPTY;

                            while (character === C_TAB || character === C_SPACE) {
                                blankQueue += character;
                                character = value.charAt(++index);
                            }

                            if (character !== C_NEWLINE) {
                                break;
                            }

                            subvalueQueue += blankQueue + character;
                            contentQueue += character;
                        }
                    }

                    if (content) {
                        if (silent) {
                            return true;
                        }

                        return eat(subvalue)(self.renderCodeBlock(content));
                    }
                }

                /**
 * Tokenise a fenced code block.
 *
 * @example
 *   tokenizeFencedCode(eat, '```js\nfoo()\n```');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `code` node.
 */
                function tokenizeFencedCode(eat, value, silent) {
                    var self = this;
                    var settings = self.options;
                    var length = value.length + 1;
                    var index = 0;
                    var subvalue = EMPTY;
                    var fenceCount;
                    var marker;
                    var character;
                    var flag;
                    var queue;
                    var content;
                    var exdentedContent;
                    var closing;
                    var exdentedClosing;
                    var indent;
                    var now;

                    if (!settings.gfm) {
                        return;
                    }

                    /*
     * Eat initial spacing.
     */

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE && character !== C_TAB) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    indent = index; // TODO: CHECK.

                    /*
     * Eat the fence.
     */

                    character = value.charAt(index);

                    if (character !== C_TILDE && character !== C_TICK) {
                        return;
                    }

                    index++;
                    marker = character;
                    fenceCount = 1;
                    subvalue += character;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== marker) {
                            break;
                        }

                        subvalue += character;
                        fenceCount++;
                        index++;
                    }

                    if (fenceCount < MIN_FENCE_COUNT) {
                        return;
                    }

                    /*
     * Eat spacing before flag.
     */

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE && character !== C_TAB) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    /*
     * Eat flag.
     */

                    flag = queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_NEWLINE || character === C_TILDE || character === C_TICK) {
                            break;
                        }

                        if (character === C_SPACE || character === C_TAB) {
                            queue += character;
                        } else {
                            flag += queue + character;
                            queue = EMPTY;
                        }

                        index++;
                    }

                    character = value.charAt(index);

                    if (character && character !== C_NEWLINE) {
                        return;
                    }

                    if (silent) {
                        return true;
                    }

                    now = eat.now();
                    now.column += subvalue.length;
                    now.offset += subvalue.length;

                    subvalue += flag;
                    flag = self.decode.raw(self.descape(flag), now);

                    if (queue) {
                        subvalue += queue;
                    }

                    queue = closing = exdentedClosing = content = exdentedContent = EMPTY;

                    /*
     * Eat content.
     */

                    while (index < length) {
                        character = value.charAt(index);
                        content += closing;
                        exdentedContent += exdentedClosing;
                        closing = exdentedClosing = EMPTY;

                        if (character !== C_NEWLINE) {
                            content += character;
                            exdentedClosing += character;
                            index++;
                            continue;
                        }

                        /*
         * Add the newline to `subvalue` if its the first
         * character. Otherwise, add it to the `closing`
         * queue.
         */

                        if (!content) {
                            subvalue += character;
                        } else {
                            closing += character;
                            exdentedClosing += character;
                        }

                        queue = EMPTY;
                        index++;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character !== C_SPACE) {
                                break;
                            }

                            queue += character;
                            index++;
                        }

                        closing += queue;
                        exdentedClosing += queue.slice(indent);

                        if (queue.length >= CODE_INDENT_LENGTH) {
                            continue;
                        }

                        queue = EMPTY;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character !== marker) {
                                break;
                            }

                            queue += character;
                            index++;
                        }

                        closing += queue;
                        exdentedClosing += queue;

                        if (queue.length < fenceCount) {
                            continue;
                        }

                        queue = EMPTY;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character !== C_SPACE && character !== C_TAB) {
                                break;
                            }

                            closing += character;
                            exdentedClosing += character;
                            index++;
                        }

                        if (!character || character === C_NEWLINE) {
                            break;
                        }
                    }

                    subvalue += content + closing;

                    return eat(subvalue)(self.renderCodeBlock(exdentedContent, flag));
                }

                /**
 * Tokenise an ATX-style heading.
 *
 * @example
 *   tokenizeATXHeading(eat, ' # foo');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `heading` node.
 */
                function tokenizeATXHeading(eat, value, silent) {
                    var self = this;
                    var settings = self.options;
                    var length = value.length + 1;
                    var index = -1;
                    var now = eat.now();
                    var subvalue = EMPTY;
                    var content = EMPTY;
                    var character;
                    var queue;
                    var depth;

                    /*
     * Eat initial spacing.
     */

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE && character !== C_TAB) {
                            index--;
                            break;
                        }

                        subvalue += character;
                    }

                    /*
     * Eat hashes.
     */

                    depth = 0;
                    length = index + MAX_ATX_COUNT + 1;

                    while (++index <= length) {
                        character = value.charAt(index);

                        if (character !== C_HASH) {
                            index--;
                            break;
                        }

                        subvalue += character;
                        depth++;
                    }

                    if (!depth || (!settings.pedantic && value.charAt(index + 1) === C_HASH)) {
                        return;
                    }

                    length = value.length + 1;

                    /*
     * Eat intermediate white-space.
     */

                    queue = EMPTY;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE && character !== C_TAB) {
                            index--;
                            break;
                        }

                        queue += character;
                    }

                    /*
     * Exit when not in pedantic mode without spacing.
     */

                    if (!settings.pedantic && !queue.length && character && character !== C_NEWLINE) {
                        return;
                    }

                    if (silent) {
                        return true;
                    }

                    /*
     * Eat content.
     */

                    subvalue += queue;
                    queue = content = EMPTY;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (!character || character === C_NEWLINE) {
                            break;
                        }

                        if (character !== C_SPACE && character !== C_TAB && character !== C_HASH) {
                            content += queue + character;
                            queue = EMPTY;
                            continue;
                        }

                        while (character === C_SPACE || character === C_TAB) {
                            queue += character;
                            character = value.charAt(++index);
                        }

                        while (character === C_HASH) {
                            queue += character;
                            character = value.charAt(++index);
                        }

                        while (character === C_SPACE || character === C_TAB) {
                            queue += character;
                            character = value.charAt(++index);
                        }

                        index--;
                    }

                    now.column += subvalue.length;
                    now.offset += subvalue.length;
                    subvalue += content + queue;

                    return eat(subvalue)(self.renderHeading(content, depth, now));
                }

                /**
 * Tokenise a Setext-style heading.
 *
 * @example
 *   tokenizeSetextHeading(eat, 'foo\n===');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `heading` node.
 */
                function tokenizeSetextHeading(eat, value, silent) {
                    var self = this;
                    var now = eat.now();
                    var length = value.length;
                    var index = -1;
                    var subvalue = EMPTY;
                    var content;
                    var queue;
                    var character;
                    var marker;
                    var depth;

                    /*
     * Eat initial indentation.
     */

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE || index >= MAX_LINE_HEADING_INDENT) {
                            index--;
                            break;
                        }

                        subvalue += character;
                    }

                    /*
     * Eat content.
     */

                    content = queue = EMPTY;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character === C_NEWLINE) {
                            index--;
                            break;
                        }

                        if (character === C_SPACE || character === C_TAB) {
                            queue += character;
                        } else {
                            content += queue + character;
                            queue = EMPTY;
                        }
                    }

                    now.column += subvalue.length;
                    now.offset += subvalue.length;
                    subvalue += content + queue;

                    /*
     * Ensure the content is followed by a newline and a
     * valid marker.
     */

                    character = value.charAt(++index);
                    marker = value.charAt(++index);

                    if (character !== C_NEWLINE || !SETEXT_MARKERS[marker]) {
                        return;
                    }

                    if (silent) {
                        return true;
                    }

                    subvalue += character;

                    /*
     * Eat Setext-line.
     */

                    queue = marker;
                    depth = SETEXT_MARKERS[marker];

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character !== marker) {
                            if (character !== C_NEWLINE) {
                                return;
                            }

                            index--;
                            break;
                        }

                        queue += character;
                    }

                    return eat(subvalue + queue)(self.renderHeading(content, depth, now));
                }

                /**
 * Tokenise a horizontal rule.
 *
 * @example
 *   tokenizeThematicBreak(eat, '***');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `thematicBreak` node.
 */
                function tokenizeThematicBreak(eat, value, silent) {
                    var self = this;
                    var index = -1;
                    var length = value.length + 1;
                    var subvalue = EMPTY;
                    var character;
                    var marker;
                    var markerCount;
                    var queue;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character !== C_TAB && character !== C_SPACE) {
                            break;
                        }

                        subvalue += character;
                    }

                    if (RULE_MARKERS[character] !== true) {
                        return;
                    }

                    marker = character;
                    subvalue += character;
                    markerCount = 1;
                    queue = EMPTY;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character === marker) {
                            markerCount++;
                            subvalue += queue + marker;
                            queue = EMPTY;
                        } else if (character === C_SPACE) {
                            queue += character;
                        } else if (
                            markerCount >= THEMATIC_BREAK_MARKER_COUNT &&
                            (!character || character === C_NEWLINE)
                        ) {
                            subvalue += queue;

                            if (silent) {
                                return true;
                            }

                            return eat(subvalue)(self.renderVoid(T_THEMATIC_BREAK));
                        } else {
                            return;
                        }
                    }
                }

                /**
 * Tokenise a blockquote.
 *
 * @example
 *   tokenizeBlockquote(eat, '> Foo');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `blockquote` node.
 */
                function tokenizeBlockquote(eat, value, silent) {
                    var self = this;
                    var commonmark = self.options.commonmark;
                    var now = eat.now();
                    var indent = self.indent(now.line);
                    var length = value.length;
                    var values = [];
                    var contents = [];
                    var indents = [];
                    var add;
                    var tokenizers;
                    var index = 0;
                    var character;
                    var rest;
                    var nextIndex;
                    var content;
                    var line;
                    var startIndex;
                    var prefixed;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE && character !== C_TAB) {
                            break;
                        }

                        index++;
                    }

                    if (value.charAt(index) !== C_GT) {
                        return;
                    }

                    if (silent) {
                        return true;
                    }

                    tokenizers = self.blockTokenizers;
                    index = 0;

                    while (index < length) {
                        nextIndex = value.indexOf(C_NEWLINE, index);
                        startIndex = index;
                        prefixed = false;

                        if (nextIndex === -1) {
                            nextIndex = length;
                        }

                        while (index < length) {
                            character = value.charAt(index);

                            if (character !== C_SPACE && character !== C_TAB) {
                                break;
                            }

                            index++;
                        }

                        if (value.charAt(index) === C_GT) {
                            index++;
                            prefixed = true;

                            if (value.charAt(index) === C_SPACE) {
                                index++;
                            }
                        } else {
                            index = startIndex;
                        }

                        content = value.slice(index, nextIndex);

                        if (!prefixed && !trim(content)) {
                            index = startIndex;
                            break;
                        }

                        if (!prefixed) {
                            rest = value.slice(index);

                            if (
                                commonmark &&
                                (tokenizers.indentedCode.call(self, eat, rest, true) ||
                                    tokenizers.fencedCode.call(self, eat, rest, true) ||
                                    tokenizers.atxHeading.call(self, eat, rest, true) ||
                                    tokenizers.setextHeading.call(self, eat, rest, true) ||
                                    tokenizers.thematicBreak.call(self, eat, rest, true) ||
                                    tokenizers.html.call(self, eat, rest, true) ||
                                    tokenizers.list.call(self, eat, rest, true))
                            ) {
                                break;
                            }

                            if (
                                !commonmark &&
                                (tokenizers.definition.call(self, eat, rest, true) ||
                                    tokenizers.footnote.call(self, eat, rest, true))
                            ) {
                                break;
                            }
                        }

                        line = startIndex === index ? content : value.slice(startIndex, nextIndex);

                        indents.push(index - startIndex);
                        values.push(line);
                        contents.push(content);

                        index = nextIndex + 1;
                    }

                    index = -1;
                    length = indents.length;
                    add = eat(values.join(C_NEWLINE));

                    while (++index < length) {
                        indent(indents[index]);
                    }

                    return add(self.renderBlockquote(contents.join(C_NEWLINE), now));
                }

                /**
 * Tokenise a list.
 *
 * @example
 *   tokenizeList(eat, '- Foo');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `list` node.
 */
                function tokenizeList(eat, value, silent) {
                    var self = this;
                    var commonmark = self.options.commonmark;
                    var pedantic = self.options.pedantic;
                    var tokenizers = self.blockTokenizers;
                    var markers;
                    var index = 0;
                    var length = value.length;
                    var start = null;
                    var queue;
                    var ordered;
                    var character;
                    var marker;
                    var nextIndex;
                    var startIndex;
                    var prefixed;
                    var currentMarker;
                    var content;
                    var line;
                    var prevEmpty;
                    var empty;
                    var items;
                    var allLines;
                    var emptyLines;
                    var item;
                    var enterTop;
                    var exitBlockquote;
                    var isLoose;
                    var node;
                    var now;
                    var end;
                    var indented;
                    var size;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE && character !== C_TAB) {
                            break;
                        }

                        index++;
                    }

                    character = value.charAt(index);

                    markers = commonmark ? LIST_ORDERED_COMMONMARK_MARKERS : LIST_ORDERED_MARKERS;

                    if (LIST_UNORDERED_MARKERS[character] === true) {
                        marker = character;
                        ordered = false;
                    } else {
                        ordered = true;
                        queue = EMPTY;

                        while (index < length) {
                            character = value.charAt(index);

                            if (!isNumeric(character)) {
                                break;
                            }

                            queue += character;
                            index++;
                        }

                        character = value.charAt(index);

                        if (!queue || markers[character] !== true) {
                            return;
                        }

                        start = parseInt(queue, 10);
                        marker = character;
                    }

                    character = value.charAt(++index);

                    if (character !== C_SPACE && character !== C_TAB) {
                        return;
                    }

                    if (silent) {
                        return true;
                    }

                    index = 0;
                    items = [];
                    allLines = [];
                    emptyLines = [];

                    while (index < length) {
                        nextIndex = value.indexOf(C_NEWLINE, index);
                        startIndex = index;
                        prefixed = false;
                        indented = false;

                        if (nextIndex === -1) {
                            nextIndex = length;
                        }

                        end = index + TAB_SIZE;
                        size = 0;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character === C_TAB) {
                                size += TAB_SIZE - size % TAB_SIZE;
                            } else if (character === C_SPACE) {
                                size++;
                            } else {
                                break;
                            }

                            index++;
                        }

                        if (size >= TAB_SIZE) {
                            indented = true;
                        }

                        if (item && size >= item.indent) {
                            indented = true;
                        }

                        character = value.charAt(index);
                        currentMarker = null;

                        if (!indented) {
                            if (LIST_UNORDERED_MARKERS[character] === true) {
                                currentMarker = character;
                                index++;
                                size++;
                            } else {
                                queue = EMPTY;

                                while (index < length) {
                                    character = value.charAt(index);

                                    if (!isNumeric(character)) {
                                        break;
                                    }

                                    queue += character;
                                    index++;
                                }

                                character = value.charAt(index);
                                index++;

                                if (queue && markers[character] === true) {
                                    currentMarker = character;
                                    size += queue.length + 1;
                                }
                            }

                            if (currentMarker) {
                                character = value.charAt(index);

                                if (character === C_TAB) {
                                    size += TAB_SIZE - size % TAB_SIZE;
                                    index++;
                                } else if (character === C_SPACE) {
                                    end = index + TAB_SIZE;

                                    while (index < end) {
                                        if (value.charAt(index) !== C_SPACE) {
                                            break;
                                        }

                                        index++;
                                        size++;
                                    }

                                    if (index === end && value.charAt(index) === C_SPACE) {
                                        index -= TAB_SIZE - 1;
                                        size -= TAB_SIZE - 1;
                                    }
                                } else if (character !== C_NEWLINE && character !== EMPTY) {
                                    currentMarker = null;
                                }
                            }
                        }

                        if (currentMarker) {
                            if (commonmark && marker !== currentMarker) {
                                break;
                            }

                            prefixed = true;
                        } else {
                            if (!commonmark && !indented && value.charAt(startIndex) === C_SPACE) {
                                indented = true;
                            } else if (commonmark && item) {
                                indented = size >= item.indent || size > TAB_SIZE;
                            }

                            prefixed = false;
                            index = startIndex;
                        }

                        line = value.slice(startIndex, nextIndex);
                        content = startIndex === index ? line : value.slice(index, nextIndex);

                        if (currentMarker && RULE_MARKERS[currentMarker] === true) {
                            if (tokenizers.thematicBreak.call(self, eat, line, true)) {
                                break;
                            }
                        }

                        prevEmpty = empty;
                        empty = !trim(content).length;

                        if (indented && item) {
                            item.value = item.value.concat(emptyLines, line);
                            allLines = allLines.concat(emptyLines, line);
                            emptyLines = [];
                        } else if (prefixed) {
                            if (emptyLines.length) {
                                item.value.push(EMPTY);
                                item.trail = emptyLines.concat();
                            }

                            item = {
                                // 'bullet': value.slice(startIndex, index),
                                value: [line],
                                indent: size,
                                trail: []
                            };

                            items.push(item);
                            allLines = allLines.concat(emptyLines, line);
                            emptyLines = [];
                        } else if (empty) {
                            // TODO: disable when in pedantic-mode.
                            if (prevEmpty) {
                                break;
                            }

                            emptyLines.push(line);
                        } else {
                            if (prevEmpty) {
                                break;
                            }

                            if (
                                !pedantic &&
                                (tokenizers.fencedCode.call(self, eat, line, true) ||
                                    tokenizers.thematicBreak.call(self, eat, line, true))
                            ) {
                                break;
                            }

                            if (!commonmark) {
                                if (
                                    tokenizers.definition.call(self, eat, line, true) ||
                                    tokenizers.footnote.call(self, eat, line, true)
                                ) {
                                    break;
                                }
                            }

                            item.value = item.value.concat(emptyLines, line);
                            allLines = allLines.concat(emptyLines, line);
                            emptyLines = [];
                        }

                        index = nextIndex + 1;
                    }

                    node = eat(allLines.join(C_NEWLINE)).reset({
                        type: T_LIST,
                        ordered: ordered,
                        start: start,
                        loose: null,
                        children: []
                    });

                    enterTop = self.enterList();
                    exitBlockquote = self.enterBlock();
                    isLoose = false;
                    index = -1;
                    length = items.length;

                    while (++index < length) {
                        item = items[index].value.join(C_NEWLINE);
                        now = eat.now();

                        item = eat(item)(self.renderListItem(item, now), node);

                        if (item.loose) {
                            isLoose = true;
                        }

                        item = items[index].trail.join(C_NEWLINE);

                        if (index !== length - 1) {
                            item += C_NEWLINE;
                        }

                        eat(item);
                    }

                    enterTop();
                    exitBlockquote();

                    node.loose = isLoose;

                    return node;
                }

                /**
 * Try to match comment.
 *
 * @param {string} value - Value to parse.
 * @param {Object} settings - Configuration as available on
 *   a parser.
 * @return {string?} - When applicable, the comment at the
 *   start of `value`.
 */
                function eatHTMLComment(value, settings) {
                    var index = COMMENT_START_LENGTH;
                    var queue = COMMENT_START;
                    var length = value.length;
                    var commonmark = settings.commonmark;
                    var character;
                    var hasNonDash;

                    if (value.slice(0, index) === queue) {
                        while (index < length) {
                            character = value.charAt(index);

                            if (
                                character === COMMENT_END_CHAR &&
                                value.slice(index, index + COMMENT_END_LENGTH) === COMMENT_END
                            ) {
                                return queue + COMMENT_END;
                            }

                            if (commonmark) {
                                if (character === C_GT && !hasNonDash) {
                                    return;
                                }

                                if (character === C_DASH) {
                                    if (value.charAt(index + 1) === C_DASH) {
                                        return;
                                    }
                                } else {
                                    hasNonDash = true;
                                }
                            }

                            queue += character;
                            index++;
                        }
                    }
                }

                /**
 * Try to match CDATA.
 *
 * @param {string} value - Value to parse.
 * @return {string?} - When applicable, the CDATA at the
 *   start of `value`.
 */
                function eatHTMLCDATA(value) {
                    var index = CDATA_START_LENGTH;
                    var queue = value.slice(0, index);
                    var length = value.length;
                    var character;

                    if (queue.toUpperCase() === CDATA_START) {
                        while (index < length) {
                            character = value.charAt(index);

                            if (
                                character === CDATA_END_CHAR &&
                                value.slice(index, index + CDATA_END_LENGTH) === CDATA_END
                            ) {
                                return queue + CDATA_END;
                            }

                            queue += character;
                            index++;
                        }
                    }
                }

                /**
 * Try to match a processing instruction.
 *
 * @param {string} value - Value to parse.
 * @return {string?} - When applicable, the processing
 *   instruction at the start of `value`.
 */
                function eatHTMLProcessingInstruction(value) {
                    var index = 0;
                    var queue = EMPTY;
                    var length = value.length;
                    var character;

                    if (value.charAt(index) === C_LT && value.charAt(++index) === C_QUESTION_MARK) {
                        queue = C_LT + C_QUESTION_MARK;
                        index++;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character === C_QUESTION_MARK && value.charAt(index + 1) === C_GT) {
                                return queue + character + C_GT;
                            }

                            queue += character;
                            index++;
                        }
                    }
                }

                /**
 * Try to match a declaration.
 *
 * @param {string} value - Value to parse.
 * @return {string?} - When applicable, the declaration at
 *   the start of `value`.
 */
                function eatHTMLDeclaration(value) {
                    var index = 0;
                    var length = value.length;
                    var queue = EMPTY;
                    var subqueue = EMPTY;
                    var character;

                    if (value.charAt(index) === C_LT && value.charAt(++index) === C_EXCLAMATION_MARK) {
                        queue = C_LT + C_EXCLAMATION_MARK;
                        index++;

                        /*
         * Eat as many alphabetic characters as
         * possible.
         */

                        while (index < length) {
                            character = value.charAt(index);

                            if (!isAlphabetic(character)) {
                                break;
                            }

                            subqueue += character;
                            index++;
                        }

                        character = value.charAt(index);

                        if (!subqueue || !isWhiteSpace(character)) {
                            return;
                        }

                        queue += subqueue + character;
                        index++;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character === C_GT) {
                                return queue;
                            }

                            queue += character;
                            index++;
                        }
                    }
                }

                /**
 * Try to match a closing tag.
 *
 * @param {string} value - Value to parse.
 * @param {boolean?} [isBlock] - Whether the tag-name
 *   must be a known block-level node to match.
 * @return {string?} - When applicable, the closing tag at
 *   the start of `value`.
 */
                function eatHTMLClosingTag(value, isBlock) {
                    var index = 0;
                    var length = value.length;
                    var queue = EMPTY;
                    var subqueue = EMPTY;
                    var character;

                    if (value.charAt(index) === C_LT && value.charAt(++index) === C_SLASH) {
                        queue = C_LT + C_SLASH;
                        subqueue = character = value.charAt(++index);

                        if (!isAlphabetic(character)) {
                            return;
                        }

                        index++;

                        /*
         * Eat as many alphabetic characters as
         * possible.
         */

                        while (index < length) {
                            character = value.charAt(index);

                            if (!isAlphabetic(character) && !isNumeric(character)) {
                                break;
                            }

                            subqueue += character;
                            index++;
                        }

                        if (isBlock && blockElements.indexOf(subqueue.toLowerCase()) === -1) {
                            return;
                        }

                        queue += subqueue;

                        /*
         * Eat white-space.
         */

                        while (index < length) {
                            character = value.charAt(index);

                            if (!isWhiteSpace(character)) {
                                break;
                            }

                            queue += character;
                            index++;
                        }

                        if (value.charAt(index) === C_GT) {
                            return queue + C_GT;
                        }
                    }
                }

                /**
 * Try to match an opening tag.
 *
 * @param {string} value - Value to parse.
 * @param {boolean?} [isBlock] - Whether the tag-name
 *   must be a known block-level node to match.
 * @return {string?} - When applicable, the opening tag at
 *   the start of `value`.
 */
                function eatHTMLOpeningTag(value, isBlock) {
                    var index = 0;
                    var length = value.length;
                    var queue = EMPTY;
                    var subqueue = EMPTY;
                    var character = value.charAt(index);
                    var hasEquals;
                    var test;

                    if (character === C_LT) {
                        queue = character;
                        subqueue = character = value.charAt(++index);

                        if (!isAlphabetic(character)) {
                            return;
                        }

                        index++;

                        /*
         * Eat as many alphabetic characters as
         * possible.
         */

                        while (index < length) {
                            character = value.charAt(index);

                            if (!isAlphabetic(character) && !isNumeric(character)) {
                                break;
                            }

                            subqueue += character;
                            index++;
                        }

                        if (isBlock && blockElements.indexOf(subqueue.toLowerCase()) === -1) {
                            return;
                        }

                        queue += subqueue;
                        subqueue = EMPTY;

                        /*
         * Find attributes.
         */

                        while (index < length) {
                            /*
             * Eat white-space.
             */

                            while (index < length) {
                                character = value.charAt(index);

                                if (!isWhiteSpace(character)) {
                                    break;
                                }

                                subqueue += character;
                                index++;
                            }

                            if (!subqueue) {
                                break;
                            }

                            /*
             * Eat an attribute name.
             */

                            queue += subqueue;
                            subqueue = EMPTY;
                            character = value.charAt(index);

                            if (isAlphabetic(character) || character === C_UNDERSCORE || character === C_COLON) {
                                subqueue = character;
                                index++;

                                while (index < length) {
                                    character = value.charAt(index);

                                    if (
                                        !isAlphabetic(character) &&
                                        !isNumeric(character) &&
                                        character !== C_UNDERSCORE &&
                                        character !== C_COLON &&
                                        character !== C_DOT &&
                                        character !== C_DASH
                                    ) {
                                        break;
                                    }

                                    subqueue += character;
                                    index++;
                                }
                            }

                            if (!subqueue) {
                                break;
                            }

                            queue += subqueue;
                            subqueue = EMPTY;
                            hasEquals = false;

                            /*
             * Eat zero or more white-space and one
             * equals sign.
             */

                            while (index < length) {
                                character = value.charAt(index);

                                if (!isWhiteSpace(character)) {
                                    if (!hasEquals && character === C_EQUALS) {
                                        hasEquals = true;
                                    } else {
                                        break;
                                    }
                                }

                                subqueue += character;
                                index++;
                            }

                            queue += subqueue;
                            subqueue = EMPTY;

                            if (!hasEquals) {
                                queue += subqueue;
                            } else {
                                character = value.charAt(index);
                                queue += subqueue;

                                if (character === C_DOUBLE_QUOTE) {
                                    test = isDoubleQuotedAttributeCharacter;
                                    subqueue = character;
                                    index++;
                                } else if (character === C_SINGLE_QUOTE) {
                                    test = isSingleQuotedAttributeCharacter;
                                    subqueue = character;
                                    index++;
                                } else {
                                    test = isUnquotedAttributeCharacter;
                                    subqueue = EMPTY;
                                }

                                while (index < length) {
                                    character = value.charAt(index);

                                    if (!test(character)) {
                                        break;
                                    }

                                    subqueue += character;
                                    index++;
                                }

                                character = value.charAt(index);
                                index++;

                                if (!test.delimiter) {
                                    if (!subqueue.length) {
                                        return;
                                    }

                                    index--;
                                } else if (character === test.delimiter) {
                                    subqueue += character;
                                } else {
                                    return;
                                }

                                queue += subqueue;
                                subqueue = EMPTY;
                            }
                        }

                        /*
         * More white-space is already eaten by the
         * attributes subroutine.
         */

                        character = value.charAt(index);

                        /*
         * Eat an optional backslash (for self-closing
         * tags).
         */

                        if (character === C_SLASH) {
                            queue += character;
                            character = value.charAt(++index);
                        }

                        return character === C_GT ? queue + character : null;
                    }
                }

                /**
 * Tokenise HTML.
 *
 * @example
 *   tokenizeBlockHTML(eat, '<span>foo</span>');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `html` node.
 */
                function tokenizeBlockHTML(eat, value, silent) {
                    var self = this;
                    var index = 0;
                    var length = value.length;
                    var subvalue = EMPTY;
                    var offset;
                    var lineCount;
                    var character;
                    var queue;

                    /*
     * Eat initial spacing.
     */

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_TAB && character !== C_SPACE) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    offset = index;
                    value = value.slice(offset);

                    /*
     * Try to eat an HTML thing.
     */

                    queue =
                        eatHTMLComment(value, self.options) ||
                        eatHTMLCDATA(value) ||
                        eatHTMLProcessingInstruction(value) ||
                        eatHTMLDeclaration(value) ||
                        eatHTMLClosingTag(value, true) ||
                        eatHTMLOpeningTag(value, true);

                    if (!queue) {
                        return;
                    }

                    if (silent) {
                        return true;
                    }

                    subvalue += queue;
                    index = subvalue.length - offset;
                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_NEWLINE) {
                            queue += character;
                            lineCount++;
                        } else if (queue.length < MIN_CLOSING_HTML_NEWLINE_COUNT) {
                            subvalue += queue + character;
                            queue = EMPTY;
                        } else {
                            break;
                        }

                        index++;
                    }

                    return eat(subvalue)(self.renderRaw(T_HTML, subvalue));
                }

                /**
 * Tokenise a definition.
 *
 * @example
 *   var value = '[foo]: http://example.com "Example Domain"';
 *   tokenizeDefinition(eat, value);
 *
 * @property {boolean} notInList
 * @property {boolean} notInBlock
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `definition` node.
 */
                function tokenizeDefinition(eat, value, silent) {
                    var self = this;
                    var commonmark = self.options.commonmark;
                    var index = 0;
                    var length = value.length;
                    var subvalue = EMPTY;
                    var beforeURL;
                    var beforeTitle;
                    var queue;
                    var character;
                    var test;
                    var identifier;
                    var url;
                    var title;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_SPACE && character !== C_TAB) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    character = value.charAt(index);

                    if (character !== C_BRACKET_OPEN) {
                        return;
                    }

                    index++;
                    subvalue += character;
                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_BRACKET_CLOSE) {
                            break;
                        } else if (character === C_BACKSLASH) {
                            queue += character;
                            index++;
                            character = value.charAt(index);
                        }

                        queue += character;
                        index++;
                    }

                    if (!queue || value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(index + 1) !== C_COLON) {
                        return;
                    }

                    identifier = queue;
                    subvalue += queue + C_BRACKET_CLOSE + C_COLON;
                    index = subvalue.length;
                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_TAB && character !== C_SPACE && character !== C_NEWLINE) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    character = value.charAt(index);
                    queue = EMPTY;
                    beforeURL = subvalue;

                    if (character === C_LT) {
                        index++;

                        while (index < length) {
                            character = value.charAt(index);

                            if (!isEnclosedURLCharacter(character)) {
                                break;
                            }

                            queue += character;
                            index++;
                        }

                        character = value.charAt(index);

                        if (character !== isEnclosedURLCharacter.delimiter) {
                            if (commonmark) {
                                return;
                            }

                            index -= queue.length + 1;
                            queue = EMPTY;
                        } else {
                            subvalue += C_LT + queue + character;
                            index++;
                        }
                    }

                    if (!queue) {
                        while (index < length) {
                            character = value.charAt(index);

                            if (!isUnclosedURLCharacter(character)) {
                                break;
                            }

                            queue += character;
                            index++;
                        }

                        subvalue += queue;
                    }

                    if (!queue) {
                        return;
                    }

                    url = queue;
                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_TAB && character !== C_SPACE && character !== C_NEWLINE) {
                            break;
                        }

                        queue += character;
                        index++;
                    }

                    character = value.charAt(index);
                    test = null;

                    if (character === C_DOUBLE_QUOTE) {
                        test = C_DOUBLE_QUOTE;
                    } else if (character === C_SINGLE_QUOTE) {
                        test = C_SINGLE_QUOTE;
                    } else if (character === C_PAREN_OPEN) {
                        test = C_PAREN_CLOSE;
                    }

                    if (!test) {
                        queue = EMPTY;
                        index = subvalue.length;
                    } else if (!queue) {
                        return;
                    } else {
                        subvalue += queue + character;
                        index = subvalue.length;
                        queue = EMPTY;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character === test) {
                                break;
                            }

                            if (character === C_NEWLINE) {
                                index++;
                                character = value.charAt(index);

                                if (character === C_NEWLINE || character === test) {
                                    return;
                                }

                                queue += C_NEWLINE;
                            }

                            queue += character;
                            index++;
                        }

                        character = value.charAt(index);

                        if (character !== test) {
                            return;
                        }

                        beforeTitle = subvalue;
                        subvalue += queue + character;
                        index++;
                        title = queue;
                        queue = EMPTY;
                    }

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_TAB && character !== C_SPACE) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    character = value.charAt(index);

                    if (!character || character === C_NEWLINE) {
                        if (silent) {
                            return true;
                        }

                        beforeURL = eat(beforeURL).test().end;
                        url = self.decode.raw(self.descape(url), beforeURL);

                        if (title) {
                            beforeTitle = eat(beforeTitle).test().end;
                            title = self.decode.raw(self.descape(title), beforeTitle);
                        }

                        return eat(subvalue)({
                            type: T_DEFINITION,
                            identifier: normalize(identifier),
                            title: title || null,
                            url: url
                        });
                    }
                }

                tokenizeDefinition.notInList = true;
                tokenizeDefinition.notInBlock = true;

                /**
 * Tokenise YAML front matter.
 *
 * @example
 *   tokenizeYAMLFrontMatter(eat, '---\nfoo: bar\n---');
 *
 * @property {boolean} onlyAtStart
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `yaml` node.
 */
                function tokenizeYAMLFrontMatter(eat, value, silent) {
                    var self = this;
                    var subvalue;
                    var content;
                    var index;
                    var length;
                    var character;
                    var queue;

                    if (
                        !self.options.yaml ||
                        value.charAt(0) !== C_DASH ||
                        value.charAt(1) !== C_DASH ||
                        value.charAt(2) !== C_DASH ||
                        value.charAt(3) !== C_NEWLINE
                    ) {
                        return;
                    }

                    subvalue = YAML_FENCE + C_NEWLINE;
                    content = queue = EMPTY;
                    index = 3;
                    length = value.length;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (
                            character === C_DASH &&
                            (queue || !content) &&
                            value.charAt(index + 1) === C_DASH &&
                            value.charAt(index + 2) === C_DASH
                        ) {
                            /* istanbul ignore if - never used (yet) */
                            if (silent) {
                                return true;
                            }

                            subvalue += queue + YAML_FENCE;

                            return eat(subvalue)(self.renderRaw(T_YAML, content));
                        }

                        if (character === C_NEWLINE) {
                            queue += character;
                        } else {
                            subvalue += queue + character;
                            content += queue + character;
                            queue = EMPTY;
                        }
                    }
                }

                tokenizeYAMLFrontMatter.onlyAtStart = true;

                /**
 * Tokenise a footnote definition.
 *
 * @example
 *   tokenizeFootnoteDefinition(eat, '[^foo]: Bar.');
 *
 * @property {boolean} notInList
 * @property {boolean} notInBlock
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `footnoteDefinition` node.
 */
                function tokenizeFootnoteDefinition(eat, value, silent) {
                    var self = this;
                    var index;
                    var length;
                    var subvalue;
                    var now;
                    var indent;
                    var content;
                    var queue;
                    var subqueue;
                    var character;
                    var identifier;

                    if (!self.options.footnotes) {
                        return;
                    }

                    index = 0;
                    length = value.length;
                    subvalue = EMPTY;
                    now = eat.now();
                    indent = self.indent(now.line);

                    while (index < length) {
                        character = value.charAt(index);

                        if (!isWhiteSpace(character)) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    if (value.charAt(index) !== C_BRACKET_OPEN || value.charAt(index + 1) !== C_CARET) {
                        return;
                    }

                    subvalue += C_BRACKET_OPEN + C_CARET;
                    index = subvalue.length;
                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_BRACKET_CLOSE) {
                            break;
                        } else if (character === C_BACKSLASH) {
                            queue += character;
                            index++;
                            character = value.charAt(index);
                        }

                        queue += character;
                        index++;
                    }

                    if (!queue || value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(index + 1) !== C_COLON) {
                        return;
                    }

                    if (silent) {
                        return true;
                    }

                    identifier = normalize(queue);
                    subvalue += queue + C_BRACKET_CLOSE + C_COLON;
                    index = subvalue.length;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character !== C_TAB && character !== C_SPACE) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    now.column += subvalue.length;
                    now.offset += subvalue.length;
                    queue = content = subqueue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_NEWLINE) {
                            subqueue = character;
                            index++;

                            while (index < length) {
                                character = value.charAt(index);

                                if (character !== C_NEWLINE) {
                                    break;
                                }

                                subqueue += character;
                                index++;
                            }

                            queue += subqueue;
                            subqueue = EMPTY;

                            while (index < length) {
                                character = value.charAt(index);

                                if (character !== C_SPACE) {
                                    break;
                                }

                                subqueue += character;
                                index++;
                            }

                            if (!subqueue.length) {
                                break;
                            }

                            queue += subqueue;
                        }

                        if (queue) {
                            content += queue;
                            queue = EMPTY;
                        }

                        content += character;
                        index++;
                    }

                    subvalue += content;

                    content = content.replace(EXPRESSION_INITIAL_TAB, function(line) {
                        indent(line.length);

                        return EMPTY;
                    });

                    return eat(subvalue)(self.renderFootnoteDefinition(identifier, content, now));
                }

                tokenizeFootnoteDefinition.notInList = true;
                tokenizeFootnoteDefinition.notInBlock = true;

                /**
 * Tokenise a table.
 *
 * @example
 *   tokenizeTable(eat, ' | foo |\n | --- |\n | bar |');
 *
 * @property {boolean} notInList
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `table` node.
 */
                function tokenizeTable(eat, value, silent) {
                    var self = this;
                    var index;
                    var alignments;
                    var alignment;
                    var subvalue;
                    var row;
                    var length;
                    var lines;
                    var queue;
                    var character;
                    var hasDash;
                    var align;
                    var cell;
                    var preamble;
                    var count;
                    var opening;
                    var now;
                    var position;
                    var lineCount;
                    var line;
                    var rows;
                    var table;
                    var lineIndex;
                    var pipeIndex;
                    var first;

                    /*
     * Exit when not in gfm-mode.
     */

                    if (!self.options.gfm) {
                        return;
                    }

                    /*
     * Get the rows.
     * Detecting tables soon is hard, so there are some
     * checks for performance here, such as the minimum
     * number of rows, and allowed characters in the
     * alignment row.
     */

                    index = lineCount = 0;
                    length = value.length + 1;
                    lines = [];

                    while (index < length) {
                        lineIndex = value.indexOf(C_NEWLINE, index);
                        pipeIndex = value.indexOf(C_PIPE, index + 1);

                        if (lineIndex === -1) {
                            lineIndex = value.length;
                        }

                        if (pipeIndex === -1 || pipeIndex > lineIndex) {
                            if (lineCount < MIN_TABLE_ROWS) {
                                return;
                            }

                            break;
                        }

                        lines.push(value.slice(index, lineIndex));
                        lineCount++;
                        index = lineIndex + 1;
                    }

                    /*
     * Parse the alignment row.
     */

                    subvalue = lines.join(C_NEWLINE);
                    alignments = lines.splice(1, 1)[0] || [];
                    index = 0;
                    length = alignments.length;
                    lineCount--;
                    alignment = false;
                    align = [];

                    while (index < length) {
                        character = alignments.charAt(index);

                        if (character === C_PIPE) {
                            hasDash = null;

                            if (alignment === false) {
                                if (first === false) {
                                    return;
                                }
                            } else {
                                align.push(alignment);
                                alignment = false;
                            }

                            first = false;
                        } else if (character === C_DASH) {
                            hasDash = true;
                            alignment = alignment || TABLE_ALIGN_NONE;
                        } else if (character === C_COLON) {
                            if (alignment === TABLE_ALIGN_LEFT) {
                                alignment = TABLE_ALIGN_CENTER;
                            } else if (hasDash && alignment === TABLE_ALIGN_NONE) {
                                alignment = TABLE_ALIGN_RIGHT;
                            } else {
                                alignment = TABLE_ALIGN_LEFT;
                            }
                        } else if (!isWhiteSpace(character)) {
                            return;
                        }

                        index++;
                    }

                    if (alignment !== false) {
                        align.push(alignment);
                    }

                    /*
     * Exit when without enough columns.
     */

                    if (align.length < MIN_TABLE_COLUMNS) {
                        return;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    /*
     * Parse the rows.
     */

                    position = -1;
                    rows = [];

                    table = eat(subvalue).reset({
                        type: T_TABLE,
                        align: align,
                        children: rows
                    });

                    while (++position < lineCount) {
                        line = lines[position];
                        row = self.renderParent(position ? T_TABLE_ROW : T_TABLE_HEADER, []);

                        /*
         * Eat a newline character when this is not the
         * first row.
         */

                        if (position) {
                            eat(C_NEWLINE);
                        }

                        /*
         * Eat the row.
         */

                        eat(line).reset(row, table);

                        length = line.length + 1;
                        index = 0;
                        queue = EMPTY;
                        cell = EMPTY;
                        preamble = true;
                        count = opening = null;

                        while (index < length) {
                            character = line.charAt(index);

                            if (character === C_TAB || character === C_SPACE) {
                                if (cell) {
                                    queue += character;
                                } else {
                                    eat(character);
                                }

                                index++;
                                continue;
                            }

                            if (character === EMPTY || character === C_PIPE) {
                                if (preamble) {
                                    eat(character);
                                } else {
                                    if (character && opening) {
                                        queue += character;
                                        index++;
                                        continue;
                                    }

                                    if ((cell || character) && !preamble) {
                                        subvalue = cell;

                                        if (queue.length > 1) {
                                            if (character) {
                                                subvalue += queue.slice(0, queue.length - 1);
                                                queue = queue.charAt(queue.length - 1);
                                            } else {
                                                subvalue += queue;
                                                queue = EMPTY;
                                            }
                                        }

                                        now = eat.now();

                                        eat(subvalue)(self.renderInline(T_TABLE_CELL, cell, now), row);
                                    }

                                    eat(queue + character);

                                    queue = EMPTY;
                                    cell = EMPTY;
                                }
                            } else {
                                if (queue) {
                                    cell += queue;
                                    queue = EMPTY;
                                }

                                cell += character;

                                if (character === C_BACKSLASH && index !== length - 2) {
                                    cell += line.charAt(index + 1);
                                    index++;
                                }

                                if (character === C_TICK) {
                                    count = 1;

                                    while (line.charAt(index + 1) === character) {
                                        cell += character;
                                        index++;
                                        count++;
                                    }

                                    if (!opening) {
                                        opening = count;
                                    } else if (count >= opening) {
                                        opening = 0;
                                    }
                                }
                            }

                            preamble = false;
                            index++;
                        }

                        /*
         * Eat the alignment row.
         */

                        if (!position) {
                            eat(C_NEWLINE + alignments);
                        }
                    }

                    return table;
                }

                tokenizeTable.notInList = true;

                /**
 * Tokenise a paragraph node.
 *
 * @example
 *   tokenizeParagraph(eat, 'Foo.');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `paragraph` node.
 */
                function tokenizeParagraph(eat, value, silent) {
                    var self = this;
                    var settings = self.options;
                    var commonmark = settings.commonmark;
                    var gfm = settings.gfm;
                    var tokenizers = self.blockTokenizers;
                    var index = value.indexOf(C_NEWLINE);
                    var length = value.length;
                    var position;
                    var subvalue;
                    var character;
                    var size;
                    var now;

                    while (index < length) {
                        /*
         * Eat everything if there’s no following newline.
         */

                        if (index === -1) {
                            index = length;
                            break;
                        }

                        /*
         * Stop if the next character is NEWLINE.
         */

                        if (value.charAt(index + 1) === C_NEWLINE) {
                            break;
                        }

                        /*
         * In commonmark-mode, following indented lines
         * are part of the paragraph.
         */

                        if (commonmark) {
                            size = 0;
                            position = index + 1;

                            while (position < length) {
                                character = value.charAt(position);

                                if (character === C_TAB) {
                                    size = TAB_SIZE;
                                    break;
                                } else if (character === C_SPACE) {
                                    size++;
                                } else {
                                    break;
                                }

                                position++;
                            }

                            if (size >= TAB_SIZE) {
                                index = value.indexOf(C_NEWLINE, index + 1);
                                continue;
                            }
                        }

                        /*
         * Check if the following code contains a possible
         * block.
         */

                        subvalue = value.slice(index + 1);

                        if (
                            tokenizers.thematicBreak.call(self, eat, subvalue, true) ||
                            tokenizers.atxHeading.call(self, eat, subvalue, true) ||
                            tokenizers.fencedCode.call(self, eat, subvalue, true) ||
                            tokenizers.blockquote.call(self, eat, subvalue, true) ||
                            tokenizers.html.call(self, eat, subvalue, true)
                        ) {
                            break;
                        }

                        if (gfm && tokenizers.list.call(self, eat, subvalue, true)) {
                            break;
                        }

                        if (
                            !commonmark &&
                            (tokenizers.setextHeading.call(self, eat, subvalue, true) ||
                                tokenizers.definition.call(self, eat, subvalue, true) ||
                                tokenizers.footnote.call(self, eat, subvalue, true))
                        ) {
                            break;
                        }

                        index = value.indexOf(C_NEWLINE, index + 1);
                    }

                    subvalue = value.slice(0, index);

                    if (trim(subvalue) === EMPTY) {
                        eat(subvalue);

                        return null;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    now = eat.now();
                    subvalue = trimTrailingLines(subvalue);

                    return eat(subvalue)(self.renderInline(T_PARAGRAPH, subvalue, now));
                }

                /**
 * Tokenise a text node.
 *
 * @example
 *   tokenizeText(eat, 'foo');
 *
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `text` node.
 */
                function tokenizeText(eat, value, silent) {
                    var self = this;
                    var methods;
                    var tokenizers;
                    var index;
                    var length;
                    var subvalue;
                    var position;
                    var tokenizer;
                    var name;
                    var min;
                    var now;

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    methods = self.inlineMethods;
                    length = methods.length;
                    tokenizers = self.inlineTokenizers;
                    index = -1;
                    min = value.length;

                    while (++index < length) {
                        name = methods[index];

                        if (name === "text" || !tokenizers[name]) {
                            continue;
                        }

                        tokenizer = tokenizers[name].locator;

                        if (!tokenizer) {
                            eat.file.fail(ERR_MISSING_LOCATOR + C_TICK + name + C_TICK);
                            continue;
                        }

                        position = tokenizer.call(self, value, 1);

                        if (position !== -1 && position < min) {
                            min = position;
                        }
                    }

                    subvalue = value.slice(0, min);
                    now = eat.now();

                    self.decode(subvalue, now, function(content, position, source) {
                        eat(source || content)(self.renderRaw(T_TEXT, content));
                    });
                }

                /**
 * Create a code-block node.
 *
 * @example
 *   renderCodeBlock('foo()', 'js', now());
 *
 * @param {string?} [value] - Code.
 * @param {string?} [language] - Optional language flag.
 * @param {Function} eat - Eater.
 * @return {Object} - `code` node.
 */
                function renderCodeBlock(value, language) {
                    return {
                        type: T_CODE,
                        lang: language || null,
                        value: trimTrailingLines(value || EMPTY)
                    };
                }

                /**
 * Create a list-item using overly simple mechanics.
 *
 * @example
 *   renderPedanticListItem('- _foo_', now());
 *
 * @param {string} value - List-item.
 * @param {Object} position - List-item location.
 * @return {string} - Cleaned `value`.
 */
                function renderPedanticListItem(value, position) {
                    var self = this;
                    var indent = self.indent(position.line);

                    /**
     * A simple replacer which removed all matches,
     * and adds their length to `offset`.
     *
     * @param {string} $0 - Indentation to subtract.
     * @return {string} - An empty string.
     */
                    function replacer($0) {
                        indent($0.length);

                        return EMPTY;
                    }

                    /*
     * Remove the list-item’s bullet.
     */

                    value = value.replace(EXPRESSION_PEDANTIC_BULLET, replacer);

                    /*
     * The initial line was also matched by the below, so
     * we reset the `line`.
     */

                    indent = self.indent(position.line);

                    return value.replace(EXPRESSION_INITIAL_INDENT, replacer);
                }

                /**
 * Create a list-item using sane mechanics.
 *
 * @example
 *   renderNormalListItem('- _foo_', now());
 *
 * @param {string} value - List-item.
 * @param {Object} position - List-item location.
 * @return {string} - Cleaned `value`.
 */
                function renderNormalListItem(value, position) {
                    var self = this;
                    var indent = self.indent(position.line);
                    var max;
                    var bullet;
                    var rest;
                    var lines;
                    var trimmedLines;
                    var index;
                    var length;

                    /*
     * Remove the list-item’s bullet.
     */

                    value = value.replace(EXPRESSION_BULLET, function($0, $1, $2, $3, $4) {
                        bullet = $1 + $2 + $3;
                        rest = $4;

                        /*
         * Make sure that the first nine numbered list items
         * can indent with an extra space.  That is, when
         * the bullet did not receive an extra final space.
         */

                        if (Number($2) < 10 && bullet.length % 2 === 1) {
                            $2 = C_SPACE + $2;
                        }

                        max = $1 + repeat(C_SPACE, $2.length) + $3;

                        return max + rest;
                    });

                    lines = value.split(C_NEWLINE);

                    trimmedLines = removeIndentation(value, getIndent(max).indent).split(C_NEWLINE);

                    /*
     * We replaced the initial bullet with something
     * else above, which was used to trick
     * `removeIndentation` into removing some more
     * characters when possible. However, that could
     * result in the initial line to be stripped more
     * than it should be.
     */

                    trimmedLines[0] = rest;

                    indent(bullet.length);

                    index = 0;
                    length = lines.length;

                    while (++index < length) {
                        indent(lines[index].length - trimmedLines[index].length);
                    }

                    return trimmedLines.join(C_NEWLINE);
                }

                /**
 * Create a list-item node.
 *
 * @example
 *   renderListItem('- _foo_', now());
 *
 * @param {Object} value - List-item.
 * @param {Object} position - List-item location.
 * @return {Object} - `listItem` node.
 */
                function renderListItem(value, position) {
                    var self = this;
                    var checked = null;
                    var node;
                    var task;
                    var indent;

                    value = LIST_ITEM_MAP[self.options.pedantic].apply(self, arguments);

                    if (self.options.gfm) {
                        task = value.match(EXPRESSION_TASK_ITEM);

                        if (task) {
                            indent = task[0].length;
                            checked = task[1].toLowerCase() === C_X_LOWER;

                            self.indent(position.line)(indent);
                            value = value.slice(indent);
                        }
                    }

                    node = {
                        type: T_LIST_ITEM,
                        loose: EXPRESSION_LOOSE_LIST_ITEM.test(value) || value.charAt(value.length - 1) === C_NEWLINE,
                        checked: checked
                    };

                    node.children = self.tokenizeBlock(value, position);

                    return node;
                }

                /**
 * Create a footnote-definition node.
 *
 * @example
 *   renderFootnoteDefinition('1', '_foo_', now());
 *
 * @param {string} identifier - Unique reference.
 * @param {string} value - Contents
 * @param {Object} position - Definition location.
 * @return {Object} - `footnoteDefinition` node.
 */
                function renderFootnoteDefinition(identifier, value, position) {
                    var self = this;
                    var exitBlockquote = self.enterBlock();
                    var node;

                    node = {
                        type: T_FOOTNOTE_DEFINITION,
                        identifier: identifier,
                        children: self.tokenizeBlock(value, position)
                    };

                    exitBlockquote();

                    return node;
                }

                /**
 * Create a heading node.
 *
 * @example
 *   renderHeading('_foo_', 1, now());
 *
 * @param {string} value - Content.
 * @param {number} depth - Heading depth.
 * @param {Object} position - Heading content location.
 * @return {Object} - `heading` node
 */
                function renderHeading(value, depth, position) {
                    return {
                        type: T_HEADING,
                        depth: depth,
                        children: this.tokenizeInline(value, position)
                    };
                }

                /**
 * Create a blockquote node.
 *
 * @example
 *   renderBlockquote('_foo_', eat);
 *
 * @param {string} value - Content.
 * @param {Object} now - Position.
 * @return {Object} - `blockquote` node.
 */
                function renderBlockquote(value, now) {
                    var self = this;
                    var exitBlockquote = self.enterBlock();
                    var node = {
                        type: T_BLOCKQUOTE,
                        children: self.tokenizeBlock(value, now)
                    };

                    exitBlockquote();

                    return node;
                }

                /**
 * Create a void node.
 *
 * @example
 *   renderVoid('thematicBreak');
 *
 * @param {string} type - Node type.
 * @return {Object} - Node of type `type`.
 */
                function renderVoid(type) {
                    return {
                        type: type
                    };
                }

                /**
 * Create a parent.
 *
 * @example
 *   renderParent('paragraph', '_foo_');
 *
 * @param {string} type - Node type.
 * @param {Array.<Object>} children - Child nodes.
 * @return {Object} - Node of type `type`.
 */
                function renderParent(type, children) {
                    return {
                        type: type,
                        children: children
                    };
                }

                /**
 * Create a raw node.
 *
 * @example
 *   renderRaw('inlineCode', 'foo()');
 *
 * @param {string} type - Node type.
 * @param {string} value - Contents.
 * @return {Object} - Node of type `type`.
 */
                function renderRaw(type, value) {
                    return {
                        type: type,
                        value: value
                    };
                }

                /**
 * Create a link node.
 *
 * @example
 *   renderLink(true, 'example.com', 'example', 'Example Domain', now(), eat);
 *   renderLink(false, 'fav.ico', 'example', 'Example Domain', now(), eat);
 *
 * @param {boolean} isLink - Whether linking to a document
 *   or an image.
 * @param {string} url - URI reference.
 * @param {string} content - Content.
 * @param {string?} title - Title.
 * @param {Object} position - Location of link.
 * @return {Object} - `link` or `image` node.
 */
                function renderLink(isLink, url, content, title, position) {
                    var self = this;
                    var exitLink = self.enterLink();
                    var node;

                    node = {
                        type: isLink ? T_LINK : T_IMAGE,
                        title: title || null
                    };

                    if (isLink) {
                        node.url = url;
                        node.children = self.tokenizeInline(content, position);
                    } else {
                        node.url = url;
                        node.alt = content ? self.decode.raw(self.descape(content), position) : null;
                    }

                    exitLink();

                    return node;
                }

                /**
 * Create a footnote node.
 *
 * @example
 *   renderFootnote('_foo_', now());
 *
 * @param {string} value - Contents.
 * @param {Object} position - Location of footnote.
 * @return {Object} - `footnote` node.
 */
                function renderFootnote(value, position) {
                    return this.renderInline(T_FOOTNOTE, value, position);
                }

                /**
 * Add a node with inline content.
 *
 * @example
 *   renderInline('strong', '_foo_', now());
 *
 * @param {string} type - Node type.
 * @param {string} value - Contents.
 * @param {Object} position - Location of node.
 * @return {Object} - Node of type `type`.
 */
                function renderInline(type, value, position) {
                    return this.renderParent(type, this.tokenizeInline(value, position));
                }

                /**
 * Add a node with block content.
 *
 * @example
 *   renderBlock('blockquote', 'Foo.', now());
 *
 * @param {string} type - Node type.
 * @param {string} value - Contents.
 * @param {Object} position - Location of node.
 * @return {Object} - Node of type `type`.
 */
                function renderBlock(type, value, position) {
                    return this.renderParent(type, this.tokenizeBlock(value, position));
                }

                /**
 * Find a possible escape sequence.
 *
 * @example
 *   locateEscape('foo \- bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible escape sequence.
 */
                function locateEscape(value, fromIndex) {
                    return value.indexOf(C_BACKSLASH, fromIndex);
                }

                /**
 * Tokenise an escape sequence.
 *
 * @example
 *   tokenizeEscape(eat, '\\a');
 *
 * @property {Function} locator - Escape locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `text` or `break` node.
 */
                function tokenizeEscape(eat, value, silent) {
                    var self = this;
                    var character;

                    if (value.charAt(0) === C_BACKSLASH) {
                        character = value.charAt(1);

                        if (self.escape.indexOf(character) !== -1) {
                            /* istanbul ignore if - never used (yet) */
                            if (silent) {
                                return true;
                            }

                            return eat(C_BACKSLASH + character)(
                                character === C_NEWLINE ? self.renderVoid(T_BREAK) : self.renderRaw(T_TEXT, character)
                            );
                        }
                    }
                }

                tokenizeEscape.locator = locateEscape;

                /**
 * Find a possible auto-link.
 *
 * @example
 *   locateAutoLink('foo <bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible auto-link.
 */
                function locateAutoLink(value, fromIndex) {
                    return value.indexOf(C_LT, fromIndex);
                }

                /**
 * Tokenise a URL in carets.
 *
 * @example
 *   tokenizeAutoLink(eat, '<http://foo.bar>');
 *
 * @property {boolean} notInLink
 * @property {Function} locator - Auto-link locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `link` node.
 */
                function tokenizeAutoLink(eat, value, silent) {
                    var self;
                    var subvalue;
                    var length;
                    var index;
                    var queue;
                    var character;
                    var hasAtCharacter;
                    var link;
                    var now;
                    var content;
                    var tokenize;
                    var node;

                    if (value.charAt(0) !== C_LT) {
                        return;
                    }

                    self = this;
                    subvalue = EMPTY;
                    length = value.length;
                    index = 0;
                    queue = EMPTY;
                    hasAtCharacter = false;
                    link = EMPTY;

                    index++;
                    subvalue = C_LT;

                    while (index < length) {
                        character = value.charAt(index);

                        if (
                            character === C_SPACE ||
                            character === C_GT ||
                            character === C_AT_SIGN ||
                            (character === C_COLON && value.charAt(index + 1) === C_SLASH)
                        ) {
                            break;
                        }

                        queue += character;
                        index++;
                    }

                    if (!queue) {
                        return;
                    }

                    link += queue;
                    queue = EMPTY;

                    character = value.charAt(index);
                    link += character;
                    index++;

                    if (character === C_AT_SIGN) {
                        hasAtCharacter = true;
                    } else {
                        if (character !== C_COLON || value.charAt(index + 1) !== C_SLASH) {
                            return;
                        }

                        link += C_SLASH;
                        index++;
                    }

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_SPACE || character === C_GT) {
                            break;
                        }

                        queue += character;
                        index++;
                    }

                    character = value.charAt(index);

                    if (!queue || character !== C_GT) {
                        return;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    link += queue;
                    content = link;
                    subvalue += link + character;
                    now = eat.now();
                    now.column++;
                    now.offset++;

                    if (hasAtCharacter) {
                        if (link.substr(0, MAILTO_PROTOCOL.length).toLowerCase() !== MAILTO_PROTOCOL) {
                            link = MAILTO_PROTOCOL + link;
                        } else {
                            content = content.substr(MAILTO_PROTOCOL.length);
                            now.column += MAILTO_PROTOCOL.length;
                            now.offset += MAILTO_PROTOCOL.length;
                        }
                    }

                    /*
     * Temporarily remove support for escapes in autolinks.
     */

                    tokenize = self.inlineTokenizers.escape;
                    self.inlineTokenizers.escape = null;

                    node = eat(subvalue)(self.renderLink(true, decode(link), content, null, now, eat));

                    self.inlineTokenizers.escape = tokenize;

                    return node;
                }

                tokenizeAutoLink.notInLink = true;
                tokenizeAutoLink.locator = locateAutoLink;

                /**
 * Find a possible URL.
 *
 * @example
 *   locateURL('foo http://bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible URL.
 */
                function locateURL(value, fromIndex) {
                    var index = -1;
                    var min = -1;
                    var position;

                    if (!this.options.gfm) {
                        return -1;
                    }

                    while (++index < PROTOCOLS_LENGTH) {
                        position = value.indexOf(PROTOCOLS[index], fromIndex);

                        if (position !== -1 && (position < min || min === -1)) {
                            min = position;
                        }
                    }

                    return min;
                }

                /**
 * Tokenise a URL in text.
 *
 * @example
 *   tokenizeURL(eat, 'http://foo.bar');
 *
 * @property {boolean} notInLink
 * @property {Function} locator - URL locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `link` node.
 */
                function tokenizeURL(eat, value, silent) {
                    var self = this;
                    var subvalue;
                    var content;
                    var character;
                    var index;
                    var position;
                    var protocol;
                    var match;
                    var length;
                    var queue;
                    var parenCount;
                    var nextCharacter;
                    var now;

                    if (!self.options.gfm) {
                        return;
                    }

                    subvalue = EMPTY;
                    index = -1;
                    length = PROTOCOLS_LENGTH;

                    while (++index < length) {
                        protocol = PROTOCOLS[index];
                        match = value.slice(0, protocol.length);

                        if (match.toLowerCase() === protocol) {
                            subvalue = match;
                            break;
                        }
                    }

                    if (!subvalue) {
                        return;
                    }

                    index = subvalue.length;
                    length = value.length;
                    queue = EMPTY;
                    parenCount = 0;

                    while (index < length) {
                        character = value.charAt(index);

                        if (isWhiteSpace(character) || character === C_LT) {
                            break;
                        }

                        if (
                            character === C_DOT ||
                            character === C_COMMA ||
                            character === C_COLON ||
                            character === C_SEMI_COLON ||
                            character === C_DOUBLE_QUOTE ||
                            character === C_SINGLE_QUOTE ||
                            character === C_PAREN_CLOSE ||
                            character === C_BRACKET_CLOSE
                        ) {
                            nextCharacter = value.charAt(index + 1);

                            if (!nextCharacter || isWhiteSpace(nextCharacter)) {
                                break;
                            }
                        }

                        if (character === C_PAREN_OPEN || character === C_BRACKET_OPEN) {
                            parenCount++;
                        }

                        if (character === C_PAREN_CLOSE || character === C_BRACKET_CLOSE) {
                            parenCount--;

                            if (parenCount < 0) {
                                break;
                            }
                        }

                        queue += character;
                        index++;
                    }

                    if (!queue) {
                        return;
                    }

                    subvalue += queue;
                    content = subvalue;

                    if (protocol === MAILTO_PROTOCOL) {
                        position = queue.indexOf(C_AT_SIGN);

                        if (position === -1 || position === length - 1) {
                            return;
                        }

                        content = content.substr(MAILTO_PROTOCOL.length);
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    now = eat.now();

                    return eat(subvalue)(self.renderLink(true, decode(subvalue), content, null, now, eat));
                }

                tokenizeURL.notInLink = true;
                tokenizeURL.locator = locateURL;

                /**
 * Find a possible tag.
 *
 * @example
 *   locateTag('foo <bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible tag.
 */
                function locateTag(value, fromIndex) {
                    return value.indexOf(C_LT, fromIndex);
                }

                /**
 * Tokenise an HTML tag.
 *
 * @example
 *   tokenizeInlineHTML(eat, '<span foo="bar">');
 *
 * @property {Function} locator - Tag locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `html` node.
 */
                function tokenizeInlineHTML(eat, value, silent) {
                    var self = this;
                    var subvalue =
                        eatHTMLComment(value, self.options) ||
                        eatHTMLCDATA(value) ||
                        eatHTMLProcessingInstruction(value) ||
                        eatHTMLDeclaration(value) ||
                        eatHTMLClosingTag(value) ||
                        eatHTMLOpeningTag(value);

                    if (!subvalue) {
                        return;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    if (!self.inLink && EXPRESSION_HTML_LINK_OPEN.test(subvalue)) {
                        self.inLink = true;
                    } else if (self.inLink && EXPRESSION_HTML_LINK_CLOSE.test(subvalue)) {
                        self.inLink = false;
                    }

                    return eat(subvalue)(self.renderRaw(T_HTML, subvalue));
                }

                tokenizeInlineHTML.locator = locateTag;

                /**
 * Find a possible link.
 *
 * @example
 *   locateLink('foo ![bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible link.
 */
                function locateLink(value, fromIndex) {
                    var link = value.indexOf(C_BRACKET_OPEN, fromIndex);
                    var image = value.indexOf(C_EXCLAMATION_MARK + C_BRACKET_OPEN, fromIndex);

                    if (image === -1) {
                        return link;
                    }

                    /*
     * Link can never be `-1` if an image is found, so we don’t need to
     * check for that :)
     */

                    return link < image ? link : image;
                }

                /**
 * Tokenise a link.
 *
 * @example
 *   tokenizeLink(eat, '![foo](fav.ico "Favicon"));
 *
 * @property {Function} locator - Link locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `link` or `image` node.
 */
                function tokenizeLink(eat, value, silent) {
                    var self = this;
                    var subvalue = EMPTY;
                    var index = 0;
                    var character = value.charAt(0);
                    var beforeURL;
                    var beforeTitle;
                    var whiteSpaceQueue;
                    var commonmark;
                    var openCount;
                    var hasMarker;
                    var markers;
                    var isImage;
                    var content;
                    var marker;
                    var length;
                    var title;
                    var depth;
                    var queue;
                    var url;
                    var now;

                    /*
     * Detect whether this is an image.
     */

                    if (character === C_EXCLAMATION_MARK) {
                        isImage = true;
                        subvalue = character;
                        character = value.charAt(++index);
                    }

                    /*
     * Eat the opening.
     */

                    if (character !== C_BRACKET_OPEN) {
                        return;
                    }

                    /*
     * Exit when this is a link and we’re already inside
     * a link.
     */

                    if (!isImage && self.inLink) {
                        return;
                    }

                    subvalue += character;
                    queue = EMPTY;
                    index++;

                    /*
     * Eat the content.
     */

                    commonmark = self.options.commonmark;
                    length = value.length;
                    now = eat.now();
                    depth = 0;

                    now.column += index;
                    now.offset += index;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_BRACKET_OPEN) {
                            depth++;
                        } else if (character === C_BRACKET_CLOSE) {
                            /*
             * Allow a single closing bracket when not in
             * commonmark-mode.
             */

                            if (!commonmark && !depth) {
                                if (value.charAt(index + 1) === C_PAREN_OPEN) {
                                    break;
                                }

                                depth++;
                            }

                            if (depth === 0) {
                                break;
                            }

                            depth--;
                        }

                        queue += character;
                        index++;
                    }

                    /*
     * Eat the content closing.
     */

                    if (value.charAt(index) !== C_BRACKET_CLOSE || value.charAt(++index) !== C_PAREN_OPEN) {
                        return;
                    }

                    subvalue += queue + C_BRACKET_CLOSE + C_PAREN_OPEN;
                    index++;
                    content = queue;

                    /*
     * Eat white-space.
     */

                    while (index < length) {
                        character = value.charAt(index);

                        if (!isWhiteSpace(character)) {
                            break;
                        }

                        subvalue += character;
                        index++;
                    }

                    /*
     * Eat the URL.
     */

                    character = value.charAt(index);
                    markers = commonmark ? COMMONMARK_LINK_TITLE_MARKERS : LINK_TITLE_MARKERS;
                    openCount = 0;
                    queue = EMPTY;
                    beforeURL = subvalue;

                    if (character === C_LT) {
                        index++;
                        beforeURL += C_LT;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character === C_GT) {
                                break;
                            }

                            if (commonmark && character === C_NEWLINE) {
                                return;
                            }

                            queue += character;
                            index++;
                        }

                        if (value.charAt(index) !== C_GT) {
                            return;
                        }

                        subvalue += C_LT + queue + C_GT;
                        url = queue;
                        index++;
                    } else {
                        character = null;
                        whiteSpaceQueue = EMPTY;

                        while (index < length) {
                            character = value.charAt(index);

                            if (whiteSpaceQueue && has.call(markers, character)) {
                                break;
                            }

                            if (isWhiteSpace(character)) {
                                if (commonmark) {
                                    break;
                                }

                                whiteSpaceQueue += character;
                            } else {
                                if (character === C_PAREN_OPEN) {
                                    depth++;
                                    openCount++;
                                } else if (character === C_PAREN_CLOSE) {
                                    if (depth === 0) {
                                        break;
                                    }

                                    depth--;
                                }

                                queue += whiteSpaceQueue;
                                whiteSpaceQueue = EMPTY;

                                if (character === C_BACKSLASH) {
                                    queue += C_BACKSLASH;
                                    character = value.charAt(++index);
                                }

                                queue += character;
                            }

                            index++;
                        }

                        subvalue += queue;
                        url = queue;
                        index = subvalue.length;
                    }

                    /*
     * Eat white-space.
     */

                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (!isWhiteSpace(character)) {
                            break;
                        }

                        queue += character;
                        index++;
                    }

                    character = value.charAt(index);
                    subvalue += queue;

                    /*
     * Eat the title.
     */

                    if (queue && has.call(markers, character)) {
                        index++;
                        subvalue += character;
                        queue = EMPTY;
                        marker = markers[character];
                        beforeTitle = subvalue;

                        /*
         * In commonmark-mode, things are pretty easy: the
         * marker cannot occur inside the title.
         *
         * Non-commonmark does, however, support nested
         * delimiters.
         */

                        if (commonmark) {
                            while (index < length) {
                                character = value.charAt(index);

                                if (character === marker) {
                                    break;
                                }

                                if (character === C_BACKSLASH) {
                                    queue += C_BACKSLASH;
                                    character = value.charAt(++index);
                                }

                                index++;
                                queue += character;
                            }

                            character = value.charAt(index);

                            if (character !== marker) {
                                return;
                            }

                            title = queue;
                            subvalue += queue + character;
                            index++;

                            while (index < length) {
                                character = value.charAt(index);

                                if (!isWhiteSpace(character)) {
                                    break;
                                }

                                subvalue += character;
                                index++;
                            }
                        } else {
                            whiteSpaceQueue = EMPTY;

                            while (index < length) {
                                character = value.charAt(index);

                                if (character === marker) {
                                    if (hasMarker) {
                                        queue += marker + whiteSpaceQueue;
                                        whiteSpaceQueue = EMPTY;
                                    }

                                    hasMarker = true;
                                } else if (!hasMarker) {
                                    queue += character;
                                } else if (character === C_PAREN_CLOSE) {
                                    subvalue += queue + marker + whiteSpaceQueue;
                                    title = queue;
                                    break;
                                } else if (isWhiteSpace(character)) {
                                    whiteSpaceQueue += character;
                                } else {
                                    queue += marker + whiteSpaceQueue + character;
                                    whiteSpaceQueue = EMPTY;
                                    hasMarker = false;
                                }

                                index++;
                            }
                        }
                    }

                    if (value.charAt(index) !== C_PAREN_CLOSE) {
                        return;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    subvalue += C_PAREN_CLOSE;

                    url = self.decode.raw(self.descape(url), eat(beforeURL).test().end);

                    if (title) {
                        beforeTitle = eat(beforeTitle).test().end;
                        title = self.decode.raw(self.descape(title), beforeTitle);
                    }

                    return eat(subvalue)(self.renderLink(!isImage, url, content, title, now, eat));
                }

                tokenizeLink.locator = locateLink;

                /**
 * Tokenise a reference link, image, or footnote;
 * shortcut reference link, or footnote.
 *
 * @example
 *   tokenizeReference(eat, '[foo]');
 *   tokenizeReference(eat, '[foo][]');
 *   tokenizeReference(eat, '[foo][bar]');
 *
 * @property {Function} locator - Reference locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - Reference node.
 */
                function tokenizeReference(eat, value, silent) {
                    var self = this;
                    var character = value.charAt(0);
                    var index = 0;
                    var length = value.length;
                    var subvalue = EMPTY;
                    var intro = EMPTY;
                    var type = T_LINK;
                    var referenceType = REFERENCE_TYPE_SHORTCUT;
                    var content;
                    var identifier;
                    var now;
                    var node;
                    var exitLink;
                    var queue;
                    var bracketed;
                    var depth;

                    /*
     * Check whether we’re eating an image.
     */

                    if (character === C_EXCLAMATION_MARK) {
                        type = T_IMAGE;
                        intro = character;
                        character = value.charAt(++index);
                    }

                    if (character !== C_BRACKET_OPEN) {
                        return;
                    }

                    index++;
                    intro += character;
                    queue = EMPTY;

                    /*
     * Check whether we’re eating a footnote.
     */

                    if (self.options.footnotes && type === T_LINK && value.charAt(index) === C_CARET) {
                        intro += C_CARET;
                        index++;
                        type = T_FOOTNOTE;
                    }

                    /*
     * Eat the text.
     */

                    depth = 0;

                    while (index < length) {
                        character = value.charAt(index);

                        if (character === C_BRACKET_OPEN) {
                            bracketed = true;
                            depth++;
                        } else if (character === C_BRACKET_CLOSE) {
                            if (!depth) {
                                break;
                            }

                            depth--;
                        }

                        if (character === C_BACKSLASH) {
                            queue += C_BACKSLASH;
                            character = value.charAt(++index);
                        }

                        queue += character;
                        index++;
                    }

                    subvalue = content = queue;
                    character = value.charAt(index);

                    if (character !== C_BRACKET_CLOSE) {
                        return;
                    }

                    index++;
                    subvalue += character;
                    queue = EMPTY;

                    while (index < length) {
                        character = value.charAt(index);

                        if (!isWhiteSpace(character)) {
                            break;
                        }

                        queue += character;
                        index++;
                    }

                    character = value.charAt(index);

                    if (character !== C_BRACKET_OPEN) {
                        if (!content) {
                            return;
                        }

                        identifier = content;
                    } else {
                        identifier = EMPTY;
                        queue += character;
                        index++;

                        while (index < length) {
                            character = value.charAt(index);

                            if (character === C_BRACKET_OPEN || character === C_BRACKET_CLOSE) {
                                break;
                            }

                            if (character === C_BACKSLASH) {
                                identifier += C_BACKSLASH;
                                character = value.charAt(++index);
                            }

                            identifier += character;
                            index++;
                        }

                        character = value.charAt(index);

                        if (character === C_BRACKET_CLOSE) {
                            queue += identifier + character;
                            index++;

                            referenceType = identifier ? REFERENCE_TYPE_FULL : REFERENCE_TYPE_COLLAPSED;
                        } else {
                            identifier = EMPTY;
                        }

                        subvalue += queue;
                        queue = EMPTY;
                    }

                    /*
     * Brackets cannot be inside the identifier.
     */

                    if (referenceType !== REFERENCE_TYPE_FULL && bracketed) {
                        return;
                    }

                    /*
     * Inline footnotes cannot have an identifier.
     */

                    if (type === T_FOOTNOTE && referenceType !== REFERENCE_TYPE_SHORTCUT) {
                        type = T_LINK;
                        intro = C_BRACKET_OPEN + C_CARET;
                        content = C_CARET + content;
                    }

                    subvalue = intro + subvalue;

                    if (type === T_LINK && self.inLink) {
                        return null;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    if (type === T_FOOTNOTE && content.indexOf(C_SPACE) !== -1) {
                        return eat(subvalue)(self.renderFootnote(content, eat.now()));
                    }

                    now = eat.now();
                    now.column += intro.length;
                    now.offset += intro.length;
                    identifier = referenceType === REFERENCE_TYPE_FULL ? identifier : content;

                    node = {
                        type: type + "Reference",
                        identifier: normalize(identifier)
                    };

                    if (type === T_LINK || type === T_IMAGE) {
                        node.referenceType = referenceType;
                    }

                    if (type === T_LINK) {
                        exitLink = self.enterLink();
                        node.children = self.tokenizeInline(content, now);
                        exitLink();
                    } else if (type === T_IMAGE) {
                        node.alt = self.decode.raw(self.descape(content), now) || null;
                    }

                    return eat(subvalue)(node);
                }

                tokenizeReference.locator = locateLink;

                /**
 * Find a possible strong emphasis.
 *
 * @example
 *   locateStrong('foo **bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible strong emphasis.
 */
                function locateStrong(value, fromIndex) {
                    var asterisk = value.indexOf(C_ASTERISK + C_ASTERISK, fromIndex);
                    var underscore = value.indexOf(C_UNDERSCORE + C_UNDERSCORE, fromIndex);

                    if (underscore === -1) {
                        return asterisk;
                    }

                    if (asterisk === -1) {
                        return underscore;
                    }

                    return underscore < asterisk ? underscore : asterisk;
                }

                /**
 * Tokenise strong emphasis.
 *
 * @example
 *   tokenizeStrong(eat, '**foo**');
 *   tokenizeStrong(eat, '__foo__');
 *
 * @property {Function} locator - Strong emphasis locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `strong` node.
 */
                function tokenizeStrong(eat, value, silent) {
                    var self = this;
                    var index = 0;
                    var character = value.charAt(index);
                    var now;
                    var pedantic;
                    var marker;
                    var queue;
                    var subvalue;
                    var length;
                    var prev;

                    if (EMPHASIS_MARKERS[character] !== true || value.charAt(++index) !== character) {
                        return;
                    }

                    pedantic = self.options.pedantic;
                    marker = character;
                    subvalue = marker + marker;
                    length = value.length;
                    index++;
                    queue = character = EMPTY;

                    if (pedantic && isWhiteSpace(value.charAt(index))) {
                        return;
                    }

                    while (index < length) {
                        prev = character;
                        character = value.charAt(index);

                        if (
                            character === marker &&
                            value.charAt(index + 1) === marker &&
                            (!pedantic || !isWhiteSpace(prev))
                        ) {
                            character = value.charAt(index + 2);

                            if (character !== marker) {
                                if (!trim(queue)) {
                                    return;
                                }

                                /* istanbul ignore if - never used (yet) */
                                if (silent) {
                                    return true;
                                }

                                now = eat.now();
                                now.column += 2;
                                now.offset += 2;

                                return eat(subvalue + queue + subvalue)(self.renderInline(T_STRONG, queue, now));
                            }
                        }

                        if (!pedantic && character === C_BACKSLASH) {
                            queue += character;
                            character = value.charAt(++index);
                        }

                        queue += character;
                        index++;
                    }
                }

                tokenizeStrong.locator = locateStrong;

                /**
 * Find possible slight emphasis.
 *
 * @example
 *   locateEmphasis('foo *bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible slight emphasis.
 */
                function locateEmphasis(value, fromIndex) {
                    var asterisk = value.indexOf(C_ASTERISK, fromIndex);
                    var underscore = value.indexOf(C_UNDERSCORE, fromIndex);

                    if (underscore === -1) {
                        return asterisk;
                    }

                    if (asterisk === -1) {
                        return underscore;
                    }

                    return underscore < asterisk ? underscore : asterisk;
                }

                /**
 * Tokenise slight emphasis.
 *
 * @example
 *   tokenizeEmphasis(eat, '*foo*');
 *   tokenizeEmphasis(eat, '_foo_');
 *
 * @property {Function} locator - Slight emphasis locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `emphasis` node.
 */
                function tokenizeEmphasis(eat, value, silent) {
                    var self = this;
                    var index = 0;
                    var character = value.charAt(index);
                    var now;
                    var pedantic;
                    var marker;
                    var queue;
                    var subvalue;
                    var length;
                    var prev;

                    if (EMPHASIS_MARKERS[character] !== true) {
                        return;
                    }

                    pedantic = self.options.pedantic;
                    subvalue = marker = character;
                    length = value.length;
                    index++;
                    queue = character = EMPTY;

                    if (pedantic && isWhiteSpace(value.charAt(index))) {
                        return;
                    }

                    while (index < length) {
                        prev = character;
                        character = value.charAt(index);

                        if (character === marker && (!pedantic || !isWhiteSpace(prev))) {
                            character = value.charAt(++index);

                            if (character !== marker) {
                                if (!trim(queue) || prev === marker) {
                                    return;
                                }

                                if (pedantic || marker !== C_UNDERSCORE || !isWordCharacter(character)) {
                                    /* istanbul ignore if - never used (yet) */
                                    if (silent) {
                                        return true;
                                    }

                                    now = eat.now();
                                    now.column++;
                                    now.offset++;

                                    return eat(subvalue + queue + marker)(self.renderInline(T_EMPHASIS, queue, now));
                                }
                            }

                            queue += marker;
                        }

                        if (!pedantic && character === C_BACKSLASH) {
                            queue += character;
                            character = value.charAt(++index);
                        }

                        queue += character;
                        index++;
                    }
                }

                tokenizeEmphasis.locator = locateEmphasis;

                /**
 * Find a possible deletion.
 *
 * @example
 *   locateDeletion('foo ~~bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible deletion.
 */
                function locateDeletion(value, fromIndex) {
                    return value.indexOf(C_TILDE + C_TILDE, fromIndex);
                }

                /**
 * Tokenise a deletion.
 *
 * @example
 *   tokenizeDeletion(eat, '~~foo~~');
 *
 * @property {Function} locator - Deletion locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `delete` node.
 */
                function tokenizeDeletion(eat, value, silent) {
                    var self = this;
                    var character = EMPTY;
                    var previous = EMPTY;
                    var preceding = EMPTY;
                    var subvalue = EMPTY;
                    var index;
                    var length;
                    var now;

                    if (
                        !self.options.gfm ||
                        value.charAt(0) !== C_TILDE ||
                        value.charAt(1) !== C_TILDE ||
                        isWhiteSpace(value.charAt(2))
                    ) {
                        return;
                    }

                    index = 1;
                    length = value.length;
                    now = eat.now();
                    now.column += 2;
                    now.offset += 2;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character === C_TILDE && previous === C_TILDE && (!preceding || !isWhiteSpace(preceding))) {
                            /* istanbul ignore if - never used (yet) */
                            if (silent) {
                                return true;
                            }

                            return eat(C_TILDE + C_TILDE + subvalue + C_TILDE + C_TILDE)(
                                self.renderInline(T_DELETE, subvalue, now)
                            );
                        }

                        subvalue += previous;
                        preceding = previous;
                        previous = character;
                    }
                }

                tokenizeDeletion.locator = locateDeletion;

                /**
 * Find possible inline code.
 *
 * @example
 *   locateInlineCode('foo `bar'); // 4
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible inline code.
 */
                function locateInlineCode(value, fromIndex) {
                    return value.indexOf(C_TICK, fromIndex);
                }

                /**
 * Tokenise inline code.
 *
 * @example
 *   tokenizeInlineCode(eat, '`foo()`');
 *
 * @property {Function} locator - Inline code locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `inlineCode` node.
 */
                function tokenizeInlineCode(eat, value, silent) {
                    var self = this;
                    var length = value.length;
                    var index = 0;
                    var queue = EMPTY;
                    var tickQueue = EMPTY;
                    var contentQueue;
                    var whiteSpaceQueue;
                    var count;
                    var openingCount;
                    var subvalue;
                    var character;
                    var found;
                    var next;

                    while (index < length) {
                        if (value.charAt(index) !== C_TICK) {
                            break;
                        }

                        queue += C_TICK;
                        index++;
                    }

                    if (!queue) {
                        return;
                    }

                    subvalue = queue;
                    openingCount = index;
                    queue = EMPTY;
                    next = value.charAt(index);
                    count = 0;

                    while (index < length) {
                        character = next;
                        next = value.charAt(index + 1);

                        if (character === C_TICK) {
                            count++;
                            tickQueue += character;
                        } else {
                            count = 0;
                            queue += character;
                        }

                        if (count && next !== C_TICK) {
                            if (count === openingCount) {
                                subvalue += queue + tickQueue;
                                found = true;
                                break;
                            }

                            queue += tickQueue;
                            tickQueue = EMPTY;
                        }

                        index++;
                    }

                    if (!found) {
                        if (openingCount % 2 !== 0) {
                            return;
                        }

                        queue = EMPTY;
                    }

                    /* istanbul ignore if - never used (yet) */
                    if (silent) {
                        return true;
                    }

                    contentQueue = whiteSpaceQueue = EMPTY;
                    length = queue.length;
                    index = -1;

                    while (++index < length) {
                        character = queue.charAt(index);

                        if (isWhiteSpace(character)) {
                            whiteSpaceQueue += character;
                            continue;
                        }

                        if (whiteSpaceQueue) {
                            if (contentQueue) {
                                contentQueue += whiteSpaceQueue;
                            }

                            whiteSpaceQueue = EMPTY;
                        }

                        contentQueue += character;
                    }

                    return eat(subvalue)(self.renderRaw(T_INLINE_CODE, contentQueue));
                }

                tokenizeInlineCode.locator = locateInlineCode;

                /**
 * Find a possible break.
 *
 * @example
 *   locateBreak('foo   \nbar'); // 3
 *
 * @param {string} value - Value to search.
 * @param {number} fromIndex - Index to start searching at.
 * @return {number} - Location of possible break.
 */
                function locateBreak(value, fromIndex) {
                    var index = value.indexOf(C_NEWLINE, fromIndex);

                    while (index > fromIndex) {
                        if (value.charAt(index - 1) !== C_SPACE) {
                            break;
                        }

                        index--;
                    }

                    return index;
                }

                /**
 * Tokenise a break.
 *
 * @example
 *   tokenizeBreak(eat, '  \n');
 *
 * @property {Function} locator - Break locator.
 * @param {function(string)} eat - Eater.
 * @param {string} value - Rest of content.
 * @param {boolean?} [silent] - Whether this is a dry run.
 * @return {Node?|boolean} - `break` node.
 */
                function tokenizeBreak(eat, value, silent) {
                    var self = this;
                    var breaks = self.options.breaks;
                    var length = value.length;
                    var index = -1;
                    var queue = EMPTY;
                    var character;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character === C_NEWLINE) {
                            if (!breaks && index < MIN_BREAK_LENGTH) {
                                return;
                            }

                            /* istanbul ignore if - never used (yet) */
                            if (silent) {
                                return true;
                            }

                            queue += character;
                            return eat(queue)(self.renderVoid(T_BREAK));
                        }

                        if (character !== C_SPACE) {
                            return;
                        }

                        queue += character;
                    }
                }

                tokenizeBreak.locator = locateBreak;

                /**
 * Construct a new parser.
 *
 * @example
 *   var parser = new Parser(new VFile('Foo'));
 *
 * @constructor
 * @class {Parser}
 * @param {VFile} file - File to parse.
 * @param {Object?} [options] - Passed to
 *   `Parser#setOptions()`.
 */
                function Parser(file, options) {
                    var self = this;

                    self.file = file;
                    self.inLink = false;
                    self.inBlock = false;
                    self.inList = false;
                    self.atStart = true;
                    self.toOffset = vfileLocation(file).toOffset;

                    self.descape = descapeFactory(self, "escape");
                    self.decode = decodeFactory(self);

                    self.options = extend({}, self.options);

                    self.setOptions(options);
                }

                /**
 * Set options.  Does not overwrite previously set
 * options.
 *
 * @example
 *   var parser = new Parser();
 *   parser.setOptions({gfm: true});
 *
 * @this {Parser}
 * @throws {Error} - When an option is invalid.
 * @param {Object?} [options] - Parse settings.
 * @return {Parser} - `self`.
 */
                Parser.prototype.setOptions = function(options) {
                    var self = this;
                    var current = self.options;
                    var key;

                    if (options === null || options === undefined) {
                        options = {};
                    } else if (typeof options === "object") {
                        options = extend({}, options);
                    } else {
                        throw new Error("Invalid value `" + options + "` " + "for setting `options`");
                    }

                    for (key in defaultOptions) {
                        var value = options[key];

                        if (value === null || value === undefined) {
                            value = current[key];
                        }

                        if (typeof value !== "boolean") {
                            throw new Error("Invalid value `" + value + "` " + "for setting `options." + key + "`");
                        }

                        options[key] = value;
                    }

                    self.options = options;

                    if (options.commonmark) {
                        self.escape = escapes.commonmark;
                    } else if (options.gfm) {
                        self.escape = escapes.gfm;
                    } else {
                        self.escape = escapes.default;
                    }

                    return self;
                };

                /*
 * Expose `defaults`.
 */

                Parser.prototype.options = defaultOptions;

                /**
 * Factory to track indentation for each line corresponding
 * to the given `start` and the number of invocations.
 *
 * @param {number} start - Starting line.
 * @return {function(offset)} - Indenter.
 */
                Parser.prototype.indent = function(start) {
                    var self = this;
                    var line = start;

                    /**
     * Intender which increments the global offset,
     * starting at the bound line, and further incrementing
     * each line for each invocation.
     *
     * @example
     *   indenter(2);
     *
     * @param {number} offset - Number to increment the
     *   offset.
     */
                    function indenter(offset) {
                        self.offset[line] = (self.offset[line] || 0) + offset;

                        line++;
                    }

                    return indenter;
                };

                /**
 * Get found offsets starting at `start`.
 *
 * @param {number} start - Starting line.
 * @return {Array.<number>} - Offsets starting at `start`.
 */
                Parser.prototype.getIndent = function(start) {
                    var offset = this.offset;
                    var result = [];

                    while (++start) {
                        if (!(start in offset)) {
                            break;
                        }

                        result.push((offset[start] || 0) + 1);
                    }

                    return result;
                };

                /**
 * Parse the bound file.
 *
 * @example
 *   new Parser(new File('_Foo_.')).parse();
 *
 * @this {Parser}
 * @return {Object} - `root` node.
 */
                Parser.prototype.parse = function() {
                    var self = this;
                    var value = String(self.file);
                    var column = 1;
                    var node;

                    /*
     * Clean non-unix newlines: `\r\n` and `\r` are all
     * changed to `\n`.  This should not affect positional
     * information.
     */

                    value = value.replace(EXPRESSION_LINE_BREAKS, C_NEWLINE);

                    if (value.charCodeAt(0) === 0xfeff) {
                        value = value.slice(1);
                        column++;
                        self.offset++;
                    }

                    /*
     * Add an `offset` matrix, used to keep track of
     * syntax and white space indentation per line.
     */

                    self.offset = {};

                    node = self.renderBlock(T_ROOT, value, {
                        line: 1,
                        column: column
                    });

                    node.position = {
                        start: {
                            line: 1,
                            column: 1,
                            offset: 0
                        }
                    };

                    node.position.end = self.eof || extend({}, node.position.start);

                    if (!self.options.position) {
                        removePosition(node);
                    }

                    return node;
                };

                /*
 * Enter and exit helpers.
 */

                Parser.prototype.exitStart = toggle("atStart", true);
                Parser.prototype.enterList = toggle("inList", false);
                Parser.prototype.enterLink = toggle("inLink", false);
                Parser.prototype.enterBlock = toggle("inBlock", false);

                /*
 * Expose helpers
 */

                Parser.prototype.renderRaw = renderRaw;
                Parser.prototype.renderVoid = renderVoid;
                Parser.prototype.renderParent = renderParent;
                Parser.prototype.renderInline = renderInline;
                Parser.prototype.renderBlock = renderBlock;

                Parser.prototype.renderLink = renderLink;
                Parser.prototype.renderCodeBlock = renderCodeBlock;
                Parser.prototype.renderBlockquote = renderBlockquote;
                Parser.prototype.renderListItem = renderListItem;
                Parser.prototype.renderFootnoteDefinition = renderFootnoteDefinition;
                Parser.prototype.renderHeading = renderHeading;
                Parser.prototype.renderFootnote = renderFootnote;

                /**
 * Construct a tokenizer.  This creates both
 * `tokenizeInline` and `tokenizeBlock`.
 *
 * @example
 *   Parser.prototype.tokenizeInline = tokenizeFactory('inline');
 *
 * @param {string} type - Name of parser, used to find
 *   its expressions (`%sMethods`) and tokenizers
 *   (`%Tokenizers`).
 * @return {Function} - Tokenizer.
 */
                function tokenizeFactory(type) {
                    /**
     * Tokenizer for a bound `type`
     *
     * @example
     *   parser = new Parser();
     *   parser.tokenizeInline('_foo_');
     *
     * @param {string} value - Content.
     * @param {Object} location - Offset at which `value`
     *   starts.
     * @return {Array.<Object>} - Nodes.
     */
                    function tokenize(value, location) {
                        var self = this;
                        var offset = self.offset;
                        var tokens = [];
                        var methods = self[type + "Methods"];
                        var tokenizers = self[type + "Tokenizers"];
                        var line = location.line;
                        var column = location.column;
                        var add;
                        var index;
                        var length;
                        var method;
                        var name;
                        var matched;
                        var valueLength;

                        /*
         * Trim white space only lines.
         */

                        if (!value) {
                            return tokens;
                        }

                        /**
         * Update line, column, and offset based on
         * `value`.
         *
         * @example
         *   updatePosition('foo');
         *
         * @param {string} subvalue - Subvalue to eat.
         */
                        function updatePosition(subvalue) {
                            var lastIndex = -1;
                            var index = subvalue.indexOf(C_NEWLINE);

                            while (index !== -1) {
                                line++;
                                lastIndex = index;
                                index = subvalue.indexOf(C_NEWLINE, index + 1);
                            }

                            if (lastIndex === -1) {
                                column += subvalue.length;
                            } else {
                                column = subvalue.length - lastIndex;
                            }

                            if (line in offset) {
                                if (lastIndex !== -1) {
                                    column += offset[line];
                                } else if (column <= offset[line]) {
                                    column = offset[line] + 1;
                                }
                            }
                        }

                        /**
         * Get offset. Called before the first character is
         * eaten to retrieve the range's offsets.
         *
         * @return {Function} - `done`, to be called when
         *   the last character is eaten.
         */
                        function getOffset() {
                            var indentation = [];
                            var pos = line + 1;

                            /**
             * Done. Called when the last character is
             * eaten to retrieve the range’s offsets.
             *
             * @return {Array.<number>} - Offset.
             */
                            function done() {
                                var last = line + 1;

                                while (pos < last) {
                                    indentation.push((offset[pos] || 0) + 1);

                                    pos++;
                                }

                                return indentation;
                            }

                            return done;
                        }

                        /**
         * Get the current position.
         *
         * @example
         *   position = now(); // {line: 1, column: 1, offset: 0}
         *
         * @return {Object} - Current Position.
         */
                        function now() {
                            var pos = {
                                line: line,
                                column: column
                            };

                            pos.offset = self.toOffset(pos);

                            return pos;
                        }

                        /**
         * Store position information for a node.
         *
         * @example
         *   start = now();
         *   updatePosition('foo');
         *   location = new Position(start);
         *   // {
         *   //   start: {line: 1, column: 1, offset: 0},
         *   //   end: {line: 1, column: 3, offset: 2}
         *   // }
         *
         * @param {Object} start - Starting position.
         */
                        function Position(start) {
                            this.start = start;
                            this.end = now();
                        }

                        /**
         * Throw when a value is incorrectly eaten.
         * This shouldn’t happen but will throw on new,
         * incorrect rules.
         *
         * @example
         *   // When the current value is set to `foo bar`.
         *   validateEat('foo');
         *   eat('foo');
         *
         *   validateEat('bar');
         *   // throws, because the space is not eaten.
         *
         * @param {string} subvalue - Value to be eaten.
         * @throws {Error} - When `subvalue` cannot be eaten.
         */
                        function validateEat(subvalue) {
                            /* istanbul ignore if */
                            if (value.substring(0, subvalue.length) !== subvalue) {
                                self.file.fail(ERR_INCORRECTLY_EATEN, now());
                            }
                        }

                        /**
         * Mark position and patch `node.position`.
         *
         * @example
         *   var update = position();
         *   updatePosition('foo');
         *   update({});
         *   // {
         *   //   position: {
         *   //     start: {line: 1, column: 1, offset: 0},
         *   //     end: {line: 1, column: 3, offset: 2}
         *   //   }
         *   // }
         *
         * @returns {Function} - Updater.
         */
                        function position() {
                            var before = now();

                            /**
             * Add the position to a node.
             *
             * @example
             *   update({type: 'text', value: 'foo'});
             *
             * @param {Node} node - Node to attach position
             *   on.
             * @param {Array} [indent] - Indentation for
             *   `node`.
             * @return {Node} - `node`.
             */
                            function update(node, indent) {
                                var prev = node.position;
                                var start = prev ? prev.start : before;
                                var combined = [];
                                var n = prev && prev.end.line;
                                var l = before.line;

                                node.position = new Position(start);

                                /*
                 * If there was already a `position`, this
                 * node was merged.  Fixing `start` wasn’t
                 * hard, but the indent is different.
                 * Especially because some information, the
                 * indent between `n` and `l` wasn’t
                 * tracked.  Luckily, that space is
                 * (should be?) empty, so we can safely
                 * check for it now.
                 */

                                if (prev && indent && prev.indent) {
                                    combined = prev.indent;

                                    if (n < l) {
                                        while (++n < l) {
                                            combined.push((offset[n] || 0) + 1);
                                        }

                                        combined.push(before.column);
                                    }

                                    indent = combined.concat(indent);
                                }

                                node.position.indent = indent || [];

                                return node;
                            }

                            return update;
                        }

                        /**
         * Add `node` to `parent`s children or to `tokens`.
         * Performs merges where possible.
         *
         * @example
         *   add({});
         *
         *   add({}, {children: []});
         *
         * @param {Object} node - Node to add.
         * @param {Object} [parent] - Parent to insert into.
         * @return {Object} - Added or merged into node.
         */
                        add = function(node, parent) {
                            var prev;
                            var children;

                            if (!parent) {
                                children = tokens;
                            } else {
                                children = parent.children;
                            }

                            prev = children[children.length - 1];

                            if (
                                prev &&
                                node.type === prev.type &&
                                node.type in MERGEABLE_NODES &&
                                mergeable(prev) &&
                                mergeable(node)
                            ) {
                                node = MERGEABLE_NODES[node.type].call(self, prev, node);
                            }

                            if (node !== prev) {
                                children.push(node);
                            }

                            if (self.atStart && tokens.length) {
                                self.exitStart();
                            }

                            return node;
                        };

                        /**
         * Remove `subvalue` from `value`.
         * `subvalue` must be at the start of `value`.
         *
         * @example
         *   eat('foo')({type: 'text', value: 'foo'});
         *
         * @param {string} subvalue - Removed from `value`,
         *   and passed to `updatePosition`.
         * @return {Function} - Wrapper around `add`, which
         *   also adds `position` to node.
         */
                        function eat(subvalue) {
                            var indent = getOffset();
                            var pos = position();
                            var current = now();

                            validateEat(subvalue);

                            /**
             * Add the given arguments, add `position` to
             * the returned node, and return the node.
             *
             * @param {Object} node - Node to add.
             * @param {Object} [parent] - Node to insert into.
             * @return {Node} - Added node.
             */
                            function apply(node, parent) {
                                return pos(add(pos(node), parent), indent);
                            }

                            /**
             * Functions just like apply, but resets the
             * content:  the line and column are reversed,
             * and the eaten value is re-added.
             *
             * This is useful for nodes with a single
             * type of content, such as lists and tables.
             *
             * See `apply` above for what parameters are
             * expected.
             *
             * @return {Node} - Added node.
             */
                            function reset() {
                                var node = apply.apply(null, arguments);

                                line = current.line;
                                column = current.column;
                                value = subvalue + value;

                                return node;
                            }

                            /**
             * Test the position, after eating, and reverse
             * to a not-eaten state.
             *
             * @return {Position} - Position after eating `subvalue`.
             */
                            function test() {
                                var result = pos({});

                                line = current.line;
                                column = current.column;
                                value = subvalue + value;

                                return result.position;
                            }

                            apply.reset = reset;
                            apply.test = reset.test = test;

                            value = value.substring(subvalue.length);

                            updatePosition(subvalue);

                            indent = indent();

                            return apply;
                        }

                        /*
         * Expose `now` on `eat`.
         */

                        eat.now = now;

                        /*
         * Expose `file` on `eat`.
         */

                        eat.file = self.file;

                        /*
         * Sync initial offset.
         */

                        updatePosition(EMPTY);

                        /*
         * Iterate over `value`, and iterate over all
         * tokenizers.  When one eats something, re-iterate
         * with the remaining value.  If no tokenizer eats,
         * something failed (should not happen) and an
         * exception is thrown.
         */

                        while (value) {
                            index = -1;
                            length = methods.length;
                            matched = false;

                            while (++index < length) {
                                name = methods[index];
                                method = tokenizers[name];

                                if (
                                    method &&
                                    (!method.onlyAtStart || self.atStart) &&
                                    (!method.notInList || !self.inList) &&
                                    (!method.notInBlock || !self.inBlock) &&
                                    (!method.notInLink || !self.inLink)
                                ) {
                                    valueLength = value.length;

                                    method.apply(self, [eat, value]);

                                    matched = valueLength !== value.length;

                                    if (matched) {
                                        break;
                                    }
                                }
                            }

                            /* istanbul ignore if */
                            if (!matched) {
                                self.file.fail(ERR_INFINITE_LOOP, eat.now());

                                /*
                 * Errors are not thrown on `File#fail`
                 * when `quiet: true`.
                 */

                                break;
                            }
                        }

                        self.eof = now();

                        return tokens;
                    }

                    return tokenize;
                }

                /*
 * Expose tokenizers for block-level nodes.
 */

                Parser.prototype.blockTokenizers = {
                    yamlFrontMatter: tokenizeYAMLFrontMatter,
                    newline: tokenizeNewline,
                    indentedCode: tokenizeIndentedCode,
                    fencedCode: tokenizeFencedCode,
                    blockquote: tokenizeBlockquote,
                    atxHeading: tokenizeATXHeading,
                    thematicBreak: tokenizeThematicBreak,
                    list: tokenizeList,
                    setextHeading: tokenizeSetextHeading,
                    html: tokenizeBlockHTML,
                    footnote: tokenizeFootnoteDefinition,
                    definition: tokenizeDefinition,
                    table: tokenizeTable,
                    paragraph: tokenizeParagraph
                };

                /*
 * Expose order in which to parse block-level nodes.
 */

                Parser.prototype.blockMethods = [
                    "yamlFrontMatter",
                    "newline",
                    "indentedCode",
                    "fencedCode",
                    "blockquote",
                    "atxHeading",
                    "thematicBreak",
                    "list",
                    "setextHeading",
                    "html",
                    "footnote",
                    "definition",
                    "table",
                    "paragraph"
                ];

                /**
 * Block tokenizer.
 *
 * @example
 *   var parser = new Parser();
 *   parser.tokenizeBlock('> foo.');
 *
 * @param {string} value - Content.
 * @return {Array.<Object>} - Nodes.
 */

                Parser.prototype.tokenizeBlock = tokenizeFactory(BLOCK);

                /*
 * Expose tokenizers for inline-level nodes.
 */

                Parser.prototype.inlineTokenizers = {
                    escape: tokenizeEscape,
                    autoLink: tokenizeAutoLink,
                    url: tokenizeURL,
                    html: tokenizeInlineHTML,
                    link: tokenizeLink,
                    reference: tokenizeReference,
                    strong: tokenizeStrong,
                    emphasis: tokenizeEmphasis,
                    deletion: tokenizeDeletion,
                    code: tokenizeInlineCode,
                    break: tokenizeBreak,
                    text: tokenizeText
                };

                /*
 * Expose order in which to parse inline-level nodes.
 */

                Parser.prototype.inlineMethods = [
                    "escape",
                    "autoLink",
                    "url",
                    "html",
                    "link",
                    "reference",
                    "strong",
                    "emphasis",
                    "deletion",
                    "code",
                    "break",
                    "text"
                ];

                /**
 * Inline tokenizer.
 *
 * @example
 *   var parser = new Parser();
 *   parser.tokenizeInline('_foo_');
 *
 * @param {string} value - Content.
 * @return {Array.<Object>} - Nodes.
 */

                Parser.prototype.tokenizeInline = tokenizeFactory(INLINE);

                /*
 * Expose `tokenizeFactory` so dependencies could create
 * their own tokenizers.
 */

                Parser.prototype.tokenizeFactory = tokenizeFactory;

                /*
 * Expose `attacher`.
 */

                module.exports = Parser;
            },
            {
                "./block-elements.json": 33,
                "./defaults.js": 34,
                "./escapes.json": 35,
                "collapse-white-space": 20,
                extend: 24,
                "parse-entities": 31,
                "repeat-string": 41,
                trim: 48,
                "trim-trailing-lines": 47,
                "unist-util-remove-position": 53,
                "vfile-location": 55
            }
        ],
        37: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:stringify
 * @fileoverview Markdown Compiler.
 */

                "use strict";

                /* eslint-env commonjs */

                /* Dependencies. */
                var unherit = require("unherit");
                var Compiler = require("./lib/compiler.js");

                /**
 * Attacher.
 *
 * @param {unified} processor - Unified processor.
 */
                function stringify(processor) {
                    processor.Compiler = unherit(Compiler);
                }

                /* Patch `Compiler`. */
                stringify.Compiler = Compiler;

                /* Expose. */
                module.exports = stringify;
            },
            { "./lib/compiler.js": 38, unherit: 49 }
        ],
        38: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:compiler
 * @fileoverview Markdown compiler
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Dependencies.
 */

                var decode = require("parse-entities");
                var encode = require("stringify-entities");
                var table = require("markdown-table");
                var repeat = require("repeat-string");
                var extend = require("extend");
                var ccount = require("ccount");
                var longestStreak = require("longest-streak");
                var defaultOptions = require("./defaults.js");

                /*
 * Constants.
 */

                var INDENT = 4;
                var MINIMUM_CODE_FENCE_LENGTH = 3;
                var YAML_FENCE_LENGTH = 3;
                var MINIMUM_RULE_LENGTH = 3;
                var MAILTO = "mailto:";
                var ERROR_LIST_ITEM_INDENT = "Cannot indent code properly. See " + "http://git.io/vgFvT";

                /*
 * Expressions.
 */

                var EXPRESSIONS_WHITE_SPACE = /\s/;

                /*
 * Naive fence expression.
 */

                var FENCE = /([`~])\1{2}/;

                /*
 * Expression for a protocol.
 *
 * @see http://en.wikipedia.org/wiki/URI_scheme#Generic_syntax
 */

                var PROTOCOL = /^[a-z][a-z+.-]+:\/?/i;

                /*
 * Punctuation characters.
 */

                var PUNCTUATION = /[-!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~_]/;

                /*
 * Characters.
 */

                var ANGLE_BRACKET_CLOSE = ">";
                var ANGLE_BRACKET_OPEN = "<";
                var ASTERISK = "*";
                var BACKSLASH = "\\";
                var CARET = "^";
                var COLON = ":";
                var SEMICOLON = ";";
                var DASH = "-";
                var DOT = ".";
                var EMPTY = "";
                var EQUALS = "=";
                var EXCLAMATION_MARK = "!";
                var HASH = "#";
                var AMPERSAND = "&";
                var LINE = "\n";
                var CARRIAGE = "\r";
                var FORM_FEED = "\f";
                var PARENTHESIS_OPEN = "(";
                var PARENTHESIS_CLOSE = ")";
                var PIPE = "|";
                var PLUS = "+";
                var QUOTE_DOUBLE = '"';
                var QUOTE_SINGLE = "'";
                var SPACE = " ";
                var TAB = "\t";
                var VERTICAL_TAB = "\u000B";
                var SQUARE_BRACKET_OPEN = "[";
                var SQUARE_BRACKET_CLOSE = "]";
                var TICK = "`";
                var TILDE = "~";
                var UNDERSCORE = "_";

                /**
 * Check whether `character` is alphanumeric.
 *
 * @param {string} character - Single character to check.
 * @return {boolean} - Whether `character` is alphanumeric.
 */
                function isAlphanumeric(character) {
                    return /\w/.test(character) && character !== UNDERSCORE;
                }

                /*
 * Entities.
 */

                var ENTITY_AMPERSAND = AMPERSAND + "amp" + SEMICOLON;
                var ENTITY_ANGLE_BRACKET_OPEN = AMPERSAND + "lt" + SEMICOLON;
                var ENTITY_COLON = AMPERSAND + "#x3A" + SEMICOLON;

                /*
 * Character combinations.
 */

                var BREAK = LINE + LINE;
                var GAP = BREAK + LINE;
                var DOUBLE_TILDE = TILDE + TILDE;

                /*
 * Allowed entity options.
 */

                var ENTITY_OPTIONS = {};

                ENTITY_OPTIONS.true = true;
                ENTITY_OPTIONS.false = true;
                ENTITY_OPTIONS.numbers = true;
                ENTITY_OPTIONS.escape = true;

                /*
 * Allowed list-bullet characters.
 */

                var LIST_BULLETS = {};

                LIST_BULLETS[ASTERISK] = true;
                LIST_BULLETS[DASH] = true;
                LIST_BULLETS[PLUS] = true;

                /*
 * Allowed horizontal-rule bullet characters.
 */

                var THEMATIC_BREAK_BULLETS = {};

                THEMATIC_BREAK_BULLETS[ASTERISK] = true;
                THEMATIC_BREAK_BULLETS[DASH] = true;
                THEMATIC_BREAK_BULLETS[UNDERSCORE] = true;

                /*
 * Allowed emphasis characters.
 */

                var EMPHASIS_MARKERS = {};

                EMPHASIS_MARKERS[UNDERSCORE] = true;
                EMPHASIS_MARKERS[ASTERISK] = true;

                /*
 * Allowed fence markers.
 */

                var FENCE_MARKERS = {};

                FENCE_MARKERS[TICK] = true;
                FENCE_MARKERS[TILDE] = true;

                /*
 * Which method to use based on `list.ordered`.
 */

                var ORDERED_MAP = {};

                ORDERED_MAP.true = "visitOrderedItems";
                ORDERED_MAP.false = "visitUnorderedItems";

                /*
 * Allowed list-item-indent's.
 */

                var LIST_ITEM_INDENTS = {};

                var LIST_ITEM_TAB = "tab";
                var LIST_ITEM_ONE = "1";
                var LIST_ITEM_MIXED = "mixed";

                LIST_ITEM_INDENTS[LIST_ITEM_ONE] = true;
                LIST_ITEM_INDENTS[LIST_ITEM_TAB] = true;
                LIST_ITEM_INDENTS[LIST_ITEM_MIXED] = true;

                /*
 * Which checkbox to use.
 */

                var CHECKBOX_MAP = {};

                CHECKBOX_MAP.null = EMPTY;
                CHECKBOX_MAP.undefined = EMPTY;
                CHECKBOX_MAP.true = SQUARE_BRACKET_OPEN + "x" + SQUARE_BRACKET_CLOSE + SPACE;
                CHECKBOX_MAP.false = SQUARE_BRACKET_OPEN + SPACE + SQUARE_BRACKET_CLOSE + SPACE;

                /**
 * Throw an exception with in its `message` `value`
 * and `name`.
 *
 * @param {*} value - Invalid value.
 * @param {string} name - Setting name.
 */
                function raise(value, name) {
                    throw new Error("Invalid value `" + value + "` " + "for setting `" + name + "`");
                }

                /**
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * a boolean.
 *
 * @example
 *   validateBoolean({foo: null}, 'foo', true) // true
 *   validateBoolean({foo: false}, 'foo', true) // false
 *   validateBoolean({foo: 'bar'}, 'foo', true) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   a boolean.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {boolean} def - Default value.
 */
                function validateBoolean(context, name, def) {
                    var value = context[name];

                    if (value === null || value === undefined) {
                        value = def;
                    }

                    if (typeof value !== "boolean") {
                        raise(value, "options." + name);
                    }

                    context[name] = value;
                }

                /**
 * Validate a value to be boolean. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * a boolean.
 *
 * @example
 *   validateNumber({foo: null}, 'foo', 1) // 1
 *   validateNumber({foo: 2}, 'foo', 1) // 2
 *   validateNumber({foo: 'bar'}, 'foo', 1) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   a number.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {number} def - Default value.
 */
                function validateNumber(context, name, def) {
                    var value = context[name];

                    if (value === null || value === undefined) {
                        value = def;
                    }

                    if (typeof value !== "number" || value !== value) {
                        raise(value, "options." + name);
                    }

                    context[name] = value;
                }

                /**
 * Validate a value to be in `map`. Defaults to `def`.
 * Raises an exception with `context[name]` when not
 * in `map`.
 *
 * @example
 *   var map = {bar: true, baz: true};
 *   validateString({foo: null}, 'foo', 'bar', map) // 'bar'
 *   validateString({foo: 'baz'}, 'foo', 'bar', map) // 'baz'
 *   validateString({foo: true}, 'foo', 'bar', map) // Throws
 *
 * @throws {Error} - When a setting is neither omitted nor
 *   in `map`.
 * @param {Object} context - Settings.
 * @param {string} name - Setting name.
 * @param {string} def - Default value.
 * @param {Object} map - Enum.
 */
                function validateString(context, name, def, map) {
                    var value = context[name];

                    if (value === null || value === undefined) {
                        value = def;
                    }

                    if (!(value in map)) {
                        raise(value, "options." + name);
                    }

                    context[name] = value;
                }

                /*
 * Expose `validate`.
 */

                var validate = {
                    boolean: validateBoolean,
                    string: validateString,
                    number: validateNumber
                };

                /**
 * Construct a state `toggler`: a function which inverses
 * `property` in context based on its current value.
 * The by `toggler` returned function restores that value.
 *
 * @example
 *   var context = {};
 *   var key = 'foo';
 *   var val = true;
 *   context[key] = val;
 *   context.enter = toggler(key, val);
 *   context[key]; // true
 *   var exit = context.enter();
 *   context[key]; // false
 *   var nested = context.enter();
 *   context[key]; // false
 *   nested();
 *   context[key]; // false
 *   exit();
 *   context[key]; // true
 *
 * @param {string} key - Property to toggle.
 * @param {boolean} state - It's default state.
 * @return {function(): function()} - Enter.
 */
                function toggler(key, state) {
                    /**
     * Construct a toggler for the bound `key`.
     *
     * @return {Function} - Exit state.
     */
                    function enter() {
                        var self = this;
                        var current = self[key];

                        self[key] = !state;

                        /**
         * State canceler, cancels the state, if allowed.
         */
                        function exit() {
                            self[key] = current;
                        }

                        return exit;
                    }

                    return enter;
                }

                /**
 * Check whether a node is mergeable with adjacent nodes.
 *
 * @param {Object} node - Node to check.
 * @return {boolean} - Whether `node` is mergable.
 */
                function mergeable(node) {
                    var start;
                    var end;

                    if (node.type !== "text" || !node.position) {
                        return true;
                    }

                    start = node.position.start;
                    end = node.position.end;

                    /*
     * Only merge nodes which occupy the same size as their
     * `value`.
     */

                    return start.line !== end.line || end.column - start.column === node.value.length;
                }

                /**
 * Encode noop.
 * Simply returns the given value.
 *
 * @example
 *   var encode = encodeNoop();
 *   encode('AT&T') // 'AT&T'
 *
 * @param {string} value - Content.
 * @return {string} - Content, without any modifications.
 */
                function encodeNoop(value) {
                    return value;
                }

                /**
 * Factory to encode HTML entities.
 * Creates a no-operation function when `type` is
 * `'false'`, a function which encodes using named
 * references when `type` is `'true'`, and a function
 * which encodes using numbered references when `type` is
 * `'numbers'`.
 *
 * @example
 *   encodeFactory('false')('AT&T') // 'AT&T'
 *   encodeFactory('true')('AT&T') // 'AT&amp;T'
 *   encodeFactory('numbers')('AT&T') // 'ATT&#x26;T'
 *
 * @param {string} type - Either `'true'`, `'false'`, or
 *   `'numbers'`.
 * @return {function(string): string} - Function which
 *   takes a value and returns its encoded version.
 */
                function encodeFactory(type) {
                    var options = {};

                    if (type === "false") {
                        return encodeNoop;
                    }

                    if (type === "true") {
                        options.useNamedReferences = true;
                    }

                    if (type === "escape") {
                        options.escapeOnly = options.useNamedReferences = true;
                    }

                    /**
     * Encode HTML entities using the bound options.
     *
     * @example
     *   // When `type` is `'true'`.
     *   encode('AT&T'); // 'AT&amp;T'
     *
     *   // When `type` is `'numbers'`.
     *   encode('AT&T'); // 'ATT&#x26;T'
     *
     * @param {string} value - Content.
     * @param {Object} [node] - Node which is compiled.
     * @return {string} - Encoded content.
     */
                    function encoder(value) {
                        return encode(value, options);
                    }

                    return encoder;
                }

                /**
 * Returns the length of HTML entity that is a prefix of
 * the given string (excluding the ampersand), 0 if it
 * does not start with an entity.
 *
 * @example
 *   entityPrefixLength('&copycat') // 4
 *   entityPrefixLength('&foo &amp &bar') // 0
 *
 * @param {string} value - Input string.
 * @return {number} - Length of an entity.
 */
                function entityPrefixLength(value) {
                    var prefix;

                    /* istanbul ignore if - Currently also tested for at
     * implemention, but we keep it here because that’s
     * proper. */
                    if (value.charAt(0) !== AMPERSAND) {
                        return 0;
                    }

                    prefix = value.split(AMPERSAND, 2).join(AMPERSAND);

                    return prefix.length - decode(prefix).length;
                }

                /**
 * Checks if a string starts with HTML entity.
 *
 * @example
 *   startsWithEntity('&copycat') // true
 *   startsWithEntity('&foo &amp &bar') // false
 *
 * @param {string} value - Value to check.
 * @return {number} - Whether `value` starts an entity.
 */
                function startsWithEntity(value) {
                    return entityPrefixLength(value) > 0;
                }

                /**
 * Check if `character` is a valid alignment row character.
 *
 * @example
 *   isAlignmentRowCharacter(':') // true
 *   isAlignmentRowCharacter('=') // false
 *
 * @param {string} character - Character to check.
 * @return {boolean} - Whether `character` is a valid
 *   alignment row character.
 */
                function isAlignmentRowCharacter(character) {
                    return character === COLON || character === DASH || character === SPACE || character === PIPE;
                }

                /**
 * Check if `index` in `value` is inside an alignment row.
 *
 * @example
 *   isInAlignmentRow(':--:', 2) // true
 *   isInAlignmentRow(':--:\n:-*-:', 9) // false
 *
 * @param {string} value - Value to check.
 * @param {number} index - Position in `value` to check.
 * @return {boolean} - Whether `index` in `value` is in
 *   an alignment row.
 */
                function isInAlignmentRow(value, index) {
                    var length = value.length;
                    var start = index;
                    var character;

                    while (++index < length) {
                        character = value.charAt(index);

                        if (character === LINE) {
                            break;
                        }

                        if (!isAlignmentRowCharacter(character)) {
                            return false;
                        }
                    }

                    index = start;

                    while (--index > -1) {
                        character = value.charAt(index);

                        if (character === LINE) {
                            break;
                        }

                        if (!isAlignmentRowCharacter(character)) {
                            return false;
                        }
                    }

                    return true;
                }

                /**
 * Factory to escape characters.
 *
 * @example
 *   var escape = escapeFactory({ commonmark: true });
 *   escape('x*x', { type: 'text', value: 'x*x' }) // 'x\\*x'
 *
 * @param {Object} options - Compiler options.
 * @return {function(value, node, parent): string} - Function which
 *   takes a value and a node and (optionally) its parent and returns
 *   its escaped value.
 */
                function escapeFactory(options) {
                    /**
     * Escape punctuation characters in a node's value.
     *
     * @param {string} value - Value to escape.
     * @param {Object} node - Node in which `value` exists.
     * @param {Object} [parent] - Parent of `node`.
     * @return {string} - Escaped `value`.
     */
                    return function escape(value, node, parent) {
                        var self = this;
                        var gfm = options.gfm;
                        var commonmark = options.commonmark;
                        var pedantic = options.pedantic;
                        var siblings = parent && parent.children;
                        var index = siblings && siblings.indexOf(node);
                        var prev = siblings && siblings[index - 1];
                        var next = siblings && siblings[index + 1];
                        var length = value.length;
                        var position = -1;
                        var queue = [];
                        var escaped = queue;
                        var afterNewLine;
                        var character;
                        var wordCharBefore;
                        var wordCharAfter;

                        if (prev) {
                            afterNewLine = prev.type === "text" && /\n\s*$/.test(prev.value);
                        } else if (parent) {
                            afterNewLine = parent.type === "paragraph";
                        }

                        while (++position < length) {
                            character = value.charAt(position);

                            if (
                                character === BACKSLASH ||
                                character === TICK ||
                                character === ASTERISK ||
                                character === SQUARE_BRACKET_OPEN ||
                                (character === UNDERSCORE &&
                                    /*
                     * Delegate leading/trailing underscores
                     * to the multinode version below.
                     */
                                    0 < position &&
                                    position < length - 1 &&
                                    (pedantic ||
                                        !isAlphanumeric(value.charAt(position - 1)) ||
                                        !isAlphanumeric(value.charAt(position + 1)))) ||
                                (self.inLink && character === SQUARE_BRACKET_CLOSE) ||
                                (gfm && character === PIPE && (self.inTable || isInAlignmentRow(value, position)))
                            ) {
                                afterNewLine = false;
                                queue.push(BACKSLASH);
                            } else if (character === ANGLE_BRACKET_OPEN) {
                                afterNewLine = false;

                                if (commonmark) {
                                    queue.push(BACKSLASH);
                                } else {
                                    queue.push(ENTITY_ANGLE_BRACKET_OPEN);
                                    continue;
                                }
                            } else if (
                                gfm &&
                                !self.inLink &&
                                character === COLON &&
                                (queue.slice(-6).join(EMPTY) === "mailto" ||
                                    queue.slice(-5).join(EMPTY) === "https" ||
                                    queue.slice(-4).join(EMPTY) === "http")
                            ) {
                                afterNewLine = false;

                                if (commonmark) {
                                    queue.push(BACKSLASH);
                                } else {
                                    queue.push(ENTITY_COLON);
                                    continue;
                                }
                                /* istanbul ignore if - Impossible to test with
             * the current set-up.  We need tests which try
             * to force markdown content into the tree. */
                            } else if (character === AMPERSAND && startsWithEntity(value.slice(position))) {
                                afterNewLine = false;

                                if (commonmark) {
                                    queue.push(BACKSLASH);
                                } else {
                                    queue.push(ENTITY_AMPERSAND);
                                    continue;
                                }
                            } else if (gfm && character === TILDE && value.charAt(position + 1) === TILDE) {
                                queue.push(BACKSLASH, TILDE);
                                afterNewLine = false;
                                position += 1;
                            } else if (character === LINE) {
                                afterNewLine = true;
                            } else if (afterNewLine) {
                                if (
                                    character === ANGLE_BRACKET_CLOSE ||
                                    character === HASH ||
                                    LIST_BULLETS[character]
                                ) {
                                    queue.push(BACKSLASH);
                                    afterNewLine = false;
                                } else if (
                                    character !== SPACE &&
                                    character !== TAB &&
                                    character !== CARRIAGE &&
                                    character !== VERTICAL_TAB &&
                                    character !== FORM_FEED
                                ) {
                                    afterNewLine = false;
                                }
                            }

                            queue.push(character);
                        }

                        /*
         * Multi-node versions.
         */

                        if (siblings && node.type === "text") {
                            /*
             * Check for an opening parentheses after a
             * link-reference (which can be joined by
             * white-space).
             */

                            if (prev && prev.referenceType === "shortcut") {
                                position = -1;
                                length = escaped.length;

                                while (++position < length) {
                                    character = escaped[position];

                                    if (character === SPACE || character === TAB) {
                                        continue;
                                    }

                                    if (character === PARENTHESIS_OPEN) {
                                        escaped[position] = BACKSLASH + character;
                                    }

                                    if (character === COLON) {
                                        if (commonmark) {
                                            escaped[position] = BACKSLASH + character;
                                        } else {
                                            escaped[position] = ENTITY_COLON;
                                        }
                                    }

                                    break;
                                }
                            }

                            /*
             * Ensure non-auto-links are not seen as links.
             * This pattern needs to check the preceding
             * nodes too.
             */

                            if (gfm && !self.inLink && prev && prev.type === "text" && value.charAt(0) === COLON) {
                                queue = prev.value.slice(-6);

                                if (queue === "mailto" || queue.slice(-5) === "https" || queue.slice(-4) === "http") {
                                    if (commonmark) {
                                        escaped.unshift(BACKSLASH);
                                    } else {
                                        escaped.splice(0, 1, ENTITY_COLON);
                                    }
                                }
                            }

                            /*
             * Escape ampersand if it would otherwise
             * start an entity.
             */

                            if (
                                next &&
                                next.type === "text" &&
                                value.slice(-1) === AMPERSAND &&
                                startsWithEntity(AMPERSAND + next.value)
                            ) {
                                if (commonmark) {
                                    escaped.splice(escaped.length - 1, 0, BACKSLASH);
                                } else {
                                    escaped.push("amp", SEMICOLON);
                                }
                            }

                            /*
             * Escape double tildes in GFM.
             */

                            if (
                                gfm &&
                                next &&
                                next.type === "text" &&
                                value.slice(-1) === TILDE &&
                                next.value.charAt(0) === TILDE
                            ) {
                                escaped.splice(escaped.length - 1, 0, BACKSLASH);
                            }

                            /*
             * Escape underscores, but not mid-word (unless
             * in pedantic mode).
             */

                            wordCharBefore = prev && prev.type === "text" && isAlphanumeric(prev.value.slice(-1));

                            wordCharAfter = next && next.type === "text" && isAlphanumeric(next.value.charAt(0));

                            if (length <= 1) {
                                if (value === UNDERSCORE && (pedantic || !wordCharBefore || !wordCharAfter)) {
                                    escaped.unshift(BACKSLASH);
                                }
                            } else {
                                if (
                                    value.charAt(0) === UNDERSCORE &&
                                    (pedantic ||
                                        !wordCharBefore ||
                                        /* istanbul ignore next - only for trees */
                                        !isAlphanumeric(value.charAt(1)))
                                ) {
                                    escaped.unshift(BACKSLASH);
                                }

                                if (
                                    value.slice(-1) === UNDERSCORE &&
                                    (pedantic ||
                                        !wordCharAfter ||
                                        /* istanbul ignore next - only for trees */
                                        !isAlphanumeric(value.slice(-2).charAt(0)))
                                ) {
                                    escaped.splice(escaped.length - 1, 0, BACKSLASH);
                                }
                            }
                        }

                        return escaped.join(EMPTY);
                    };
                }

                /**
 * Wrap `url` in angle brackets when needed, or when
 * forced.
 *
 * In links, images, and definitions, the URL part needs
 * to be enclosed when it:
 *
 * - has a length of `0`;
 * - contains white-space;
 * - has more or less opening than closing parentheses.
 *
 * @example
 *   encloseURI('foo bar') // '<foo bar>'
 *   encloseURI('foo(bar(baz)') // '<foo(bar(baz)>'
 *   encloseURI('') // '<>'
 *   encloseURI('example.com') // 'example.com'
 *   encloseURI('example.com', true) // '<example.com>'
 *
 * @param {string} uri - URI to enclose.
 * @param {boolean?} [always] - Force enclosing.
 * @return {boolean} - Properly enclosed `uri`.
 */
                function encloseURI(uri, always) {
                    if (
                        always ||
                        !uri.length ||
                        EXPRESSIONS_WHITE_SPACE.test(uri) ||
                        ccount(uri, PARENTHESIS_OPEN) !== ccount(uri, PARENTHESIS_CLOSE)
                    ) {
                        return ANGLE_BRACKET_OPEN + uri + ANGLE_BRACKET_CLOSE;
                    }

                    return uri;
                }

                /**
 * There is currently no way to support nested delimiters
 * across Markdown.pl, CommonMark, and GitHub (RedCarpet).
 * The following code supports Markdown.pl and GitHub.
 * CommonMark is not supported when mixing double- and
 * single quotes inside a title.
 *
 * @see https://github.com/vmg/redcarpet/issues/473
 * @see https://github.com/jgm/CommonMark/issues/308
 *
 * @example
 *   encloseTitle('foo') // '"foo"'
 *   encloseTitle('foo \'bar\' baz') // '"foo \'bar\' baz"'
 *   encloseTitle('foo "bar" baz') // '\'foo "bar" baz\''
 *   encloseTitle('foo "bar" \'baz\'') // '"foo "bar" \'baz\'"'
 *
 * @param {string} title - Content.
 * @return {string} - Properly enclosed title.
 */
                function encloseTitle(title) {
                    var delimiter = QUOTE_DOUBLE;

                    if (title.indexOf(delimiter) !== -1) {
                        delimiter = QUOTE_SINGLE;
                    }

                    return delimiter + title + delimiter;
                }

                /**
 * Pad `value` with `level * INDENT` spaces.  Respects
 * lines. Ignores empty lines.
 *
 * @example
 *   pad('foo', 1) // '    foo'
 *
 * @param {string} value - Content.
 * @param {number} level - Indentation level.
 * @return {string} - Padded `value`.
 */
                function pad(value, level) {
                    var index;
                    var padding;

                    value = value.split(LINE);

                    index = value.length;
                    padding = repeat(SPACE, level * INDENT);

                    while (index--) {
                        if (value[index].length !== 0) {
                            value[index] = padding + value[index];
                        }
                    }

                    return value.join(LINE);
                }

                /**
 * Construct a new compiler.
 *
 * @example
 *   var compiler = new Compiler(new File('> foo.'));
 *
 * @constructor
 * @class {Compiler}
 * @param {File} file - Virtual file.
 * @param {Object?} [options] - Passed to
 *   `Compiler#setOptions()`.
 */
                function Compiler(file, options) {
                    var self = this;

                    self.file = file;

                    self.options = extend({}, self.options);

                    self.setOptions(options);
                }

                /*
 * Cache prototype.
 */

                var compilerPrototype = Compiler.prototype;

                /*
 * Expose defaults.
 */

                compilerPrototype.options = defaultOptions;

                /*
 * Expose visitors.
 */

                var visitors = (compilerPrototype.visitors = {});

                /*
 * Map of applicable enum's.
 */

                var maps = {
                    entities: ENTITY_OPTIONS,
                    bullet: LIST_BULLETS,
                    rule: THEMATIC_BREAK_BULLETS,
                    listItemIndent: LIST_ITEM_INDENTS,
                    emphasis: EMPHASIS_MARKERS,
                    strong: EMPHASIS_MARKERS,
                    fence: FENCE_MARKERS
                };

                /**
 * Set options.  Does not overwrite previously set
 * options.
 *
 * @example
 *   var compiler = new Compiler();
 *   compiler.setOptions({bullet: '*'});
 *
 * @this {Compiler}
 * @throws {Error} - When an option is invalid.
 * @param {Object?} [options] - Stringify settings.
 * @return {Compiler} - `self`.
 */
                compilerPrototype.setOptions = function(options) {
                    var self = this;
                    var current = self.options;
                    var ruleRepetition;
                    var key;

                    if (options === null || options === undefined) {
                        options = {};
                    } else if (typeof options === "object") {
                        options = extend({}, options);
                    } else {
                        throw new Error("Invalid value `" + options + "` " + "for setting `options`");
                    }

                    for (key in defaultOptions) {
                        validate[typeof current[key]](options, key, current[key], maps[key]);
                    }

                    ruleRepetition = options.ruleRepetition;

                    if (ruleRepetition && ruleRepetition < MINIMUM_RULE_LENGTH) {
                        raise(ruleRepetition, "options.ruleRepetition");
                    }

                    self.encode = encodeFactory(String(options.entities));
                    self.escape = escapeFactory(options);

                    self.options = options;

                    return self;
                };

                /*
 * Enter and exit helpers.
 */

                compilerPrototype.enterLink = toggler("inLink", false);
                compilerPrototype.enterTable = toggler("inTable", false);

                /**
 * Shortcut and collapsed link references need no escaping
 * and encoding during the processing of child nodes (it
 * must be implied from identifier).
 *
 * This toggler turns encoding and escaping off for shortcut
 * and collapsed references.
 *
 * Implies `enterLink`.
 *
 * @param {Compiler} compiler - Compiler instance.
 * @param {LinkReference} node - LinkReference node.
 * @return {Function} - Exit state.
 */
                compilerPrototype.enterLinkReference = function(compiler, node) {
                    var encode = compiler.encode;
                    var escape = compiler.escape;
                    var exitLink = compiler.enterLink();

                    if (node.referenceType === "shortcut" || node.referenceType === "collapsed") {
                        compiler.encode = compiler.escape = encodeNoop;
                        return function() {
                            compiler.encode = encode;
                            compiler.escape = escape;
                            exitLink();
                        };
                    } else {
                        return exitLink;
                    }
                };

                /**
 * Visit a node.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visit({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '**Foo**'
 *
 * @param {Object} node - Node.
 * @param {Object?} [parent] - `node`s parent.
 * @return {string} - Compiled `node`.
 */
                compilerPrototype.visit = function(node, parent) {
                    var self = this;

                    /*
     * Fail on unknown nodes.
     */

                    if (typeof self.visitors[node.type] !== "function") {
                        self.file.fail("Missing compiler for node of type `" + node.type + "`: `" + node + "`", node);
                    }

                    return self.visitors[node.type].call(self, node, parent);
                };

                /**
 * Visit all children of `parent`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.all({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     },
 *     {
 *       type: 'text',
 *       value: 'Bar'
 *     }]
 *   });
 *   // ['Foo', 'Bar']
 *
 * @param {Object} parent - Parent node of children.
 * @return {Array.<string>} - List of compiled children.
 */
                compilerPrototype.all = function(parent) {
                    var self = this;
                    var children = parent.children;
                    var values = [];
                    var index = 0;
                    var length = children.length;
                    var mergedLength = 1;
                    var node = children[0];
                    var next;

                    if (length === 0) {
                        return values;
                    }

                    while (++index < length) {
                        next = children[index];

                        if (node.type === next.type && node.type === "text" && mergeable(node) && mergeable(next)) {
                            node.value += next.value;
                        } else {
                            values.push(self.visit(node, parent));
                            node = next;
                            children[mergedLength++] = node;
                        }
                    }

                    values.push(self.visit(node, parent));
                    children.length = mergedLength;

                    return values;
                };

                /**
 * Visit ordered list items.
 *
 * Starts the list with
 * `node.start` and increments each following list item
 * bullet by one:
 *
 *     2. foo
 *     3. bar
 *
 * In `incrementListMarker: false` mode, does not increment
 * each marker and stays on `node.start`:
 *
 *     1. foo
 *     1. bar
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitOrderedItems({
 *     type: 'list',
 *     ordered: true,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '1.  bar'
 *
 * @param {Object} node - `list` node with
 *   `ordered: true`.
 * @return {string} - Markdown list.
 */
                compilerPrototype.visitOrderedItems = function(node) {
                    var self = this;
                    var increment = self.options.incrementListMarker;
                    var values = [];
                    var start = node.start;
                    var children = node.children;
                    var length = children.length;
                    var index = -1;
                    var bullet;
                    var fn = self.visitors.listItem;

                    while (++index < length) {
                        bullet = (increment ? start + index : start) + DOT;
                        values[index] = fn.call(self, children[index], node, index, bullet);
                    }

                    return values.join(LINE);
                };

                /**
 * Visit unordered list items.
 *
 * Uses `options.bullet` as each item's bullet.
 *
 * Adds an extra line after an item if it has
 * `loose: true`.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitUnorderedItems({
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '-   bar'
 *
 * @param {Object} node - `list` node with
 *   `ordered: false`.
 * @return {string} - Markdown list.
 */
                compilerPrototype.visitUnorderedItems = function(node) {
                    var self = this;
                    var values = [];
                    var children = node.children;
                    var length = children.length;
                    var index = -1;
                    var bullet = self.options.bullet;
                    var fn = self.visitors.listItem;

                    while (++index < length) {
                        values[index] = fn.call(self, children[index], node, index, bullet);
                    }

                    return values.join(LINE);
                };

                /**
 * Stringify a block node with block children (e.g., `root`
 * or `blockquote`).
 *
 * Knows about code following a list, or adjacent lists
 * with similar bullets, and places an extra newline
 * between them.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.block({
 *     type: 'root',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // 'bar'
 *
 * @param {Object} node - `root` node.
 * @return {string} - Markdown block content.
 */
                compilerPrototype.block = function(node) {
                    var self = this;
                    var values = [];
                    var children = node.children;
                    var length = children.length;
                    var index = -1;
                    var child;
                    var prev;

                    while (++index < length) {
                        child = children[index];

                        if (prev) {
                            /*
             * Duplicate nodes, such as a list
             * directly following another list,
             * often need multiple new lines.
             *
             * Additionally, code blocks following a list
             * might easily be mistaken for a paragraph
             * in the list itself.
             */

                            if (child.type === prev.type && prev.type === "list") {
                                values.push(prev.ordered === child.ordered ? GAP : BREAK);
                            } else if (prev.type === "list" && child.type === "code" && !child.lang) {
                                values.push(GAP);
                            } else {
                                values.push(BREAK);
                            }
                        }

                        values.push(self.visit(child, node));

                        prev = child;
                    }

                    return values.join(EMPTY);
                };

                /**
 * Stringify a root.
 *
 * Adds a final newline to ensure valid POSIX files.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.root({
 *     type: 'root',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // 'bar'
 *
 * @param {Object} node - `root` node.
 * @return {string} - Markdown document.
 */
                visitors.root = function(node) {
                    return this.block(node) + LINE;
                };

                /**
 * Stringify a heading.
 *
 * In `setext: true` mode and when `depth` is smaller than
 * three, creates a setext header:
 *
 *     Foo
 *     ===
 *
 * Otherwise, an ATX header is generated:
 *
 *     ### Foo
 *
 * In `closeAtx: true` mode, the header is closed with
 * hashes:
 *
 *     ### Foo ###
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.heading({
 *     type: 'heading',
 *     depth: 2,
 *     children: [{
 *       type: 'strong',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '## **bar**'
 *
 * @param {Object} node - `heading` node.
 * @return {string} - Markdown heading.
 */
                visitors.heading = function(node) {
                    var self = this;
                    var setext = self.options.setext;
                    var closeAtx = self.options.closeAtx;
                    var depth = node.depth;
                    var content = self.all(node).join(EMPTY);
                    var prefix;

                    if (setext && depth < 3) {
                        return content + LINE + repeat(depth === 1 ? EQUALS : DASH, content.length);
                    }

                    prefix = repeat(HASH, node.depth);
                    content = prefix + SPACE + content;

                    if (closeAtx) {
                        content += SPACE + prefix;
                    }

                    return content;
                };

                /**
 * Stringify text.
 *
 * Supports named entities in `settings.encode: true` mode:
 *
 *     AT&amp;T
 *
 * Supports numbered entities in `settings.encode: numbers`
 * mode:
 *
 *     AT&#x26;T
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.text({
 *     type: 'text',
 *     value: 'foo'
 *   });
 *   // 'foo'
 *
 * @param {Object} node - `text` node.
 * @param {Object} parent - Parent of `node`.
 * @return {string} - Raw markdown text.
 */
                visitors.text = function(node, parent) {
                    return this.encode(this.escape(node.value, node, parent), node);
                };

                /**
 * Stringify a paragraph.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.paragraph({
 *     type: 'paragraph',
 *     children: [{
 *       type: 'strong',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '**bar**'
 *
 * @param {Object} node - `paragraph` node.
 * @return {string} - Markdown paragraph.
 */
                visitors.paragraph = function(node) {
                    return this.all(node).join(EMPTY);
                };

                /**
 * Stringify a block quote.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.paragraph({
 *     type: 'blockquote',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'strong',
 *         children: [{
 *           type: 'text',
 *           value: 'bar'
 *         }]
 *       }]
 *     }]
 *   });
 *   // '> **bar**'
 *
 * @param {Object} node - `blockquote` node.
 * @return {string} - Markdown block quote.
 */
                visitors.blockquote = function(node) {
                    var values = this.block(node).split(LINE);
                    var result = [];
                    var length = values.length;
                    var index = -1;
                    var value;

                    while (++index < length) {
                        value = values[index];
                        result[index] = (value ? SPACE : EMPTY) + value;
                    }

                    return ANGLE_BRACKET_CLOSE + result.join(LINE + ANGLE_BRACKET_CLOSE);
                };

                /**
 * Stringify a list. See `Compiler#visitOrderedList()` and
 * `Compiler#visitUnorderedList()` for internal working.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.visitUnorderedItems({
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '-   bar'
 *
 * @param {Object} node - `list` node.
 * @return {string} - Markdown list.
 */
                visitors.list = function(node) {
                    return this[ORDERED_MAP[node.ordered]](node);
                };

                /**
 * Stringify a list item.
 *
 * Prefixes the content with a checked checkbox when
 * `checked: true`:
 *
 *     [x] foo
 *
 * Prefixes the content with an unchecked checkbox when
 * `checked: false`:
 *
 *     [ ] foo
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.listItem({
 *     type: 'listItem',
 *     checked: true,
 *     children: [{
 *       type: 'text',
 *       value: 'bar'
 *     }]
 *   }, {
 *     type: 'list',
 *     ordered: false,
 *     children: [{
 *       type: 'listItem',
 *       checked: true,
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   }, 0, '*');
 *   '-   [x] bar'
 *
 * @param {Object} node - `listItem` node.
 * @param {Object} parent - `list` node.
 * @param {number} position - Index of `node` in `parent`.
 * @param {string} bullet - Bullet to use.  This, and the
 *   `listItemIndent` setting define the used indent.
 * @return {string} - Markdown list item.
 */
                visitors.listItem = function(node, parent, position, bullet) {
                    var self = this;
                    var style = self.options.listItemIndent;
                    var children = node.children;
                    var values = [];
                    var index = -1;
                    var length = children.length;
                    var loose = node.loose;
                    var value;
                    var indent;
                    var spacing;

                    while (++index < length) {
                        values[index] = self.visit(children[index], node);
                    }

                    value = CHECKBOX_MAP[node.checked] + values.join(loose ? BREAK : LINE);

                    if (style === LIST_ITEM_ONE || (style === LIST_ITEM_MIXED && value.indexOf(LINE) === -1)) {
                        indent = bullet.length + 1;
                        spacing = SPACE;
                    } else {
                        indent = Math.ceil((bullet.length + 1) / INDENT) * INDENT;
                        spacing = repeat(SPACE, indent - bullet.length);
                    }

                    value = bullet + spacing + pad(value, indent / INDENT).slice(indent);

                    if (loose && parent.children.length - 1 !== position) {
                        value += LINE;
                    }

                    return value;
                };

                /**
 * Stringify inline code.
 *
 * Knows about internal ticks (`\``), and ensures one more
 * tick is used to enclose the inline code:
 *
 *     ```foo ``bar`` baz```
 *
 * Even knows about inital and final ticks:
 *
 *     `` `foo ``
 *     `` foo` ``
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.inlineCode({
 *     type: 'inlineCode',
 *     value: 'foo(); `bar`; baz()'
 *   });
 *   // '``foo(); `bar`; baz()``'
 *
 * @param {Object} node - `inlineCode` node.
 * @return {string} - Markdown inline code.
 */
                visitors.inlineCode = function(node) {
                    var value = node.value;
                    var ticks = repeat(TICK, longestStreak(value, TICK) + 1);
                    var start = ticks;
                    var end = ticks;

                    if (value.charAt(0) === TICK) {
                        start += SPACE;
                    }

                    if (value.charAt(value.length - 1) === TICK) {
                        end = SPACE + end;
                    }

                    return start + node.value + end;
                };

                /**
 * Stringify YAML front matter.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.yaml({
 *     type: 'yaml',
 *     value: 'foo: bar'
 *   });
 *   // '---\nfoo: bar\n---'
 *
 * @param {Object} node - `yaml` node.
 * @return {string} - Markdown YAML document.
 */
                visitors.yaml = function(node) {
                    var delimiter = repeat(DASH, YAML_FENCE_LENGTH);
                    var value = node.value ? LINE + node.value : EMPTY;

                    return delimiter + value + LINE + delimiter;
                };

                /**
 * Stringify a code block.
 *
 * Creates indented code when:
 *
 * - No language tag exists;
 * - Not in `fences: true` mode;
 * - A non-empty value exists.
 *
 * Otherwise, GFM fenced code is created:
 *
 *     ```js
 *     foo();
 *     ```
 *
 * When in ``fence: `~` `` mode, uses tildes as fences:
 *
 *     ~~~js
 *     foo();
 *     ~~~
 *
 * Knows about internal fences (Note: GitHub/Kramdown does
 * not support this):
 *
 *     ````javascript
 *     ```markdown
 *     foo
 *     ```
 *     ````
 *
 * Supports named entities in the language flag with
 * `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.code({
 *     type: 'code',
 *     lang: 'js',
 *     value: 'fooo();'
 *   });
 *   // '```js\nfooo();\n```'
 *
 * @param {Object} node - `code` node.
 * @param {Object} parent - Parent of `node`.
 * @return {string} - Markdown code block.
 */
                visitors.code = function(node, parent) {
                    var self = this;
                    var value = node.value;
                    var options = self.options;
                    var marker = options.fence;
                    var language = self.encode(node.lang || EMPTY, node);
                    var fence;

                    /*
     * Without (needed) fences.
     */

                    if (!language && !options.fences && value) {
                        /*
         * Throw when pedantic, in a list item which
         * isn’t compiled using a tab.
         */

                        if (
                            parent &&
                            parent.type === "listItem" &&
                            options.listItemIndent !== LIST_ITEM_TAB &&
                            options.pedantic
                        ) {
                            self.file.fail(ERROR_LIST_ITEM_INDENT, node.position);
                        }

                        return pad(value, 1);
                    }

                    fence = longestStreak(value, marker) + 1;

                    /*
     * Fix GFM / RedCarpet bug, where fence-like characters
     * inside fenced code can exit a code-block.
     * Yes, even when the outer fence uses different
     * characters, or is longer.
     * Thus, we can only pad the code to make it work.
     */

                    if (FENCE.test(value)) {
                        value = pad(value, 1);
                    }

                    fence = repeat(marker, Math.max(fence, MINIMUM_CODE_FENCE_LENGTH));

                    return fence + language + LINE + value + LINE + fence;
                };

                /**
 * Stringify HTML.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.html({
 *     type: 'html',
 *     value: '<div>bar</div>'
 *   });
 *   // '<div>bar</div>'
 *
 * @param {Object} node - `html` node.
 * @return {string} - Markdown HTML.
 */
                visitors.html = function(node) {
                    return node.value;
                };

                /**
 * Stringify a horizontal rule.
 *
 * The character used is configurable by `rule`: (`'_'`)
 *
 *     ___
 *
 * The number of repititions is defined through
 * `ruleRepetition`: (`6`)
 *
 *     ******
 *
 * Whether spaces delimit each character, is configured
 * through `ruleSpaces`: (`true`)
 *
 *     * * *
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.thematicBreak({
 *     type: 'thematicBreak'
 *   });
 *   // '***'
 *
 * @return {string} - Markdown rule.
 */
                visitors.thematicBreak = function() {
                    var options = this.options;
                    var rule = repeat(options.rule, options.ruleRepetition);

                    if (options.ruleSpaces) {
                        rule = rule.split(EMPTY).join(SPACE);
                    }

                    return rule;
                };

                /**
 * Stringify a strong.
 *
 * The marker used is configurable by `strong`, which
 * defaults to an asterisk (`'*'`) but also accepts an
 * underscore (`'_'`):
 *
 *     _foo_
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.strong({
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '**Foo**'
 *
 * @param {Object} node - `strong` node.
 * @return {string} - Markdown strong-emphasised text.
 */
                visitors.strong = function(node) {
                    var marker = this.options.strong;

                    marker = marker + marker;

                    return marker + this.all(node).join(EMPTY) + marker;
                };

                /**
 * Stringify an emphasis.
 *
 * The marker used is configurable by `emphasis`, which
 * defaults to an underscore (`'_'`) but also accepts an
 * asterisk (`'*'`):
 *
 *     *foo*
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.emphasis({
 *     type: 'emphasis',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '_Foo_'
 *
 * @param {Object} node - `emphasis` node.
 * @return {string} - Markdown emphasised text.
 */
                visitors.emphasis = function(node) {
                    var marker = this.options.emphasis;

                    return marker + this.all(node).join(EMPTY) + marker;
                };

                /**
 * Stringify a hard break.
 *
 * In Commonmark mode, trailing backslash form is used in order
 * to preserve trailing whitespace that the line may end with,
 * and also for better visibility.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.break({
 *     type: 'break'
 *   });
 *   // '  \n'
 *
 * @return {string} - Hard markdown break.
 */
                visitors.break = function() {
                    return this.options.commonmark ? BACKSLASH + LINE : SPACE + SPACE + LINE;
                };

                /**
 * Stringify a delete.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.delete({
 *     type: 'delete',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '~~Foo~~'
 *
 * @param {Object} node - `delete` node.
 * @return {string} - Markdown strike-through.
 */
                visitors.delete = function(node) {
                    return DOUBLE_TILDE + this.all(node).join(EMPTY) + DOUBLE_TILDE;
                };

                /**
 * Stringify a link.
 *
 * When no title exists, the compiled `children` equal
 * `url`, and `url` starts with a protocol, an auto
 * link is created:
 *
 *     <http://example.com>
 *
 * Otherwise, is smart about enclosing `url` (see
 * `encloseURI()`) and `title` (see `encloseTitle()`).
 *
 *    [foo](<foo at bar dot com> 'An "example" e-mail')
 *
 * Supports named entities in the `url` and `title` when
 * in `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.link({
 *     type: 'link',
 *     url: 'http://example.com',
 *     title: 'Example Domain',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[Foo](http://example.com "Example Domain")'
 *
 * @param {Object} node - `link` node.
 * @return {string} - Markdown link.
 */
                visitors.link = function(node) {
                    var self = this;
                    var url = self.encode(node.url, node);
                    var exit = self.enterLink();
                    var escapedURL = self.encode(self.escape(node.url, node));
                    var value = self.all(node).join(EMPTY);

                    exit();

                    if (
                        node.title === null &&
                        PROTOCOL.test(url) &&
                        (escapedURL === value || escapedURL === MAILTO + value)
                    ) {
                        /*
         * Backslash escapes do not work in autolinks,
         * so we do not escape.
         */

                        return encloseURI(self.encode(node.url), true);
                    }

                    url = encloseURI(url);

                    if (node.title) {
                        url += SPACE + encloseTitle(self.encode(self.escape(node.title, node), node));
                    }

                    value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;

                    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;

                    return value;
                };

                /**
 * Stringify a link label.
 *
 * Because link references are easily, mistakingly,
 * created (for example, `[foo]`), reference nodes have
 * an extra property depicting how it looked in the
 * original document, so stringification can cause minimal
 * changes.
 *
 * @example
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'full',
 *     identifier: 'foo'
 *   });
 *   // '[foo]'
 *
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'collapsed',
 *     identifier: 'foo'
 *   });
 *   // '[]'
 *
 *   label({
 *     type: 'referenceImage',
 *     referenceType: 'shortcut',
 *     identifier: 'foo'
 *   });
 *   // ''
 *
 * @param {Object} node - `linkReference` or
 *   `imageReference` node.
 * @return {string} - Markdown label reference.
 */
                function label(node) {
                    var value = EMPTY;
                    var type = node.referenceType;

                    if (type === "full") {
                        value = node.identifier;
                    }

                    if (type !== "shortcut") {
                        value = SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE;
                    }

                    return value;
                }

                /**
 * For shortcut and collapsed reference links, the contents
 * is also an identifier, so we need to restore the original
 * encoding and escaping that were present in the source
 * string.
 *
 * This function takes the unescaped & unencoded value from
 * shortcut's child nodes and the identifier and encodes
 * the former according to the latter.
 *
 * @example
 *   copyIdentifierEncoding('a*b', 'a\\*b*c')
 *   // 'a\\*b*c'
 *
 * @param {string} value - Unescaped and unencoded stringified
 *   link value.
 * @param {string} identifier - Link identifier.
 * @return {string} - Encoded link value.
 */
                function copyIdentifierEncoding(value, identifier) {
                    var index = 0;
                    var position = 0;
                    var length = value.length;
                    var count = identifier.length;
                    var result = [];
                    var start;

                    while (index < length) {
                        /*
         * Take next non-punctuation characters from `value`.
         */

                        start = index;

                        while (index < length && !PUNCTUATION.test(value.charAt(index))) {
                            index += 1;
                        }

                        result.push(value.slice(start, index));

                        /*
         * Advance `position` to the next punctuation character.
         */
                        while (position < count && !PUNCTUATION.test(identifier.charAt(position))) {
                            position += 1;
                        }

                        /*
         * Take next punctuation characters from `identifier`.
         */
                        start = position;

                        while (position < count && PUNCTUATION.test(identifier.charAt(position))) {
                            if (identifier.charAt(position) === AMPERSAND) {
                                position += entityPrefixLength(identifier.slice(position));
                            }
                            position += 1;
                        }

                        result.push(identifier.slice(start, position));

                        /*
         * Advance `index` to the next non-punctuation character.
         */
                        while (index < length && PUNCTUATION.test(value.charAt(index))) {
                            index += 1;
                        }
                    }

                    return result.join(EMPTY);
                }

                /**
 * Stringify a link reference.
 *
 * See `label()` on how reference labels are created.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.linkReference({
 *     type: 'linkReference',
 *     referenceType: 'collapsed',
 *     identifier: 'foo',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[Foo][]'
 *
 * @param {Object} node - `linkReference` node.
 * @return {string} - Markdown link reference.
 */
                visitors.linkReference = function(node) {
                    var self = this;
                    var exitLinkReference = self.enterLinkReference(self, node);
                    var value = self.all(node).join(EMPTY);

                    exitLinkReference();

                    if (node.referenceType === "shortcut" || node.referenceType === "collapsed") {
                        value = copyIdentifierEncoding(value, node.identifier);
                    }

                    return SQUARE_BRACKET_OPEN + value + SQUARE_BRACKET_CLOSE + label(node);
                };

                /**
 * Stringify an image reference.
 *
 * See `label()` on how reference labels are created.
 *
 * Supports named entities in the `alt` when
 * in `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.imageReference({
 *     type: 'imageReference',
 *     referenceType: 'full',
 *     identifier: 'foo',
 *     alt: 'Foo'
 *   });
 *   // '![Foo][foo]'
 *
 * @param {Object} node - `imageReference` node.
 * @return {string} - Markdown image reference.
 */
                visitors.imageReference = function(node) {
                    var alt = this.encode(node.alt, node) || EMPTY;

                    return EXCLAMATION_MARK + SQUARE_BRACKET_OPEN + alt + SQUARE_BRACKET_CLOSE + label(node);
                };

                /**
 * Stringify a footnote reference.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnoteReference({
 *     type: 'footnoteReference',
 *     identifier: 'foo'
 *   });
 *   // '[^foo]'
 *
 * @param {Object} node - `footnoteReference` node.
 * @return {string} - Markdown footnote reference.
 */
                visitors.footnoteReference = function(node) {
                    return SQUARE_BRACKET_OPEN + CARET + node.identifier + SQUARE_BRACKET_CLOSE;
                };

                /**
 * Stringify a link- or image definition.
 *
 * Is smart about enclosing `url` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    [foo]: <foo at bar dot com> 'An "example" e-mail'
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.definition({
 *     type: 'definition',
 *     url: 'http://example.com',
 *     title: 'Example Domain',
 *     identifier: 'foo'
 *   });
 *   // '[foo]: http://example.com "Example Domain"'
 *
 * @param {Object} node - `definition` node.
 * @return {string} - Markdown link- or image definition.
 */
                visitors.definition = function(node) {
                    var value = SQUARE_BRACKET_OPEN + node.identifier + SQUARE_BRACKET_CLOSE;
                    var url = encloseURI(node.url);

                    if (node.title) {
                        url += SPACE + encloseTitle(node.title);
                    }

                    return value + COLON + SPACE + url;
                };

                /**
 * Stringify an image.
 *
 * Is smart about enclosing `url` (see `encloseURI()`) and
 * `title` (see `encloseTitle()`).
 *
 *    ![foo](</fav icon.png> 'My "favourite" icon')
 *
 * Supports named entities in `url`, `alt`, and `title`
 * when in `settings.encode` mode.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.image({
 *     type: 'image',
 *     url: 'http://example.png/favicon.png',
 *     title: 'Example Icon',
 *     alt: 'Foo'
 *   });
 *   // '![Foo](http://example.png/favicon.png "Example Icon")'
 *
 * @param {Object} node - `image` node.
 * @return {string} - Markdown image.
 */
                visitors.image = function(node) {
                    var url = encloseURI(this.encode(node.url, node));
                    var value;

                    if (node.title) {
                        url += SPACE + encloseTitle(this.encode(node.title, node));
                    }

                    value =
                        EXCLAMATION_MARK +
                        SQUARE_BRACKET_OPEN +
                        this.encode(node.alt || EMPTY, node) +
                        SQUARE_BRACKET_CLOSE;

                    value += PARENTHESIS_OPEN + url + PARENTHESIS_CLOSE;

                    return value;
                };

                /**
 * Stringify a footnote.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnote({
 *     type: 'footnote',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *   // '[^Foo]'
 *
 * @param {Object} node - `footnote` node.
 * @return {string} - Markdown footnote.
 */
                visitors.footnote = function(node) {
                    return SQUARE_BRACKET_OPEN + CARET + this.all(node).join(EMPTY) + SQUARE_BRACKET_CLOSE;
                };

                /**
 * Stringify a footnote definition.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.footnoteDefinition({
 *     type: 'footnoteDefinition',
 *     identifier: 'foo',
 *     children: [{
 *       type: 'paragraph',
 *       children: [{
 *         type: 'text',
 *         value: 'bar'
 *       }]
 *     }]
 *   });
 *   // '[^foo]: bar'
 *
 * @param {Object} node - `footnoteDefinition` node.
 * @return {string} - Markdown footnote definition.
 */
                visitors.footnoteDefinition = function(node) {
                    var id = node.identifier.toLowerCase();

                    return (
                        SQUARE_BRACKET_OPEN +
                        CARET +
                        id +
                        SQUARE_BRACKET_CLOSE +
                        COLON +
                        SPACE +
                        this.all(node).join(BREAK + repeat(SPACE, INDENT))
                    );
                };

                /**
 * Stringify table.
 *
 * Creates a fenced table by default, but not in
 * `looseTable: true` mode:
 *
 *     Foo | Bar
 *     :-: | ---
 *     Baz | Qux
 *
 * NOTE: Be careful with `looseTable: true` mode, as a
 * loose table inside an indented code block on GitHub
 * renders as an actual table!
 *
 * Creates a spaces table by default, but not in
 * `spacedTable: false`:
 *
 *     |Foo|Bar|
 *     |:-:|---|
 *     |Baz|Qux|
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.table({
 *     type: 'table',
 *     align: ['center', null],
 *     children: [
 *       {
 *         type: 'tableRow',
 *         children: [
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Foo'
 *             }]
 *           },
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Bar'
 *             }]
 *           }
 *         ]
 *       },
 *       {
 *         type: 'tableRow',
 *         children: [
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Baz'
 *             }]
 *           },
 *           {
 *             type: 'tableCell'
 *             children: [{
 *               type: 'text'
 *               value: 'Qux'
 *             }]
 *           }
 *         ]
 *       }
 *     ]
 *   });
 *   // '| Foo | Bar |\n| :-: | --- |\n| Baz | Qux |'
 *
 * @param {Object} node - `table` node.
 * @return {string} - Markdown table.
 */
                visitors.table = function(node) {
                    var self = this;
                    var loose = self.options.looseTable;
                    var spaced = self.options.spacedTable;
                    var rows = node.children;
                    var index = rows.length;
                    var exit = self.enterTable();
                    var result = [];
                    var start;

                    while (index--) {
                        result[index] = self.all(rows[index]);
                    }

                    exit();

                    start = loose ? EMPTY : spaced ? PIPE + SPACE : PIPE;

                    return table(result, {
                        align: node.align,
                        start: start,
                        end: start
                            .split(EMPTY)
                            .reverse()
                            .join(EMPTY),
                        delimiter: spaced ? SPACE + PIPE + SPACE : PIPE
                    });
                };

                /**
 * Stringify a table cell.
 *
 * @example
 *   var compiler = new Compiler();
 *
 *   compiler.tableCell({
 *     type: 'tableCell',
 *     children: [{
 *       type: 'text'
 *       value: 'Qux'
 *     }]
 *   });
 *   // 'Qux'
 *
 * @param {Object} node - `tableCell` node.
 * @return {string} - Markdown table cell.
 */
                visitors.tableCell = function(node) {
                    return this.all(node).join(EMPTY);
                };

                /**
 * Stringify the bound file.
 *
 * @example
 *   var file = new VFile('__Foo__');
 *
 *   file.namespace('mdast').tree = {
 *     type: 'strong',
 *     children: [{
 *       type: 'text',
 *       value: 'Foo'
 *     }]
 *   });
 *
 *   new Compiler(file).compile();
 *   // '**Foo**'
 *
 * @this {Compiler}
 * @param {Node} node - Syntax tree.
 * @return {string} - Markdown document.
 */
                compilerPrototype.compile = function(node) {
                    return this.visit(node);
                };

                /*
 * Expose `stringify` on `module.exports`.
 */

                module.exports = Compiler;
            },
            {
                "./defaults.js": 39,
                ccount: 10,
                extend: 24,
                "longest-streak": 27,
                "markdown-table": 28,
                "parse-entities": 31,
                "repeat-string": 41,
                "stringify-entities": 42
            }
        ],
        39: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark:stringify:defaults
 * @fileoverview Default options for `stringify`.
 */

                "use strict";

                /* eslint-env commonjs */

                module.exports = {
                    gfm: true,
                    commonmark: false,
                    pedantic: false,
                    entities: "false",
                    setext: false,
                    closeAtx: false,
                    looseTable: false,
                    spacedTable: true,
                    incrementListMarker: true,
                    fences: false,
                    fence: "`",
                    bullet: "-",
                    listItemIndent: "tab",
                    rule: "*",
                    ruleSpaces: true,
                    ruleRepetition: 3,
                    strong: "*",
                    emphasis: "_"
                };
            },
            {}
        ],
        40: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015-2016 Titus Wormer
 * @license MIT
 * @module remark
 * @fileoverview Markdown processor powered by plugins.
 */

                "use strict";

                /* eslint-env commonjs */

                /* Dependencies. */
                var unified = require("unified");
                var parse = require("remark-parse");
                var stringify = require("remark-stringify");

                /* Expose. */
                module.exports = unified()
                    .use(parse)
                    .use(stringify)
                    .abstract();
            },
            { "remark-parse": 32, "remark-stringify": 37, unified: 50 }
        ],
        41: [
            function(require, module, exports) {
                /*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

                "use strict";

                /**
 * Results cache
 */

                var res = "";
                var cache;

                /**
 * Expose `repeat`
 */

                module.exports = repeat;

                /**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

                function repeat(str, num) {
                    if (typeof str !== "string") {
                        throw new TypeError("repeat-string expects a string.");
                    }

                    // cover common, quick use cases
                    if (num === 1) return str;
                    if (num === 2) return str + str;

                    var max = str.length * num;
                    if (cache !== str || typeof cache === "undefined") {
                        cache = str;
                        res = "";
                    }

                    while (max > res.length && num > 0) {
                        if (num & 1) {
                            res += str;
                        }

                        num >>= 1;
                        if (!num) break;
                        str += str;
                    }

                    return res.substr(0, max);
                }
            },
            {}
        ],
        42: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module stringify-entities
 * @fileoverview Encode HTML character references and character entities.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Dependencies.
 */

                var entities = require("character-entities-html4");
                var EXPRESSION_NAMED = require("./lib/expression.js");

                /*
 * Methods.
 */

                var has = {}.hasOwnProperty;

                /*
 * List of enforced escapes.
 */

                var escapes = ['"', "'", "<", ">", "&", "`"];

                /*
 * Map of characters to names.
 */

                var characters = {};

                (function() {
                    var name;

                    for (name in entities) {
                        characters[entities[name]] = name;
                    }
                })();

                /*
 * Regular expressions.
 */

                var EXPRESSION_ESCAPE = new RegExp("[" + escapes.join("") + "]", "g");
                var EXPRESSION_SURROGATE_PAIR = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
                var EXPRESSION_BMP = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

                /**
 * Transform `code` into a hexadecimal character reference.
 *
 * @param {number} code - Number to encode.
 * @return {string} - `code` encoded as hexadecimal.
 */
                function characterCodeToHexadecimalReference(code) {
                    return "&#x" + code.toString(16).toUpperCase() + ";";
                }

                /**
 * Transform `character` into a hexadecimal character
 * reference.
 *
 * @param {string} character - Character to encode.
 * @return {string} - `character` encoded as hexadecimal.
 */
                function characterToHexadecimalReference(character) {
                    return characterCodeToHexadecimalReference(character.charCodeAt(0));
                }

                /**
 * Transform `code` into an entity.
 *
 * @param {string} name - Name to wrap.
 * @return {string} - `name` encoded as hexadecimal.
 */
                function toNamedEntity(name) {
                    return "&" + name + ";";
                }

                /**
 * Transform `code` into an entity.
 *
 * @param {string} character - Character to encode.
 * @return {string} - `name` encoded as hexadecimal.
 */
                function characterToNamedEntity(character) {
                    return toNamedEntity(characters[character]);
                }

                /**
 * Encode special characters in `value`.
 *
 * @param {string} value - Value to encode.
 * @param {Object?} [options] - Configuration.
 * @param {boolean?} [options.escapeOnly=false]
 *   - Whether to only escape required characters.
 * @param {boolean?} [options.useNamedReferences=false]
 *   - Whether to use entities where possible.
 * @return {string} - Encoded `value`.
 */
                function encode(value, options) {
                    var settings = options || {};
                    var escapeOnly = settings.escapeOnly;
                    var named = settings.useNamedReferences;
                    var map = named ? characters : null;

                    value = value.replace(EXPRESSION_ESCAPE, function(character) {
                        return map && has.call(map, character)
                            ? toNamedEntity(map[character])
                            : characterToHexadecimalReference(character);
                    });

                    if (escapeOnly) {
                        return value;
                    }

                    if (named) {
                        value = value.replace(EXPRESSION_NAMED, characterToNamedEntity);
                    }

                    return value
                        .replace(EXPRESSION_SURROGATE_PAIR, function(pair) {
                            return characterCodeToHexadecimalReference(
                                (pair.charCodeAt(0) - 0xd800) * 0x400 + pair.charCodeAt(1) - 0xdc00 + 0x10000
                            );
                        })
                        .replace(EXPRESSION_BMP, characterToHexadecimalReference);
                }

                /**
 * Shortcut to escape special characters in HTML.
 *
 * @param {string} value - Value to encode.
 * @return {string} - Encoded `value`.
 */
                function escape(value) {
                    return encode(value, {
                        escapeOnly: true,
                        useNamedReferences: true
                    });
                }

                encode.escape = escape;

                /*
 * Expose.
 */

                module.exports = encode;
            },
            { "./lib/expression.js": 43, "character-entities-html4": 12 }
        ],
        43: [
            function(require, module, exports) {
                /* This script was generated by `script/generate-expression.js` */

                "use strict";

                /* eslint-env commonjs */
                /* eslint-disable no-irregular-whitespace */

                module.exports = /[ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿƒΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρςστυφχψωϑϒϖ•…′″‾⁄℘ℑℜ™ℵ←↑→↓↔↵⇐⇑⇒⇓⇔∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∼≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅⌈⌉⌊⌋〈〉◊♠♣♥♦ŒœŠšŸˆ˜   ‌‍‎‏–—‘’‚“”„†‡‰‹›€]/g;
            },
            {}
        ],
        44: [
            function(require, module, exports) {
                "use strict";

                var StructuredSource = require("./structured-source.js")["default"];

                module.exports = StructuredSource;

                /* vim: set sw=4 ts=4 et tw=80 : */
            },
            { "./structured-source.js": 45 }
        ],
        45: [
            function(require, module, exports) {
                "use strict";

                var _classProps = function(child, staticProps, instanceProps) {
                    if (staticProps) Object.defineProperties(child, staticProps);
                    if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
                };

                var upperBound = require("boundary").upperBound;
                var Position = function Position(line, column) {
                    this.line = line;
                    this.column = column;
                };

                exports.Position = Position;
                var SourceLocation = function SourceLocation(start, end) {
                    this.start = start;
                    this.end = end;
                };

                exports.SourceLocation = SourceLocation;
                var StructuredSource = (function() {
                    var StructuredSource =
                        /**
   * @constructs StructuredSource
   * @param {string} source - source code text.
   */
                        function StructuredSource(source) {
                            this.indice = [0];
                            var regexp = /[\r\n\u2028\u2029]/g;
                            var length = source.length;
                            regexp.lastIndex = 0;
                            while (true) {
                                var result = regexp.exec(source);
                                if (!result) {
                                    break;
                                }
                                var index = result.index;
                                if (
                                    source.charCodeAt(index) === 13 /* '\r' */ &&
                                    source.charCodeAt(index + 1) === 10 /* '\n' */
                                ) {
                                    index += 1;
                                }
                                var nextIndex = index + 1;
                                // If there's a last line terminator, we push it to the indice.
                                // So use < instead of <=.
                                if (length < nextIndex) {
                                    break;
                                }
                                this.indice.push(nextIndex);
                                regexp.lastIndex = nextIndex;
                            }
                        };

                    StructuredSource.prototype.locationToRange = function(loc) {
                        return [this.positionToIndex(loc.start), this.positionToIndex(loc.end)];
                    };

                    StructuredSource.prototype.rangeToLocation = function(range) {
                        return new SourceLocation(this.indexToPosition(range[0]), this.indexToPosition(range[1]));
                    };

                    StructuredSource.prototype.positionToIndex = function(pos) {
                        // Line number starts with 1.
                        // Column number starts with 0.
                        var start = this.indice[pos.line - 1];
                        return start + pos.column;
                    };

                    StructuredSource.prototype.indexToPosition = function(index) {
                        var startLine = upperBound(this.indice, index);
                        return new Position(startLine, index - this.indice[startLine - 1]);
                    };

                    _classProps(StructuredSource, null, {
                        line: {
                            get: function() {
                                return this.indice.length;
                            }
                        }
                    });

                    return StructuredSource;
                })();

                exports["default"] = StructuredSource;
            },
            { boundary: 7 }
        ],
        46: [
            function(require, module, exports) {
                var traverse = (module.exports = function(obj) {
                    return new Traverse(obj);
                });

                function Traverse(obj) {
                    this.value = obj;
                }

                Traverse.prototype.get = function(ps) {
                    var node = this.value;
                    for (var i = 0; i < ps.length; i++) {
                        var key = ps[i];
                        if (!node || !hasOwnProperty.call(node, key)) {
                            node = undefined;
                            break;
                        }
                        node = node[key];
                    }
                    return node;
                };

                Traverse.prototype.has = function(ps) {
                    var node = this.value;
                    for (var i = 0; i < ps.length; i++) {
                        var key = ps[i];
                        if (!node || !hasOwnProperty.call(node, key)) {
                            return false;
                        }
                        node = node[key];
                    }
                    return true;
                };

                Traverse.prototype.set = function(ps, value) {
                    var node = this.value;
                    for (var i = 0; i < ps.length - 1; i++) {
                        var key = ps[i];
                        if (!hasOwnProperty.call(node, key)) node[key] = {};
                        node = node[key];
                    }
                    node[ps[i]] = value;
                    return value;
                };

                Traverse.prototype.map = function(cb) {
                    return walk(this.value, cb, true);
                };

                Traverse.prototype.forEach = function(cb) {
                    this.value = walk(this.value, cb, false);
                    return this.value;
                };

                Traverse.prototype.reduce = function(cb, init) {
                    var skip = arguments.length === 1;
                    var acc = skip ? this.value : init;
                    this.forEach(function(x) {
                        if (!this.isRoot || !skip) {
                            acc = cb.call(this, acc, x);
                        }
                    });
                    return acc;
                };

                Traverse.prototype.paths = function() {
                    var acc = [];
                    this.forEach(function(x) {
                        acc.push(this.path);
                    });
                    return acc;
                };

                Traverse.prototype.nodes = function() {
                    var acc = [];
                    this.forEach(function(x) {
                        acc.push(this.node);
                    });
                    return acc;
                };

                Traverse.prototype.clone = function() {
                    var parents = [],
                        nodes = [];

                    return (function clone(src) {
                        for (var i = 0; i < parents.length; i++) {
                            if (parents[i] === src) {
                                return nodes[i];
                            }
                        }

                        if (typeof src === "object" && src !== null) {
                            var dst = copy(src);

                            parents.push(src);
                            nodes.push(dst);

                            forEach(objectKeys(src), function(key) {
                                dst[key] = clone(src[key]);
                            });

                            parents.pop();
                            nodes.pop();
                            return dst;
                        } else {
                            return src;
                        }
                    })(this.value);
                };

                function walk(root, cb, immutable) {
                    var path = [];
                    var parents = [];
                    var alive = true;

                    return (function walker(node_) {
                        var node = immutable ? copy(node_) : node_;
                        var modifiers = {};

                        var keepGoing = true;

                        var state = {
                            node: node,
                            node_: node_,
                            path: [].concat(path),
                            parent: parents[parents.length - 1],
                            parents: parents,
                            key: path.slice(-1)[0],
                            isRoot: path.length === 0,
                            level: path.length,
                            circular: null,
                            update: function(x, stopHere) {
                                if (!state.isRoot) {
                                    state.parent.node[state.key] = x;
                                }
                                state.node = x;
                                if (stopHere) keepGoing = false;
                            },
                            delete: function(stopHere) {
                                delete state.parent.node[state.key];
                                if (stopHere) keepGoing = false;
                            },
                            remove: function(stopHere) {
                                if (isArray(state.parent.node)) {
                                    state.parent.node.splice(state.key, 1);
                                } else {
                                    delete state.parent.node[state.key];
                                }
                                if (stopHere) keepGoing = false;
                            },
                            keys: null,
                            before: function(f) {
                                modifiers.before = f;
                            },
                            after: function(f) {
                                modifiers.after = f;
                            },
                            pre: function(f) {
                                modifiers.pre = f;
                            },
                            post: function(f) {
                                modifiers.post = f;
                            },
                            stop: function() {
                                alive = false;
                            },
                            block: function() {
                                keepGoing = false;
                            }
                        };

                        if (!alive) return state;

                        function updateState() {
                            if (typeof state.node === "object" && state.node !== null) {
                                if (!state.keys || state.node_ !== state.node) {
                                    state.keys = objectKeys(state.node);
                                }

                                state.isLeaf = state.keys.length == 0;

                                for (var i = 0; i < parents.length; i++) {
                                    if (parents[i].node_ === node_) {
                                        state.circular = parents[i];
                                        break;
                                    }
                                }
                            } else {
                                state.isLeaf = true;
                                state.keys = null;
                            }

                            state.notLeaf = !state.isLeaf;
                            state.notRoot = !state.isRoot;
                        }

                        updateState();

                        // use return values to update if defined
                        var ret = cb.call(state, state.node);
                        if (ret !== undefined && state.update) state.update(ret);

                        if (modifiers.before) modifiers.before.call(state, state.node);

                        if (!keepGoing) return state;

                        if (typeof state.node == "object" && state.node !== null && !state.circular) {
                            parents.push(state);

                            updateState();

                            forEach(state.keys, function(key, i) {
                                path.push(key);

                                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);

                                var child = walker(state.node[key]);
                                if (immutable && hasOwnProperty.call(state.node, key)) {
                                    state.node[key] = child.node;
                                }

                                child.isLast = i == state.keys.length - 1;
                                child.isFirst = i == 0;

                                if (modifiers.post) modifiers.post.call(state, child);

                                path.pop();
                            });
                            parents.pop();
                        }

                        if (modifiers.after) modifiers.after.call(state, state.node);

                        return state;
                    })(root).node;
                }

                function copy(src) {
                    if (typeof src === "object" && src !== null) {
                        var dst;

                        if (isArray(src)) {
                            dst = [];
                        } else if (isDate(src)) {
                            dst = new Date(src.getTime ? src.getTime() : src);
                        } else if (isRegExp(src)) {
                            dst = new RegExp(src);
                        } else if (isError(src)) {
                            dst = { message: src.message };
                        } else if (isBoolean(src)) {
                            dst = new Boolean(src);
                        } else if (isNumber(src)) {
                            dst = new Number(src);
                        } else if (isString(src)) {
                            dst = new String(src);
                        } else if (Object.create && Object.getPrototypeOf) {
                            dst = Object.create(Object.getPrototypeOf(src));
                        } else if (src.constructor === Object) {
                            dst = {};
                        } else {
                            var proto = (src.constructor && src.constructor.prototype) || src.__proto__ || {};
                            var T = function() {};
                            T.prototype = proto;
                            dst = new T();
                        }

                        forEach(objectKeys(src), function(key) {
                            dst[key] = src[key];
                        });
                        return dst;
                    } else return src;
                }

                var objectKeys =
                    Object.keys ||
                    function keys(obj) {
                        var res = [];
                        for (var key in obj) res.push(key);
                        return res;
                    };

                function toS(obj) {
                    return Object.prototype.toString.call(obj);
                }
                function isDate(obj) {
                    return toS(obj) === "[object Date]";
                }
                function isRegExp(obj) {
                    return toS(obj) === "[object RegExp]";
                }
                function isError(obj) {
                    return toS(obj) === "[object Error]";
                }
                function isBoolean(obj) {
                    return toS(obj) === "[object Boolean]";
                }
                function isNumber(obj) {
                    return toS(obj) === "[object Number]";
                }
                function isString(obj) {
                    return toS(obj) === "[object String]";
                }

                var isArray =
                    Array.isArray ||
                    function isArray(xs) {
                        return Object.prototype.toString.call(xs) === "[object Array]";
                    };

                var forEach = function(xs, fn) {
                    if (xs.forEach) return xs.forEach(fn);
                    else
                        for (var i = 0; i < xs.length; i++) {
                            fn(xs[i], i, xs);
                        }
                };

                forEach(objectKeys(Traverse.prototype), function(key) {
                    traverse[key] = function(obj) {
                        var args = [].slice.call(arguments, 1);
                        var t = new Traverse(obj);
                        return t[key].apply(t, args);
                    };
                });

                var hasOwnProperty =
                    Object.hasOwnProperty ||
                    function(obj, key) {
                        return key in obj;
                    };
            },
            {}
        ],
        47: [
            function(require, module, exports) {
                "use strict";

                /*
 * Constants.
 */

                var LINE = "\n";

                /**
 * Remove final newline characters from `value`.
 *
 * @example
 *   trimTrailingLines('foo\nbar'); // 'foo\nbar'
 *   trimTrailingLines('foo\nbar\n'); // 'foo\nbar'
 *   trimTrailingLines('foo\nbar\n\n'); // 'foo\nbar'
 *
 * @param {string} value - Value with trailing newlines,
 *   coerced to string.
 * @return {string} - Value without trailing newlines.
 */
                function trimTrailingLines(value) {
                    var index;

                    value = String(value);
                    index = value.length;

                    while (value.charAt(--index) === LINE) {
                        /* empty */
                    }

                    return value.slice(0, index + 1);
                }

                /*
 * Expose.
 */

                module.exports = trimTrailingLines;
            },
            {}
        ],
        48: [
            function(require, module, exports) {
                exports = module.exports = trim;

                function trim(str) {
                    return str.replace(/^\s*|\s*$/g, "");
                }

                exports.left = function(str) {
                    return str.replace(/^\s*/, "");
                };

                exports.right = function(str) {
                    return str.replace(/\s*$/, "");
                };
            },
            {}
        ],
        49: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unherit
 * @fileoverview Create a custom constructor which can be modified
 *   without affecting the original class.
 * @example
 *   var EventEmitter = require('events').EventEmitter;
 *   var Emitter = unherit(EventEmitter);
 *   // Create a private class which acts just like
 *   // `EventEmitter`.
 *
 *   Emitter.prototype.defaultMaxListeners = 0;
 *   // Now, all instances of `Emitter` have no maximum
 *   // listeners, without affecting other `EventEmitter`s.
 */

                "use strict";

                /*
 * Dependencies.
 */

                var clone = require("clone");
                var inherits = require("inherits");

                /**
 * Create a custom constructor which can be modified
 * without affecting the original class.
 *
 * @param {Function} Super - Super-class.
 * @return {Function} - Constructor acting like `Super`,
 *   which can be modified without affecting the original
 *   class.
 */
                function unherit(Super) {
                    var base = clone(Super.prototype);
                    var result;
                    var key;

                    /**
     * Constructor accepting a single argument,
     * which itself is an `arguments` object.
     */
                    function From(parameters) {
                        return Super.apply(this, parameters);
                    }

                    /**
     * Constructor accepting variadic arguments.
     */
                    function Of() {
                        if (!(this instanceof Of)) {
                            return new From(arguments);
                        }

                        return Super.apply(this, arguments);
                    }

                    inherits(Of, Super);
                    inherits(From, Of);

                    /*
     * Both do duplicate work. However, cloning the
     * prototype ensures clonable things are cloned
     * and thus used. The `inherits` call ensures
     * `instanceof` still thinks an instance subclasses
     * `Super`.
     */

                    result = Of.prototype;

                    for (key in base) {
                        result[key] = base[key];
                    }

                    return Of;
                }

                /*
 * Expose.
 */

                module.exports = unherit;
            },
            { clone: 19, inherits: 26 }
        ],
        50: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Pluggable text processing interface.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Expose.
 */

                module.exports = require("./lib/unified.js");
            },
            { "./lib/unified.js": 52 }
        ],
        51: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Middleware.  Inspired by `segmentio/ware`,
 *   but able to change the values from transformer to
 *   transformer.
 */

                "use strict";

                /* eslint-env commonjs */

                var slice = [].slice;

                /**
 * Wrap `fn`.  Can be sync or async; return a promise,
 * receive a completion handler, return new values and
 * errors.
 *
 * @param {Function} fn - Thing to wrap.
 * @param {Function} next - Completion handler.
 * @return {Function} - Wrapped `fn`.
 */
                function wrap(fn, next) {
                    var invoked;
                    var failed;

                    /**
     * Invoke `next`, only once.
     * Tracks if an error is passed, too.
     *
     * @param {Error?} err - Optional error.
     */
                    function done(err) {
                        if (!invoked) {
                            invoked = true;

                            if (err) {
                                failed = true;
                            }

                            next.apply(null, arguments);
                        }
                    }

                    /**
     * Invoke `done` with one value.
     * Tracks if an error is passed, too.
     *
     * @param {*} value - Optional value.
     */
                    function then(value) {
                        done(null, value);
                    }

                    return function() {
                        var params = slice.call(arguments, 0);
                        var callback = fn.length > params.length;
                        var result;

                        if (callback) {
                            params.push(done);
                        }

                        try {
                            result = fn.apply(null, params);
                        } catch (err) {
                            // Well, this is quite the pickle.  `fn` passes
                            // an error to `done`, and `done` also throws
                            // an error, which bubbles to the try-body
                            // above, and into the catch-statement here.
                            // Then, given to `done`, which is now a no-op
                            // as it’s already invoked, causing it to be
                            // silently ignored.  We can’t let that happen.
                            // Instead, throw the thing.
                            if (callback && failed) {
                                throw err;
                            }

                            return done(err);
                        }

                        if (!callback) {
                            if (result && typeof result.then === "function") {
                                result.then(then, done);
                            } else if (result instanceof Error) {
                                done(result);
                            } else {
                                then(result);
                            }
                        }
                    };
                }

                /**
 * Create new middleware.
 *
 * @return {Object} - Middlewre.
 */
                function trough() {
                    var fns = [];
                    var middleware = {};

                    /**
     * Run `fns`.  Last argument must be
     * a completion handler.
     *
     * @param {...*} input - Parameters
     */
                    function run() {
                        var index = -1;
                        var input = slice.call(arguments, 0, -1);
                        var done = arguments[arguments.length - 1];

                        /**
         * Run the next `fn`, if any.
         *
         * @param {Error?} err - Failure.
         * @param {...*} values - Other input.
         */
                        function next(err) {
                            var fn = fns[++index];
                            var params = slice.call(arguments, 0);
                            var values = params.slice(1);
                            var length = input.length;
                            var pos = -1;

                            if (err) {
                                done(err);
                                return;
                            }

                            // Copy non-nully input into values.
                            while (++pos < length) {
                                if (values[pos] === null || values[pos] === undefined) {
                                    values[pos] = input[pos];
                                }
                            }

                            // bail.
                            input = values;

                            // next / done.
                            if (fn) {
                                wrap(fn, next).apply(null, input);
                            } else {
                                done.apply(null, [null].concat(input));
                            }
                        }

                        // start.
                        next.apply(null, [null].concat(input));
                    }

                    /**
     * Add `fn` to the list.
     *
     * @param {Function} fn - Anything `wrap` accepts.
     */
                    function use(fn) {
                        fns.push(fn);

                        return middleware;
                    }

                    /*
     * Expose.
     */

                    middleware.run = run;
                    middleware.use = use;

                    return middleware;
                }

                module.exports = trough;
            },
            {}
        ],
        52: [
            function(require, module, exports) {
                (function(global) {
                    /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Pluggable text processing interface.
 */

                    "use strict";

                    /* eslint-env commonjs */

                    /*
 * Dependencies.
 */

                    var events = require("events");
                    var once = require("once");
                    var extend = require("extend");
                    var bail = require("bail");
                    var vfile = require("vfile");
                    var trough = require("./trough.js");

                    /*
 * Methods.
 */

                    var slice = [].slice;
                    var own = {}.hasOwnProperty;

                    /*
 * Process pipeline.
 */

                    var pipeline = trough()
                        .use(function(p, ctx) {
                            ctx.tree = p.parse(ctx.file, ctx.options);
                        })
                        .use(function(p, ctx, next) {
                            p.run(ctx.tree, ctx.file, function(err, tree, file) {
                                if (err) {
                                    next(err);
                                } else {
                                    ctx.tree = tree;
                                    ctx.file = file;
                                    next();
                                }
                            });
                        })
                        .use(function(p, ctx) {
                            ctx.file.contents = p.stringify(ctx.tree, ctx.file, ctx.options);
                        });

                    /**
 * Check if `node` is a Unist node.
 *
 * @param {*} node - Value.
 * @return {boolean} - Whether `node` is a Unist node.
 */
                    function isNode(node) {
                        return node && typeof node.type === "string" && node.type.length !== 0;
                    }

                    /**
 * Check if `file` is a VFile.
 *
 * @param {*} file - Value.
 * @return {boolean} - Whether `file` is a VFile.
 */
                    function isFile(file) {
                        return file && typeof file.contents === "string";
                    }

                    /**
 * Check if `fn` is a function.
 *
 * @param {*} fn - Value.
 * @return {boolean} - Whether `fn` is a function.
 */
                    function isFunction(fn) {
                        return typeof fn === "function";
                    }

                    /**
 * Check if `compiler` is a Compiler.
 *
 * @param {*} compiler - Value.
 * @return {boolean} - Whether `compiler` is a Compiler.
 */
                    function isCompiler(compiler) {
                        return isFunction(compiler) && compiler.prototype && isFunction(compiler.prototype.compile);
                    }

                    /**
 * Check if `parser` is a Parser.
 *
 * @param {*} parser - Value.
 * @return {boolean} - Whether `parser` is a Parser.
 */
                    function isParser(parser) {
                        return isFunction(parser) && parser.prototype && isFunction(parser.prototype.parse);
                    }

                    /**
 * Function to create the first processor.
 *
 * @return {Function} - First processor.
 */
                    function unified() {
                        var attachers = [];
                        var transformers = trough();
                        var namespace = {};
                        var chunks = [];
                        var emitter = new events.EventEmitter();
                        var ended = false;
                        var concrete = true;
                        var settings;
                        var key;

                        /**
     * Create a new processor based on the processor
     * in the current scope.
     *
     * @return {Processor} - New concrete processor based
     *   on the descendant processor.
     */
                        function processor() {
                            var destination = unified();
                            var length = attachers.length;
                            var index = -1;

                            while (++index < length) {
                                destination.use.apply(null, attachers[index]);
                            }

                            destination.data(extend(true, {}, namespace));

                            return destination;
                        }

                        /*
     * Mix in methods.
     */

                        for (key in emitter) {
                            processor[key] = emitter[key];
                        }

                        /*
     * Helpers.
     */

                        /**
     * Assert a parser is available.
     *
     * @param {string} name - Name of callee.
     */
                        function assertParser(name) {
                            if (!isParser(processor.Parser)) {
                                throw new Error("Cannot `" + name + "` without `Parser`");
                            }
                        }

                        /**
     * Assert a compiler is available.
     *
     * @param {string} name - Name of callee.
     */
                        function assertCompiler(name) {
                            if (!isCompiler(processor.Compiler)) {
                                throw new Error("Cannot `" + name + "` without `Compiler`");
                            }
                        }

                        /**
     * Assert the processor is concrete.
     *
     * @param {string} name - Name of callee.
     */
                        function assertConcrete(name) {
                            if (!concrete) {
                                throw new Error(
                                    "Cannot " +
                                        (name ? "invoke `" + name + "` on" : "pipe into") +
                                        " abstract processor.\n" +
                                        "To make the processor concrete, invoke it: " +
                                        "use `processor()` instead of `processor`."
                                );
                            }
                        }

                        /**
     * Assert `node` is a Unist node.
     *
     * @param {*} node - Value to check.
     */
                        function assertNode(node) {
                            if (!isNode(node)) {
                                throw new Error("Expected node, got `" + node + "`");
                            }
                        }

                        /**
     * Assert, if no `done` is given, that `complete` is
     * `true`.
     *
     * @param {string} name - Name of callee.
     * @param {boolean} complete - Whether an async process
     *   is complete.
     * @param {Function?} done - Optional handler of async
     *   results.
     */
                        function assertDone(name, complete, done) {
                            if (!complete && !done) {
                                throw new Error(
                                    "Expected `done` to be given to `" + name + "` " + "as async plug-ins are used"
                                );
                            }
                        }

                        /*
     * Throw as early as possible.
     * As events are triggered synchroneously, the stack
     * is preserved.
     */

                        processor.on("pipe", function() {
                            assertConcrete();
                        });

                        /**
     * Abstract: used to signal an abstract processor which
     * should made concrete before using.
     *
     * For example, take unified itself.  It’s abstract.
     * Plug-ins should not be added to it.  Rather, it should
     * be made concrete (by invoking it) before modifying it.
     *
     * In essence, always invoke this when exporting a
     * processor.
     *
     * @return {Processor} - The operated on processor.
     */
                        function abstract() {
                            concrete = false;

                            return processor;
                        }

                        /**
     * Data management.
     *
     * Getter / setter for processor-specific informtion.
     *
     * @param {string} key - Key to get or set.
     * @param {*} value - Value to set.
     * @return {*} - Either the operator on processor in
     *   setter mode; or the value stored as `key` in
     *   getter mode.
     */
                        function data(key, value) {
                            assertConcrete("data");

                            if (typeof key === "string") {
                                // set key
                                if (arguments.length === 2) {
                                    namespace[key] = value;

                                    return processor;
                                }

                                // get key
                                return (own.call(namespace, key) && namespace[key]) || null;
                            }

                            // get space
                            if (!key) {
                                return namespace;
                            }

                            // set space
                            namespace = key;

                            return processor;
                        }

                        /**
     * Plug-in management.
     *
     * Pass it:
     * *   an attacher and options,
     * *   a list of attachers and options for all of them;
     * *   a tuple of one attacher and options.
     * *   a matrix: list containing any of the above and
     *     matrices.
     *
     * @param {...*} value - See description.
     * @return {Processor} - The operated on processor.
     */
                        function use(value) {
                            var args = slice.call(arguments, 0);
                            var params = args.slice(1);
                            var index;
                            var length;
                            var transformer;

                            assertConcrete("use");

                            /*
         * Multiple attachers.
         */

                            if ("length" in value && !isFunction(value)) {
                                index = -1;
                                length = value.length;

                                if (!isFunction(value[0])) {
                                    // matrix of things.
                                    while (++index < length) {
                                        use(value[index]);
                                    }
                                } else if (isFunction(value[1])) {
                                    // list of things.
                                    while (++index < length) {
                                        use.apply(null, [value[index]].concat(params));
                                    }
                                } else {
                                    // arguments.
                                    use.apply(null, value);
                                }

                                return processor;
                            }

                            /*
         * Store attacher.
         */

                            attachers.push(args);

                            /*
         * Single attacher.
         */

                            transformer = value.apply(null, [processor].concat(params));

                            if (isFunction(transformer)) {
                                transformers.use(transformer);
                            }

                            return processor;
                        }

                        /**
     * Parse a file (in string or VFile representation)
     * into a Unist node using the `Parser` on the
     * processor.
     *
     * @param {(string|VFile)?} [file] - File to process.
     * @param {Object?} [options] - Configuration.
     * @return {Node} - Unist node.
     */
                        function parse(file, options) {
                            assertConcrete("parse");
                            assertParser("parse");

                            return new processor.Parser(vfile(file), options, processor).parse();
                        }

                        /**
     * Run transforms on a Unist node representation of a file
     * (in string or VFile representation).
     *
     * @param {Node} node - Unist node.
     * @param {(string|VFile)?} [file] - File representation.
     * @param {Function?} [done] - Callback.
     * @return {Node} - The given or resulting Unist node.
     */
                        function run(node, file, done) {
                            var complete = false;
                            var result;

                            assertConcrete("run");
                            assertNode(node);

                            result = node;

                            if (!done && file && !isFile(file)) {
                                done = file;
                                file = null;
                            }

                            transformers.run(node, vfile(file), function(err, tree, file) {
                                complete = true;
                                result = tree || node;

                                (done || bail)(err, tree, file);
                            });

                            assertDone("run", complete, done);

                            return result;
                        }

                        /**
     * Stringify a Unist node representation of a file
     * (in string or VFile representation) into a string
     * using the `Compiler` on the processor.
     *
     * @param {Node} node - Unist node.
     * @param {(string|VFile)?} [file] - File representation.
     * @param {Object?} [options] - Configuration.
     * @return {string} - String representation.
     */
                        function stringify(node, file, options) {
                            assertConcrete("stringify");
                            assertCompiler("stringify");
                            assertNode(node);

                            if (!options && file && !isFile(file)) {
                                options = file;
                                file = null;
                            }

                            return new processor.Compiler(vfile(file), options, processor).compile(node);
                        }

                        /**
     * Parse a file (in string or VFile representation)
     * into a Unist node using the `Parser` on the processor,
     * then run transforms on that node, and compile the
     * resulting node using the `Compiler` on the processor,
     * and store that result on the VFile.
     *
     * @param {(string|VFile)?} file - File representation.
     * @param {Object?} [options] - Configuration.
     * @param {Function?} [done] - Callback.
     * @return {VFile} - The given or resulting VFile.
     */
                        function process(file, options, done) {
                            var complete = false;
                            var exception;

                            assertConcrete("process");
                            assertParser("process");
                            assertCompiler("process");

                            if (!done && isFunction(options)) {
                                done = options;
                                options = null;
                            }

                            file = vfile(file);

                            pipeline.run(
                                processor,
                                {
                                    file: file,
                                    options: options || {}
                                },
                                function(err) {
                                    complete = true;

                                    if (done) {
                                        done(err, file);
                                    } else {
                                        exception = err;
                                    }
                                }
                            );

                            assertDone("process", complete, done);

                            /* Throw sync error. */
                            bail(exception);

                            return file;
                        }

                        /*
     * Streams.
     */

                        /**
     * Write a chunk into memory.
     *
     * @param {(Buffer|string)?} chunk - Value to write.
     * @param {string?} [encoding] - Encoding.
     * @param {Function?} [callback] - Callback.
     * @return {boolean} - Whether the write was succesful.
     */
                        function write(chunk, encoding, callback) {
                            assertConcrete("write");

                            if (isFunction(encoding)) {
                                callback = encoding;
                                encoding = null;
                            }

                            if (ended) {
                                throw new Error("Did not expect `write` after `end`");
                            }

                            chunks.push((chunk || "").toString(encoding || "utf8"));

                            if (callback) {
                                callback();
                            }

                            // Signal succesful write.
                            return true;
                        }

                        /**
     * End the writing.  Passes all arguments to a final
     * `write`.  Starts the process, which will trigger
     * `error`, with a fatal error, if any; `data`, with
     * the generated document in `string` form, if
     * succesful.  If messages are triggered during the
     * process, those are triggerd as `warning`s.
     *
     * @return {boolean} - Whether the last write was
     *   succesful.
     */
                        function end() {
                            assertConcrete("end");
                            assertParser("end");
                            assertCompiler("end");

                            write.apply(null, arguments);

                            ended = true;

                            process(chunks.join(""), settings, function(err, file) {
                                var messages = file.messages;
                                var length = messages.length;
                                var index = -1;

                                chunks = settings = null;

                                // Trigger messages as warnings, except for fatal error.
                                while (++index < length) {
                                    if (messages[index] !== err) {
                                        processor.emit("warning", messages[index]);
                                    }
                                }

                                if (!err) {
                                    processor.emit("data", file.contents);
                                    processor.emit("end");
                                } else {
                                    // Don’t enter an infinite error throwing loop.
                                    global.setTimeout(function() {
                                        processor.emit("error", err);
                                    }, 4);
                                }
                            });

                            return true;
                        }

                        /**
     * Pipe the processor into a writable stream.
     *
     * Basically `Stream#pipe`, but inlined and
     * simplified to keep the bundled size down.
     *
     * @see https://github.com/nodejs/node/blob/master/lib/stream.js#L26
     *
     * @param {Stream} dest - Writable stream.
     * @param {Object?} [options] - Processing
     *   configuration.
     * @return {Stream} - The destination stream.
     */
                        function pipe(dest, options) {
                            var onend = once(function() {
                                dest.end();
                            });

                            assertConcrete("pipe");

                            settings = options || {};

                            /**
         * Handle data.
         *
         * @param {*} chunk - Data to pass through.
         */
                            function ondata(chunk) {
                                if (dest.writable) {
                                    dest.write(chunk);
                                }
                            }

                            /**
         * Clean listeners.
         */
                            function cleanup() {
                                processor.removeListener("data", ondata);
                                processor.removeListener("end", onend);
                                processor.removeListener("error", onerror);
                                processor.removeListener("end", cleanup);
                                processor.removeListener("close", cleanup);

                                dest.removeListener("error", onerror);
                                dest.removeListener("close", cleanup);
                            }

                            /**
         * Close dangling pipes and handle unheard errors.
         *
         * @param {Error} err - Exception.
         */
                            function onerror(err) {
                                var handlers = processor._events.error;

                                cleanup();

                                // can’t use `listenerCount` in node <= 0.12.
                                if (!handlers || !handlers.length || handlers === onerror) {
                                    throw err; // Unhandled stream error in pipe.
                                }
                            }

                            processor.on("data", ondata);
                            processor.on("error", onerror);
                            processor.on("end", cleanup);
                            processor.on("close", cleanup);

                            // If the 'end' option is not supplied, dest.end() will be called when
                            // the 'end' or 'close' events are received.  Only dest.end() once.
                            if (!dest._isStdio && settings.end !== false) {
                                processor.on("end", onend);
                            }

                            dest.on("error", onerror);
                            dest.on("close", cleanup);

                            dest.emit("pipe", processor);

                            return dest;
                        }

                        /*
     * Data management.
     */

                        processor.data = data;

                        /*
     * Lock.
     */

                        processor.abstract = abstract;

                        /*
     * Plug-ins.
     */

                        processor.use = use;

                        /*
     * Streaming.
     */

                        processor.writable = true;
                        processor.readable = true;
                        processor.write = write;
                        processor.end = end;
                        processor.pipe = pipe;

                        /*
     * API.
     */

                        processor.parse = parse;
                        processor.stringify = stringify;
                        processor.run = run;
                        processor.process = process;

                        /*
     * Expose.
     */

                        return processor;
                    }

                    /*
 * Expose an abstract processor.
 */

                    module.exports = unified().abstract();
                }.call(
                    this,
                    typeof global !== "undefined"
                        ? global
                        : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}
                ));
            },
            { "./trough.js": 51, bail: 5, events: 23, extend: 24, once: 30, vfile: 56 }
        ],
        53: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module unist:util:remove-position
 * @fileoverview Remove `position`s from a unist tree.
 */

                "use strict";

                /* eslint-env commonjs */

                /*
 * Dependencies.
 */

                var visit = require("unist-util-visit");

                /**
 * Remove `position`s from `tree`.
 *
 * @param {Node} tree - Node.
 * @return {Node} - Node without `position`s.
 */
                function removePosition(tree) {
                    visit(tree, function(node) {
                        node.position = undefined;
                    });

                    return tree;
                }

                /*
 * Expose.
 */

                module.exports = removePosition;
            },
            { "unist-util-visit": 54 }
        ],
        54: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unist:util:visit
 * @fileoverview Recursively walk over unist nodes.
 */

                "use strict";

                /* eslint-env commonjs */

                /**
 * Visit.
 *
 * @param {Node} tree - Root node
 * @param {string} [type] - Node type.
 * @param {function(node): boolean?} visitor - Invoked
 *   with each found node.  Can return `false` to stop.
 * @param {boolean} [reverse] - By default, `visit` will
 *   walk forwards, when `reverse` is `true`, `visit`
 *   walks backwards.
 */
                function visit(tree, type, visitor, reverse) {
                    if (typeof type === "function") {
                        reverse = visitor;
                        visitor = type;
                        type = null;
                    }

                    /**
     * Visit children in `parent`.
     *
     * @param {Array.<Node>} children - Children of `node`.
     * @param {Node?} parent - Parent of `node`.
     * @return {boolean?} - `false` if the visiting stopped.
     */
                    function all(children, parent) {
                        var step = reverse ? -1 : 1;
                        var max = children.length;
                        var min = -1;
                        var index = (reverse ? max : min) + step;
                        var child;

                        while (index > min && index < max) {
                            child = children[index];

                            if (child && one(child, index, parent) === false) {
                                return false;
                            }

                            index += step;
                        }

                        return true;
                    }

                    /**
     * Visit a single node.
     *
     * @param {Node} node - Node to visit.
     * @param {number?} [index] - Position of `node` in `parent`.
     * @param {Node?} [parent] - Parent of `node`.
     * @return {boolean?} - A result of invoking `visitor`.
     */
                    function one(node, index, parent) {
                        var result;

                        index = index || (parent ? 0 : null);

                        if (!type || node.type === type) {
                            result = visitor(node, index, parent || null);
                        }

                        if (node.children && result !== false) {
                            return all(node.children, node);
                        }

                        return result;
                    }

                    one(tree);
                }

                /*
 * Expose.
 */

                module.exports = visit;
            },
            {}
        ],
        55: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module vfile:location
 * @fileoverview Convert between positions (line and
 *   column-based) and offsets (range-based) locations.
 */

                "use strict";

                /* eslint-env commonjs */

                /**
 * Get indices of line-breaks in `value`.
 *
 * @param {string} value - Value.
 * @return {Array.<number>} - List of indices of
 *   line-breaks.
 */
                function indices(value) {
                    var result = [];
                    var index = value.indexOf("\n");

                    while (index !== -1) {
                        result.push(index + 1);

                        index = value.indexOf("\n", index + 1);
                    }

                    result.push(value.length + 1);

                    return result;
                }

                /**
 * Factory to get the `offset` for a line and column-based
 * `position` in the bound indices.
 *
 * @param {Array.<number>} indices - Indices of
 *   line-breaks in `value`.
 * @return {Function} - Bound method.
 */
                function positionToOffsetFactory(indices) {
                    /**
     * Get the `offset` for a line and column-based
     * `position` in the bound indices.
     *
     * @param {Position} position - Object with `line` and
     *   `column` properties.
     * @return {number} - Offset. `-1` when given invalid
     *   or out of bounds input.
     */
                    function positionToOffset(position) {
                        var line = position && position.line;
                        var column = position && position.column;

                        if (!isNaN(line) && !isNaN(column) && line - 1 in indices) {
                            return (indices[line - 2] || 0) + column - 1 || 0;
                        }

                        return -1;
                    }

                    return positionToOffset;
                }

                /**
 * Factory to get the line and column-based `position` for
 * `offset` in the bound indices.
 *
 * @param {Array.<number>} indices - Indices of
 *   line-breaks in `value`.
 * @return {Function} - Bound method.
 */
                function offsetToPositionFactory(indices) {
                    /**
     * Get the line and column-based `position` for
     * `offset` in the bound indices.
     *
     * @param {number} offset - Offset.
     * @return {Position} - Object with `line`, `column`,
     *   and `offset` properties based on the bound
     *   `indices`.  An empty object when given invalid
     *   or out of bounds input.
     */
                    function offsetToPosition(offset) {
                        var index = -1;
                        var length = indices.length;

                        if (offset < 0) {
                            return {};
                        }

                        while (++index < length) {
                            if (indices[index] > offset) {
                                return {
                                    line: index + 1,
                                    column: offset - (indices[index - 1] || 0) + 1,
                                    offset: offset
                                };
                            }
                        }

                        return {};
                    }

                    return offsetToPosition;
                }

                /**
 * Factory.
 *
 * @param {VFile|string} file - Virtual file or document.
 */
                function factory(file) {
                    var contents = indices(String(file));

                    /*
     * Expose.
     */

                    return {
                        toPosition: offsetToPositionFactory(contents),
                        toOffset: positionToOffsetFactory(contents)
                    };
                }

                /*
 * Expose.
 */

                module.exports = factory;
            },
            {}
        ],
        56: [
            function(require, module, exports) {
                /**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module vfile
 * @fileoverview Virtual file format to attach additional
 *   information related to processed input.  Similar to
 *   `wearefractal/vinyl`.  Additionally, `VFile` can be
 *   passed directly to ESLint formatters to visualise
 *   warnings and errors relating to a file.
 * @example
 *   var VFile = require('vfile');
 *
 *   var file = new VFile({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'txt',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file.toString(); // 'Foo *bar* baz'
 *   file.filePath(); // '~/example.txt'
 *
 *   file.move({'extension': 'md'});
 *   file.filePath(); // '~/example.md'
 *
 *   file.warn('Something went wrong', {'line': 2, 'column': 3});
 *   // { [~/example.md:2:3: Something went wrong]
 *   //   name: '~/example.md:2:3',
 *   //   file: '~/example.md',
 *   //   reason: 'Something went wrong',
 *   //   line: 2,
 *   //   column: 3,
 *   //   fatal: false }
 */

                "use strict";

                /* eslint-env commonjs */

                var proto;

                var SEPARATOR = "/";

                try {
                    SEPARATOR = require("pa" + "th").sep;
                } catch (e) {
                    /* empty */
                }

                /**
 * Construct a new file message.
 *
 * Note: We cannot invoke `Error` on the created context,
 * as that adds readonly `line` and `column` attributes on
 * Safari 9, thus throwing and failing the data.
 *
 * @example
 *   var message = new VFileMessage('Whoops!');
 *
 *   message instanceof Error // true
 *
 * @constructor
 * @class {VFileMessage}
 * @param {string} reason - Reason for messaging.
 * @property {boolean} [fatal=null] - Whether the message
 *   is fatal.
 * @property {string} [name=''] - File-name and positional
 *   information.
 * @property {string} [file=''] - File-path.
 * @property {string} [reason=''] - Reason for messaging.
 * @property {number} [line=null] - Start of message.
 * @property {number} [column=null] - Start of message.
 * @property {Position|Location} [location=null] - Place of
 *   message.
 * @property {string} [stack] - Stack-trace of warning.
 */
                function VFileMessage(reason) {
                    this.message = reason;
                }

                /**
 * Inherit from `Error#`.
 */
                function VFileMessagePrototype() {}

                VFileMessagePrototype.prototype = Error.prototype;

                proto = new VFileMessagePrototype();

                VFileMessage.prototype = proto;

                /*
 * Expose defaults.
 */

                proto.file = proto.name = proto.reason = proto.message = proto.stack = "";
                proto.fatal = proto.column = proto.line = null;

                /**
 * File-related message with location information.
 *
 * @typedef {Error} VFileMessage
 * @property {string} name - (Starting) location of the
 *   message, preceded by its file-path when available,
 *   and joined by `:`. Used internally by the native
 *   `Error#toString()`.
 * @property {string} file - File-path.
 * @property {string} reason - Reason for message.
 * @property {number?} line - Line of message, when
 *   available.
 * @property {number?} column - Column of message, when
 *   available.
 * @property {string?} stack - Stack of message, when
 *   available.
 * @property {boolean?} fatal - Whether the associated file
 *   is still processable.
 */

                /**
 * Stringify a position.
 *
 * @example
 *   stringify({'line': 1, 'column': 3}) // '1:3'
 *   stringify({'line': 1}) // '1:1'
 *   stringify({'column': 3}) // '1:3'
 *   stringify() // '1:1'
 *
 * @private
 * @param {Object?} [position] - Single position, like
 *   those available at `node.position.start`.
 * @return {string} - Compiled location.
 */
                function stringify(position) {
                    if (!position) {
                        position = {};
                    }

                    return (position.line || 1) + ":" + (position.column || 1);
                }

                /**
 * ESLint's formatter API expects `filePath` to be a
 * string.  This hack supports invocation as well as
 * implicit coercion.
 *
 * @example
 *   var file = new VFile({
 *     'filename': 'example',
 *     'extension': 'txt'
 *   });
 *
 *   filePath = filePathFactory(file);
 *
 *   String(filePath); // 'example.txt'
 *   filePath(); // 'example.txt'
 *
 * @private
 * @param {VFile} file - Virtual file.
 * @return {Function} - `filePath` getter.
 */
                function filePathFactory(file) {
                    /**
     * Get the filename, with extension and directory, if applicable.
     *
     * @example
     *   var file = new VFile({
     *     'directory': '~',
     *     'filename': 'example',
     *     'extension': 'txt'
     *   });
     *
     *   String(file.filePath); // ~/example.txt
     *   file.filePath() // ~/example.txt
     *
     * @memberof {VFile}
     * @property {Function} toString - Itself. ESLint's
     *   formatter API expects `filePath` to be `string`.
     *   This hack supports invocation as well as implicit
     *   coercion.
     * @return {string} - If the `vFile` has a `filename`,
     *   it will be prefixed with the directory (slashed),
     *   if applicable, and suffixed with the (dotted)
     *   extension (if applicable).  Otherwise, an empty
     *   string is returned.
     */
                    function filePath() {
                        var directory = file.directory;
                        var separator;

                        if (file.filename || file.extension) {
                            separator = directory.charAt(directory.length - 1);

                            if (separator === "/" || separator === "\\") {
                                directory = directory.slice(0, -1);
                            }

                            if (directory === ".") {
                                directory = "";
                            }

                            return (
                                (directory ? directory + SEPARATOR : "") +
                                file.filename +
                                (file.extension ? "." + file.extension : "")
                            );
                        }

                        return "";
                    }

                    filePath.toString = filePath;

                    return filePath;
                }

                /**
* Get the filename with extantion.
*
* @example
*   var file = new VFile({
*     'directory': '~/foo/bar'
*     'filename': 'example',
*     'extension': 'txt'
*   });
*
*   file.basename() // example.txt
*
* @memberof {VFile}
* @return {string} - name of file with extantion.
*/
                function basename() {
                    var self = this;
                    var extension = self.extension;

                    if (self.filename || extension) {
                        return self.filename + (extension ? "." + extension : "");
                    }

                    return "";
                }

                /**
 * Construct a new file.
 *
 * @example
 *   var file = new VFile({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'txt',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file === VFile(file) // true
 *   file === new VFile(file) // true
 *   VFile('foo') instanceof VFile // true
 *
 * @constructor
 * @class {VFile}
 * @param {Object|VFile|string} [options] - either an
 *   options object, or the value of `contents` (both
 *   optional).  When a `file` is passed in, it's
 *   immediately returned.
 * @property {string} [contents=''] - Content of file.
 * @property {string} [directory=''] - Path to parent
 *   directory.
 * @property {string} [filename=''] - Filename.
 *   A file-path can still be generated when no filename
 *   exists.
 * @property {string} [extension=''] - Extension.
 *   A file-path can still be generated when no extension
 *   exists.
 * @property {boolean?} quiet - Whether an error created by
 *   `VFile#fail()` is returned (when truthy) or thrown
 *   (when falsey). Ensure all `messages` associated with
 *   a file are handled properly when setting this to
 *   `true`.
 * @property {Array.<VFileMessage>} messages - List of associated
 *   messages.
 */
                function VFile(options) {
                    var self = this;

                    /*
     * No `new` operator.
     */

                    if (!(self instanceof VFile)) {
                        return new VFile(options);
                    }

                    /*
     * Given file.
     */

                    if (options && typeof options.message === "function" && typeof options.hasFailed === "function") {
                        return options;
                    }

                    if (!options) {
                        options = {};
                    } else if (typeof options === "string") {
                        options = {
                            contents: options
                        };
                    }

                    self.contents = options.contents || "";

                    self.messages = [];

                    /*
     * Make sure eslint’s formatters stringify `filePath`
     * properly.
     */

                    self.filePath = filePathFactory(self);

                    self.history = [];

                    self.move({
                        filename: options.filename,
                        directory: options.directory,
                        extension: options.extension
                    });
                }

                /**
 * Get the value of the file.
 *
 * @example
 *   var vFile = new VFile('Foo');
 *   String(vFile); // 'Foo'
 *
 * @this {VFile}
 * @memberof {VFile}
 * @return {string} - value at the `contents` property
 *   in context.
 */
                function toString() {
                    return this.contents;
                }

                /**
 * Move a file by passing a new directory, filename,
 * and extension.  When these are not given, the default
 * values are kept.
 *
 * @example
 *   var file = new VFile({
 *     'directory': '~',
 *     'filename': 'example',
 *     'extension': 'txt',
 *     'contents': 'Foo *bar* baz'
 *   });
 *
 *   file.move({'directory': '/var/www'});
 *   file.filePath(); // '/var/www/example.txt'
 *
 *   file.move({'extension': 'md'});
 *   file.filePath(); // '/var/www/example.md'
 *
 * @this {VFile}
 * @memberof {VFile}
 * @param {Object?} [options] - Configuration.
 * @return {VFile} - Context object.
 */
                function move(options) {
                    var self = this;
                    var before = self.filePath();
                    var after;

                    if (!options) {
                        options = {};
                    }

                    self.directory = options.directory || self.directory || "";
                    self.filename = options.filename || self.filename || "";
                    self.extension = options.extension || self.extension || "";

                    after = self.filePath();

                    if (after && before !== after) {
                        self.history.push(after);
                    }

                    return self;
                }

                /**
 * Create a message with `reason` at `position`.
 * When an error is passed in as `reason`, copies the
 * stack.  This does not add a message to `messages`.
 *
 * @example
 *   var file = new VFile();
 *
 *   file.message('Something went wrong');
 *   // { [1:1: Something went wrong]
 *   //   name: '1:1',
 *   //   file: '',
 *   //   reason: 'Something went wrong',
 *   //   line: null,
 *   //   column: null }
 *
 * @this {VFile}
 * @memberof {VFile}
 * @param {string|Error} reason - Reason for message.
 * @param {Node|Location|Position} [position] - Location
 *   of message in file.
 * @param {string} [ruleId] - Category of warning.
 * @return {VFileMessage} - File-related message with
 *   location information.
 */
                function message(reason, position, ruleId) {
                    var filePath = this.filePath();
                    var range;
                    var err;
                    var location = {
                        start: {
                            line: null,
                            column: null
                        },
                        end: {
                            line: null,
                            column: null
                        }
                    };

                    /*
     * Node / location / position.
     */

                    if (position && position.position) {
                        position = position.position;
                    }

                    if (position && position.start) {
                        range = stringify(position.start) + "-" + stringify(position.end);
                        location = position;
                        position = position.start;
                    } else {
                        range = stringify(position);

                        if (position) {
                            location.start = position;
                            location.end.line = null;
                            location.end.column = null;
                        }
                    }

                    err = new VFileMessage(reason.message || reason);

                    err.name = (filePath ? filePath + ":" : "") + range;
                    err.file = filePath;
                    err.reason = reason.message || reason;
                    err.line = position ? position.line : null;
                    err.column = position ? position.column : null;
                    err.location = location;
                    err.ruleId = ruleId || null;

                    if (reason.stack) {
                        err.stack = reason.stack;
                    }

                    return err;
                }

                /**
 * Warn. Creates a non-fatal message (see `VFile#message()`),
 * and adds it to the file's `messages` list.
 *
 * @example
 *   var file = new VFile();
 *
 *   file.warn('Something went wrong');
 *   // { [1:1: Something went wrong]
 *   //   name: '1:1',
 *   //   file: '',
 *   //   reason: 'Something went wrong',
 *   //   line: null,
 *   //   column: null,
 *   //   fatal: false }
 *
 * @see VFile#message
 * @this {VFile}
 * @memberof {VFile}
 */
                function warn() {
                    var err = this.message.apply(this, arguments);

                    err.fatal = false;

                    this.messages.push(err);

                    return err;
                }

                /**
 * Fail. Creates a fatal message (see `VFile#message()`),
 * sets `fatal: true`, adds it to the file's
 * `messages` list.
 *
 * If `quiet` is not `true`, throws the error.
 *
 * @example
 *   var file = new VFile();
 *
 *   file.fail('Something went wrong');
 *   // 1:1: Something went wrong
 *   //     at VFile.exception (vfile/index.js:296:11)
 *   //     at VFile.fail (vfile/index.js:360:20)
 *   //     at repl:1:6
 *
 *   file.quiet = true;
 *   file.fail('Something went wrong');
 *   // { [1:1: Something went wrong]
 *   //   name: '1:1',
 *   //   file: '',
 *   //   reason: 'Something went wrong',
 *   //   line: null,
 *   //   column: null,
 *   //   fatal: true }
 *
 * @this {VFile}
 * @memberof {VFile}
 * @throws {VFileMessage} - When not `quiet: true`.
 * @param {string|Error} reason - Reason for failure.
 * @param {Node|Location|Position} [position] - Place
 *   of failure in file.
 * @return {VFileMessage} - Unless thrown, of course.
 */
                function fail(reason, position) {
                    var err = this.message(reason, position);

                    err.fatal = true;

                    this.messages.push(err);

                    if (!this.quiet) {
                        throw err;
                    }

                    return err;
                }

                /**
 * Check if a fatal message occurred making the file no
 * longer processable.
 *
 * @example
 *   var file = new VFile();
 *   file.quiet = true;
 *
 *   file.hasFailed(); // false
 *
 *   file.fail('Something went wrong');
 *   file.hasFailed(); // true
 *
 * @this {VFile}
 * @memberof {VFile}
 * @return {boolean} - `true` if at least one of file's
 *   `messages` has a `fatal` property set to `true`
 */
                function hasFailed() {
                    var messages = this.messages;
                    var index = -1;
                    var length = messages.length;

                    while (++index < length) {
                        if (messages[index].fatal) {
                            return true;
                        }
                    }

                    return false;
                }

                /**
 * Access metadata.
 *
 * @example
 *   var file = new VFile('Foo');
 *
 *   file.namespace('foo').bar = 'baz';
 *
 *   console.log(file.namespace('foo').bar) // 'baz';
 *
 * @this {VFile}
 * @memberof {VFile}
 * @param {string} key - Namespace key.
 * @return {Object} - Private space.
 */
                function namespace(key) {
                    var self = this;
                    var space = self.data;

                    if (!space) {
                        space = self.data = {};
                    }

                    if (!space[key]) {
                        space[key] = {};
                    }

                    return space[key];
                }

                /*
 * Methods.
 */

                proto = VFile.prototype;

                proto.basename = basename;
                proto.move = move;
                proto.toString = toString;
                proto.message = message;
                proto.warn = warn;
                proto.fail = fail;
                proto.hasFailed = hasFailed;
                proto.namespace = namespace;

                /*
 * Expose.
 */

                module.exports = VFile;
            },
            {}
        ],
        57: [
            function(require, module, exports) {
                // Returns a wrapper function that returns a wrapped callback
                // The wrapper function should do some stuff, and return a
                // presumably different callback function.
                // This makes sure that own properties are retained, so that
                // decorations and such are not lost along the way.
                module.exports = wrappy;
                function wrappy(fn, cb) {
                    if (fn && cb) return wrappy(fn)(cb);

                    if (typeof fn !== "function") throw new TypeError("need wrapper function");

                    Object.keys(fn).forEach(function(k) {
                        wrapper[k] = fn[k];
                    });

                    return wrapper;

                    function wrapper() {
                        var args = new Array(arguments.length);
                        for (var i = 0; i < args.length; i++) {
                            args[i] = arguments[i];
                        }
                        var ret = fn.apply(this, args);
                        var cb = args[args.length - 1];
                        if (typeof ret === "function" && ret !== cb) {
                            Object.keys(cb).forEach(function(k) {
                                ret[k] = cb[k];
                            });
                        }
                        return ret;
                    }
                }
            },
            {}
        ]
    },
    {},
    [1]
);
