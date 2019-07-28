window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    var process = module.exports = {};
    var cachedSetTimeout;
    var cachedClearTimeout;
    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined");
    }
    (function() {
      try {
        cachedSetTimeout = "function" === typeof setTimeout ? setTimeout : defaultSetTimout;
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        cachedClearTimeout = "function" === typeof clearTimeout ? clearTimeout : defaultClearTimeout;
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function cleanUpNextTick() {
      if (!draining || !currentQueue) return;
      draining = false;
      currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1;
      queue.length && drainQueue();
    }
    function drainQueue() {
      if (draining) return;
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) currentQueue && currentQueue[queueIndex].run();
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }
    process.nextTick = function(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
      queue.push(new Item(fun, args));
      1 !== queue.length || draining || runTimeout(drainQueue);
    };
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = "";
    process.versions = {};
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    process.listeners = function(name) {
      return [];
    };
    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process.cwd = function() {
      return "/";
    };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
    process.umask = function() {
      return 0;
    };
  }, {} ],
  2: [ function(require, module, exports) {
    "use strict";
    module.exports = require("./lib");
  }, {
    "./lib": 3
  } ],
  3: [ function(require, module, exports) {
    (function(process) {
      "use strict";
      var AsyncLock = function(opts) {
        opts = opts || {};
        this.Promise = opts.Promise || Promise;
        this.queues = {};
        this.domains = {};
        this.domainReentrant = opts.domainReentrant || false;
        this.timeout = opts.timeout || AsyncLock.DEFAULT_TIMEOUT;
        this.maxPending = opts.maxPending || AsyncLock.DEFAULT_MAX_PENDING;
      };
      AsyncLock.DEFAULT_TIMEOUT = 0;
      AsyncLock.DEFAULT_MAX_PENDING = 1e3;
      AsyncLock.prototype.acquire = function(key, fn, cb, opts) {
        if (Array.isArray(key)) return this._acquireBatch(key, fn, cb, opts);
        if ("function" !== typeof fn) throw new Error("You must pass a function to execute");
        var deferred = null;
        if ("function" !== typeof cb) {
          opts = cb;
          cb = null;
          deferred = this._deferPromise();
        }
        opts = opts || {};
        var resolved = false;
        var timer = null;
        var self = this;
        var done = function(locked, err, ret) {
          if (locked) {
            0 === self.queues[key].length && delete self.queues[key];
            delete self.domains[key];
          }
          if (!resolved) {
            deferred ? err ? deferred.reject(err) : deferred.resolve(ret) : "function" === typeof cb && cb(err, ret);
            resolved = true;
          }
          locked && !!self.queues[key] && self.queues[key].length > 0 && self.queues[key].shift()();
        };
        var exec = function(locked) {
          if (resolved) return done(locked);
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          locked && (self.domains[key] = process.domain);
          if (1 === fn.length) {
            var called = false;
            fn(function(err, ret) {
              if (!called) {
                called = true;
                done(locked, err, ret);
              }
            });
          } else self._promiseTry(function() {
            return fn();
          }).then(function(ret) {
            done(locked, void 0, ret);
          }, function(error) {
            done(locked, error);
          });
        };
        !process.domain || (exec = process.domain.bind(exec));
        if (self.queues[key]) if (self.domainReentrant && !!process.domain && process.domain === self.domains[key]) exec(false); else if (self.queues[key].length >= self.maxPending) done(false, new Error("Too much pending tasks")); else {
          var taskFn = function() {
            exec(true);
          };
          opts.skipQueue ? self.queues[key].unshift(taskFn) : self.queues[key].push(taskFn);
          var timeout = opts.timeout || self.timeout;
          timeout && (timer = setTimeout(function() {
            timer = null;
            done(false, new Error("async-lock timed out"));
          }, timeout));
        } else {
          self.queues[key] = [];
          exec(true);
        }
        if (deferred) return deferred.promise;
      };
      AsyncLock.prototype._acquireBatch = function(keys, fn, cb, opts) {
        if ("function" !== typeof cb) {
          opts = cb;
          cb = null;
        }
        var self = this;
        var getFn = function(key, fn) {
          return function(cb) {
            self.acquire(key, fn, cb, opts);
          };
        };
        var fnx = fn;
        keys.reverse().forEach(function(key) {
          fnx = getFn(key, fnx);
        });
        if ("function" !== typeof cb) {
          var deferred = this._deferPromise();
          1 === fnx.length ? fnx(function(err, ret) {
            err ? deferred.reject(err) : deferred.resolve(ret);
          }) : deferred.resolve(fnx());
          return deferred.promise;
        }
        fnx(cb);
      };
      AsyncLock.prototype.isBusy = function(key) {
        return key ? !!this.queues[key] : Object.keys(this.queues).length > 0;
      };
      AsyncLock.prototype._promiseTry = function(fn) {
        try {
          return this.Promise.resolve(fn());
        } catch (e) {
          return this.Promise.reject(e);
        }
      };
      AsyncLock.prototype._deferPromise = function() {
        if ("function" === typeof this.Promise.defer) return this.Promise.defer();
        var result = {
          reject: function(err) {
            return Promise.resolve().then(function() {
              result.reject(err);
            });
          },
          resolve: function(ret) {
            return Promise.resolve().then(function() {
              result.resolve(ret);
            });
          },
          promise: void 0
        };
        result.promise = new this.Promise(function(resolve, reject) {
          result.reject = reject;
          result.resolve = resolve;
        });
        return result;
      };
      module.exports = AsyncLock;
    }).call(this, require("_process"));
  }, {
    _process: 1
  } ],
  4: [ function(require, module, exports) {
    var charenc = {
      utf8: {
        stringToBytes: function(str) {
          return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
        },
        bytesToString: function(bytes) {
          return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
        }
      },
      bin: {
        stringToBytes: function(str) {
          for (var bytes = [], i = 0; i < str.length; i++) bytes.push(255 & str.charCodeAt(i));
          return bytes;
        },
        bytesToString: function(bytes) {
          for (var str = [], i = 0; i < bytes.length; i++) str.push(String.fromCharCode(bytes[i]));
          return str.join("");
        }
      }
    };
    module.exports = charenc;
  }, {} ],
  5: [ function(require, module, exports) {
    (function() {
      var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", crypt = {
        rotl: function(n, b) {
          return n << b | n >>> 32 - b;
        },
        rotr: function(n, b) {
          return n << 32 - b | n >>> b;
        },
        endian: function(n) {
          if (n.constructor == Number) return 16711935 & crypt.rotl(n, 8) | 4278255360 & crypt.rotl(n, 24);
          for (var i = 0; i < n.length; i++) n[i] = crypt.endian(n[i]);
          return n;
        },
        randomBytes: function(n) {
          for (var bytes = []; n > 0; n--) bytes.push(Math.floor(256 * Math.random()));
          return bytes;
        },
        bytesToWords: function(bytes) {
          for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8) words[b >>> 5] |= bytes[i] << 24 - b % 32;
          return words;
        },
        wordsToBytes: function(words) {
          for (var bytes = [], b = 0; b < 32 * words.length; b += 8) bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255);
          return bytes;
        },
        bytesToHex: function(bytes) {
          for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((15 & bytes[i]).toString(16));
          }
          return hex.join("");
        },
        hexToBytes: function(hex) {
          for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
          return bytes;
        },
        bytesToBase64: function(bytes) {
          for (var base64 = [], i = 0; i < bytes.length; i += 3) {
            var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
            for (var j = 0; j < 4; j++) 8 * i + 6 * j <= 8 * bytes.length ? base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 63)) : base64.push("=");
          }
          return base64.join("");
        },
        base64ToBytes: function(base64) {
          base64 = base64.replace(/[^A-Z0-9+\/]/gi, "");
          for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
            if (0 == imod4) continue;
            bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << 2 * imod4 | base64map.indexOf(base64.charAt(i)) >>> 6 - 2 * imod4);
          }
          return bytes;
        }
      };
      module.exports = crypt;
    })();
  }, {} ],
  6: [ function(require, module, exports) {
    module.exports = function(obj) {
      return null != obj && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
    };
    function isBuffer(obj) {
      return !!obj.constructor && "function" === typeof obj.constructor.isBuffer && obj.constructor.isBuffer(obj);
    }
    function isSlowBuffer(obj) {
      return "function" === typeof obj.readFloatLE && "function" === typeof obj.slice && isBuffer(obj.slice(0, 0));
    }
  }, {} ],
  7: [ function(require, module, exports) {
    (function(global) {
      (function() {
        var undefined;
        var VERSION = "4.17.11";
        var LARGE_ARRAY_SIZE = 200;
        var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function";
        var HASH_UNDEFINED = "__lodash_hash_undefined__";
        var MAX_MEMOIZE_SIZE = 500;
        var PLACEHOLDER = "__lodash_placeholder__";
        var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
        var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
        var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
        var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
        var HOT_COUNT = 800, HOT_SPAN = 16;
        var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
        var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 1.7976931348623157e308, NAN = NaN;
        var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
        var wrapFlags = [ [ "ary", WRAP_ARY_FLAG ], [ "bind", WRAP_BIND_FLAG ], [ "bindKey", WRAP_BIND_KEY_FLAG ], [ "curry", WRAP_CURRY_FLAG ], [ "curryRight", WRAP_CURRY_RIGHT_FLAG ], [ "flip", WRAP_FLIP_FLAG ], [ "partial", WRAP_PARTIAL_FLAG ], [ "partialRight", WRAP_PARTIAL_RIGHT_FLAG ], [ "rearg", WRAP_REARG_FLAG ] ];
        var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
        var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
        var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
        var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
        var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
        var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
        var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
        var reTrim = /^\s+|\s+$/g, reTrimStart = /^\s+/, reTrimEnd = /\s+$/;
        var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
        var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
        var reEscapeChar = /\\(\\)?/g;
        var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
        var reFlags = /\w*$/;
        var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
        var reIsBinary = /^0b[01]+$/i;
        var reIsHostCtor = /^\[object .+?Constructor\]$/;
        var reIsOctal = /^0o[0-7]+$/i;
        var reIsUint = /^(?:0|[1-9]\d*)$/;
        var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
        var reNoMatch = /($^)/;
        var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
        var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
        var rsApos = "['\u2019]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
        var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [ rsNonAstral, rsRegional, rsSurrPair ].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [ rsDingbat, rsRegional, rsSurrPair ].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [ rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral ].join("|") + ")";
        var reApos = RegExp(rsApos, "g");
        var reComboMark = RegExp(rsCombo, "g");
        var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
        var reUnicodeWord = RegExp([ rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [ rsBreak, rsUpper, "$" ].join("|") + ")", rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [ rsBreak, rsUpper + rsMiscLower, "$" ].join("|") + ")", rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower, rsUpper + "+" + rsOptContrUpper, rsOrdUpper, rsOrdLower, rsDigits, rsEmoji ].join("|"), "g");
        var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
        var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
        var contextProps = [ "Array", "Buffer", "DataView", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Math", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "_", "clearTimeout", "isFinite", "parseInt", "setTimeout" ];
        var templateCounter = -1;
        var typedArrayTags = {};
        typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
        typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
        var cloneableTags = {};
        cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
        cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
        var deburredLetters = {
          "\xc0": "A",
          "\xc1": "A",
          "\xc2": "A",
          "\xc3": "A",
          "\xc4": "A",
          "\xc5": "A",
          "\xe0": "a",
          "\xe1": "a",
          "\xe2": "a",
          "\xe3": "a",
          "\xe4": "a",
          "\xe5": "a",
          "\xc7": "C",
          "\xe7": "c",
          "\xd0": "D",
          "\xf0": "d",
          "\xc8": "E",
          "\xc9": "E",
          "\xca": "E",
          "\xcb": "E",
          "\xe8": "e",
          "\xe9": "e",
          "\xea": "e",
          "\xeb": "e",
          "\xcc": "I",
          "\xcd": "I",
          "\xce": "I",
          "\xcf": "I",
          "\xec": "i",
          "\xed": "i",
          "\xee": "i",
          "\xef": "i",
          "\xd1": "N",
          "\xf1": "n",
          "\xd2": "O",
          "\xd3": "O",
          "\xd4": "O",
          "\xd5": "O",
          "\xd6": "O",
          "\xd8": "O",
          "\xf2": "o",
          "\xf3": "o",
          "\xf4": "o",
          "\xf5": "o",
          "\xf6": "o",
          "\xf8": "o",
          "\xd9": "U",
          "\xda": "U",
          "\xdb": "U",
          "\xdc": "U",
          "\xf9": "u",
          "\xfa": "u",
          "\xfb": "u",
          "\xfc": "u",
          "\xdd": "Y",
          "\xfd": "y",
          "\xff": "y",
          "\xc6": "Ae",
          "\xe6": "ae",
          "\xde": "Th",
          "\xfe": "th",
          "\xdf": "ss",
          "\u0100": "A",
          "\u0102": "A",
          "\u0104": "A",
          "\u0101": "a",
          "\u0103": "a",
          "\u0105": "a",
          "\u0106": "C",
          "\u0108": "C",
          "\u010a": "C",
          "\u010c": "C",
          "\u0107": "c",
          "\u0109": "c",
          "\u010b": "c",
          "\u010d": "c",
          "\u010e": "D",
          "\u0110": "D",
          "\u010f": "d",
          "\u0111": "d",
          "\u0112": "E",
          "\u0114": "E",
          "\u0116": "E",
          "\u0118": "E",
          "\u011a": "E",
          "\u0113": "e",
          "\u0115": "e",
          "\u0117": "e",
          "\u0119": "e",
          "\u011b": "e",
          "\u011c": "G",
          "\u011e": "G",
          "\u0120": "G",
          "\u0122": "G",
          "\u011d": "g",
          "\u011f": "g",
          "\u0121": "g",
          "\u0123": "g",
          "\u0124": "H",
          "\u0126": "H",
          "\u0125": "h",
          "\u0127": "h",
          "\u0128": "I",
          "\u012a": "I",
          "\u012c": "I",
          "\u012e": "I",
          "\u0130": "I",
          "\u0129": "i",
          "\u012b": "i",
          "\u012d": "i",
          "\u012f": "i",
          "\u0131": "i",
          "\u0134": "J",
          "\u0135": "j",
          "\u0136": "K",
          "\u0137": "k",
          "\u0138": "k",
          "\u0139": "L",
          "\u013b": "L",
          "\u013d": "L",
          "\u013f": "L",
          "\u0141": "L",
          "\u013a": "l",
          "\u013c": "l",
          "\u013e": "l",
          "\u0140": "l",
          "\u0142": "l",
          "\u0143": "N",
          "\u0145": "N",
          "\u0147": "N",
          "\u014a": "N",
          "\u0144": "n",
          "\u0146": "n",
          "\u0148": "n",
          "\u014b": "n",
          "\u014c": "O",
          "\u014e": "O",
          "\u0150": "O",
          "\u014d": "o",
          "\u014f": "o",
          "\u0151": "o",
          "\u0154": "R",
          "\u0156": "R",
          "\u0158": "R",
          "\u0155": "r",
          "\u0157": "r",
          "\u0159": "r",
          "\u015a": "S",
          "\u015c": "S",
          "\u015e": "S",
          "\u0160": "S",
          "\u015b": "s",
          "\u015d": "s",
          "\u015f": "s",
          "\u0161": "s",
          "\u0162": "T",
          "\u0164": "T",
          "\u0166": "T",
          "\u0163": "t",
          "\u0165": "t",
          "\u0167": "t",
          "\u0168": "U",
          "\u016a": "U",
          "\u016c": "U",
          "\u016e": "U",
          "\u0170": "U",
          "\u0172": "U",
          "\u0169": "u",
          "\u016b": "u",
          "\u016d": "u",
          "\u016f": "u",
          "\u0171": "u",
          "\u0173": "u",
          "\u0174": "W",
          "\u0175": "w",
          "\u0176": "Y",
          "\u0177": "y",
          "\u0178": "Y",
          "\u0179": "Z",
          "\u017b": "Z",
          "\u017d": "Z",
          "\u017a": "z",
          "\u017c": "z",
          "\u017e": "z",
          "\u0132": "IJ",
          "\u0133": "ij",
          "\u0152": "Oe",
          "\u0153": "oe",
          "\u0149": "'n",
          "\u017f": "s"
        };
        var htmlEscapes = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        };
        var htmlUnescapes = {
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&#39;": "'"
        };
        var stringEscapes = {
          "\\": "\\",
          "'": "'",
          "\n": "n",
          "\r": "r",
          "\u2028": "u2028",
          "\u2029": "u2029"
        };
        var freeParseFloat = parseFloat, freeParseInt = parseInt;
        var freeGlobal = "object" == typeof global && global && global.Object === Object && global;
        var freeSelf = "object" == typeof self && self && self.Object === Object && self;
        var root = freeGlobal || freeSelf || Function("return this")();
        var freeExports = "object" == typeof exports && exports && !exports.nodeType && exports;
        var freeModule = freeExports && "object" == typeof module && module && !module.nodeType && module;
        var moduleExports = freeModule && freeModule.exports === freeExports;
        var freeProcess = moduleExports && freeGlobal.process;
        var nodeUtil = function() {
          try {
            var types = freeModule && freeModule.require && freeModule.require("util").types;
            if (types) return types;
            return freeProcess && freeProcess.binding && freeProcess.binding("util");
          } catch (e) {}
        }();
        var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
        function apply(func, thisArg, args) {
          switch (args.length) {
           case 0:
            return func.call(thisArg);

           case 1:
            return func.call(thisArg, args[0]);

           case 2:
            return func.call(thisArg, args[0], args[1]);

           case 3:
            return func.call(thisArg, args[0], args[1], args[2]);
          }
          return func.apply(thisArg, args);
        }
        function arrayAggregator(array, setter, iteratee, accumulator) {
          var index = -1, length = null == array ? 0 : array.length;
          while (++index < length) {
            var value = array[index];
            setter(accumulator, value, iteratee(value), array);
          }
          return accumulator;
        }
        function arrayEach(array, iteratee) {
          var index = -1, length = null == array ? 0 : array.length;
          while (++index < length) if (false === iteratee(array[index], index, array)) break;
          return array;
        }
        function arrayEachRight(array, iteratee) {
          var length = null == array ? 0 : array.length;
          while (length--) if (false === iteratee(array[length], length, array)) break;
          return array;
        }
        function arrayEvery(array, predicate) {
          var index = -1, length = null == array ? 0 : array.length;
          while (++index < length) if (!predicate(array[index], index, array)) return false;
          return true;
        }
        function arrayFilter(array, predicate) {
          var index = -1, length = null == array ? 0 : array.length, resIndex = 0, result = [];
          while (++index < length) {
            var value = array[index];
            predicate(value, index, array) && (result[resIndex++] = value);
          }
          return result;
        }
        function arrayIncludes(array, value) {
          var length = null == array ? 0 : array.length;
          return !!length && baseIndexOf(array, value, 0) > -1;
        }
        function arrayIncludesWith(array, value, comparator) {
          var index = -1, length = null == array ? 0 : array.length;
          while (++index < length) if (comparator(value, array[index])) return true;
          return false;
        }
        function arrayMap(array, iteratee) {
          var index = -1, length = null == array ? 0 : array.length, result = Array(length);
          while (++index < length) result[index] = iteratee(array[index], index, array);
          return result;
        }
        function arrayPush(array, values) {
          var index = -1, length = values.length, offset = array.length;
          while (++index < length) array[offset + index] = values[index];
          return array;
        }
        function arrayReduce(array, iteratee, accumulator, initAccum) {
          var index = -1, length = null == array ? 0 : array.length;
          initAccum && length && (accumulator = array[++index]);
          while (++index < length) accumulator = iteratee(accumulator, array[index], index, array);
          return accumulator;
        }
        function arrayReduceRight(array, iteratee, accumulator, initAccum) {
          var length = null == array ? 0 : array.length;
          initAccum && length && (accumulator = array[--length]);
          while (length--) accumulator = iteratee(accumulator, array[length], length, array);
          return accumulator;
        }
        function arraySome(array, predicate) {
          var index = -1, length = null == array ? 0 : array.length;
          while (++index < length) if (predicate(array[index], index, array)) return true;
          return false;
        }
        var asciiSize = baseProperty("length");
        function asciiToArray(string) {
          return string.split("");
        }
        function asciiWords(string) {
          return string.match(reAsciiWord) || [];
        }
        function baseFindKey(collection, predicate, eachFunc) {
          var result;
          eachFunc(collection, function(value, key, collection) {
            if (predicate(value, key, collection)) {
              result = key;
              return false;
            }
          });
          return result;
        }
        function baseFindIndex(array, predicate, fromIndex, fromRight) {
          var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
          while (fromRight ? index-- : ++index < length) if (predicate(array[index], index, array)) return index;
          return -1;
        }
        function baseIndexOf(array, value, fromIndex) {
          return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
        }
        function baseIndexOfWith(array, value, fromIndex, comparator) {
          var index = fromIndex - 1, length = array.length;
          while (++index < length) if (comparator(array[index], value)) return index;
          return -1;
        }
        function baseIsNaN(value) {
          return value !== value;
        }
        function baseMean(array, iteratee) {
          var length = null == array ? 0 : array.length;
          return length ? baseSum(array, iteratee) / length : NAN;
        }
        function baseProperty(key) {
          return function(object) {
            return null == object ? undefined : object[key];
          };
        }
        function basePropertyOf(object) {
          return function(key) {
            return null == object ? undefined : object[key];
          };
        }
        function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
          eachFunc(collection, function(value, index, collection) {
            accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection);
          });
          return accumulator;
        }
        function baseSortBy(array, comparer) {
          var length = array.length;
          array.sort(comparer);
          while (length--) array[length] = array[length].value;
          return array;
        }
        function baseSum(array, iteratee) {
          var result, index = -1, length = array.length;
          while (++index < length) {
            var current = iteratee(array[index]);
            current !== undefined && (result = result === undefined ? current : result + current);
          }
          return result;
        }
        function baseTimes(n, iteratee) {
          var index = -1, result = Array(n);
          while (++index < n) result[index] = iteratee(index);
          return result;
        }
        function baseToPairs(object, props) {
          return arrayMap(props, function(key) {
            return [ key, object[key] ];
          });
        }
        function baseUnary(func) {
          return function(value) {
            return func(value);
          };
        }
        function baseValues(object, props) {
          return arrayMap(props, function(key) {
            return object[key];
          });
        }
        function cacheHas(cache, key) {
          return cache.has(key);
        }
        function charsStartIndex(strSymbols, chrSymbols) {
          var index = -1, length = strSymbols.length;
          while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) ;
          return index;
        }
        function charsEndIndex(strSymbols, chrSymbols) {
          var index = strSymbols.length;
          while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) ;
          return index;
        }
        function countHolders(array, placeholder) {
          var length = array.length, result = 0;
          while (length--) array[length] === placeholder && ++result;
          return result;
        }
        var deburrLetter = basePropertyOf(deburredLetters);
        var escapeHtmlChar = basePropertyOf(htmlEscapes);
        function escapeStringChar(chr) {
          return "\\" + stringEscapes[chr];
        }
        function getValue(object, key) {
          return null == object ? undefined : object[key];
        }
        function hasUnicode(string) {
          return reHasUnicode.test(string);
        }
        function hasUnicodeWord(string) {
          return reHasUnicodeWord.test(string);
        }
        function iteratorToArray(iterator) {
          var data, result = [];
          while (!(data = iterator.next()).done) result.push(data.value);
          return result;
        }
        function mapToArray(map) {
          var index = -1, result = Array(map.size);
          map.forEach(function(value, key) {
            result[++index] = [ key, value ];
          });
          return result;
        }
        function overArg(func, transform) {
          return function(arg) {
            return func(transform(arg));
          };
        }
        function replaceHolders(array, placeholder) {
          var index = -1, length = array.length, resIndex = 0, result = [];
          while (++index < length) {
            var value = array[index];
            if (value === placeholder || value === PLACEHOLDER) {
              array[index] = PLACEHOLDER;
              result[resIndex++] = index;
            }
          }
          return result;
        }
        function setToArray(set) {
          var index = -1, result = Array(set.size);
          set.forEach(function(value) {
            result[++index] = value;
          });
          return result;
        }
        function setToPairs(set) {
          var index = -1, result = Array(set.size);
          set.forEach(function(value) {
            result[++index] = [ value, value ];
          });
          return result;
        }
        function strictIndexOf(array, value, fromIndex) {
          var index = fromIndex - 1, length = array.length;
          while (++index < length) if (array[index] === value) return index;
          return -1;
        }
        function strictLastIndexOf(array, value, fromIndex) {
          var index = fromIndex + 1;
          while (index--) if (array[index] === value) return index;
          return index;
        }
        function stringSize(string) {
          return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
        }
        function stringToArray(string) {
          return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
        }
        var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
        function unicodeSize(string) {
          var result = reUnicode.lastIndex = 0;
          while (reUnicode.test(string)) ++result;
          return result;
        }
        function unicodeToArray(string) {
          return string.match(reUnicode) || [];
        }
        function unicodeWords(string) {
          return string.match(reUnicodeWord) || [];
        }
        var runInContext = function runInContext(context) {
          context = null == context ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
          var Array = context.Array, Date = context.Date, Error = context.Error, Function = context.Function, Math = context.Math, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError;
          var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
          var coreJsData = context["__core-js_shared__"];
          var funcToString = funcProto.toString;
          var hasOwnProperty = objectProto.hasOwnProperty;
          var idCounter = 0;
          var maskSrcKey = function() {
            var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
            return uid ? "Symbol(src)_1." + uid : "";
          }();
          var nativeObjectToString = objectProto.toString;
          var objectCtorString = funcToString.call(Object);
          var oldDash = root._;
          var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
          var Buffer = moduleExports ? context.Buffer : undefined, Symbol = context.Symbol, Uint8Array = context.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined, getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined, symIterator = Symbol ? Symbol.iterator : undefined, symToStringTag = Symbol ? Symbol.toStringTag : undefined;
          var defineProperty = function() {
            try {
              var func = getNative(Object, "defineProperty");
              func({}, "", {});
              return func;
            } catch (e) {}
          }();
          var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date && Date.now !== root.Date.now && Date.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
          var nativeCeil = Math.ceil, nativeFloor = Math.floor, nativeGetSymbols = Object.getOwnPropertySymbols, nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object.keys, Object), nativeMax = Math.max, nativeMin = Math.min, nativeNow = Date.now, nativeParseInt = context.parseInt, nativeRandom = Math.random, nativeReverse = arrayProto.reverse;
          var DataView = getNative(context, "DataView"), Map = getNative(context, "Map"), Promise = getNative(context, "Promise"), Set = getNative(context, "Set"), WeakMap = getNative(context, "WeakMap"), nativeCreate = getNative(Object, "create");
          var metaMap = WeakMap && new WeakMap();
          var realNames = {};
          var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
          var symbolProto = Symbol ? Symbol.prototype : undefined, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined, symbolToString = symbolProto ? symbolProto.toString : undefined;
          function lodash(value) {
            if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
              if (value instanceof LodashWrapper) return value;
              if (hasOwnProperty.call(value, "__wrapped__")) return wrapperClone(value);
            }
            return new LodashWrapper(value);
          }
          var baseCreate = function() {
            function object() {}
            return function(proto) {
              if (!isObject(proto)) return {};
              if (objectCreate) return objectCreate(proto);
              object.prototype = proto;
              var result = new object();
              object.prototype = undefined;
              return result;
            };
          }();
          function baseLodash() {}
          function LodashWrapper(value, chainAll) {
            this.__wrapped__ = value;
            this.__actions__ = [];
            this.__chain__ = !!chainAll;
            this.__index__ = 0;
            this.__values__ = undefined;
          }
          lodash.templateSettings = {
            escape: reEscape,
            evaluate: reEvaluate,
            interpolate: reInterpolate,
            variable: "",
            imports: {
              _: lodash
            }
          };
          lodash.prototype = baseLodash.prototype;
          lodash.prototype.constructor = lodash;
          LodashWrapper.prototype = baseCreate(baseLodash.prototype);
          LodashWrapper.prototype.constructor = LodashWrapper;
          function LazyWrapper(value) {
            this.__wrapped__ = value;
            this.__actions__ = [];
            this.__dir__ = 1;
            this.__filtered__ = false;
            this.__iteratees__ = [];
            this.__takeCount__ = MAX_ARRAY_LENGTH;
            this.__views__ = [];
          }
          function lazyClone() {
            var result = new LazyWrapper(this.__wrapped__);
            result.__actions__ = copyArray(this.__actions__);
            result.__dir__ = this.__dir__;
            result.__filtered__ = this.__filtered__;
            result.__iteratees__ = copyArray(this.__iteratees__);
            result.__takeCount__ = this.__takeCount__;
            result.__views__ = copyArray(this.__views__);
            return result;
          }
          function lazyReverse() {
            if (this.__filtered__) {
              var result = new LazyWrapper(this);
              result.__dir__ = -1;
              result.__filtered__ = true;
            } else {
              result = this.clone();
              result.__dir__ *= -1;
            }
            return result;
          }
          function lazyValue() {
            var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
            if (!isArr || !isRight && arrLength == length && takeCount == length) return baseWrapperValue(array, this.__actions__);
            var result = [];
            outer: while (length-- && resIndex < takeCount) {
              index += dir;
              var iterIndex = -1, value = array[index];
              while (++iterIndex < iterLength) {
                var data = iteratees[iterIndex], iteratee = data.iteratee, type = data.type, computed = iteratee(value);
                if (type == LAZY_MAP_FLAG) value = computed; else if (!computed) {
                  if (type == LAZY_FILTER_FLAG) continue outer;
                  break outer;
                }
              }
              result[resIndex++] = value;
            }
            return result;
          }
          LazyWrapper.prototype = baseCreate(baseLodash.prototype);
          LazyWrapper.prototype.constructor = LazyWrapper;
          function Hash(entries) {
            var index = -1, length = null == entries ? 0 : entries.length;
            this.clear();
            while (++index < length) {
              var entry = entries[index];
              this.set(entry[0], entry[1]);
            }
          }
          function hashClear() {
            this.__data__ = nativeCreate ? nativeCreate(null) : {};
            this.size = 0;
          }
          function hashDelete(key) {
            var result = this.has(key) && delete this.__data__[key];
            this.size -= result ? 1 : 0;
            return result;
          }
          function hashGet(key) {
            var data = this.__data__;
            if (nativeCreate) {
              var result = data[key];
              return result === HASH_UNDEFINED ? undefined : result;
            }
            return hasOwnProperty.call(data, key) ? data[key] : undefined;
          }
          function hashHas(key) {
            var data = this.__data__;
            return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
          }
          function hashSet(key, value) {
            var data = this.__data__;
            this.size += this.has(key) ? 0 : 1;
            data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
            return this;
          }
          Hash.prototype.clear = hashClear;
          Hash.prototype["delete"] = hashDelete;
          Hash.prototype.get = hashGet;
          Hash.prototype.has = hashHas;
          Hash.prototype.set = hashSet;
          function ListCache(entries) {
            var index = -1, length = null == entries ? 0 : entries.length;
            this.clear();
            while (++index < length) {
              var entry = entries[index];
              this.set(entry[0], entry[1]);
            }
          }
          function listCacheClear() {
            this.__data__ = [];
            this.size = 0;
          }
          function listCacheDelete(key) {
            var data = this.__data__, index = assocIndexOf(data, key);
            if (index < 0) return false;
            var lastIndex = data.length - 1;
            index == lastIndex ? data.pop() : splice.call(data, index, 1);
            --this.size;
            return true;
          }
          function listCacheGet(key) {
            var data = this.__data__, index = assocIndexOf(data, key);
            return index < 0 ? undefined : data[index][1];
          }
          function listCacheHas(key) {
            return assocIndexOf(this.__data__, key) > -1;
          }
          function listCacheSet(key, value) {
            var data = this.__data__, index = assocIndexOf(data, key);
            if (index < 0) {
              ++this.size;
              data.push([ key, value ]);
            } else data[index][1] = value;
            return this;
          }
          ListCache.prototype.clear = listCacheClear;
          ListCache.prototype["delete"] = listCacheDelete;
          ListCache.prototype.get = listCacheGet;
          ListCache.prototype.has = listCacheHas;
          ListCache.prototype.set = listCacheSet;
          function MapCache(entries) {
            var index = -1, length = null == entries ? 0 : entries.length;
            this.clear();
            while (++index < length) {
              var entry = entries[index];
              this.set(entry[0], entry[1]);
            }
          }
          function mapCacheClear() {
            this.size = 0;
            this.__data__ = {
              hash: new Hash(),
              map: new (Map || ListCache)(),
              string: new Hash()
            };
          }
          function mapCacheDelete(key) {
            var result = getMapData(this, key)["delete"](key);
            this.size -= result ? 1 : 0;
            return result;
          }
          function mapCacheGet(key) {
            return getMapData(this, key).get(key);
          }
          function mapCacheHas(key) {
            return getMapData(this, key).has(key);
          }
          function mapCacheSet(key, value) {
            var data = getMapData(this, key), size = data.size;
            data.set(key, value);
            this.size += data.size == size ? 0 : 1;
            return this;
          }
          MapCache.prototype.clear = mapCacheClear;
          MapCache.prototype["delete"] = mapCacheDelete;
          MapCache.prototype.get = mapCacheGet;
          MapCache.prototype.has = mapCacheHas;
          MapCache.prototype.set = mapCacheSet;
          function SetCache(values) {
            var index = -1, length = null == values ? 0 : values.length;
            this.__data__ = new MapCache();
            while (++index < length) this.add(values[index]);
          }
          function setCacheAdd(value) {
            this.__data__.set(value, HASH_UNDEFINED);
            return this;
          }
          function setCacheHas(value) {
            return this.__data__.has(value);
          }
          SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
          SetCache.prototype.has = setCacheHas;
          function Stack(entries) {
            var data = this.__data__ = new ListCache(entries);
            this.size = data.size;
          }
          function stackClear() {
            this.__data__ = new ListCache();
            this.size = 0;
          }
          function stackDelete(key) {
            var data = this.__data__, result = data["delete"](key);
            this.size = data.size;
            return result;
          }
          function stackGet(key) {
            return this.__data__.get(key);
          }
          function stackHas(key) {
            return this.__data__.has(key);
          }
          function stackSet(key, value) {
            var data = this.__data__;
            if (data instanceof ListCache) {
              var pairs = data.__data__;
              if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
                pairs.push([ key, value ]);
                this.size = ++data.size;
                return this;
              }
              data = this.__data__ = new MapCache(pairs);
            }
            data.set(key, value);
            this.size = data.size;
            return this;
          }
          Stack.prototype.clear = stackClear;
          Stack.prototype["delete"] = stackDelete;
          Stack.prototype.get = stackGet;
          Stack.prototype.has = stackHas;
          Stack.prototype.set = stackSet;
          function arrayLikeKeys(value, inherited) {
            var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
            for (var key in value) !inherited && !hasOwnProperty.call(value, key) || skipIndexes && ("length" == key || isBuff && ("offset" == key || "parent" == key) || isType && ("buffer" == key || "byteLength" == key || "byteOffset" == key) || isIndex(key, length)) || result.push(key);
            return result;
          }
          function arraySample(array) {
            var length = array.length;
            return length ? array[baseRandom(0, length - 1)] : undefined;
          }
          function arraySampleSize(array, n) {
            return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
          }
          function arrayShuffle(array) {
            return shuffleSelf(copyArray(array));
          }
          function assignMergeValue(object, key, value) {
            (value === undefined || eq(object[key], value)) && (value !== undefined || key in object) || baseAssignValue(object, key, value);
          }
          function assignValue(object, key, value) {
            var objValue = object[key];
            hasOwnProperty.call(object, key) && eq(objValue, value) && (value !== undefined || key in object) || baseAssignValue(object, key, value);
          }
          function assocIndexOf(array, key) {
            var length = array.length;
            while (length--) if (eq(array[length][0], key)) return length;
            return -1;
          }
          function baseAggregator(collection, setter, iteratee, accumulator) {
            baseEach(collection, function(value, key, collection) {
              setter(accumulator, value, iteratee(value), collection);
            });
            return accumulator;
          }
          function baseAssign(object, source) {
            return object && copyObject(source, keys(source), object);
          }
          function baseAssignIn(object, source) {
            return object && copyObject(source, keysIn(source), object);
          }
          function baseAssignValue(object, key, value) {
            "__proto__" == key && defineProperty ? defineProperty(object, key, {
              configurable: true,
              enumerable: true,
              value: value,
              writable: true
            }) : object[key] = value;
          }
          function baseAt(object, paths) {
            var index = -1, length = paths.length, result = Array(length), skip = null == object;
            while (++index < length) result[index] = skip ? undefined : get(object, paths[index]);
            return result;
          }
          function baseClamp(number, lower, upper) {
            if (number === number) {
              upper !== undefined && (number = number <= upper ? number : upper);
              lower !== undefined && (number = number >= lower ? number : lower);
            }
            return number;
          }
          function baseClone(value, bitmask, customizer, key, object, stack) {
            var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
            customizer && (result = object ? customizer(value, key, object, stack) : customizer(value));
            if (result !== undefined) return result;
            if (!isObject(value)) return value;
            var isArr = isArray(value);
            if (isArr) {
              result = initCloneArray(value);
              if (!isDeep) return copyArray(value, result);
            } else {
              var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
              if (isBuffer(value)) return cloneBuffer(value, isDeep);
              if (tag == objectTag || tag == argsTag || isFunc && !object) {
                result = isFlat || isFunc ? {} : initCloneObject(value);
                if (!isDeep) return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
              } else {
                if (!cloneableTags[tag]) return object ? value : {};
                result = initCloneByTag(value, tag, isDeep);
              }
            }
            stack || (stack = new Stack());
            var stacked = stack.get(value);
            if (stacked) return stacked;
            stack.set(value, result);
            if (isSet(value)) {
              value.forEach(function(subValue) {
                result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
              });
              return result;
            }
            if (isMap(value)) {
              value.forEach(function(subValue, key) {
                result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
              });
              return result;
            }
            var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
            var props = isArr ? undefined : keysFunc(value);
            arrayEach(props || value, function(subValue, key) {
              if (props) {
                key = subValue;
                subValue = value[key];
              }
              assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
            });
            return result;
          }
          function baseConforms(source) {
            var props = keys(source);
            return function(object) {
              return baseConformsTo(object, source, props);
            };
          }
          function baseConformsTo(object, source, props) {
            var length = props.length;
            if (null == object) return !length;
            object = Object(object);
            while (length--) {
              var key = props[length], predicate = source[key], value = object[key];
              if (value === undefined && !(key in object) || !predicate(value)) return false;
            }
            return true;
          }
          function baseDelay(func, wait, args) {
            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            return setTimeout(function() {
              func.apply(undefined, args);
            }, wait);
          }
          function baseDifference(array, values, iteratee, comparator) {
            var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values.length;
            if (!length) return result;
            iteratee && (values = arrayMap(values, baseUnary(iteratee)));
            if (comparator) {
              includes = arrayIncludesWith;
              isCommon = false;
            } else if (values.length >= LARGE_ARRAY_SIZE) {
              includes = cacheHas;
              isCommon = false;
              values = new SetCache(values);
            }
            outer: while (++index < length) {
              var value = array[index], computed = null == iteratee ? value : iteratee(value);
              value = comparator || 0 !== value ? value : 0;
              if (isCommon && computed === computed) {
                var valuesIndex = valuesLength;
                while (valuesIndex--) if (values[valuesIndex] === computed) continue outer;
                result.push(value);
              } else includes(values, computed, comparator) || result.push(value);
            }
            return result;
          }
          var baseEach = createBaseEach(baseForOwn);
          var baseEachRight = createBaseEach(baseForOwnRight, true);
          function baseEvery(collection, predicate) {
            var result = true;
            baseEach(collection, function(value, index, collection) {
              result = !!predicate(value, index, collection);
              return result;
            });
            return result;
          }
          function baseExtremum(array, iteratee, comparator) {
            var index = -1, length = array.length;
            while (++index < length) {
              var value = array[index], current = iteratee(value);
              if (null != current && (computed === undefined ? current === current && !isSymbol(current) : comparator(current, computed))) var computed = current, result = value;
            }
            return result;
          }
          function baseFill(array, value, start, end) {
            var length = array.length;
            start = toInteger(start);
            start < 0 && (start = -start > length ? 0 : length + start);
            end = end === undefined || end > length ? length : toInteger(end);
            end < 0 && (end += length);
            end = start > end ? 0 : toLength(end);
            while (start < end) array[start++] = value;
            return array;
          }
          function baseFilter(collection, predicate) {
            var result = [];
            baseEach(collection, function(value, index, collection) {
              predicate(value, index, collection) && result.push(value);
            });
            return result;
          }
          function baseFlatten(array, depth, predicate, isStrict, result) {
            var index = -1, length = array.length;
            predicate || (predicate = isFlattenable);
            result || (result = []);
            while (++index < length) {
              var value = array[index];
              depth > 0 && predicate(value) ? depth > 1 ? baseFlatten(value, depth - 1, predicate, isStrict, result) : arrayPush(result, value) : isStrict || (result[result.length] = value);
            }
            return result;
          }
          var baseFor = createBaseFor();
          var baseForRight = createBaseFor(true);
          function baseForOwn(object, iteratee) {
            return object && baseFor(object, iteratee, keys);
          }
          function baseForOwnRight(object, iteratee) {
            return object && baseForRight(object, iteratee, keys);
          }
          function baseFunctions(object, props) {
            return arrayFilter(props, function(key) {
              return isFunction(object[key]);
            });
          }
          function baseGet(object, path) {
            path = castPath(path, object);
            var index = 0, length = path.length;
            while (null != object && index < length) object = object[toKey(path[index++])];
            return index && index == length ? object : undefined;
          }
          function baseGetAllKeys(object, keysFunc, symbolsFunc) {
            var result = keysFunc(object);
            return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
          }
          function baseGetTag(value) {
            if (null == value) return value === undefined ? undefinedTag : nullTag;
            return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
          }
          function baseGt(value, other) {
            return value > other;
          }
          function baseHas(object, key) {
            return null != object && hasOwnProperty.call(object, key);
          }
          function baseHasIn(object, key) {
            return null != object && key in Object(object);
          }
          function baseInRange(number, start, end) {
            return number >= nativeMin(start, end) && number < nativeMax(start, end);
          }
          function baseIntersection(arrays, iteratee, comparator) {
            var includes = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array(othLength), maxLength = Infinity, result = [];
            while (othIndex--) {
              var array = arrays[othIndex];
              othIndex && iteratee && (array = arrayMap(array, baseUnary(iteratee)));
              maxLength = nativeMin(array.length, maxLength);
              caches[othIndex] = !comparator && (iteratee || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined;
            }
            array = arrays[0];
            var index = -1, seen = caches[0];
            outer: while (++index < length && result.length < maxLength) {
              var value = array[index], computed = iteratee ? iteratee(value) : value;
              value = comparator || 0 !== value ? value : 0;
              if (!(seen ? cacheHas(seen, computed) : includes(result, computed, comparator))) {
                othIndex = othLength;
                while (--othIndex) {
                  var cache = caches[othIndex];
                  if (!(cache ? cacheHas(cache, computed) : includes(arrays[othIndex], computed, comparator))) continue outer;
                }
                seen && seen.push(computed);
                result.push(value);
              }
            }
            return result;
          }
          function baseInverter(object, setter, iteratee, accumulator) {
            baseForOwn(object, function(value, key, object) {
              setter(accumulator, iteratee(value), key, object);
            });
            return accumulator;
          }
          function baseInvoke(object, path, args) {
            path = castPath(path, object);
            object = parent(object, path);
            var func = null == object ? object : object[toKey(last(path))];
            return null == func ? undefined : apply(func, object, args);
          }
          function baseIsArguments(value) {
            return isObjectLike(value) && baseGetTag(value) == argsTag;
          }
          function baseIsArrayBuffer(value) {
            return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
          }
          function baseIsDate(value) {
            return isObjectLike(value) && baseGetTag(value) == dateTag;
          }
          function baseIsEqual(value, other, bitmask, customizer, stack) {
            if (value === other) return true;
            if (null == value || null == other || !isObjectLike(value) && !isObjectLike(other)) return value !== value && other !== other;
            return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
          }
          function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
            var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
            objTag = objTag == argsTag ? objectTag : objTag;
            othTag = othTag == argsTag ? objectTag : othTag;
            var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
            if (isSameTag && isBuffer(object)) {
              if (!isBuffer(other)) return false;
              objIsArr = true;
              objIsObj = false;
            }
            if (isSameTag && !objIsObj) {
              stack || (stack = new Stack());
              return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
            }
            if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
              var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
              if (objIsWrapped || othIsWrapped) {
                var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
                stack || (stack = new Stack());
                return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
              }
            }
            if (!isSameTag) return false;
            stack || (stack = new Stack());
            return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
          }
          function baseIsMap(value) {
            return isObjectLike(value) && getTag(value) == mapTag;
          }
          function baseIsMatch(object, source, matchData, customizer) {
            var index = matchData.length, length = index, noCustomizer = !customizer;
            if (null == object) return !length;
            object = Object(object);
            while (index--) {
              var data = matchData[index];
              if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) return false;
            }
            while (++index < length) {
              data = matchData[index];
              var key = data[0], objValue = object[key], srcValue = data[1];
              if (noCustomizer && data[2]) {
                if (objValue === undefined && !(key in object)) return false;
              } else {
                var stack = new Stack();
                if (customizer) var result = customizer(objValue, srcValue, key, object, source, stack);
                if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) return false;
              }
            }
            return true;
          }
          function baseIsNative(value) {
            if (!isObject(value) || isMasked(value)) return false;
            var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
            return pattern.test(toSource(value));
          }
          function baseIsRegExp(value) {
            return isObjectLike(value) && baseGetTag(value) == regexpTag;
          }
          function baseIsSet(value) {
            return isObjectLike(value) && getTag(value) == setTag;
          }
          function baseIsTypedArray(value) {
            return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
          }
          function baseIteratee(value) {
            if ("function" == typeof value) return value;
            if (null == value) return identity;
            if ("object" == typeof value) return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
            return property(value);
          }
          function baseKeys(object) {
            if (!isPrototype(object)) return nativeKeys(object);
            var result = [];
            for (var key in Object(object)) hasOwnProperty.call(object, key) && "constructor" != key && result.push(key);
            return result;
          }
          function baseKeysIn(object) {
            if (!isObject(object)) return nativeKeysIn(object);
            var isProto = isPrototype(object), result = [];
            for (var key in object) "constructor" == key && (isProto || !hasOwnProperty.call(object, key)) || result.push(key);
            return result;
          }
          function baseLt(value, other) {
            return value < other;
          }
          function baseMap(collection, iteratee) {
            var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
            baseEach(collection, function(value, key, collection) {
              result[++index] = iteratee(value, key, collection);
            });
            return result;
          }
          function baseMatches(source) {
            var matchData = getMatchData(source);
            if (1 == matchData.length && matchData[0][2]) return matchesStrictComparable(matchData[0][0], matchData[0][1]);
            return function(object) {
              return object === source || baseIsMatch(object, source, matchData);
            };
          }
          function baseMatchesProperty(path, srcValue) {
            if (isKey(path) && isStrictComparable(srcValue)) return matchesStrictComparable(toKey(path), srcValue);
            return function(object) {
              var objValue = get(object, path);
              return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
            };
          }
          function baseMerge(object, source, srcIndex, customizer, stack) {
            if (object === source) return;
            baseFor(source, function(srcValue, key) {
              if (isObject(srcValue)) {
                stack || (stack = new Stack());
                baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
              } else {
                var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : undefined;
                newValue === undefined && (newValue = srcValue);
                assignMergeValue(object, key, newValue);
              }
            }, keysIn);
          }
          function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
            var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
            if (stacked) {
              assignMergeValue(object, key, stacked);
              return;
            }
            var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined;
            var isCommon = newValue === undefined;
            if (isCommon) {
              var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
              newValue = srcValue;
              if (isArr || isBuff || isTyped) if (isArray(objValue)) newValue = objValue; else if (isArrayLikeObject(objValue)) newValue = copyArray(objValue); else if (isBuff) {
                isCommon = false;
                newValue = cloneBuffer(srcValue, true);
              } else if (isTyped) {
                isCommon = false;
                newValue = cloneTypedArray(srcValue, true);
              } else newValue = []; else if (isPlainObject(srcValue) || isArguments(srcValue)) {
                newValue = objValue;
                isArguments(objValue) ? newValue = toPlainObject(objValue) : isObject(objValue) && !isFunction(objValue) || (newValue = initCloneObject(srcValue));
              } else isCommon = false;
            }
            if (isCommon) {
              stack.set(srcValue, newValue);
              mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
              stack["delete"](srcValue);
            }
            assignMergeValue(object, key, newValue);
          }
          function baseNth(array, n) {
            var length = array.length;
            if (!length) return;
            n += n < 0 ? length : 0;
            return isIndex(n, length) ? array[n] : undefined;
          }
          function baseOrderBy(collection, iteratees, orders) {
            var index = -1;
            iteratees = arrayMap(iteratees.length ? iteratees : [ identity ], baseUnary(getIteratee()));
            var result = baseMap(collection, function(value, key, collection) {
              var criteria = arrayMap(iteratees, function(iteratee) {
                return iteratee(value);
              });
              return {
                criteria: criteria,
                index: ++index,
                value: value
              };
            });
            return baseSortBy(result, function(object, other) {
              return compareMultiple(object, other, orders);
            });
          }
          function basePick(object, paths) {
            return basePickBy(object, paths, function(value, path) {
              return hasIn(object, path);
            });
          }
          function basePickBy(object, paths, predicate) {
            var index = -1, length = paths.length, result = {};
            while (++index < length) {
              var path = paths[index], value = baseGet(object, path);
              predicate(value, path) && baseSet(result, castPath(path, object), value);
            }
            return result;
          }
          function basePropertyDeep(path) {
            return function(object) {
              return baseGet(object, path);
            };
          }
          function basePullAll(array, values, iteratee, comparator) {
            var indexOf = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values.length, seen = array;
            array === values && (values = copyArray(values));
            iteratee && (seen = arrayMap(array, baseUnary(iteratee)));
            while (++index < length) {
              var fromIndex = 0, value = values[index], computed = iteratee ? iteratee(value) : value;
              while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
                seen !== array && splice.call(seen, fromIndex, 1);
                splice.call(array, fromIndex, 1);
              }
            }
            return array;
          }
          function basePullAt(array, indexes) {
            var length = array ? indexes.length : 0, lastIndex = length - 1;
            while (length--) {
              var index = indexes[length];
              if (length == lastIndex || index !== previous) {
                var previous = index;
                isIndex(index) ? splice.call(array, index, 1) : baseUnset(array, index);
              }
            }
            return array;
          }
          function baseRandom(lower, upper) {
            return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
          }
          function baseRange(start, end, step, fromRight) {
            var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
            while (length--) {
              result[fromRight ? length : ++index] = start;
              start += step;
            }
            return result;
          }
          function baseRepeat(string, n) {
            var result = "";
            if (!string || n < 1 || n > MAX_SAFE_INTEGER) return result;
            do {
              n % 2 && (result += string);
              n = nativeFloor(n / 2);
              n && (string += string);
            } while (n);
            return result;
          }
          function baseRest(func, start) {
            return setToString(overRest(func, start, identity), func + "");
          }
          function baseSample(collection) {
            return arraySample(values(collection));
          }
          function baseSampleSize(collection, n) {
            var array = values(collection);
            return shuffleSelf(array, baseClamp(n, 0, array.length));
          }
          function baseSet(object, path, value, customizer) {
            if (!isObject(object)) return object;
            path = castPath(path, object);
            var index = -1, length = path.length, lastIndex = length - 1, nested = object;
            while (null != nested && ++index < length) {
              var key = toKey(path[index]), newValue = value;
              if (index != lastIndex) {
                var objValue = nested[key];
                newValue = customizer ? customizer(objValue, key, nested) : undefined;
                newValue === undefined && (newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {});
              }
              assignValue(nested, key, newValue);
              nested = nested[key];
            }
            return object;
          }
          var baseSetData = metaMap ? function(func, data) {
            metaMap.set(func, data);
            return func;
          } : identity;
          var baseSetToString = defineProperty ? function(func, string) {
            return defineProperty(func, "toString", {
              configurable: true,
              enumerable: false,
              value: constant(string),
              writable: true
            });
          } : identity;
          function baseShuffle(collection) {
            return shuffleSelf(values(collection));
          }
          function baseSlice(array, start, end) {
            var index = -1, length = array.length;
            start < 0 && (start = -start > length ? 0 : length + start);
            end = end > length ? length : end;
            end < 0 && (end += length);
            length = start > end ? 0 : end - start >>> 0;
            start >>>= 0;
            var result = Array(length);
            while (++index < length) result[index] = array[index + start];
            return result;
          }
          function baseSome(collection, predicate) {
            var result;
            baseEach(collection, function(value, index, collection) {
              result = predicate(value, index, collection);
              return !result;
            });
            return !!result;
          }
          function baseSortedIndex(array, value, retHighest) {
            var low = 0, high = null == array ? low : array.length;
            if ("number" == typeof value && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
              while (low < high) {
                var mid = low + high >>> 1, computed = array[mid];
                null !== computed && !isSymbol(computed) && (retHighest ? computed <= value : computed < value) ? low = mid + 1 : high = mid;
              }
              return high;
            }
            return baseSortedIndexBy(array, value, identity, retHighest);
          }
          function baseSortedIndexBy(array, value, iteratee, retHighest) {
            value = iteratee(value);
            var low = 0, high = null == array ? 0 : array.length, valIsNaN = value !== value, valIsNull = null === value, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined;
            while (low < high) {
              var mid = nativeFloor((low + high) / 2), computed = iteratee(array[mid]), othIsDefined = computed !== undefined, othIsNull = null === computed, othIsReflexive = computed === computed, othIsSymbol = isSymbol(computed);
              if (valIsNaN) var setLow = retHighest || othIsReflexive; else setLow = valIsUndefined ? othIsReflexive && (retHighest || othIsDefined) : valIsNull ? othIsReflexive && othIsDefined && (retHighest || !othIsNull) : valIsSymbol ? othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol) : !othIsNull && !othIsSymbol && (retHighest ? computed <= value : computed < value);
              setLow ? low = mid + 1 : high = mid;
            }
            return nativeMin(high, MAX_ARRAY_INDEX);
          }
          function baseSortedUniq(array, iteratee) {
            var index = -1, length = array.length, resIndex = 0, result = [];
            while (++index < length) {
              var value = array[index], computed = iteratee ? iteratee(value) : value;
              if (!index || !eq(computed, seen)) {
                var seen = computed;
                result[resIndex++] = 0 === value ? 0 : value;
              }
            }
            return result;
          }
          function baseToNumber(value) {
            if ("number" == typeof value) return value;
            if (isSymbol(value)) return NAN;
            return +value;
          }
          function baseToString(value) {
            if ("string" == typeof value) return value;
            if (isArray(value)) return arrayMap(value, baseToString) + "";
            if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : "";
            var result = value + "";
            return "0" == result && 1 / value == -INFINITY ? "-0" : result;
          }
          function baseUniq(array, iteratee, comparator) {
            var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
            if (comparator) {
              isCommon = false;
              includes = arrayIncludesWith;
            } else if (length >= LARGE_ARRAY_SIZE) {
              var set = iteratee ? null : createSet(array);
              if (set) return setToArray(set);
              isCommon = false;
              includes = cacheHas;
              seen = new SetCache();
            } else seen = iteratee ? [] : result;
            outer: while (++index < length) {
              var value = array[index], computed = iteratee ? iteratee(value) : value;
              value = comparator || 0 !== value ? value : 0;
              if (isCommon && computed === computed) {
                var seenIndex = seen.length;
                while (seenIndex--) if (seen[seenIndex] === computed) continue outer;
                iteratee && seen.push(computed);
                result.push(value);
              } else if (!includes(seen, computed, comparator)) {
                seen !== result && seen.push(computed);
                result.push(value);
              }
            }
            return result;
          }
          function baseUnset(object, path) {
            path = castPath(path, object);
            object = parent(object, path);
            return null == object || delete object[toKey(last(path))];
          }
          function baseUpdate(object, path, updater, customizer) {
            return baseSet(object, path, updater(baseGet(object, path)), customizer);
          }
          function baseWhile(array, predicate, isDrop, fromRight) {
            var length = array.length, index = fromRight ? length : -1;
            while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) ;
            return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
          }
          function baseWrapperValue(value, actions) {
            var result = value;
            result instanceof LazyWrapper && (result = result.value());
            return arrayReduce(actions, function(result, action) {
              return action.func.apply(action.thisArg, arrayPush([ result ], action.args));
            }, result);
          }
          function baseXor(arrays, iteratee, comparator) {
            var length = arrays.length;
            if (length < 2) return length ? baseUniq(arrays[0]) : [];
            var index = -1, result = Array(length);
            while (++index < length) {
              var array = arrays[index], othIndex = -1;
              while (++othIndex < length) othIndex != index && (result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator));
            }
            return baseUniq(baseFlatten(result, 1), iteratee, comparator);
          }
          function baseZipObject(props, values, assignFunc) {
            var index = -1, length = props.length, valsLength = values.length, result = {};
            while (++index < length) {
              var value = index < valsLength ? values[index] : undefined;
              assignFunc(result, props[index], value);
            }
            return result;
          }
          function castArrayLikeObject(value) {
            return isArrayLikeObject(value) ? value : [];
          }
          function castFunction(value) {
            return "function" == typeof value ? value : identity;
          }
          function castPath(value, object) {
            if (isArray(value)) return value;
            return isKey(value, object) ? [ value ] : stringToPath(toString(value));
          }
          var castRest = baseRest;
          function castSlice(array, start, end) {
            var length = array.length;
            end = end === undefined ? length : end;
            return !start && end >= length ? array : baseSlice(array, start, end);
          }
          var clearTimeout = ctxClearTimeout || function(id) {
            return root.clearTimeout(id);
          };
          function cloneBuffer(buffer, isDeep) {
            if (isDeep) return buffer.slice();
            var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
            buffer.copy(result);
            return result;
          }
          function cloneArrayBuffer(arrayBuffer) {
            var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
            new Uint8Array(result).set(new Uint8Array(arrayBuffer));
            return result;
          }
          function cloneDataView(dataView, isDeep) {
            var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
            return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
          }
          function cloneRegExp(regexp) {
            var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
            result.lastIndex = regexp.lastIndex;
            return result;
          }
          function cloneSymbol(symbol) {
            return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
          }
          function cloneTypedArray(typedArray, isDeep) {
            var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
            return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
          }
          function compareAscending(value, other) {
            if (value !== other) {
              var valIsDefined = value !== undefined, valIsNull = null === value, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
              var othIsDefined = other !== undefined, othIsNull = null === other, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
              if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) return 1;
              if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) return -1;
            }
            return 0;
          }
          function compareMultiple(object, other, orders) {
            var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
            while (++index < length) {
              var result = compareAscending(objCriteria[index], othCriteria[index]);
              if (result) {
                if (index >= ordersLength) return result;
                var order = orders[index];
                return result * ("desc" == order ? -1 : 1);
              }
            }
            return object.index - other.index;
          }
          function composeArgs(args, partials, holders, isCurried) {
            var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(leftLength + rangeLength), isUncurried = !isCurried;
            while (++leftIndex < leftLength) result[leftIndex] = partials[leftIndex];
            while (++argsIndex < holdersLength) (isUncurried || argsIndex < argsLength) && (result[holders[argsIndex]] = args[argsIndex]);
            while (rangeLength--) result[leftIndex++] = args[argsIndex++];
            return result;
          }
          function composeArgsRight(args, partials, holders, isCurried) {
            var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(rangeLength + rightLength), isUncurried = !isCurried;
            while (++argsIndex < rangeLength) result[argsIndex] = args[argsIndex];
            var offset = argsIndex;
            while (++rightIndex < rightLength) result[offset + rightIndex] = partials[rightIndex];
            while (++holdersIndex < holdersLength) (isUncurried || argsIndex < argsLength) && (result[offset + holders[holdersIndex]] = args[argsIndex++]);
            return result;
          }
          function copyArray(source, array) {
            var index = -1, length = source.length;
            array || (array = Array(length));
            while (++index < length) array[index] = source[index];
            return array;
          }
          function copyObject(source, props, object, customizer) {
            var isNew = !object;
            object || (object = {});
            var index = -1, length = props.length;
            while (++index < length) {
              var key = props[index];
              var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
              newValue === undefined && (newValue = source[key]);
              isNew ? baseAssignValue(object, key, newValue) : assignValue(object, key, newValue);
            }
            return object;
          }
          function copySymbols(source, object) {
            return copyObject(source, getSymbols(source), object);
          }
          function copySymbolsIn(source, object) {
            return copyObject(source, getSymbolsIn(source), object);
          }
          function createAggregator(setter, initializer) {
            return function(collection, iteratee) {
              var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
              return func(collection, setter, getIteratee(iteratee, 2), accumulator);
            };
          }
          function createAssigner(assigner) {
            return baseRest(function(object, sources) {
              var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined, guard = length > 2 ? sources[2] : undefined;
              customizer = assigner.length > 3 && "function" == typeof customizer ? (length--, 
              customizer) : undefined;
              if (guard && isIterateeCall(sources[0], sources[1], guard)) {
                customizer = length < 3 ? undefined : customizer;
                length = 1;
              }
              object = Object(object);
              while (++index < length) {
                var source = sources[index];
                source && assigner(object, source, index, customizer);
              }
              return object;
            });
          }
          function createBaseEach(eachFunc, fromRight) {
            return function(collection, iteratee) {
              if (null == collection) return collection;
              if (!isArrayLike(collection)) return eachFunc(collection, iteratee);
              var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
              while (fromRight ? index-- : ++index < length) if (false === iteratee(iterable[index], index, iterable)) break;
              return collection;
            };
          }
          function createBaseFor(fromRight) {
            return function(object, iteratee, keysFunc) {
              var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
              while (length--) {
                var key = props[fromRight ? length : ++index];
                if (false === iteratee(iterable[key], key, iterable)) break;
              }
              return object;
            };
          }
          function createBind(func, bitmask, thisArg) {
            var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
            function wrapper() {
              var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
              return fn.apply(isBind ? thisArg : this, arguments);
            }
            return wrapper;
          }
          function createCaseFirst(methodName) {
            return function(string) {
              string = toString(string);
              var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined;
              var chr = strSymbols ? strSymbols[0] : string.charAt(0);
              var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
              return chr[methodName]() + trailing;
            };
          }
          function createCompounder(callback) {
            return function(string) {
              return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
            };
          }
          function createCtor(Ctor) {
            return function() {
              var args = arguments;
              switch (args.length) {
               case 0:
                return new Ctor();

               case 1:
                return new Ctor(args[0]);

               case 2:
                return new Ctor(args[0], args[1]);

               case 3:
                return new Ctor(args[0], args[1], args[2]);

               case 4:
                return new Ctor(args[0], args[1], args[2], args[3]);

               case 5:
                return new Ctor(args[0], args[1], args[2], args[3], args[4]);

               case 6:
                return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);

               case 7:
                return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
              }
              var thisBinding = baseCreate(Ctor.prototype), result = Ctor.apply(thisBinding, args);
              return isObject(result) ? result : thisBinding;
            };
          }
          function createCurry(func, bitmask, arity) {
            var Ctor = createCtor(func);
            function wrapper() {
              var length = arguments.length, args = Array(length), index = length, placeholder = getHolder(wrapper);
              while (index--) args[index] = arguments[index];
              var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
              length -= holders.length;
              if (length < arity) return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, undefined, args, holders, undefined, undefined, arity - length);
              var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
              return apply(fn, this, args);
            }
            return wrapper;
          }
          function createFind(findIndexFunc) {
            return function(collection, predicate, fromIndex) {
              var iterable = Object(collection);
              if (!isArrayLike(collection)) {
                var iteratee = getIteratee(predicate, 3);
                collection = keys(collection);
                predicate = function(key) {
                  return iteratee(iterable[key], key, iterable);
                };
              }
              var index = findIndexFunc(collection, predicate, fromIndex);
              return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
            };
          }
          function createFlow(fromRight) {
            return flatRest(function(funcs) {
              var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
              fromRight && funcs.reverse();
              while (index--) {
                var func = funcs[index];
                if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                if (prereq && !wrapper && "wrapper" == getFuncName(func)) var wrapper = new LodashWrapper([], true);
              }
              index = wrapper ? index : length;
              while (++index < length) {
                func = funcs[index];
                var funcName = getFuncName(func), data = "wrapper" == funcName ? getData(func) : undefined;
                wrapper = data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && 1 == data[9] ? wrapper[getFuncName(data[0])].apply(wrapper, data[3]) : 1 == func.length && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
              }
              return function() {
                var args = arguments, value = args[0];
                if (wrapper && 1 == args.length && isArray(value)) return wrapper.plant(value).value();
                var index = 0, result = length ? funcs[index].apply(this, args) : value;
                while (++index < length) result = funcs[index].call(this, result);
                return result;
              };
            });
          }
          function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
            var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined : createCtor(func);
            function wrapper() {
              var length = arguments.length, args = Array(length), index = length;
              while (index--) args[index] = arguments[index];
              if (isCurried) var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
              partials && (args = composeArgs(args, partials, holders, isCurried));
              partialsRight && (args = composeArgsRight(args, partialsRight, holdersRight, isCurried));
              length -= holdersCount;
              if (isCurried && length < arity) {
                var newHolders = replaceHolders(args, placeholder);
                return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, thisArg, args, newHolders, argPos, ary, arity - length);
              }
              var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
              length = args.length;
              argPos ? args = reorder(args, argPos) : isFlip && length > 1 && args.reverse();
              isAry && ary < length && (args.length = ary);
              this && this !== root && this instanceof wrapper && (fn = Ctor || createCtor(fn));
              return fn.apply(thisBinding, args);
            }
            return wrapper;
          }
          function createInverter(setter, toIteratee) {
            return function(object, iteratee) {
              return baseInverter(object, setter, toIteratee(iteratee), {});
            };
          }
          function createMathOperation(operator, defaultValue) {
            return function(value, other) {
              var result;
              if (value === undefined && other === undefined) return defaultValue;
              value !== undefined && (result = value);
              if (other !== undefined) {
                if (result === undefined) return other;
                if ("string" == typeof value || "string" == typeof other) {
                  value = baseToString(value);
                  other = baseToString(other);
                } else {
                  value = baseToNumber(value);
                  other = baseToNumber(other);
                }
                result = operator(value, other);
              }
              return result;
            };
          }
          function createOver(arrayFunc) {
            return flatRest(function(iteratees) {
              iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
              return baseRest(function(args) {
                var thisArg = this;
                return arrayFunc(iteratees, function(iteratee) {
                  return apply(iteratee, thisArg, args);
                });
              });
            });
          }
          function createPadding(length, chars) {
            chars = chars === undefined ? " " : baseToString(chars);
            var charsLength = chars.length;
            if (charsLength < 2) return charsLength ? baseRepeat(chars, length) : chars;
            var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
            return hasUnicode(chars) ? castSlice(stringToArray(result), 0, length).join("") : result.slice(0, length);
          }
          function createPartial(func, bitmask, thisArg, partials) {
            var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
            function wrapper() {
              var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
              while (++leftIndex < leftLength) args[leftIndex] = partials[leftIndex];
              while (argsLength--) args[leftIndex++] = arguments[++argsIndex];
              return apply(fn, isBind ? thisArg : this, args);
            }
            return wrapper;
          }
          function createRange(fromRight) {
            return function(start, end, step) {
              step && "number" != typeof step && isIterateeCall(start, end, step) && (end = step = undefined);
              start = toFinite(start);
              if (end === undefined) {
                end = start;
                start = 0;
              } else end = toFinite(end);
              step = step === undefined ? start < end ? 1 : -1 : toFinite(step);
              return baseRange(start, end, step, fromRight);
            };
          }
          function createRelationalOperation(operator) {
            return function(value, other) {
              if (!("string" == typeof value && "string" == typeof other)) {
                value = toNumber(value);
                other = toNumber(other);
              }
              return operator(value, other);
            };
          }
          function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
            var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined, newHoldersRight = isCurry ? undefined : holders, newPartials = isCurry ? partials : undefined, newPartialsRight = isCurry ? undefined : partials;
            bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
            bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
            bitmask & WRAP_CURRY_BOUND_FLAG || (bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG));
            var newData = [ func, bitmask, thisArg, newPartials, newHolders, newPartialsRight, newHoldersRight, argPos, ary, arity ];
            var result = wrapFunc.apply(undefined, newData);
            isLaziable(func) && setData(result, newData);
            result.placeholder = placeholder;
            return setWrapToString(result, func, bitmask);
          }
          function createRound(methodName) {
            var func = Math[methodName];
            return function(number, precision) {
              number = toNumber(number);
              precision = null == precision ? 0 : nativeMin(toInteger(precision), 292);
              if (precision) {
                var pair = (toString(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
                pair = (toString(value) + "e").split("e");
                return +(pair[0] + "e" + (+pair[1] - precision));
              }
              return func(number);
            };
          }
          var createSet = Set && 1 / setToArray(new Set([ , -0 ]))[1] == INFINITY ? function(values) {
            return new Set(values);
          } : noop;
          function createToPairs(keysFunc) {
            return function(object) {
              var tag = getTag(object);
              if (tag == mapTag) return mapToArray(object);
              if (tag == setTag) return setToPairs(object);
              return baseToPairs(object, keysFunc(object));
            };
          }
          function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
            var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
            if (!isBindKey && "function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            var length = partials ? partials.length : 0;
            if (!length) {
              bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
              partials = holders = undefined;
            }
            ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
            arity = arity === undefined ? arity : toInteger(arity);
            length -= holders ? holders.length : 0;
            if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
              var partialsRight = partials, holdersRight = holders;
              partials = holders = undefined;
            }
            var data = isBindKey ? undefined : getData(func);
            var newData = [ func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity ];
            data && mergeData(newData, data);
            func = newData[0];
            bitmask = newData[1];
            thisArg = newData[2];
            partials = newData[3];
            holders = newData[4];
            arity = newData[9] = newData[9] === undefined ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
            !arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG) && (bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG));
            if (bitmask && bitmask != WRAP_BIND_FLAG) result = bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG ? createCurry(func, bitmask, arity) : bitmask != WRAP_PARTIAL_FLAG && bitmask != (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG) || holders.length ? createHybrid.apply(undefined, newData) : createPartial(func, bitmask, thisArg, partials); else var result = createBind(func, bitmask, thisArg);
            var setter = data ? baseSetData : setData;
            return setWrapToString(setter(result, newData), func, bitmask);
          }
          function customDefaultsAssignIn(objValue, srcValue, key, object) {
            if (objValue === undefined || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) return srcValue;
            return objValue;
          }
          function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
            if (isObject(objValue) && isObject(srcValue)) {
              stack.set(srcValue, objValue);
              baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
              stack["delete"](srcValue);
            }
            return objValue;
          }
          function customOmitClone(value) {
            return isPlainObject(value) ? undefined : value;
          }
          function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
            if (arrLength != othLength && !(isPartial && othLength > arrLength)) return false;
            var stacked = stack.get(array);
            if (stacked && stack.get(other)) return stacked == other;
            var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
            stack.set(array, other);
            stack.set(other, array);
            while (++index < arrLength) {
              var arrValue = array[index], othValue = other[index];
              if (customizer) var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
              if (compared !== undefined) {
                if (compared) continue;
                result = false;
                break;
              }
              if (seen) {
                if (!arraySome(other, function(othValue, othIndex) {
                  if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) return seen.push(othIndex);
                })) {
                  result = false;
                  break;
                }
              } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                result = false;
                break;
              }
            }
            stack["delete"](array);
            stack["delete"](other);
            return result;
          }
          function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
            switch (tag) {
             case dataViewTag:
              if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) return false;
              object = object.buffer;
              other = other.buffer;

             case arrayBufferTag:
              if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) return false;
              return true;

             case boolTag:
             case dateTag:
             case numberTag:
              return eq(+object, +other);

             case errorTag:
              return object.name == other.name && object.message == other.message;

             case regexpTag:
             case stringTag:
              return object == other + "";

             case mapTag:
              var convert = mapToArray;

             case setTag:
              var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
              convert || (convert = setToArray);
              if (object.size != other.size && !isPartial) return false;
              var stacked = stack.get(object);
              if (stacked) return stacked == other;
              bitmask |= COMPARE_UNORDERED_FLAG;
              stack.set(object, other);
              var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
              stack["delete"](object);
              return result;

             case symbolTag:
              if (symbolValueOf) return symbolValueOf.call(object) == symbolValueOf.call(other);
            }
            return false;
          }
          function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
            if (objLength != othLength && !isPartial) return false;
            var index = objLength;
            while (index--) {
              var key = objProps[index];
              if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) return false;
            }
            var stacked = stack.get(object);
            if (stacked && stack.get(other)) return stacked == other;
            var result = true;
            stack.set(object, other);
            stack.set(other, object);
            var skipCtor = isPartial;
            while (++index < objLength) {
              key = objProps[index];
              var objValue = object[key], othValue = other[key];
              if (customizer) var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
              if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
                result = false;
                break;
              }
              skipCtor || (skipCtor = "constructor" == key);
            }
            if (result && !skipCtor) {
              var objCtor = object.constructor, othCtor = other.constructor;
              objCtor != othCtor && "constructor" in object && "constructor" in other && !("function" == typeof objCtor && objCtor instanceof objCtor && "function" == typeof othCtor && othCtor instanceof othCtor) && (result = false);
            }
            stack["delete"](object);
            stack["delete"](other);
            return result;
          }
          function flatRest(func) {
            return setToString(overRest(func, undefined, flatten), func + "");
          }
          function getAllKeys(object) {
            return baseGetAllKeys(object, keys, getSymbols);
          }
          function getAllKeysIn(object) {
            return baseGetAllKeys(object, keysIn, getSymbolsIn);
          }
          var getData = metaMap ? function(func) {
            return metaMap.get(func);
          } : noop;
          function getFuncName(func) {
            var result = func.name + "", array = realNames[result], length = hasOwnProperty.call(realNames, result) ? array.length : 0;
            while (length--) {
              var data = array[length], otherFunc = data.func;
              if (null == otherFunc || otherFunc == func) return data.name;
            }
            return result;
          }
          function getHolder(func) {
            var object = hasOwnProperty.call(lodash, "placeholder") ? lodash : func;
            return object.placeholder;
          }
          function getIteratee() {
            var result = lodash.iteratee || iteratee;
            result = result === iteratee ? baseIteratee : result;
            return arguments.length ? result(arguments[0], arguments[1]) : result;
          }
          function getMapData(map, key) {
            var data = map.__data__;
            return isKeyable(key) ? data["string" == typeof key ? "string" : "hash"] : data.map;
          }
          function getMatchData(object) {
            var result = keys(object), length = result.length;
            while (length--) {
              var key = result[length], value = object[key];
              result[length] = [ key, value, isStrictComparable(value) ];
            }
            return result;
          }
          function getNative(object, key) {
            var value = getValue(object, key);
            return baseIsNative(value) ? value : undefined;
          }
          function getRawTag(value) {
            var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
            try {
              value[symToStringTag] = undefined;
              var unmasked = true;
            } catch (e) {}
            var result = nativeObjectToString.call(value);
            unmasked && (isOwn ? value[symToStringTag] = tag : delete value[symToStringTag]);
            return result;
          }
          var getSymbols = nativeGetSymbols ? function(object) {
            if (null == object) return [];
            object = Object(object);
            return arrayFilter(nativeGetSymbols(object), function(symbol) {
              return propertyIsEnumerable.call(object, symbol);
            });
          } : stubArray;
          var getSymbolsIn = nativeGetSymbols ? function(object) {
            var result = [];
            while (object) {
              arrayPush(result, getSymbols(object));
              object = getPrototype(object);
            }
            return result;
          } : stubArray;
          var getTag = baseGetTag;
          (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) && (getTag = function(value) {
            var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : "";
            if (ctorString) switch (ctorString) {
             case dataViewCtorString:
              return dataViewTag;

             case mapCtorString:
              return mapTag;

             case promiseCtorString:
              return promiseTag;

             case setCtorString:
              return setTag;

             case weakMapCtorString:
              return weakMapTag;
            }
            return result;
          });
          function getView(start, end, transforms) {
            var index = -1, length = transforms.length;
            while (++index < length) {
              var data = transforms[index], size = data.size;
              switch (data.type) {
               case "drop":
                start += size;
                break;

               case "dropRight":
                end -= size;
                break;

               case "take":
                end = nativeMin(end, start + size);
                break;

               case "takeRight":
                start = nativeMax(start, end - size);
              }
            }
            return {
              start: start,
              end: end
            };
          }
          function getWrapDetails(source) {
            var match = source.match(reWrapDetails);
            return match ? match[1].split(reSplitDetails) : [];
          }
          function hasPath(object, path, hasFunc) {
            path = castPath(path, object);
            var index = -1, length = path.length, result = false;
            while (++index < length) {
              var key = toKey(path[index]);
              if (!(result = null != object && hasFunc(object, key))) break;
              object = object[key];
            }
            if (result || ++index != length) return result;
            length = null == object ? 0 : object.length;
            return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
          }
          function initCloneArray(array) {
            var length = array.length, result = new array.constructor(length);
            if (length && "string" == typeof array[0] && hasOwnProperty.call(array, "index")) {
              result.index = array.index;
              result.input = array.input;
            }
            return result;
          }
          function initCloneObject(object) {
            return "function" != typeof object.constructor || isPrototype(object) ? {} : baseCreate(getPrototype(object));
          }
          function initCloneByTag(object, tag, isDeep) {
            var Ctor = object.constructor;
            switch (tag) {
             case arrayBufferTag:
              return cloneArrayBuffer(object);

             case boolTag:
             case dateTag:
              return new Ctor(+object);

             case dataViewTag:
              return cloneDataView(object, isDeep);

             case float32Tag:
             case float64Tag:
             case int8Tag:
             case int16Tag:
             case int32Tag:
             case uint8Tag:
             case uint8ClampedTag:
             case uint16Tag:
             case uint32Tag:
              return cloneTypedArray(object, isDeep);

             case mapTag:
              return new Ctor();

             case numberTag:
             case stringTag:
              return new Ctor(object);

             case regexpTag:
              return cloneRegExp(object);

             case setTag:
              return new Ctor();

             case symbolTag:
              return cloneSymbol(object);
            }
          }
          function insertWrapDetails(source, details) {
            var length = details.length;
            if (!length) return source;
            var lastIndex = length - 1;
            details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
            details = details.join(length > 2 ? ", " : " ");
            return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
          }
          function isFlattenable(value) {
            return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
          }
          function isIndex(value, length) {
            var type = typeof value;
            length = null == length ? MAX_SAFE_INTEGER : length;
            return !!length && ("number" == type || "symbol" != type && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
          }
          function isIterateeCall(value, index, object) {
            if (!isObject(object)) return false;
            var type = typeof index;
            if ("number" == type ? isArrayLike(object) && isIndex(index, object.length) : "string" == type && index in object) return eq(object[index], value);
            return false;
          }
          function isKey(value, object) {
            if (isArray(value)) return false;
            var type = typeof value;
            if ("number" == type || "symbol" == type || "boolean" == type || null == value || isSymbol(value)) return true;
            return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || null != object && value in Object(object);
          }
          function isKeyable(value) {
            var type = typeof value;
            return "string" == type || "number" == type || "symbol" == type || "boolean" == type ? "__proto__" !== value : null === value;
          }
          function isLaziable(func) {
            var funcName = getFuncName(func), other = lodash[funcName];
            if ("function" != typeof other || !(funcName in LazyWrapper.prototype)) return false;
            if (func === other) return true;
            var data = getData(other);
            return !!data && func === data[0];
          }
          function isMasked(func) {
            return !!maskSrcKey && maskSrcKey in func;
          }
          var isMaskable = coreJsData ? isFunction : stubFalse;
          function isPrototype(value) {
            var Ctor = value && value.constructor, proto = "function" == typeof Ctor && Ctor.prototype || objectProto;
            return value === proto;
          }
          function isStrictComparable(value) {
            return value === value && !isObject(value);
          }
          function matchesStrictComparable(key, srcValue) {
            return function(object) {
              if (null == object) return false;
              return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
            };
          }
          function memoizeCapped(func) {
            var result = memoize(func, function(key) {
              cache.size === MAX_MEMOIZE_SIZE && cache.clear();
              return key;
            });
            var cache = result.cache;
            return result;
          }
          function mergeData(data, source) {
            var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
            var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
            if (!(isCommon || isCombo)) return data;
            if (srcBitmask & WRAP_BIND_FLAG) {
              data[2] = source[2];
              newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
            }
            var value = source[3];
            if (value) {
              var partials = data[3];
              data[3] = partials ? composeArgs(partials, value, source[4]) : value;
              data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
            }
            value = source[5];
            if (value) {
              partials = data[5];
              data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
              data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
            }
            value = source[7];
            value && (data[7] = value);
            srcBitmask & WRAP_ARY_FLAG && (data[8] = null == data[8] ? source[8] : nativeMin(data[8], source[8]));
            null == data[9] && (data[9] = source[9]);
            data[0] = source[0];
            data[1] = newBitmask;
            return data;
          }
          function nativeKeysIn(object) {
            var result = [];
            if (null != object) for (var key in Object(object)) result.push(key);
            return result;
          }
          function objectToString(value) {
            return nativeObjectToString.call(value);
          }
          function overRest(func, start, transform) {
            start = nativeMax(start === undefined ? func.length - 1 : start, 0);
            return function() {
              var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
              while (++index < length) array[index] = args[start + index];
              index = -1;
              var otherArgs = Array(start + 1);
              while (++index < start) otherArgs[index] = args[index];
              otherArgs[start] = transform(array);
              return apply(func, this, otherArgs);
            };
          }
          function parent(object, path) {
            return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
          }
          function reorder(array, indexes) {
            var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
            while (length--) {
              var index = indexes[length];
              array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
            }
            return array;
          }
          function safeGet(object, key) {
            if ("__proto__" == key) return;
            return object[key];
          }
          var setData = shortOut(baseSetData);
          var setTimeout = ctxSetTimeout || function(func, wait) {
            return root.setTimeout(func, wait);
          };
          var setToString = shortOut(baseSetToString);
          function setWrapToString(wrapper, reference, bitmask) {
            var source = reference + "";
            return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
          }
          function shortOut(func) {
            var count = 0, lastCalled = 0;
            return function() {
              var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
              lastCalled = stamp;
              if (remaining > 0) {
                if (++count >= HOT_COUNT) return arguments[0];
              } else count = 0;
              return func.apply(undefined, arguments);
            };
          }
          function shuffleSelf(array, size) {
            var index = -1, length = array.length, lastIndex = length - 1;
            size = size === undefined ? length : size;
            while (++index < size) {
              var rand = baseRandom(index, lastIndex), value = array[rand];
              array[rand] = array[index];
              array[index] = value;
            }
            array.length = size;
            return array;
          }
          var stringToPath = memoizeCapped(function(string) {
            var result = [];
            46 === string.charCodeAt(0) && result.push("");
            string.replace(rePropName, function(match, number, quote, subString) {
              result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
            });
            return result;
          });
          function toKey(value) {
            if ("string" == typeof value || isSymbol(value)) return value;
            var result = value + "";
            return "0" == result && 1 / value == -INFINITY ? "-0" : result;
          }
          function toSource(func) {
            if (null != func) {
              try {
                return funcToString.call(func);
              } catch (e) {}
              try {
                return func + "";
              } catch (e) {}
            }
            return "";
          }
          function updateWrapDetails(details, bitmask) {
            arrayEach(wrapFlags, function(pair) {
              var value = "_." + pair[0];
              bitmask & pair[1] && !arrayIncludes(details, value) && details.push(value);
            });
            return details.sort();
          }
          function wrapperClone(wrapper) {
            if (wrapper instanceof LazyWrapper) return wrapper.clone();
            var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
            result.__actions__ = copyArray(wrapper.__actions__);
            result.__index__ = wrapper.__index__;
            result.__values__ = wrapper.__values__;
            return result;
          }
          function chunk(array, size, guard) {
            size = (guard ? isIterateeCall(array, size, guard) : size === undefined) ? 1 : nativeMax(toInteger(size), 0);
            var length = null == array ? 0 : array.length;
            if (!length || size < 1) return [];
            var index = 0, resIndex = 0, result = Array(nativeCeil(length / size));
            while (index < length) result[resIndex++] = baseSlice(array, index, index += size);
            return result;
          }
          function compact(array) {
            var index = -1, length = null == array ? 0 : array.length, resIndex = 0, result = [];
            while (++index < length) {
              var value = array[index];
              value && (result[resIndex++] = value);
            }
            return result;
          }
          function concat() {
            var length = arguments.length;
            if (!length) return [];
            var args = Array(length - 1), array = arguments[0], index = length;
            while (index--) args[index - 1] = arguments[index];
            return arrayPush(isArray(array) ? copyArray(array) : [ array ], baseFlatten(args, 1));
          }
          var difference = baseRest(function(array, values) {
            return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
          });
          var differenceBy = baseRest(function(array, values) {
            var iteratee = last(values);
            isArrayLikeObject(iteratee) && (iteratee = undefined);
            return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2)) : [];
          });
          var differenceWith = baseRest(function(array, values) {
            var comparator = last(values);
            isArrayLikeObject(comparator) && (comparator = undefined);
            return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator) : [];
          });
          function drop(array, n, guard) {
            var length = null == array ? 0 : array.length;
            if (!length) return [];
            n = guard || n === undefined ? 1 : toInteger(n);
            return baseSlice(array, n < 0 ? 0 : n, length);
          }
          function dropRight(array, n, guard) {
            var length = null == array ? 0 : array.length;
            if (!length) return [];
            n = guard || n === undefined ? 1 : toInteger(n);
            n = length - n;
            return baseSlice(array, 0, n < 0 ? 0 : n);
          }
          function dropRightWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
          }
          function dropWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
          }
          function fill(array, value, start, end) {
            var length = null == array ? 0 : array.length;
            if (!length) return [];
            if (start && "number" != typeof start && isIterateeCall(array, value, start)) {
              start = 0;
              end = length;
            }
            return baseFill(array, value, start, end);
          }
          function findIndex(array, predicate, fromIndex) {
            var length = null == array ? 0 : array.length;
            if (!length) return -1;
            var index = null == fromIndex ? 0 : toInteger(fromIndex);
            index < 0 && (index = nativeMax(length + index, 0));
            return baseFindIndex(array, getIteratee(predicate, 3), index);
          }
          function findLastIndex(array, predicate, fromIndex) {
            var length = null == array ? 0 : array.length;
            if (!length) return -1;
            var index = length - 1;
            if (fromIndex !== undefined) {
              index = toInteger(fromIndex);
              index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
            }
            return baseFindIndex(array, getIteratee(predicate, 3), index, true);
          }
          function flatten(array) {
            var length = null == array ? 0 : array.length;
            return length ? baseFlatten(array, 1) : [];
          }
          function flattenDeep(array) {
            var length = null == array ? 0 : array.length;
            return length ? baseFlatten(array, INFINITY) : [];
          }
          function flattenDepth(array, depth) {
            var length = null == array ? 0 : array.length;
            if (!length) return [];
            depth = depth === undefined ? 1 : toInteger(depth);
            return baseFlatten(array, depth);
          }
          function fromPairs(pairs) {
            var index = -1, length = null == pairs ? 0 : pairs.length, result = {};
            while (++index < length) {
              var pair = pairs[index];
              result[pair[0]] = pair[1];
            }
            return result;
          }
          function head(array) {
            return array && array.length ? array[0] : undefined;
          }
          function indexOf(array, value, fromIndex) {
            var length = null == array ? 0 : array.length;
            if (!length) return -1;
            var index = null == fromIndex ? 0 : toInteger(fromIndex);
            index < 0 && (index = nativeMax(length + index, 0));
            return baseIndexOf(array, value, index);
          }
          function initial(array) {
            var length = null == array ? 0 : array.length;
            return length ? baseSlice(array, 0, -1) : [];
          }
          var intersection = baseRest(function(arrays) {
            var mapped = arrayMap(arrays, castArrayLikeObject);
            return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
          });
          var intersectionBy = baseRest(function(arrays) {
            var iteratee = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
            iteratee === last(mapped) ? iteratee = undefined : mapped.pop();
            return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee, 2)) : [];
          });
          var intersectionWith = baseRest(function(arrays) {
            var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
            comparator = "function" == typeof comparator ? comparator : undefined;
            comparator && mapped.pop();
            return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined, comparator) : [];
          });
          function join(array, separator) {
            return null == array ? "" : nativeJoin.call(array, separator);
          }
          function last(array) {
            var length = null == array ? 0 : array.length;
            return length ? array[length - 1] : undefined;
          }
          function lastIndexOf(array, value, fromIndex) {
            var length = null == array ? 0 : array.length;
            if (!length) return -1;
            var index = length;
            if (fromIndex !== undefined) {
              index = toInteger(fromIndex);
              index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
            }
            return value === value ? strictLastIndexOf(array, value, index) : baseFindIndex(array, baseIsNaN, index, true);
          }
          function nth(array, n) {
            return array && array.length ? baseNth(array, toInteger(n)) : undefined;
          }
          var pull = baseRest(pullAll);
          function pullAll(array, values) {
            return array && array.length && values && values.length ? basePullAll(array, values) : array;
          }
          function pullAllBy(array, values, iteratee) {
            return array && array.length && values && values.length ? basePullAll(array, values, getIteratee(iteratee, 2)) : array;
          }
          function pullAllWith(array, values, comparator) {
            return array && array.length && values && values.length ? basePullAll(array, values, undefined, comparator) : array;
          }
          var pullAt = flatRest(function(array, indexes) {
            var length = null == array ? 0 : array.length, result = baseAt(array, indexes);
            basePullAt(array, arrayMap(indexes, function(index) {
              return isIndex(index, length) ? +index : index;
            }).sort(compareAscending));
            return result;
          });
          function remove(array, predicate) {
            var result = [];
            if (!(array && array.length)) return result;
            var index = -1, indexes = [], length = array.length;
            predicate = getIteratee(predicate, 3);
            while (++index < length) {
              var value = array[index];
              if (predicate(value, index, array)) {
                result.push(value);
                indexes.push(index);
              }
            }
            basePullAt(array, indexes);
            return result;
          }
          function reverse(array) {
            return null == array ? array : nativeReverse.call(array);
          }
          function slice(array, start, end) {
            var length = null == array ? 0 : array.length;
            if (!length) return [];
            if (end && "number" != typeof end && isIterateeCall(array, start, end)) {
              start = 0;
              end = length;
            } else {
              start = null == start ? 0 : toInteger(start);
              end = end === undefined ? length : toInteger(end);
            }
            return baseSlice(array, start, end);
          }
          function sortedIndex(array, value) {
            return baseSortedIndex(array, value);
          }
          function sortedIndexBy(array, value, iteratee) {
            return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
          }
          function sortedIndexOf(array, value) {
            var length = null == array ? 0 : array.length;
            if (length) {
              var index = baseSortedIndex(array, value);
              if (index < length && eq(array[index], value)) return index;
            }
            return -1;
          }
          function sortedLastIndex(array, value) {
            return baseSortedIndex(array, value, true);
          }
          function sortedLastIndexBy(array, value, iteratee) {
            return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
          }
          function sortedLastIndexOf(array, value) {
            var length = null == array ? 0 : array.length;
            if (length) {
              var index = baseSortedIndex(array, value, true) - 1;
              if (eq(array[index], value)) return index;
            }
            return -1;
          }
          function sortedUniq(array) {
            return array && array.length ? baseSortedUniq(array) : [];
          }
          function sortedUniqBy(array, iteratee) {
            return array && array.length ? baseSortedUniq(array, getIteratee(iteratee, 2)) : [];
          }
          function tail(array) {
            var length = null == array ? 0 : array.length;
            return length ? baseSlice(array, 1, length) : [];
          }
          function take(array, n, guard) {
            if (!(array && array.length)) return [];
            n = guard || n === undefined ? 1 : toInteger(n);
            return baseSlice(array, 0, n < 0 ? 0 : n);
          }
          function takeRight(array, n, guard) {
            var length = null == array ? 0 : array.length;
            if (!length) return [];
            n = guard || n === undefined ? 1 : toInteger(n);
            n = length - n;
            return baseSlice(array, n < 0 ? 0 : n, length);
          }
          function takeRightWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
          }
          function takeWhile(array, predicate) {
            return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
          }
          var union = baseRest(function(arrays) {
            return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
          });
          var unionBy = baseRest(function(arrays) {
            var iteratee = last(arrays);
            isArrayLikeObject(iteratee) && (iteratee = undefined);
            return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
          });
          var unionWith = baseRest(function(arrays) {
            var comparator = last(arrays);
            comparator = "function" == typeof comparator ? comparator : undefined;
            return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
          });
          function uniq(array) {
            return array && array.length ? baseUniq(array) : [];
          }
          function uniqBy(array, iteratee) {
            return array && array.length ? baseUniq(array, getIteratee(iteratee, 2)) : [];
          }
          function uniqWith(array, comparator) {
            comparator = "function" == typeof comparator ? comparator : undefined;
            return array && array.length ? baseUniq(array, undefined, comparator) : [];
          }
          function unzip(array) {
            if (!(array && array.length)) return [];
            var length = 0;
            array = arrayFilter(array, function(group) {
              if (isArrayLikeObject(group)) {
                length = nativeMax(group.length, length);
                return true;
              }
            });
            return baseTimes(length, function(index) {
              return arrayMap(array, baseProperty(index));
            });
          }
          function unzipWith(array, iteratee) {
            if (!(array && array.length)) return [];
            var result = unzip(array);
            if (null == iteratee) return result;
            return arrayMap(result, function(group) {
              return apply(iteratee, undefined, group);
            });
          }
          var without = baseRest(function(array, values) {
            return isArrayLikeObject(array) ? baseDifference(array, values) : [];
          });
          var xor = baseRest(function(arrays) {
            return baseXor(arrayFilter(arrays, isArrayLikeObject));
          });
          var xorBy = baseRest(function(arrays) {
            var iteratee = last(arrays);
            isArrayLikeObject(iteratee) && (iteratee = undefined);
            return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
          });
          var xorWith = baseRest(function(arrays) {
            var comparator = last(arrays);
            comparator = "function" == typeof comparator ? comparator : undefined;
            return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
          });
          var zip = baseRest(unzip);
          function zipObject(props, values) {
            return baseZipObject(props || [], values || [], assignValue);
          }
          function zipObjectDeep(props, values) {
            return baseZipObject(props || [], values || [], baseSet);
          }
          var zipWith = baseRest(function(arrays) {
            var length = arrays.length, iteratee = length > 1 ? arrays[length - 1] : undefined;
            iteratee = "function" == typeof iteratee ? (arrays.pop(), iteratee) : undefined;
            return unzipWith(arrays, iteratee);
          });
          function chain(value) {
            var result = lodash(value);
            result.__chain__ = true;
            return result;
          }
          function tap(value, interceptor) {
            interceptor(value);
            return value;
          }
          function thru(value, interceptor) {
            return interceptor(value);
          }
          var wrapperAt = flatRest(function(paths) {
            var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object) {
              return baseAt(object, paths);
            };
            if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) return this.thru(interceptor);
            value = value.slice(start, +start + (length ? 1 : 0));
            value.__actions__.push({
              func: thru,
              args: [ interceptor ],
              thisArg: undefined
            });
            return new LodashWrapper(value, this.__chain__).thru(function(array) {
              length && !array.length && array.push(undefined);
              return array;
            });
          });
          function wrapperChain() {
            return chain(this);
          }
          function wrapperCommit() {
            return new LodashWrapper(this.value(), this.__chain__);
          }
          function wrapperNext() {
            this.__values__ === undefined && (this.__values__ = toArray(this.value()));
            var done = this.__index__ >= this.__values__.length, value = done ? undefined : this.__values__[this.__index__++];
            return {
              done: done,
              value: value
            };
          }
          function wrapperToIterator() {
            return this;
          }
          function wrapperPlant(value) {
            var result, parent = this;
            while (parent instanceof baseLodash) {
              var clone = wrapperClone(parent);
              clone.__index__ = 0;
              clone.__values__ = undefined;
              result ? previous.__wrapped__ = clone : result = clone;
              var previous = clone;
              parent = parent.__wrapped__;
            }
            previous.__wrapped__ = value;
            return result;
          }
          function wrapperReverse() {
            var value = this.__wrapped__;
            if (value instanceof LazyWrapper) {
              var wrapped = value;
              this.__actions__.length && (wrapped = new LazyWrapper(this));
              wrapped = wrapped.reverse();
              wrapped.__actions__.push({
                func: thru,
                args: [ reverse ],
                thisArg: undefined
              });
              return new LodashWrapper(wrapped, this.__chain__);
            }
            return this.thru(reverse);
          }
          function wrapperValue() {
            return baseWrapperValue(this.__wrapped__, this.__actions__);
          }
          var countBy = createAggregator(function(result, value, key) {
            hasOwnProperty.call(result, key) ? ++result[key] : baseAssignValue(result, key, 1);
          });
          function every(collection, predicate, guard) {
            var func = isArray(collection) ? arrayEvery : baseEvery;
            guard && isIterateeCall(collection, predicate, guard) && (predicate = undefined);
            return func(collection, getIteratee(predicate, 3));
          }
          function filter(collection, predicate) {
            var func = isArray(collection) ? arrayFilter : baseFilter;
            return func(collection, getIteratee(predicate, 3));
          }
          var find = createFind(findIndex);
          var findLast = createFind(findLastIndex);
          function flatMap(collection, iteratee) {
            return baseFlatten(map(collection, iteratee), 1);
          }
          function flatMapDeep(collection, iteratee) {
            return baseFlatten(map(collection, iteratee), INFINITY);
          }
          function flatMapDepth(collection, iteratee, depth) {
            depth = depth === undefined ? 1 : toInteger(depth);
            return baseFlatten(map(collection, iteratee), depth);
          }
          function forEach(collection, iteratee) {
            var func = isArray(collection) ? arrayEach : baseEach;
            return func(collection, getIteratee(iteratee, 3));
          }
          function forEachRight(collection, iteratee) {
            var func = isArray(collection) ? arrayEachRight : baseEachRight;
            return func(collection, getIteratee(iteratee, 3));
          }
          var groupBy = createAggregator(function(result, value, key) {
            hasOwnProperty.call(result, key) ? result[key].push(value) : baseAssignValue(result, key, [ value ]);
          });
          function includes(collection, value, fromIndex, guard) {
            collection = isArrayLike(collection) ? collection : values(collection);
            fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
            var length = collection.length;
            fromIndex < 0 && (fromIndex = nativeMax(length + fromIndex, 0));
            return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
          }
          var invokeMap = baseRest(function(collection, path, args) {
            var index = -1, isFunc = "function" == typeof path, result = isArrayLike(collection) ? Array(collection.length) : [];
            baseEach(collection, function(value) {
              result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
            });
            return result;
          });
          var keyBy = createAggregator(function(result, value, key) {
            baseAssignValue(result, key, value);
          });
          function map(collection, iteratee) {
            var func = isArray(collection) ? arrayMap : baseMap;
            return func(collection, getIteratee(iteratee, 3));
          }
          function orderBy(collection, iteratees, orders, guard) {
            if (null == collection) return [];
            isArray(iteratees) || (iteratees = null == iteratees ? [] : [ iteratees ]);
            orders = guard ? undefined : orders;
            isArray(orders) || (orders = null == orders ? [] : [ orders ]);
            return baseOrderBy(collection, iteratees, orders);
          }
          var partition = createAggregator(function(result, value, key) {
            result[key ? 0 : 1].push(value);
          }, function() {
            return [ [], [] ];
          });
          function reduce(collection, iteratee, accumulator) {
            var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
            return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
          }
          function reduceRight(collection, iteratee, accumulator) {
            var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
            return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
          }
          function reject(collection, predicate) {
            var func = isArray(collection) ? arrayFilter : baseFilter;
            return func(collection, negate(getIteratee(predicate, 3)));
          }
          function sample(collection) {
            var func = isArray(collection) ? arraySample : baseSample;
            return func(collection);
          }
          function sampleSize(collection, n, guard) {
            n = (guard ? isIterateeCall(collection, n, guard) : n === undefined) ? 1 : toInteger(n);
            var func = isArray(collection) ? arraySampleSize : baseSampleSize;
            return func(collection, n);
          }
          function shuffle(collection) {
            var func = isArray(collection) ? arrayShuffle : baseShuffle;
            return func(collection);
          }
          function size(collection) {
            if (null == collection) return 0;
            if (isArrayLike(collection)) return isString(collection) ? stringSize(collection) : collection.length;
            var tag = getTag(collection);
            if (tag == mapTag || tag == setTag) return collection.size;
            return baseKeys(collection).length;
          }
          function some(collection, predicate, guard) {
            var func = isArray(collection) ? arraySome : baseSome;
            guard && isIterateeCall(collection, predicate, guard) && (predicate = undefined);
            return func(collection, getIteratee(predicate, 3));
          }
          var sortBy = baseRest(function(collection, iteratees) {
            if (null == collection) return [];
            var length = iteratees.length;
            length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1]) ? iteratees = [] : length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2]) && (iteratees = [ iteratees[0] ]);
            return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
          });
          var now = ctxNow || function() {
            return root.Date.now();
          };
          function after(n, func) {
            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            n = toInteger(n);
            return function() {
              if (--n < 1) return func.apply(this, arguments);
            };
          }
          function ary(func, n, guard) {
            n = guard ? undefined : n;
            n = func && null == n ? func.length : n;
            return createWrap(func, WRAP_ARY_FLAG, undefined, undefined, undefined, undefined, n);
          }
          function before(n, func) {
            var result;
            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            n = toInteger(n);
            return function() {
              --n > 0 && (result = func.apply(this, arguments));
              n <= 1 && (func = undefined);
              return result;
            };
          }
          var bind = baseRest(function(func, thisArg, partials) {
            var bitmask = WRAP_BIND_FLAG;
            if (partials.length) {
              var holders = replaceHolders(partials, getHolder(bind));
              bitmask |= WRAP_PARTIAL_FLAG;
            }
            return createWrap(func, bitmask, thisArg, partials, holders);
          });
          var bindKey = baseRest(function(object, key, partials) {
            var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
            if (partials.length) {
              var holders = replaceHolders(partials, getHolder(bindKey));
              bitmask |= WRAP_PARTIAL_FLAG;
            }
            return createWrap(key, bitmask, object, partials, holders);
          });
          function curry(func, arity, guard) {
            arity = guard ? undefined : arity;
            var result = createWrap(func, WRAP_CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
            result.placeholder = curry.placeholder;
            return result;
          }
          function curryRight(func, arity, guard) {
            arity = guard ? undefined : arity;
            var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
            result.placeholder = curryRight.placeholder;
            return result;
          }
          function debounce(func, wait, options) {
            var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            wait = toNumber(wait) || 0;
            if (isObject(options)) {
              leading = !!options.leading;
              maxing = "maxWait" in options;
              maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
              trailing = "trailing" in options ? !!options.trailing : trailing;
            }
            function invokeFunc(time) {
              var args = lastArgs, thisArg = lastThis;
              lastArgs = lastThis = undefined;
              lastInvokeTime = time;
              result = func.apply(thisArg, args);
              return result;
            }
            function leadingEdge(time) {
              lastInvokeTime = time;
              timerId = setTimeout(timerExpired, wait);
              return leading ? invokeFunc(time) : result;
            }
            function remainingWait(time) {
              var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
              return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
            }
            function shouldInvoke(time) {
              var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
              return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
            }
            function timerExpired() {
              var time = now();
              if (shouldInvoke(time)) return trailingEdge(time);
              timerId = setTimeout(timerExpired, remainingWait(time));
            }
            function trailingEdge(time) {
              timerId = undefined;
              if (trailing && lastArgs) return invokeFunc(time);
              lastArgs = lastThis = undefined;
              return result;
            }
            function cancel() {
              timerId !== undefined && clearTimeout(timerId);
              lastInvokeTime = 0;
              lastArgs = lastCallTime = lastThis = timerId = undefined;
            }
            function flush() {
              return timerId === undefined ? result : trailingEdge(now());
            }
            function debounced() {
              var time = now(), isInvoking = shouldInvoke(time);
              lastArgs = arguments;
              lastThis = this;
              lastCallTime = time;
              if (isInvoking) {
                if (timerId === undefined) return leadingEdge(lastCallTime);
                if (maxing) {
                  timerId = setTimeout(timerExpired, wait);
                  return invokeFunc(lastCallTime);
                }
              }
              timerId === undefined && (timerId = setTimeout(timerExpired, wait));
              return result;
            }
            debounced.cancel = cancel;
            debounced.flush = flush;
            return debounced;
          }
          var defer = baseRest(function(func, args) {
            return baseDelay(func, 1, args);
          });
          var delay = baseRest(function(func, wait, args) {
            return baseDelay(func, toNumber(wait) || 0, args);
          });
          function flip(func) {
            return createWrap(func, WRAP_FLIP_FLAG);
          }
          function memoize(func, resolver) {
            if ("function" != typeof func || null != resolver && "function" != typeof resolver) throw new TypeError(FUNC_ERROR_TEXT);
            var memoized = function() {
              var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
              if (cache.has(key)) return cache.get(key);
              var result = func.apply(this, args);
              memoized.cache = cache.set(key, result) || cache;
              return result;
            };
            memoized.cache = new (memoize.Cache || MapCache)();
            return memoized;
          }
          memoize.Cache = MapCache;
          function negate(predicate) {
            if ("function" != typeof predicate) throw new TypeError(FUNC_ERROR_TEXT);
            return function() {
              var args = arguments;
              switch (args.length) {
               case 0:
                return !predicate.call(this);

               case 1:
                return !predicate.call(this, args[0]);

               case 2:
                return !predicate.call(this, args[0], args[1]);

               case 3:
                return !predicate.call(this, args[0], args[1], args[2]);
              }
              return !predicate.apply(this, args);
            };
          }
          function once(func) {
            return before(2, func);
          }
          var overArgs = castRest(function(func, transforms) {
            transforms = 1 == transforms.length && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
            var funcsLength = transforms.length;
            return baseRest(function(args) {
              var index = -1, length = nativeMin(args.length, funcsLength);
              while (++index < length) args[index] = transforms[index].call(this, args[index]);
              return apply(func, this, args);
            });
          });
          var partial = baseRest(function(func, partials) {
            var holders = replaceHolders(partials, getHolder(partial));
            return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
          });
          var partialRight = baseRest(function(func, partials) {
            var holders = replaceHolders(partials, getHolder(partialRight));
            return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined, partials, holders);
          });
          var rearg = flatRest(function(func, indexes) {
            return createWrap(func, WRAP_REARG_FLAG, undefined, undefined, undefined, indexes);
          });
          function rest(func, start) {
            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            start = start === undefined ? start : toInteger(start);
            return baseRest(func, start);
          }
          function spread(func, start) {
            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            start = null == start ? 0 : nativeMax(toInteger(start), 0);
            return baseRest(function(args) {
              var array = args[start], otherArgs = castSlice(args, 0, start);
              array && arrayPush(otherArgs, array);
              return apply(func, this, otherArgs);
            });
          }
          function throttle(func, wait, options) {
            var leading = true, trailing = true;
            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
            if (isObject(options)) {
              leading = "leading" in options ? !!options.leading : leading;
              trailing = "trailing" in options ? !!options.trailing : trailing;
            }
            return debounce(func, wait, {
              leading: leading,
              maxWait: wait,
              trailing: trailing
            });
          }
          function unary(func) {
            return ary(func, 1);
          }
          function wrap(value, wrapper) {
            return partial(castFunction(wrapper), value);
          }
          function castArray() {
            if (!arguments.length) return [];
            var value = arguments[0];
            return isArray(value) ? value : [ value ];
          }
          function clone(value) {
            return baseClone(value, CLONE_SYMBOLS_FLAG);
          }
          function cloneWith(value, customizer) {
            customizer = "function" == typeof customizer ? customizer : undefined;
            return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
          }
          function cloneDeep(value) {
            return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
          }
          function cloneDeepWith(value, customizer) {
            customizer = "function" == typeof customizer ? customizer : undefined;
            return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
          }
          function conformsTo(object, source) {
            return null == source || baseConformsTo(object, source, keys(source));
          }
          function eq(value, other) {
            return value === other || value !== value && other !== other;
          }
          var gt = createRelationalOperation(baseGt);
          var gte = createRelationalOperation(function(value, other) {
            return value >= other;
          });
          var isArguments = baseIsArguments(function() {
            return arguments;
          }()) ? baseIsArguments : function(value) {
            return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
          };
          var isArray = Array.isArray;
          var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
          function isArrayLike(value) {
            return null != value && isLength(value.length) && !isFunction(value);
          }
          function isArrayLikeObject(value) {
            return isObjectLike(value) && isArrayLike(value);
          }
          function isBoolean(value) {
            return true === value || false === value || isObjectLike(value) && baseGetTag(value) == boolTag;
          }
          var isBuffer = nativeIsBuffer || stubFalse;
          var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
          function isElement(value) {
            return isObjectLike(value) && 1 === value.nodeType && !isPlainObject(value);
          }
          function isEmpty(value) {
            if (null == value) return true;
            if (isArrayLike(value) && (isArray(value) || "string" == typeof value || "function" == typeof value.splice || isBuffer(value) || isTypedArray(value) || isArguments(value))) return !value.length;
            var tag = getTag(value);
            if (tag == mapTag || tag == setTag) return !value.size;
            if (isPrototype(value)) return !baseKeys(value).length;
            for (var key in value) if (hasOwnProperty.call(value, key)) return false;
            return true;
          }
          function isEqual(value, other) {
            return baseIsEqual(value, other);
          }
          function isEqualWith(value, other, customizer) {
            customizer = "function" == typeof customizer ? customizer : undefined;
            var result = customizer ? customizer(value, other) : undefined;
            return result === undefined ? baseIsEqual(value, other, undefined, customizer) : !!result;
          }
          function isError(value) {
            if (!isObjectLike(value)) return false;
            var tag = baseGetTag(value);
            return tag == errorTag || tag == domExcTag || "string" == typeof value.message && "string" == typeof value.name && !isPlainObject(value);
          }
          function isFinite(value) {
            return "number" == typeof value && nativeIsFinite(value);
          }
          function isFunction(value) {
            if (!isObject(value)) return false;
            var tag = baseGetTag(value);
            return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
          }
          function isInteger(value) {
            return "number" == typeof value && value == toInteger(value);
          }
          function isLength(value) {
            return "number" == typeof value && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
          }
          function isObject(value) {
            var type = typeof value;
            return null != value && ("object" == type || "function" == type);
          }
          function isObjectLike(value) {
            return null != value && "object" == typeof value;
          }
          var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
          function isMatch(object, source) {
            return object === source || baseIsMatch(object, source, getMatchData(source));
          }
          function isMatchWith(object, source, customizer) {
            customizer = "function" == typeof customizer ? customizer : undefined;
            return baseIsMatch(object, source, getMatchData(source), customizer);
          }
          function isNaN(value) {
            return isNumber(value) && value != +value;
          }
          function isNative(value) {
            if (isMaskable(value)) throw new Error(CORE_ERROR_TEXT);
            return baseIsNative(value);
          }
          function isNull(value) {
            return null === value;
          }
          function isNil(value) {
            return null == value;
          }
          function isNumber(value) {
            return "number" == typeof value || isObjectLike(value) && baseGetTag(value) == numberTag;
          }
          function isPlainObject(value) {
            if (!isObjectLike(value) || baseGetTag(value) != objectTag) return false;
            var proto = getPrototype(value);
            if (null === proto) return true;
            var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
            return "function" == typeof Ctor && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
          }
          var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
          function isSafeInteger(value) {
            return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
          }
          var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
          function isString(value) {
            return "string" == typeof value || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
          }
          function isSymbol(value) {
            return "symbol" == typeof value || isObjectLike(value) && baseGetTag(value) == symbolTag;
          }
          var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
          function isUndefined(value) {
            return value === undefined;
          }
          function isWeakMap(value) {
            return isObjectLike(value) && getTag(value) == weakMapTag;
          }
          function isWeakSet(value) {
            return isObjectLike(value) && baseGetTag(value) == weakSetTag;
          }
          var lt = createRelationalOperation(baseLt);
          var lte = createRelationalOperation(function(value, other) {
            return value <= other;
          });
          function toArray(value) {
            if (!value) return [];
            if (isArrayLike(value)) return isString(value) ? stringToArray(value) : copyArray(value);
            if (symIterator && value[symIterator]) return iteratorToArray(value[symIterator]());
            var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
            return func(value);
          }
          function toFinite(value) {
            if (!value) return 0 === value ? value : 0;
            value = toNumber(value);
            if (value === INFINITY || value === -INFINITY) {
              var sign = value < 0 ? -1 : 1;
              return sign * MAX_INTEGER;
            }
            return value === value ? value : 0;
          }
          function toInteger(value) {
            var result = toFinite(value), remainder = result % 1;
            return result === result ? remainder ? result - remainder : result : 0;
          }
          function toLength(value) {
            return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
          }
          function toNumber(value) {
            if ("number" == typeof value) return value;
            if (isSymbol(value)) return NAN;
            if (isObject(value)) {
              var other = "function" == typeof value.valueOf ? value.valueOf() : value;
              value = isObject(other) ? other + "" : other;
            }
            if ("string" != typeof value) return 0 === value ? value : +value;
            value = value.replace(reTrim, "");
            var isBinary = reIsBinary.test(value);
            return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
          }
          function toPlainObject(value) {
            return copyObject(value, keysIn(value));
          }
          function toSafeInteger(value) {
            return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : 0 === value ? value : 0;
          }
          function toString(value) {
            return null == value ? "" : baseToString(value);
          }
          var assign = createAssigner(function(object, source) {
            if (isPrototype(source) || isArrayLike(source)) {
              copyObject(source, keys(source), object);
              return;
            }
            for (var key in source) hasOwnProperty.call(source, key) && assignValue(object, key, source[key]);
          });
          var assignIn = createAssigner(function(object, source) {
            copyObject(source, keysIn(source), object);
          });
          var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
            copyObject(source, keysIn(source), object, customizer);
          });
          var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
            copyObject(source, keys(source), object, customizer);
          });
          var at = flatRest(baseAt);
          function create(prototype, properties) {
            var result = baseCreate(prototype);
            return null == properties ? result : baseAssign(result, properties);
          }
          var defaults = baseRest(function(object, sources) {
            object = Object(object);
            var index = -1;
            var length = sources.length;
            var guard = length > 2 ? sources[2] : undefined;
            guard && isIterateeCall(sources[0], sources[1], guard) && (length = 1);
            while (++index < length) {
              var source = sources[index];
              var props = keysIn(source);
              var propsIndex = -1;
              var propsLength = props.length;
              while (++propsIndex < propsLength) {
                var key = props[propsIndex];
                var value = object[key];
                (value === undefined || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) && (object[key] = source[key]);
              }
            }
            return object;
          });
          var defaultsDeep = baseRest(function(args) {
            args.push(undefined, customDefaultsMerge);
            return apply(mergeWith, undefined, args);
          });
          function findKey(object, predicate) {
            return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
          }
          function findLastKey(object, predicate) {
            return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
          }
          function forIn(object, iteratee) {
            return null == object ? object : baseFor(object, getIteratee(iteratee, 3), keysIn);
          }
          function forInRight(object, iteratee) {
            return null == object ? object : baseForRight(object, getIteratee(iteratee, 3), keysIn);
          }
          function forOwn(object, iteratee) {
            return object && baseForOwn(object, getIteratee(iteratee, 3));
          }
          function forOwnRight(object, iteratee) {
            return object && baseForOwnRight(object, getIteratee(iteratee, 3));
          }
          function functions(object) {
            return null == object ? [] : baseFunctions(object, keys(object));
          }
          function functionsIn(object) {
            return null == object ? [] : baseFunctions(object, keysIn(object));
          }
          function get(object, path, defaultValue) {
            var result = null == object ? undefined : baseGet(object, path);
            return result === undefined ? defaultValue : result;
          }
          function has(object, path) {
            return null != object && hasPath(object, path, baseHas);
          }
          function hasIn(object, path) {
            return null != object && hasPath(object, path, baseHasIn);
          }
          var invert = createInverter(function(result, value, key) {
            null != value && "function" != typeof value.toString && (value = nativeObjectToString.call(value));
            result[value] = key;
          }, constant(identity));
          var invertBy = createInverter(function(result, value, key) {
            null != value && "function" != typeof value.toString && (value = nativeObjectToString.call(value));
            hasOwnProperty.call(result, value) ? result[value].push(key) : result[value] = [ key ];
          }, getIteratee);
          var invoke = baseRest(baseInvoke);
          function keys(object) {
            return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
          }
          function keysIn(object) {
            return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
          }
          function mapKeys(object, iteratee) {
            var result = {};
            iteratee = getIteratee(iteratee, 3);
            baseForOwn(object, function(value, key, object) {
              baseAssignValue(result, iteratee(value, key, object), value);
            });
            return result;
          }
          function mapValues(object, iteratee) {
            var result = {};
            iteratee = getIteratee(iteratee, 3);
            baseForOwn(object, function(value, key, object) {
              baseAssignValue(result, key, iteratee(value, key, object));
            });
            return result;
          }
          var merge = createAssigner(function(object, source, srcIndex) {
            baseMerge(object, source, srcIndex);
          });
          var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
            baseMerge(object, source, srcIndex, customizer);
          });
          var omit = flatRest(function(object, paths) {
            var result = {};
            if (null == object) return result;
            var isDeep = false;
            paths = arrayMap(paths, function(path) {
              path = castPath(path, object);
              isDeep || (isDeep = path.length > 1);
              return path;
            });
            copyObject(object, getAllKeysIn(object), result);
            isDeep && (result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone));
            var length = paths.length;
            while (length--) baseUnset(result, paths[length]);
            return result;
          });
          function omitBy(object, predicate) {
            return pickBy(object, negate(getIteratee(predicate)));
          }
          var pick = flatRest(function(object, paths) {
            return null == object ? {} : basePick(object, paths);
          });
          function pickBy(object, predicate) {
            if (null == object) return {};
            var props = arrayMap(getAllKeysIn(object), function(prop) {
              return [ prop ];
            });
            predicate = getIteratee(predicate);
            return basePickBy(object, props, function(value, path) {
              return predicate(value, path[0]);
            });
          }
          function result(object, path, defaultValue) {
            path = castPath(path, object);
            var index = -1, length = path.length;
            if (!length) {
              length = 1;
              object = undefined;
            }
            while (++index < length) {
              var value = null == object ? undefined : object[toKey(path[index])];
              if (value === undefined) {
                index = length;
                value = defaultValue;
              }
              object = isFunction(value) ? value.call(object) : value;
            }
            return object;
          }
          function set(object, path, value) {
            return null == object ? object : baseSet(object, path, value);
          }
          function setWith(object, path, value, customizer) {
            customizer = "function" == typeof customizer ? customizer : undefined;
            return null == object ? object : baseSet(object, path, value, customizer);
          }
          var toPairs = createToPairs(keys);
          var toPairsIn = createToPairs(keysIn);
          function transform(object, iteratee, accumulator) {
            var isArr = isArray(object), isArrLike = isArr || isBuffer(object) || isTypedArray(object);
            iteratee = getIteratee(iteratee, 4);
            if (null == accumulator) {
              var Ctor = object && object.constructor;
              accumulator = isArrLike ? isArr ? new Ctor() : [] : isObject(object) && isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
            }
            (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
              return iteratee(accumulator, value, index, object);
            });
            return accumulator;
          }
          function unset(object, path) {
            return null == object || baseUnset(object, path);
          }
          function update(object, path, updater) {
            return null == object ? object : baseUpdate(object, path, castFunction(updater));
          }
          function updateWith(object, path, updater, customizer) {
            customizer = "function" == typeof customizer ? customizer : undefined;
            return null == object ? object : baseUpdate(object, path, castFunction(updater), customizer);
          }
          function values(object) {
            return null == object ? [] : baseValues(object, keys(object));
          }
          function valuesIn(object) {
            return null == object ? [] : baseValues(object, keysIn(object));
          }
          function clamp(number, lower, upper) {
            if (upper === undefined) {
              upper = lower;
              lower = undefined;
            }
            if (upper !== undefined) {
              upper = toNumber(upper);
              upper = upper === upper ? upper : 0;
            }
            if (lower !== undefined) {
              lower = toNumber(lower);
              lower = lower === lower ? lower : 0;
            }
            return baseClamp(toNumber(number), lower, upper);
          }
          function inRange(number, start, end) {
            start = toFinite(start);
            if (end === undefined) {
              end = start;
              start = 0;
            } else end = toFinite(end);
            number = toNumber(number);
            return baseInRange(number, start, end);
          }
          function random(lower, upper, floating) {
            floating && "boolean" != typeof floating && isIterateeCall(lower, upper, floating) && (upper = floating = undefined);
            if (floating === undefined) if ("boolean" == typeof upper) {
              floating = upper;
              upper = undefined;
            } else if ("boolean" == typeof lower) {
              floating = lower;
              lower = undefined;
            }
            if (lower === undefined && upper === undefined) {
              lower = 0;
              upper = 1;
            } else {
              lower = toFinite(lower);
              if (upper === undefined) {
                upper = lower;
                lower = 0;
              } else upper = toFinite(upper);
            }
            if (lower > upper) {
              var temp = lower;
              lower = upper;
              upper = temp;
            }
            if (floating || lower % 1 || upper % 1) {
              var rand = nativeRandom();
              return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
            }
            return baseRandom(lower, upper);
          }
          var camelCase = createCompounder(function(result, word, index) {
            word = word.toLowerCase();
            return result + (index ? capitalize(word) : word);
          });
          function capitalize(string) {
            return upperFirst(toString(string).toLowerCase());
          }
          function deburr(string) {
            string = toString(string);
            return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
          }
          function endsWith(string, target, position) {
            string = toString(string);
            target = baseToString(target);
            var length = string.length;
            position = position === undefined ? length : baseClamp(toInteger(position), 0, length);
            var end = position;
            position -= target.length;
            return position >= 0 && string.slice(position, end) == target;
          }
          function escape(string) {
            string = toString(string);
            return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
          }
          function escapeRegExp(string) {
            string = toString(string);
            return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
          }
          var kebabCase = createCompounder(function(result, word, index) {
            return result + (index ? "-" : "") + word.toLowerCase();
          });
          var lowerCase = createCompounder(function(result, word, index) {
            return result + (index ? " " : "") + word.toLowerCase();
          });
          var lowerFirst = createCaseFirst("toLowerCase");
          function pad(string, length, chars) {
            string = toString(string);
            length = toInteger(length);
            var strLength = length ? stringSize(string) : 0;
            if (!length || strLength >= length) return string;
            var mid = (length - strLength) / 2;
            return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
          }
          function padEnd(string, length, chars) {
            string = toString(string);
            length = toInteger(length);
            var strLength = length ? stringSize(string) : 0;
            return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
          }
          function padStart(string, length, chars) {
            string = toString(string);
            length = toInteger(length);
            var strLength = length ? stringSize(string) : 0;
            return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
          }
          function parseInt(string, radix, guard) {
            guard || null == radix ? radix = 0 : radix && (radix = +radix);
            return nativeParseInt(toString(string).replace(reTrimStart, ""), radix || 0);
          }
          function repeat(string, n, guard) {
            n = (guard ? isIterateeCall(string, n, guard) : n === undefined) ? 1 : toInteger(n);
            return baseRepeat(toString(string), n);
          }
          function replace() {
            var args = arguments, string = toString(args[0]);
            return args.length < 3 ? string : string.replace(args[1], args[2]);
          }
          var snakeCase = createCompounder(function(result, word, index) {
            return result + (index ? "_" : "") + word.toLowerCase();
          });
          function split(string, separator, limit) {
            limit && "number" != typeof limit && isIterateeCall(string, separator, limit) && (separator = limit = undefined);
            limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;
            if (!limit) return [];
            string = toString(string);
            if (string && ("string" == typeof separator || null != separator && !isRegExp(separator))) {
              separator = baseToString(separator);
              if (!separator && hasUnicode(string)) return castSlice(stringToArray(string), 0, limit);
            }
            return string.split(separator, limit);
          }
          var startCase = createCompounder(function(result, word, index) {
            return result + (index ? " " : "") + upperFirst(word);
          });
          function startsWith(string, target, position) {
            string = toString(string);
            position = null == position ? 0 : baseClamp(toInteger(position), 0, string.length);
            target = baseToString(target);
            return string.slice(position, position + target.length) == target;
          }
          function template(string, options, guard) {
            var settings = lodash.templateSettings;
            guard && isIterateeCall(string, options, guard) && (options = undefined);
            string = toString(string);
            options = assignInWith({}, options, settings, customDefaultsAssignIn);
            var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
            var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
            var reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
            var sourceURL = "//# sourceURL=" + ("sourceURL" in options ? options.sourceURL : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
            string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
              interpolateValue || (interpolateValue = esTemplateValue);
              source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
              if (escapeValue) {
                isEscaping = true;
                source += "' +\n__e(" + escapeValue + ") +\n'";
              }
              if (evaluateValue) {
                isEvaluating = true;
                source += "';\n" + evaluateValue + ";\n__p += '";
              }
              interpolateValue && (source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'");
              index = offset + match.length;
              return match;
            });
            source += "';\n";
            var variable = options.variable;
            variable || (source = "with (obj) {\n" + source + "\n}\n");
            source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
            source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
            var result = attempt(function() {
              return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);
            });
            result.source = source;
            if (isError(result)) throw result;
            return result;
          }
          function toLower(value) {
            return toString(value).toLowerCase();
          }
          function toUpper(value) {
            return toString(value).toUpperCase();
          }
          function trim(string, chars, guard) {
            string = toString(string);
            if (string && (guard || chars === undefined)) return string.replace(reTrim, "");
            if (!string || !(chars = baseToString(chars))) return string;
            var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
            return castSlice(strSymbols, start, end).join("");
          }
          function trimEnd(string, chars, guard) {
            string = toString(string);
            if (string && (guard || chars === undefined)) return string.replace(reTrimEnd, "");
            if (!string || !(chars = baseToString(chars))) return string;
            var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
            return castSlice(strSymbols, 0, end).join("");
          }
          function trimStart(string, chars, guard) {
            string = toString(string);
            if (string && (guard || chars === undefined)) return string.replace(reTrimStart, "");
            if (!string || !(chars = baseToString(chars))) return string;
            var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
            return castSlice(strSymbols, start).join("");
          }
          function truncate(string, options) {
            var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
            if (isObject(options)) {
              var separator = "separator" in options ? options.separator : separator;
              length = "length" in options ? toInteger(options.length) : length;
              omission = "omission" in options ? baseToString(options.omission) : omission;
            }
            string = toString(string);
            var strLength = string.length;
            if (hasUnicode(string)) {
              var strSymbols = stringToArray(string);
              strLength = strSymbols.length;
            }
            if (length >= strLength) return string;
            var end = length - stringSize(omission);
            if (end < 1) return omission;
            var result = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
            if (separator === undefined) return result + omission;
            strSymbols && (end += result.length - end);
            if (isRegExp(separator)) {
              if (string.slice(end).search(separator)) {
                var match, substring = result;
                separator.global || (separator = RegExp(separator.source, toString(reFlags.exec(separator)) + "g"));
                separator.lastIndex = 0;
                while (match = separator.exec(substring)) var newEnd = match.index;
                result = result.slice(0, newEnd === undefined ? end : newEnd);
              }
            } else if (string.indexOf(baseToString(separator), end) != end) {
              var index = result.lastIndexOf(separator);
              index > -1 && (result = result.slice(0, index));
            }
            return result + omission;
          }
          function unescape(string) {
            string = toString(string);
            return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
          }
          var upperCase = createCompounder(function(result, word, index) {
            return result + (index ? " " : "") + word.toUpperCase();
          });
          var upperFirst = createCaseFirst("toUpperCase");
          function words(string, pattern, guard) {
            string = toString(string);
            pattern = guard ? undefined : pattern;
            if (pattern === undefined) return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
            return string.match(pattern) || [];
          }
          var attempt = baseRest(function(func, args) {
            try {
              return apply(func, undefined, args);
            } catch (e) {
              return isError(e) ? e : new Error(e);
            }
          });
          var bindAll = flatRest(function(object, methodNames) {
            arrayEach(methodNames, function(key) {
              key = toKey(key);
              baseAssignValue(object, key, bind(object[key], object));
            });
            return object;
          });
          function cond(pairs) {
            var length = null == pairs ? 0 : pairs.length, toIteratee = getIteratee();
            pairs = length ? arrayMap(pairs, function(pair) {
              if ("function" != typeof pair[1]) throw new TypeError(FUNC_ERROR_TEXT);
              return [ toIteratee(pair[0]), pair[1] ];
            }) : [];
            return baseRest(function(args) {
              var index = -1;
              while (++index < length) {
                var pair = pairs[index];
                if (apply(pair[0], this, args)) return apply(pair[1], this, args);
              }
            });
          }
          function conforms(source) {
            return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
          }
          function constant(value) {
            return function() {
              return value;
            };
          }
          function defaultTo(value, defaultValue) {
            return null == value || value !== value ? defaultValue : value;
          }
          var flow = createFlow();
          var flowRight = createFlow(true);
          function identity(value) {
            return value;
          }
          function iteratee(func) {
            return baseIteratee("function" == typeof func ? func : baseClone(func, CLONE_DEEP_FLAG));
          }
          function matches(source) {
            return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
          }
          function matchesProperty(path, srcValue) {
            return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
          }
          var method = baseRest(function(path, args) {
            return function(object) {
              return baseInvoke(object, path, args);
            };
          });
          var methodOf = baseRest(function(object, args) {
            return function(path) {
              return baseInvoke(object, path, args);
            };
          });
          function mixin(object, source, options) {
            var props = keys(source), methodNames = baseFunctions(source, props);
            if (null == options && !(isObject(source) && (methodNames.length || !props.length))) {
              options = source;
              source = object;
              object = this;
              methodNames = baseFunctions(source, keys(source));
            }
            var chain = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
            arrayEach(methodNames, function(methodName) {
              var func = source[methodName];
              object[methodName] = func;
              isFunc && (object.prototype[methodName] = function() {
                var chainAll = this.__chain__;
                if (chain || chainAll) {
                  var result = object(this.__wrapped__), actions = result.__actions__ = copyArray(this.__actions__);
                  actions.push({
                    func: func,
                    args: arguments,
                    thisArg: object
                  });
                  result.__chain__ = chainAll;
                  return result;
                }
                return func.apply(object, arrayPush([ this.value() ], arguments));
              });
            });
            return object;
          }
          function noConflict() {
            root._ === this && (root._ = oldDash);
            return this;
          }
          function noop() {}
          function nthArg(n) {
            n = toInteger(n);
            return baseRest(function(args) {
              return baseNth(args, n);
            });
          }
          var over = createOver(arrayMap);
          var overEvery = createOver(arrayEvery);
          var overSome = createOver(arraySome);
          function property(path) {
            return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
          }
          function propertyOf(object) {
            return function(path) {
              return null == object ? undefined : baseGet(object, path);
            };
          }
          var range = createRange();
          var rangeRight = createRange(true);
          function stubArray() {
            return [];
          }
          function stubFalse() {
            return false;
          }
          function stubObject() {
            return {};
          }
          function stubString() {
            return "";
          }
          function stubTrue() {
            return true;
          }
          function times(n, iteratee) {
            n = toInteger(n);
            if (n < 1 || n > MAX_SAFE_INTEGER) return [];
            var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
            iteratee = getIteratee(iteratee);
            n -= MAX_ARRAY_LENGTH;
            var result = baseTimes(length, iteratee);
            while (++index < n) iteratee(index);
            return result;
          }
          function toPath(value) {
            if (isArray(value)) return arrayMap(value, toKey);
            return isSymbol(value) ? [ value ] : copyArray(stringToPath(toString(value)));
          }
          function uniqueId(prefix) {
            var id = ++idCounter;
            return toString(prefix) + id;
          }
          var add = createMathOperation(function(augend, addend) {
            return augend + addend;
          }, 0);
          var ceil = createRound("ceil");
          var divide = createMathOperation(function(dividend, divisor) {
            return dividend / divisor;
          }, 1);
          var floor = createRound("floor");
          function max(array) {
            return array && array.length ? baseExtremum(array, identity, baseGt) : undefined;
          }
          function maxBy(array, iteratee) {
            return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseGt) : undefined;
          }
          function mean(array) {
            return baseMean(array, identity);
          }
          function meanBy(array, iteratee) {
            return baseMean(array, getIteratee(iteratee, 2));
          }
          function min(array) {
            return array && array.length ? baseExtremum(array, identity, baseLt) : undefined;
          }
          function minBy(array, iteratee) {
            return array && array.length ? baseExtremum(array, getIteratee(iteratee, 2), baseLt) : undefined;
          }
          var multiply = createMathOperation(function(multiplier, multiplicand) {
            return multiplier * multiplicand;
          }, 1);
          var round = createRound("round");
          var subtract = createMathOperation(function(minuend, subtrahend) {
            return minuend - subtrahend;
          }, 0);
          function sum(array) {
            return array && array.length ? baseSum(array, identity) : 0;
          }
          function sumBy(array, iteratee) {
            return array && array.length ? baseSum(array, getIteratee(iteratee, 2)) : 0;
          }
          lodash.after = after;
          lodash.ary = ary;
          lodash.assign = assign;
          lodash.assignIn = assignIn;
          lodash.assignInWith = assignInWith;
          lodash.assignWith = assignWith;
          lodash.at = at;
          lodash.before = before;
          lodash.bind = bind;
          lodash.bindAll = bindAll;
          lodash.bindKey = bindKey;
          lodash.castArray = castArray;
          lodash.chain = chain;
          lodash.chunk = chunk;
          lodash.compact = compact;
          lodash.concat = concat;
          lodash.cond = cond;
          lodash.conforms = conforms;
          lodash.constant = constant;
          lodash.countBy = countBy;
          lodash.create = create;
          lodash.curry = curry;
          lodash.curryRight = curryRight;
          lodash.debounce = debounce;
          lodash.defaults = defaults;
          lodash.defaultsDeep = defaultsDeep;
          lodash.defer = defer;
          lodash.delay = delay;
          lodash.difference = difference;
          lodash.differenceBy = differenceBy;
          lodash.differenceWith = differenceWith;
          lodash.drop = drop;
          lodash.dropRight = dropRight;
          lodash.dropRightWhile = dropRightWhile;
          lodash.dropWhile = dropWhile;
          lodash.fill = fill;
          lodash.filter = filter;
          lodash.flatMap = flatMap;
          lodash.flatMapDeep = flatMapDeep;
          lodash.flatMapDepth = flatMapDepth;
          lodash.flatten = flatten;
          lodash.flattenDeep = flattenDeep;
          lodash.flattenDepth = flattenDepth;
          lodash.flip = flip;
          lodash.flow = flow;
          lodash.flowRight = flowRight;
          lodash.fromPairs = fromPairs;
          lodash.functions = functions;
          lodash.functionsIn = functionsIn;
          lodash.groupBy = groupBy;
          lodash.initial = initial;
          lodash.intersection = intersection;
          lodash.intersectionBy = intersectionBy;
          lodash.intersectionWith = intersectionWith;
          lodash.invert = invert;
          lodash.invertBy = invertBy;
          lodash.invokeMap = invokeMap;
          lodash.iteratee = iteratee;
          lodash.keyBy = keyBy;
          lodash.keys = keys;
          lodash.keysIn = keysIn;
          lodash.map = map;
          lodash.mapKeys = mapKeys;
          lodash.mapValues = mapValues;
          lodash.matches = matches;
          lodash.matchesProperty = matchesProperty;
          lodash.memoize = memoize;
          lodash.merge = merge;
          lodash.mergeWith = mergeWith;
          lodash.method = method;
          lodash.methodOf = methodOf;
          lodash.mixin = mixin;
          lodash.negate = negate;
          lodash.nthArg = nthArg;
          lodash.omit = omit;
          lodash.omitBy = omitBy;
          lodash.once = once;
          lodash.orderBy = orderBy;
          lodash.over = over;
          lodash.overArgs = overArgs;
          lodash.overEvery = overEvery;
          lodash.overSome = overSome;
          lodash.partial = partial;
          lodash.partialRight = partialRight;
          lodash.partition = partition;
          lodash.pick = pick;
          lodash.pickBy = pickBy;
          lodash.property = property;
          lodash.propertyOf = propertyOf;
          lodash.pull = pull;
          lodash.pullAll = pullAll;
          lodash.pullAllBy = pullAllBy;
          lodash.pullAllWith = pullAllWith;
          lodash.pullAt = pullAt;
          lodash.range = range;
          lodash.rangeRight = rangeRight;
          lodash.rearg = rearg;
          lodash.reject = reject;
          lodash.remove = remove;
          lodash.rest = rest;
          lodash.reverse = reverse;
          lodash.sampleSize = sampleSize;
          lodash.set = set;
          lodash.setWith = setWith;
          lodash.shuffle = shuffle;
          lodash.slice = slice;
          lodash.sortBy = sortBy;
          lodash.sortedUniq = sortedUniq;
          lodash.sortedUniqBy = sortedUniqBy;
          lodash.split = split;
          lodash.spread = spread;
          lodash.tail = tail;
          lodash.take = take;
          lodash.takeRight = takeRight;
          lodash.takeRightWhile = takeRightWhile;
          lodash.takeWhile = takeWhile;
          lodash.tap = tap;
          lodash.throttle = throttle;
          lodash.thru = thru;
          lodash.toArray = toArray;
          lodash.toPairs = toPairs;
          lodash.toPairsIn = toPairsIn;
          lodash.toPath = toPath;
          lodash.toPlainObject = toPlainObject;
          lodash.transform = transform;
          lodash.unary = unary;
          lodash.union = union;
          lodash.unionBy = unionBy;
          lodash.unionWith = unionWith;
          lodash.uniq = uniq;
          lodash.uniqBy = uniqBy;
          lodash.uniqWith = uniqWith;
          lodash.unset = unset;
          lodash.unzip = unzip;
          lodash.unzipWith = unzipWith;
          lodash.update = update;
          lodash.updateWith = updateWith;
          lodash.values = values;
          lodash.valuesIn = valuesIn;
          lodash.without = without;
          lodash.words = words;
          lodash.wrap = wrap;
          lodash.xor = xor;
          lodash.xorBy = xorBy;
          lodash.xorWith = xorWith;
          lodash.zip = zip;
          lodash.zipObject = zipObject;
          lodash.zipObjectDeep = zipObjectDeep;
          lodash.zipWith = zipWith;
          lodash.entries = toPairs;
          lodash.entriesIn = toPairsIn;
          lodash.extend = assignIn;
          lodash.extendWith = assignInWith;
          mixin(lodash, lodash);
          lodash.add = add;
          lodash.attempt = attempt;
          lodash.camelCase = camelCase;
          lodash.capitalize = capitalize;
          lodash.ceil = ceil;
          lodash.clamp = clamp;
          lodash.clone = clone;
          lodash.cloneDeep = cloneDeep;
          lodash.cloneDeepWith = cloneDeepWith;
          lodash.cloneWith = cloneWith;
          lodash.conformsTo = conformsTo;
          lodash.deburr = deburr;
          lodash.defaultTo = defaultTo;
          lodash.divide = divide;
          lodash.endsWith = endsWith;
          lodash.eq = eq;
          lodash.escape = escape;
          lodash.escapeRegExp = escapeRegExp;
          lodash.every = every;
          lodash.find = find;
          lodash.findIndex = findIndex;
          lodash.findKey = findKey;
          lodash.findLast = findLast;
          lodash.findLastIndex = findLastIndex;
          lodash.findLastKey = findLastKey;
          lodash.floor = floor;
          lodash.forEach = forEach;
          lodash.forEachRight = forEachRight;
          lodash.forIn = forIn;
          lodash.forInRight = forInRight;
          lodash.forOwn = forOwn;
          lodash.forOwnRight = forOwnRight;
          lodash.get = get;
          lodash.gt = gt;
          lodash.gte = gte;
          lodash.has = has;
          lodash.hasIn = hasIn;
          lodash.head = head;
          lodash.identity = identity;
          lodash.includes = includes;
          lodash.indexOf = indexOf;
          lodash.inRange = inRange;
          lodash.invoke = invoke;
          lodash.isArguments = isArguments;
          lodash.isArray = isArray;
          lodash.isArrayBuffer = isArrayBuffer;
          lodash.isArrayLike = isArrayLike;
          lodash.isArrayLikeObject = isArrayLikeObject;
          lodash.isBoolean = isBoolean;
          lodash.isBuffer = isBuffer;
          lodash.isDate = isDate;
          lodash.isElement = isElement;
          lodash.isEmpty = isEmpty;
          lodash.isEqual = isEqual;
          lodash.isEqualWith = isEqualWith;
          lodash.isError = isError;
          lodash.isFinite = isFinite;
          lodash.isFunction = isFunction;
          lodash.isInteger = isInteger;
          lodash.isLength = isLength;
          lodash.isMap = isMap;
          lodash.isMatch = isMatch;
          lodash.isMatchWith = isMatchWith;
          lodash.isNaN = isNaN;
          lodash.isNative = isNative;
          lodash.isNil = isNil;
          lodash.isNull = isNull;
          lodash.isNumber = isNumber;
          lodash.isObject = isObject;
          lodash.isObjectLike = isObjectLike;
          lodash.isPlainObject = isPlainObject;
          lodash.isRegExp = isRegExp;
          lodash.isSafeInteger = isSafeInteger;
          lodash.isSet = isSet;
          lodash.isString = isString;
          lodash.isSymbol = isSymbol;
          lodash.isTypedArray = isTypedArray;
          lodash.isUndefined = isUndefined;
          lodash.isWeakMap = isWeakMap;
          lodash.isWeakSet = isWeakSet;
          lodash.join = join;
          lodash.kebabCase = kebabCase;
          lodash.last = last;
          lodash.lastIndexOf = lastIndexOf;
          lodash.lowerCase = lowerCase;
          lodash.lowerFirst = lowerFirst;
          lodash.lt = lt;
          lodash.lte = lte;
          lodash.max = max;
          lodash.maxBy = maxBy;
          lodash.mean = mean;
          lodash.meanBy = meanBy;
          lodash.min = min;
          lodash.minBy = minBy;
          lodash.stubArray = stubArray;
          lodash.stubFalse = stubFalse;
          lodash.stubObject = stubObject;
          lodash.stubString = stubString;
          lodash.stubTrue = stubTrue;
          lodash.multiply = multiply;
          lodash.nth = nth;
          lodash.noConflict = noConflict;
          lodash.noop = noop;
          lodash.now = now;
          lodash.pad = pad;
          lodash.padEnd = padEnd;
          lodash.padStart = padStart;
          lodash.parseInt = parseInt;
          lodash.random = random;
          lodash.reduce = reduce;
          lodash.reduceRight = reduceRight;
          lodash.repeat = repeat;
          lodash.replace = replace;
          lodash.result = result;
          lodash.round = round;
          lodash.runInContext = runInContext;
          lodash.sample = sample;
          lodash.size = size;
          lodash.snakeCase = snakeCase;
          lodash.some = some;
          lodash.sortedIndex = sortedIndex;
          lodash.sortedIndexBy = sortedIndexBy;
          lodash.sortedIndexOf = sortedIndexOf;
          lodash.sortedLastIndex = sortedLastIndex;
          lodash.sortedLastIndexBy = sortedLastIndexBy;
          lodash.sortedLastIndexOf = sortedLastIndexOf;
          lodash.startCase = startCase;
          lodash.startsWith = startsWith;
          lodash.subtract = subtract;
          lodash.sum = sum;
          lodash.sumBy = sumBy;
          lodash.template = template;
          lodash.times = times;
          lodash.toFinite = toFinite;
          lodash.toInteger = toInteger;
          lodash.toLength = toLength;
          lodash.toLower = toLower;
          lodash.toNumber = toNumber;
          lodash.toSafeInteger = toSafeInteger;
          lodash.toString = toString;
          lodash.toUpper = toUpper;
          lodash.trim = trim;
          lodash.trimEnd = trimEnd;
          lodash.trimStart = trimStart;
          lodash.truncate = truncate;
          lodash.unescape = unescape;
          lodash.uniqueId = uniqueId;
          lodash.upperCase = upperCase;
          lodash.upperFirst = upperFirst;
          lodash.each = forEach;
          lodash.eachRight = forEachRight;
          lodash.first = head;
          mixin(lodash, function() {
            var source = {};
            baseForOwn(lodash, function(func, methodName) {
              hasOwnProperty.call(lodash.prototype, methodName) || (source[methodName] = func);
            });
            return source;
          }(), {
            chain: false
          });
          lodash.VERSION = VERSION;
          arrayEach([ "bind", "bindKey", "curry", "curryRight", "partial", "partialRight" ], function(methodName) {
            lodash[methodName].placeholder = lodash;
          });
          arrayEach([ "drop", "take" ], function(methodName, index) {
            LazyWrapper.prototype[methodName] = function(n) {
              n = n === undefined ? 1 : nativeMax(toInteger(n), 0);
              var result = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
              result.__filtered__ ? result.__takeCount__ = nativeMin(n, result.__takeCount__) : result.__views__.push({
                size: nativeMin(n, MAX_ARRAY_LENGTH),
                type: methodName + (result.__dir__ < 0 ? "Right" : "")
              });
              return result;
            };
            LazyWrapper.prototype[methodName + "Right"] = function(n) {
              return this.reverse()[methodName](n).reverse();
            };
          });
          arrayEach([ "filter", "map", "takeWhile" ], function(methodName, index) {
            var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
            LazyWrapper.prototype[methodName] = function(iteratee) {
              var result = this.clone();
              result.__iteratees__.push({
                iteratee: getIteratee(iteratee, 3),
                type: type
              });
              result.__filtered__ = result.__filtered__ || isFilter;
              return result;
            };
          });
          arrayEach([ "head", "last" ], function(methodName, index) {
            var takeName = "take" + (index ? "Right" : "");
            LazyWrapper.prototype[methodName] = function() {
              return this[takeName](1).value()[0];
            };
          });
          arrayEach([ "initial", "tail" ], function(methodName, index) {
            var dropName = "drop" + (index ? "" : "Right");
            LazyWrapper.prototype[methodName] = function() {
              return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
            };
          });
          LazyWrapper.prototype.compact = function() {
            return this.filter(identity);
          };
          LazyWrapper.prototype.find = function(predicate) {
            return this.filter(predicate).head();
          };
          LazyWrapper.prototype.findLast = function(predicate) {
            return this.reverse().find(predicate);
          };
          LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
            if ("function" == typeof path) return new LazyWrapper(this);
            return this.map(function(value) {
              return baseInvoke(value, path, args);
            });
          });
          LazyWrapper.prototype.reject = function(predicate) {
            return this.filter(negate(getIteratee(predicate)));
          };
          LazyWrapper.prototype.slice = function(start, end) {
            start = toInteger(start);
            var result = this;
            if (result.__filtered__ && (start > 0 || end < 0)) return new LazyWrapper(result);
            start < 0 ? result = result.takeRight(-start) : start && (result = result.drop(start));
            if (end !== undefined) {
              end = toInteger(end);
              result = end < 0 ? result.dropRight(-end) : result.take(end - start);
            }
            return result;
          };
          LazyWrapper.prototype.takeRightWhile = function(predicate) {
            return this.reverse().takeWhile(predicate).reverse();
          };
          LazyWrapper.prototype.toArray = function() {
            return this.take(MAX_ARRAY_LENGTH);
          };
          baseForOwn(LazyWrapper.prototype, function(func, methodName) {
            var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash[isTaker ? "take" + ("last" == methodName ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
            if (!lodashFunc) return;
            lodash.prototype[methodName] = function() {
              var value = this.__wrapped__, args = isTaker ? [ 1 ] : arguments, isLazy = value instanceof LazyWrapper, iteratee = args[0], useLazy = isLazy || isArray(value);
              var interceptor = function(value) {
                var result = lodashFunc.apply(lodash, arrayPush([ value ], args));
                return isTaker && chainAll ? result[0] : result;
              };
              useLazy && checkIteratee && "function" == typeof iteratee && 1 != iteratee.length && (isLazy = useLazy = false);
              var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
              if (!retUnwrapped && useLazy) {
                value = onlyLazy ? value : new LazyWrapper(this);
                var result = func.apply(value, args);
                result.__actions__.push({
                  func: thru,
                  args: [ interceptor ],
                  thisArg: undefined
                });
                return new LodashWrapper(result, chainAll);
              }
              if (isUnwrapped && onlyLazy) return func.apply(this, args);
              result = this.thru(interceptor);
              return isUnwrapped ? isTaker ? result.value()[0] : result.value() : result;
            };
          });
          arrayEach([ "pop", "push", "shift", "sort", "splice", "unshift" ], function(methodName) {
            var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
            lodash.prototype[methodName] = function() {
              var args = arguments;
              if (retUnwrapped && !this.__chain__) {
                var value = this.value();
                return func.apply(isArray(value) ? value : [], args);
              }
              return this[chainName](function(value) {
                return func.apply(isArray(value) ? value : [], args);
              });
            };
          });
          baseForOwn(LazyWrapper.prototype, function(func, methodName) {
            var lodashFunc = lodash[methodName];
            if (lodashFunc) {
              var key = lodashFunc.name + "", names = realNames[key] || (realNames[key] = []);
              names.push({
                name: methodName,
                func: lodashFunc
              });
            }
          });
          realNames[createHybrid(undefined, WRAP_BIND_KEY_FLAG).name] = [ {
            name: "wrapper",
            func: undefined
          } ];
          LazyWrapper.prototype.clone = lazyClone;
          LazyWrapper.prototype.reverse = lazyReverse;
          LazyWrapper.prototype.value = lazyValue;
          lodash.prototype.at = wrapperAt;
          lodash.prototype.chain = wrapperChain;
          lodash.prototype.commit = wrapperCommit;
          lodash.prototype.next = wrapperNext;
          lodash.prototype.plant = wrapperPlant;
          lodash.prototype.reverse = wrapperReverse;
          lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
          lodash.prototype.first = lodash.prototype.head;
          symIterator && (lodash.prototype[symIterator] = wrapperToIterator);
          return lodash;
        };
        var _ = runInContext();
        if ("function" == typeof define && "object" == typeof define.amd && define.amd) {
          root._ = _;
          define(function() {
            return _;
          });
        } else if (freeModule) {
          (freeModule.exports = _)._ = _;
          freeExports._ = _;
        } else root._ = _;
      }).call(this);
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {} ],
  8: [ function(require, module, exports) {
    (function() {
      var crypt = require("crypt"), utf8 = require("charenc").utf8, isBuffer = require("is-buffer"), bin = require("charenc").bin, md5 = function(message, options) {
        message.constructor == String ? message = options && "binary" === options.encoding ? bin.stringToBytes(message) : utf8.stringToBytes(message) : isBuffer(message) ? message = Array.prototype.slice.call(message, 0) : Array.isArray(message) || (message = message.toString());
        var m = crypt.bytesToWords(message), l = 8 * message.length, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
        for (var i = 0; i < m.length; i++) m[i] = 16711935 & (m[i] << 8 | m[i] >>> 24) | 4278255360 & (m[i] << 24 | m[i] >>> 8);
        m[l >>> 5] |= 128 << l % 32;
        m[14 + (l + 64 >>> 9 << 4)] = l;
        var FF = md5._ff, GG = md5._gg, HH = md5._hh, II = md5._ii;
        for (var i = 0; i < m.length; i += 16) {
          var aa = a, bb = b, cc = c, dd = d;
          a = FF(a, b, c, d, m[i + 0], 7, -680876936);
          d = FF(d, a, b, c, m[i + 1], 12, -389564586);
          c = FF(c, d, a, b, m[i + 2], 17, 606105819);
          b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
          a = FF(a, b, c, d, m[i + 4], 7, -176418897);
          d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
          c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
          b = FF(b, c, d, a, m[i + 7], 22, -45705983);
          a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
          d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
          c = FF(c, d, a, b, m[i + 10], 17, -42063);
          b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
          a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
          d = FF(d, a, b, c, m[i + 13], 12, -40341101);
          c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
          b = FF(b, c, d, a, m[i + 15], 22, 1236535329);
          a = GG(a, b, c, d, m[i + 1], 5, -165796510);
          d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
          c = GG(c, d, a, b, m[i + 11], 14, 643717713);
          b = GG(b, c, d, a, m[i + 0], 20, -373897302);
          a = GG(a, b, c, d, m[i + 5], 5, -701558691);
          d = GG(d, a, b, c, m[i + 10], 9, 38016083);
          c = GG(c, d, a, b, m[i + 15], 14, -660478335);
          b = GG(b, c, d, a, m[i + 4], 20, -405537848);
          a = GG(a, b, c, d, m[i + 9], 5, 568446438);
          d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
          c = GG(c, d, a, b, m[i + 3], 14, -187363961);
          b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
          a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
          d = GG(d, a, b, c, m[i + 2], 9, -51403784);
          c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
          b = GG(b, c, d, a, m[i + 12], 20, -1926607734);
          a = HH(a, b, c, d, m[i + 5], 4, -378558);
          d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
          c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
          b = HH(b, c, d, a, m[i + 14], 23, -35309556);
          a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
          d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
          c = HH(c, d, a, b, m[i + 7], 16, -155497632);
          b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
          a = HH(a, b, c, d, m[i + 13], 4, 681279174);
          d = HH(d, a, b, c, m[i + 0], 11, -358537222);
          c = HH(c, d, a, b, m[i + 3], 16, -722521979);
          b = HH(b, c, d, a, m[i + 6], 23, 76029189);
          a = HH(a, b, c, d, m[i + 9], 4, -640364487);
          d = HH(d, a, b, c, m[i + 12], 11, -421815835);
          c = HH(c, d, a, b, m[i + 15], 16, 530742520);
          b = HH(b, c, d, a, m[i + 2], 23, -995338651);
          a = II(a, b, c, d, m[i + 0], 6, -198630844);
          d = II(d, a, b, c, m[i + 7], 10, 1126891415);
          c = II(c, d, a, b, m[i + 14], 15, -1416354905);
          b = II(b, c, d, a, m[i + 5], 21, -57434055);
          a = II(a, b, c, d, m[i + 12], 6, 1700485571);
          d = II(d, a, b, c, m[i + 3], 10, -1894986606);
          c = II(c, d, a, b, m[i + 10], 15, -1051523);
          b = II(b, c, d, a, m[i + 1], 21, -2054922799);
          a = II(a, b, c, d, m[i + 8], 6, 1873313359);
          d = II(d, a, b, c, m[i + 15], 10, -30611744);
          c = II(c, d, a, b, m[i + 6], 15, -1560198380);
          b = II(b, c, d, a, m[i + 13], 21, 1309151649);
          a = II(a, b, c, d, m[i + 4], 6, -145523070);
          d = II(d, a, b, c, m[i + 11], 10, -1120210379);
          c = II(c, d, a, b, m[i + 2], 15, 718787259);
          b = II(b, c, d, a, m[i + 9], 21, -343485551);
          a = a + aa >>> 0;
          b = b + bb >>> 0;
          c = c + cc >>> 0;
          d = d + dd >>> 0;
        }
        return crypt.endian([ a, b, c, d ]);
      };
      md5._ff = function(a, b, c, d, x, s, t) {
        var n = a + (b & c | ~b & d) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md5._gg = function(a, b, c, d, x, s, t) {
        var n = a + (b & d | c & ~d) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md5._hh = function(a, b, c, d, x, s, t) {
        var n = a + (b ^ c ^ d) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md5._ii = function(a, b, c, d, x, s, t) {
        var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
        return (n << s | n >>> 32 - s) + b;
      };
      md5._blocksize = 16;
      md5._digestsize = 16;
      module.exports = function(message, options) {
        if (void 0 === message || null === message) throw new Error("Illegal argument " + message);
        var digestbytes = crypt.wordsToBytes(md5(message, options));
        return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
      };
    })();
  }, {
    charenc: 4,
    crypt: 5,
    "is-buffer": 6
  } ],
  AbstractRoomConfig: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fe2ea2y47tJ9LHTi2h2jaZ4", "AbstractRoomConfig");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../ws/AiJ");
    var AiJKit_1 = require("../ws/AiJKit");
    var AppConfig_1 = require("../AppConfig");
    var AbstractRoomConfig = function() {
      function AbstractRoomConfig(host, port) {
        this.host = host;
        this.port = port;
        this.url = "ws://" + host + ":" + port;
        this._config = new AiJ_1.AiJ.Config(this.url, new AiJ_1.AiJ.Options());
        AbstractRoomConfig.destroyInst();
        AbstractRoomConfig.createInst(this);
      }
      AbstractRoomConfig.getInst = function() {
        return AbstractRoomConfig._inst;
      };
      AbstractRoomConfig.destroyInst = function() {
        if (null != AbstractRoomConfig._inst) {
          AbstractRoomConfig._inst.destroy();
          AbstractRoomConfig._inst = null;
        }
      };
      AbstractRoomConfig.createInst = function(inst) {
        AbstractRoomConfig._inst = inst;
        AbstractRoomConfig._inst.create();
      };
      AbstractRoomConfig.prototype.create = function() {
        this.onCreate();
        AiJKit_1.default.init(AppConfig_1.default.GAME_WS_NAME, this._config);
      };
      AbstractRoomConfig.prototype.destroy = function() {
        AiJKit_1.default.close(AppConfig_1.default.GAME_WS_NAME);
        this.onDestroy();
      };
      return AbstractRoomConfig;
    }();
    exports.default = AbstractRoomConfig;
    cc._RF.pop();
  }, {
    "../AppConfig": "AppConfig",
    "../ws/AiJ": "AiJ",
    "../ws/AiJKit": "AiJKit"
  } ],
  AiJApp: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "45dc7jmSU9FfJq1niV8UwFC", "AiJApp");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ccclass = cc._decorator.ccclass;
    var WelcomeLayer_1 = require("./WelcomeLayer");
    var UIManger_1 = require("./UIManger");
    var AppConfig_1 = require("./AppConfig");
    var FireKit_1 = require("./fire/FireKit");
    var AiJApp = function(_super) {
      __extends(AiJApp, _super);
      function AiJApp() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      AiJApp_1 = AiJApp;
      AiJApp.prototype.onLoad = function() {
        var _this = this;
        fgui.addLoadHandler();
        fgui.GRoot.create();
        fgui.UIPackage.loadPackage("commons", function() {
          fgui.UIPackage.addPackage("commons");
          AiJApp_1.initFire();
          AiJApp_1.initDialog();
          UIManger_1.default.getInst().setRoot(_this);
          UIManger_1.default.getInst().switchLayer(WelcomeLayer_1.default);
        });
      };
      AiJApp.initFire = function() {
        FireKit_1.default.init(AppConfig_1.default.LOCAL_FIRE);
        FireKit_1.default.init(AppConfig_1.default.PLAZA_FIRE);
        FireKit_1.default.init(AppConfig_1.default.GAME_FIRE);
      };
      AiJApp.initDialog = function() {};
      var AiJApp_1;
      AiJApp = AiJApp_1 = __decorate([ ccclass ], AiJApp);
      return AiJApp;
    }(cc.Component);
    exports.default = AiJApp;
    cc._RF.pop();
  }, {
    "./AppConfig": "AppConfig",
    "./UIManger": "UIManger",
    "./WelcomeLayer": "WelcomeLayer",
    "./fire/FireKit": "FireKit"
  } ],
  AiJCCComponent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "156e3BCfORM8ZPUdyCulBbz", "AiJCCComponent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AsyncLock = require("async-lock");
    var AiJCCComponent = function(_super) {
      __extends(AiJCCComponent, _super);
      function AiJCCComponent() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.lock = new AsyncLock();
        _this.UI_LOCK_KEY = "ui_key";
        return _this;
      }
      AiJCCComponent.prototype.loadPackage = function(url, loadCb) {
        this.lock.acquire(this.UI_LOCK_KEY, function(cb) {
          fgui.UIPackage.loadPackage(url, function() {
            loadCb();
            cb();
          });
        }, function() {
          console.log("Load package success!");
        });
      };
      AiJCCComponent.prototype.initAiJCom = function(objs) {
        var _this = this;
        this.lock.acquire(this.UI_LOCK_KEY, function(cb) {
          _this.onInitAiJCom(objs);
          cb();
        }, function() {
          console.log("AiJCom init success");
        });
      };
      return AiJCCComponent;
    }(cc.Component);
    exports.default = AiJCCComponent;
    cc._RF.pop();
  }, {
    "async-lock": 2
  } ],
  AiJKit: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "463e3s0Xb1DoLzbqIFnzE6E", "AiJKit");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJPro_1 = require("./AiJPro");
    var AiJKit = function() {
      function AiJKit() {}
      AiJKit.init = function(name, config) {
        if (AiJKit.exist(name)) throw Error("Websocket " + name + " \u5df2\u7ecf\u5b58\u5728");
        AiJKit.aiJProDict[name] = new AiJPro_1.default(config);
      };
      AiJKit.exist = function(name) {
        return null != this.aiJProDict[name];
      };
      AiJKit.use = function(name) {
        return AiJKit.aiJProDict[name];
      };
      AiJKit.close = function(name) {
        AiJKit.aiJProDict[name].close();
        delete AiJKit.aiJProDict[name];
      };
      AiJKit.aiJProDict = {};
      return AiJKit;
    }();
    exports.default = AiJKit;
    cc._RF.pop();
  }, {
    "./AiJPro": "AiJPro"
  } ],
  AiJPro: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7aa80HptUZONLMv/KLoQsPT", "AiJPro");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("./AiJ");
    var AiJPro = function() {
      function AiJPro(config) {
        this.aij = new AiJ_1.AiJ(config);
      }
      AiJPro.prototype.isOpen = function() {
        return this.aij.aiJWs.readyState == this.aij.aiJWs.ws.OPEN;
      };
      AiJPro.prototype.send = function(event) {
        this.aij.send(event);
      };
      AiJPro.prototype.connect = function() {
        this.aij.aiJWs.connect(false);
      };
      AiJPro.prototype.close = function() {
        this.aij.aiJWs.close();
      };
      return AiJPro;
    }();
    exports.default = AiJPro;
    cc._RF.pop();
  }, {
    "./AiJ": "AiJ"
  } ],
  AiJ: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5ea82+0RpRAdZXgBDaIywJJ", "AiJ");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ = function() {
      function AiJ(config) {
        void 0 === this.aiJWs && (this.aiJWs = null);
        this.aiJWs = new AiJ.AiJWs(config);
      }
      AiJ.prototype.send = function(event) {
        this.aiJWs.send(event);
      };
      return AiJ;
    }();
    exports.AiJ = AiJ;
    AiJ["__class"] = "AiJ";
    (function(AiJ) {
      var AiJEvent = function() {
        function AiJEvent() {
          void 0 === this.mainType && (this.mainType = 0);
          void 0 === this.subType && (this.subType = 0);
        }
        return AiJEvent;
      }();
      AiJ.AiJEvent = AiJEvent;
      AiJEvent["__class"] = "AiJ.AiJEvent";
      var Response = function() {
        function Response() {
          void 0 === this.mainType && (this.mainType = 0);
          void 0 === this.subType && (this.subType = 0);
          void 0 === this.code && (this.code = 0);
          void 0 === this.message && (this.message = null);
          void 0 === this.text && (this.text = null);
        }
        return Response;
      }();
      AiJ.Response = Response;
      Response["__class"] = "AiJ.Response";
      var ResponseHandler = function() {
        function ResponseHandler() {}
        return ResponseHandler;
      }();
      AiJ.ResponseHandler = ResponseHandler;
      ResponseHandler["__class"] = "AiJ.ResponseHandler";
      var Options = function() {
        function Options() {
          this.connectionTimeout = 1e4;
          this.reconnectInterval = 1e3;
          this.reconnectDecay = 1.1;
          this.maxReconnectInterval = 3e4;
          this.maxRetries = 10;
          this.debug = true;
          this.allowReconnect = true;
          this.automaticOpen = true;
        }
        return Options;
      }();
      AiJ.Options = Options;
      Options["__class"] = "AiJ.Options";
      var Config = function() {
        function Config(ws, object) {
          this.mapping = new Object();
          this.options = new AiJ.Options();
          this.wsEventListener = new Config.Config$0(this);
          void 0 === this.ws && (this.ws = null);
          this.ws = ws;
          this.options.connectionTimeout = null != object["connectionTimeout"] ? object["connectionTimeout"] : this.options.connectionTimeout;
          this.options.maxRetries = null != object["maxRetries"] ? object["maxRetries"] : this.options.maxRetries;
          this.options.debug = null != object["debug"] ? object["debug"] : this.options.debug;
          this.options.allowReconnect = null != object["allowReconnect"] ? object["allowReconnect"] : this.options.allowReconnect;
          this.options.automaticOpen = null != object["automaticOpen"] ? object["automaticOpen"] : this.options.automaticOpen;
          this.options.maxReconnectInterval = null != object["maxReconnectInterval"] ? object["maxReconnectInterval"] : this.options.maxReconnectInterval;
          this.options.reconnectInterval = null != object["reconnectInterval"] ? object["reconnectInterval"] : this.options.reconnectInterval;
          this.options.reconnectDecay = null != object["reconnectDecay"] ? object["reconnectDecay"] : this.options.reconnectDecay;
        }
        Config.prototype.setWsEventListener = function(wsEventListener) {
          this.wsEventListener = wsEventListener;
        };
        Config.prototype.addRouter = function(mainType, subType, handler) {
          var mainRouter = this.mapping[new String(mainType).toString()];
          if (null == mainRouter) {
            mainRouter = new Object();
            this.mapping[new String(mainType).toString()] = mainRouter;
          }
          var subRouter = mainRouter[new String(subType).toString()];
          if (null == subRouter) {
            subRouter = [];
            mainRouter[new String(subType).toString()] = subRouter;
          }
          subRouter.push(handler) > 0;
        };
        return Config;
      }();
      AiJ.Config = Config;
      Config["__class"] = "AiJ.Config";
      (function(Config) {
        var Config$0 = function() {
          function Config$0(__parent) {
            this.__parent = __parent;
          }
          Config$0.prototype.onConnecting = function(aiJWs) {
            aiJWs.config.options.debug && window.console.log("onConnecting");
          };
          Config$0.prototype.onOpen = function(aiJWs, reconnectAttempts, event) {
            aiJWs.config.options.debug && window.console.log("onOpen");
          };
          Config$0.prototype.onClose = function(aiJWs, event) {
            aiJWs.config.options.debug && window.console.log("onClose");
          };
          Config$0.prototype.onForcedClose = function(aiJWs, event) {
            aiJWs.config.options.debug && window.console.log("onForcedClose");
          };
          Config$0.prototype.onError = function(aiJWs, event) {
            aiJWs.config.options.debug && window.console.log("onError");
          };
          Config$0.prototype.onMessage = function(aiJWs, messageEvent) {
            aiJWs.config.options.debug && window.console.log("onMessage");
          };
          Config$0.prototype.onTimeout = function(aiJWs) {
            aiJWs.config.options.debug && window.console.log("onTimeout");
          };
          Config$0.prototype.onReconnectAttempt = function(aiJWs, reconnectAttempts) {
            aiJWs.config.options.debug && window.console.log("onReconnectAttempt");
          };
          Config$0.prototype.onReconnectFail = function(aiJWs, reconnectAttempts) {
            aiJWs.config.options.debug && window.console.log("onReconnectFail");
          };
          return Config$0;
        }();
        Config.Config$0 = Config$0;
        Config$0["__interfaces"] = [ "AiJ.WsEventListener" ];
      })(Config = AiJ.Config || (AiJ.Config = {}));
      var AiJWs = function() {
        function AiJWs(config) {
          this.reconnectAttempts = 0;
          this.readyState = -1;
          this.forcedClose = false;
          this.timedOut = false;
          void 0 === this.self && (this.self = null);
          void 0 === this.ws && (this.ws = null);
          void 0 === this.config && (this.config = null);
          this.self = this;
          this.config = config;
          this.config.options.automaticOpen && this.connect(false);
        }
        AiJWs.prototype.reconnect = function() {
          var _this = this;
          this.reconnectAttempts++;
          if (this.reconnectAttempts > this.config.options.maxRetries) {
            this.config.wsEventListener.onReconnectFail(this, this.reconnectAttempts);
            return;
          }
          this.config.wsEventListener.onReconnectAttempt(this, this.reconnectAttempts);
          var timeout = this.self.config.options.reconnectInterval * Math.pow(this.self.config.options.reconnectDecay, this.self.reconnectAttempts);
          window.setTimeout(function() {
            return _this.self.connect(true);
          }, timeout > this.self.config.options.maxReconnectInterval ? this.self.config.options.maxReconnectInterval : timeout);
        };
        AiJWs.prototype.connect = function(reconnectAttempt) {
          var _this = this;
          reconnectAttempt || (this.reconnectAttempts = 0);
          this.ws = new WebSocket(this.config.ws);
          this.forcedClose = false;
          this.readyState = this.ws.CONNECTING;
          this.config.wsEventListener.onConnecting(this.self);
          var timeoutHandle = window.setTimeout(function() {
            _this.timedOut = true;
            _this.config.wsEventListener.onTimeout(_this.self);
            _this.ws.close();
            _this.timedOut = false;
          }, this.config.options.connectionTimeout);
          this.ws.onopen = function(event) {
            window.clearTimeout(timeoutHandle);
            _this.self.readyState = _this.ws.OPEN;
            _this.self.reconnectAttempts = 0;
            _this.config.wsEventListener.onOpen(_this.self, _this.self.reconnectAttempts, event);
            return new Object();
          };
          this.ws.onclose = function(closeEvent) {
            window.clearTimeout(timeoutHandle);
            if (_this.forcedClose) {
              _this.self.readyState = _this.ws.CLOSED;
              _this.config.wsEventListener.onForcedClose(_this.self, closeEvent);
            } else {
              reconnectAttempt || _this.timedOut || _this.config.wsEventListener.onClose(_this.self, closeEvent);
              _this.reconnect();
            }
            return new Object();
          };
          this.ws.onerror = function(event) {
            window.clearTimeout(timeoutHandle);
            _this.config.wsEventListener.onError(_this.self, event);
            return new Object();
          };
          this.ws.onmessage = function(messageEvent) {
            _this.config.options.debug && window.console.log("\u63a5\u6536\u4fe1\u606f:" + JSON.stringify(messageEvent.data));
            try {
              var response = JSON.parse(messageEvent.data);
              if (null != response) {
                response.text = messageEvent.data;
                var mainTypeMapping = _this.config.mapping[new String(response.mainType).toString()];
                if (null != mainTypeMapping) {
                  var functions = mainTypeMapping[new String(response.subType).toString()];
                  if (null != functions) for (var i = 0; i < functions.length; i++) functions[i].handler(_this.self, response); else _this.config.options.debug && window.console.log("mainType:" + response.mainType + " subType:" + response.subType + " no mapping");
                } else _this.config.options.debug && window.console.log("mainType:" + response.mainType + " no mapping");
              }
            } finally {
              _this.config.wsEventListener.onMessage(_this.self, messageEvent);
            }
            return new Object();
          };
        };
        AiJWs.prototype.send = function(event) {
          this.config.options.debug && window.console.log("\u53d1\u9001\u4fe1\u606f:" + JSON.stringify(event));
          this.ws.send(JSON.stringify(event));
        };
        AiJWs.prototype.close = function() {
          this.forcedClose = true;
          this.ws.close();
        };
        return AiJWs;
      }();
      AiJ.AiJWs = AiJWs;
      AiJWs["__class"] = "AiJ.AiJWs";
    })(AiJ = exports.AiJ || (exports.AiJ = {}));
    exports.AiJ = AiJ;
    cc._RF.pop();
  }, {} ],
  AlertWindow: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "139f4lZ/vJKdZWWze0ku7BE", "AlertWindow");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AlertWindow = function(_super) {
      __extends(AlertWindow, _super);
      function AlertWindow() {
        return _super.call(this) || this;
      }
      AlertWindow.getInst = function() {
        null == AlertWindow.inst && (AlertWindow.inst = new AlertWindow());
        return AlertWindow.inst;
      };
      AlertWindow.alert = function(title, message) {
        var inst = AlertWindow.getInst();
        inst.show();
        inst.contentPane.getChild("title").asTextField.text = title;
        inst.contentPane.getChild("content").asTextField.text = message;
      };
      AlertWindow.prototype.onInit = function() {
        this.contentPane = fgui.UIPackage.createObject("commons", "AlertWindow").asCom;
        this.center();
      };
      return AlertWindow;
    }(fgui.Window);
    exports.default = AlertWindow;
    cc._RF.pop();
  }, {} ],
  AppConfig: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "12cf41W7tlPzoLZVTcrbgP8", "AppConfig");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AppConfig = function() {
      function AppConfig() {}
      AppConfig.PLAZA_WS_HOST = "192.168.1.6";
      AppConfig.PLAZA_WS_PORT = 8082;
      AppConfig.PLATFORM_URL = "http://192.168.1.6:8090/";
      AppConfig.PLAZA_WS_NAME = "PLAZA_WS";
      AppConfig.LOCAL_FIRE = "LOCAL_FIRE";
      AppConfig.PLAZA_FIRE = "PLAZA_FIRE";
      AppConfig.GAME_FIRE = "GAME_FIRE";
      AppConfig.GAME_WS_NAME = "GAME_WS_NAME";
      return AppConfig;
    }();
    exports.default = AppConfig;
    cc._RF.pop();
  }, {} ],
  AudioManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1f3aatSwUNFM61nLb0C+xEA", "AudioManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AudioManager = function() {
      function AudioManager() {}
      AudioManager.play_music = function(pkgName, resName) {
        var pi = fgui.UIPackage.getItemByURL(fgui.UIPackage.getItemURL(pkgName, resName));
        cc.audioEngine.playMusic(pi.owner.getItemAsset(pi), true);
      };
      AudioManager.play_effect = function(pkgName, resName) {
        var pi = fgui.UIPackage.getItemByURL(fgui.UIPackage.getItemURL(pkgName, resName));
        cc.audioEngine.playEffect(pi.owner.getItemAsset(pi), true);
      };
      AudioManager.stop_music = function() {
        cc.audioEngine.stopMusic();
      };
      return AudioManager;
    }();
    exports.default = AudioManager;
    cc._RF.pop();
  }, {} ],
  BroadcastEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "975ccaM1Z1LyqRUh3utBqKl", "BroadcastEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var BroadcastEventResponseHandler = function(_super) {
      __extends(BroadcastEventResponseHandler, _super);
      function BroadcastEventResponseHandler() {
        return _super.call(this) || this;
      }
      BroadcastEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).emit("broadcast", response);
      };
      return BroadcastEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = BroadcastEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  BroadcastEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5146dXpdVZIHYqmg98/wgoI", "BroadcastEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var BroadcastEventResponse = function(_super) {
      __extends(BroadcastEventResponse, _super);
      function BroadcastEventResponse() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.broadcasts = [];
        return _this;
      }
      return BroadcastEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = BroadcastEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  BroadcastEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0ffd3PxugRGGYpAK+d8lgM6", "BroadcastEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var BroadcastEvent = function(_super) {
      __extends(BroadcastEvent, _super);
      function BroadcastEvent() {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 2;
        return _this;
      }
      return BroadcastEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = BroadcastEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  ChatEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a53a7mCafxNb7S79qSuo3kS", "ChatEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var ChatEventResponseHandler = function(_super) {
      __extends(ChatEventResponseHandler, _super);
      function ChatEventResponseHandler() {
        return _super.call(this) || this;
      }
      ChatEventResponseHandler.prototype.handler = function(aiJWs, response) {};
      return ChatEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = ChatEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  ClientReadyEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "41539WwHgRIn4zyS9TZx6oU", "ClientReadyEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var ClientReadyEvent = function(_super) {
      __extends(ClientReadyEvent, _super);
      function ClientReadyEvent() {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 5;
        return _this;
      }
      return ClientReadyEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = ClientReadyEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  CreateTableEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "96f7a7y86JNSpxX6OkM5bdk", "CreateTableEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var CreateTableEventResponseHandler = function(_super) {
      __extends(CreateTableEventResponseHandler, _super);
      function CreateTableEventResponseHandler() {
        return _super.call(this) || this;
      }
      CreateTableEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).emit("create_table_success", response);
      };
      return CreateTableEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = CreateTableEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  CreateTableEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0ff8cwDxFNMSLp6GUqjnra9", "CreateTableEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var CreateTableEventResponse = function(_super) {
      __extends(CreateTableEventResponse, _super);
      function CreateTableEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return CreateTableEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = CreateTableEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  CreateTableEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "28eddJWtRZHF5UW+YtHPijP", "CreateTableEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var CreateTableEvent = function(_super) {
      __extends(CreateTableEvent, _super);
      function CreateTableEvent() {
        var _this = _super.call(this) || this;
        _this.ruleText = "{}";
        _this.mainType = 2;
        _this.subType = 1;
        return _this;
      }
      return CreateTableEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = CreateTableEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  DismissTableEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "185f9WIuxtAs7bEWdjloWmU", "DismissTableEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var DismissTableEvent = function(_super) {
      __extends(DismissTableEvent, _super);
      function DismissTableEvent() {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 3;
        return _this;
      }
      return DismissTableEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = DismissTableEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  DismissVoteEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "98f17cD2ldOV4Ifm1IQutYc", "DismissVoteEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var DismissVoteEventResponseHandler = function(_super) {
      __extends(DismissVoteEventResponseHandler, _super);
      function DismissVoteEventResponseHandler() {
        return _super.call(this) || this;
      }
      DismissVoteEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("dismiss_vote", response);
      };
      return DismissVoteEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = DismissVoteEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  DismissVoteEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "21bd1IxHp1EWbOw4qTWo6hw", "DismissVoteEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var DismissVoteEventResponse = function(_super) {
      __extends(DismissVoteEventResponse, _super);
      function DismissVoteEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return DismissVoteEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = DismissVoteEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  DismissVoteTableEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "78639sPZXpInrC5BKyNAFBs", "DismissVoteTableEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var DismissVoteTableEvent = function(_super) {
      __extends(DismissVoteTableEvent, _super);
      function DismissVoteTableEvent(agree) {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 9;
        _this.agree = agree;
        return _this;
      }
      return DismissVoteTableEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = DismissVoteTableEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  FireKit: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "75c871UmTpLjpK6atYRj6Hj", "FireKit");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var OnFire_1 = require("./OnFire");
    var FireKit = function() {
      function FireKit() {}
      FireKit.init = function(name) {
        null == FireKit.fireDict[name] && (FireKit.fireDict[name] = new OnFire_1.default());
      };
      FireKit.use = function(name) {
        return FireKit.fireDict[name];
      };
      FireKit.fireDict = {};
      return FireKit;
    }();
    exports.default = FireKit;
    cc._RF.pop();
  }, {
    "./OnFire": "OnFire"
  } ],
  GameServiceManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b2dc1/0dMtPtZy0HabQ6zpy", "GameServiceManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _ = require("lodash");
    var GameServiceManager = function() {
      function GameServiceManager() {}
      GameServiceManager.getInst = function() {
        null == GameServiceManager.inst && (GameServiceManager.inst = new GameServiceManager());
        return GameServiceManager.inst;
      };
      GameServiceManager.prototype.initGameService = function(serviceItems) {
        this.serviceItems = serviceItems;
      };
      GameServiceManager.prototype.getGameService = function(name) {
        return _.filter(this.serviceItems, {
          name: name
        });
      };
      GameServiceManager.prototype.getGameServiceByServiceId = function(serviceId) {
        return _.find(this.serviceItems, {
          serviceId: serviceId
        });
      };
      GameServiceManager.prototype.randomGameService = function(name) {
        var serviceItems = _.filter(this.serviceItems, {
          name: name
        });
        return 0 == serviceItems.length ? null : _.shuffle(serviceItems)[0];
      };
      return GameServiceManager;
    }();
    exports.default = GameServiceManager;
    var GameService = function() {
      function GameService() {}
      return GameService;
    }();
    cc._RF.pop();
  }, {
    lodash: 7
  } ],
  HeroEnterEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9262bUVcJ1OMrncc71qlLLd", "HeroEnterEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroEnterEventResponseHandler = function(_super) {
      __extends(HeroEnterEventResponseHandler, _super);
      function HeroEnterEventResponseHandler() {
        return _super.call(this) || this;
      }
      HeroEnterEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_enter", response);
      };
      return HeroEnterEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroEnterEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroEnterEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6557bWuuOZGEaj7f/o9w4ew", "HeroEnterEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroEnterEventResponse = function(_super) {
      __extends(HeroEnterEventResponse, _super);
      function HeroEnterEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroEnterEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroEnterEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroLeaveEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "59312p2OLVMVpxrIa2DeHgr", "HeroLeaveEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroLeaveEventResponseHandler = function(_super) {
      __extends(HeroLeaveEventResponseHandler, _super);
      function HeroLeaveEventResponseHandler() {
        return _super.call(this) || this;
      }
      HeroLeaveEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_leave", response);
      };
      return HeroLeaveEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroLeaveEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroLeaveEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "896faIVO4lN17aVbV+D8xoP", "HeroLeaveEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroLeaveEventResponse = function(_super) {
      __extends(HeroLeaveEventResponse, _super);
      function HeroLeaveEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroLeaveEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroLeaveEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bf0a6u1ii9AXrLaSJD1Gaqa", "HeroManager");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var HeroManager = function() {
      function HeroManager() {
        this.heroes = {};
      }
      HeroManager.getInst = function() {
        null == HeroManager.inst && (HeroManager.inst = new HeroManager());
        return HeroManager.inst;
      };
      HeroManager.prototype.getHero = function(userId) {
        return this.heroes[userId];
      };
      HeroManager.prototype.addHero = function(hero) {
        this.heroes[hero.userId] = hero;
      };
      HeroManager.prototype.setMe = function(me) {
        this.addHero(me);
        this._me = me;
      };
      HeroManager.prototype.getMe = function() {
        return this._me;
      };
      return HeroManager;
    }();
    exports.default = HeroManager;
    cc._RF.pop();
  }, {} ],
  HeroOfflineEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cc232+JEc9IXbgRURJmYipn", "HeroOfflineEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroOfflineEventResponseHandler = function(_super) {
      __extends(HeroOfflineEventResponseHandler, _super);
      function HeroOfflineEventResponseHandler() {
        return _super.call(this) || this;
      }
      HeroOfflineEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_offline", response);
      };
      return HeroOfflineEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroOfflineEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroOfflineEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1a7e34baSxGgJCeOXRk/Pim", "HeroOfflineEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroOfflineEventResponse = function(_super) {
      __extends(HeroOfflineEventResponse, _super);
      function HeroOfflineEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroOfflineEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroOfflineEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroOnlineEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2bdcb4akB5PCIDM60Gtql4g", "HeroOnlineEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroOnlineEventResponseHandler = function(_super) {
      __extends(HeroOnlineEventResponseHandler, _super);
      function HeroOnlineEventResponseHandler() {
        return _super.call(this) || this;
      }
      HeroOnlineEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_online", response);
      };
      return HeroOnlineEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroOnlineEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroOnlineEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4c020l2/ghJm64BE+cEUUNu", "HeroOnlineEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroOnlineEventResponse = function(_super) {
      __extends(HeroOnlineEventResponse, _super);
      function HeroOnlineEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroOnlineEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroOnlineEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroProfileEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8398dN+QoNMJZuGkjs1WeW8", "HeroProfileEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroProfileEventResponseHandler = function(_super) {
      __extends(HeroProfileEventResponseHandler, _super);
      function HeroProfileEventResponseHandler() {
        return _super.call(this) || this;
      }
      HeroProfileEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_profile", response);
      };
      return HeroProfileEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroProfileEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroProfileEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f4b52Qov3VIar4WJEvMWsFc", "HeroProfileEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroProfileEventResponse = function(_super) {
      __extends(HeroProfileEventResponse, _super);
      function HeroProfileEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroProfileEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroProfileEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroProfileEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d26e8iNpoJIG5rmQRuBNG6h", "HeroProfileEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroProfileEvent = function(_super) {
      __extends(HeroProfileEvent, _super);
      function HeroProfileEvent(userId) {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 6;
        _this.userId = userId;
        return _this;
      }
      return HeroProfileEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = HeroProfileEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroSceneResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bf9a3GjD+lFpbalV5Ux7wLj", "HeroSceneResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroSceneResponseHandler = function(_super) {
      __extends(HeroSceneResponseHandler, _super);
      function HeroSceneResponseHandler() {
        return _super.call(this) || this;
      }
      HeroSceneResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_scene", response);
      };
      return HeroSceneResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroSceneResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroSceneResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bd4fbg6viBFxLkJAUT7kzlq", "HeroSceneResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroSceneResponse = function(_super) {
      __extends(HeroSceneResponse, _super);
      function HeroSceneResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroSceneResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroSceneResponse;
    var HeroItem = function() {
      function HeroItem() {}
      return HeroItem;
    }();
    exports.HeroItem = HeroItem;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroSitDownEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1315cKkiT9PL5X4OgpjKilw", "HeroSitDownEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroSitDownEventResponseHandler = function(_super) {
      __extends(HeroSitDownEventResponseHandler, _super);
      function HeroSitDownEventResponseHandler() {
        return _super.call(this) || this;
      }
      HeroSitDownEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_sitDown", response);
      };
      return HeroSitDownEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroSitDownEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroSitDownEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ed87dB8W6NFmK16uagR4DDS", "HeroSitDownEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroSitDownEventResponse = function(_super) {
      __extends(HeroSitDownEventResponse, _super);
      function HeroSitDownEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroSitDownEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroSitDownEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  HeroStandUpEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1f024N+AvpNdJhzaVKvJ3EU", "HeroStandUpEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var HeroStandUpEventResponseHandler = function(_super) {
      __extends(HeroStandUpEventResponseHandler, _super);
      function HeroStandUpEventResponseHandler() {
        return _super.call(this) || this;
      }
      HeroStandUpEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("hero_standUp", response);
      };
      return HeroStandUpEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = HeroStandUpEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  HeroStandUpEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "74f61ofS2FIwI523dkqOntK", "HeroStandUpEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var HeroStandUpEventResponse = function(_super) {
      __extends(HeroStandUpEventResponse, _super);
      function HeroStandUpEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return HeroStandUpEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = HeroStandUpEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  Hero: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b9b294yHEFEZ7636zwoW9o7", "Hero");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AppConfig_1 = require("../AppConfig");
    var Hero = function() {
      function Hero(userName, userId, nickName, gender, avatar, distributorId, address, longitude, latitude, ip, certStatus) {
        this.userName = userName;
        this.userId = userId;
        this.nickName = nickName;
        this.gender = gender;
        this.avatar = cc.sys.isBrowser ? AppConfig_1.default.PLATFORM_URL + "avatar?url=" + encodeURIComponent(avatar) : avatar;
        this.distributorId = distributorId;
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.ip = ip;
        this.certStatus = certStatus;
      }
      return Hero;
    }();
    exports.default = Hero;
    cc._RF.pop();
  }, {
    "../AppConfig": "AppConfig"
  } ],
  HotUpdateManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "afd03NcMeNAfbZBiq5ALqlY", "HotUpdateManager");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AlertWindow_1 = require("../AlertWindow");
    var HotUpdateManager = function() {
      function HotUpdateManager() {
        this._updating = false;
        this._canRetry = false;
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset";
        cc.log("storagePath:" + this._storagePath);
        this._am = new jsb.AssetsManager("", this._storagePath, function(versionA, versionB) {
          cc.log("JS Custom Version Compare: version A is " + versionA + ", version B is " + versionB);
          var vA = versionA.split(".");
          var vB = versionB.split(".");
          for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a != b) return a - b;
          }
          return vB.length > vA.length ? -1 : 0;
        });
        cc.sys.os == cc.sys.OS_ANDROID && this._am.setMaxConcurrentTask(2);
      }
      HotUpdateManager.getInst = function() {
        null == HotUpdateManager.inst && (HotUpdateManager.inst = new HotUpdateManager());
        return HotUpdateManager.inst;
      };
      HotUpdateManager.prototype.checkAndUpdate = function(callback) {
        var _this = this;
        if (this._updating) {
          cc.log("Checking or updating ...");
          return;
        }
        this._callback = callback;
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
          cc.log("load project.manifest");
          cc.loader.loadRes("project", function(err, res) {
            cc.log(res._$nativeAsset);
            var manifest = new jsb.Manifest(res._$nativeAsset, _this._storagePath);
            _this._am.loadLocalManifest(manifest, _this._storagePath);
            if (!_this._am.getLocalManifest() || !_this._am.getLocalManifest().isLoaded()) {
              cc.log("Failed to load local manifest ...");
              AlertWindow_1.default.alert("\u51fa\u9519\u4e86", "\u52a0\u8f7d\u672c\u5730\u7684manifest\u6587\u4ef6\u5931\u8d25,\u8bf7\u91cd\u65b0\u5b89\u88c5\u5ba2\u6237\u7aef.");
              return;
            }
            _this._am.setEventCallback(_this.checkCb.bind(_this));
            _this._am.checkUpdate();
            _this._updating = true;
          });
        }
      };
      HotUpdateManager.prototype.checkCb = function(event) {
        cc.log("checkCb Code: " + event.getEventCode());
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          cc.log("No local manifest file found, hot update skipped.");
          AlertWindow_1.default.alert("\u51fa\u9519\u4e86", "\u52a0\u8f7d\u672c\u5730\u7684manifest\u6587\u4ef6\u5931\u8d25,\u66f4\u65b0\u5931\u8d25.");
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          cc.log("Fail to download manifest file, hot update skipped.");
          AlertWindow_1.default.alert("\u51fa\u9519\u4e86", "\u4e0b\u8f7dmanifest\u6587\u4ef6\u5931\u8d25,\u66f4\u65b0\u5931\u8d25.");
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          cc.log("Already up to date with the latest remote version.");
          break;

         case jsb.EventAssetsManager.NEW_VERSION_FOUND:
          cc.log("New version found, please try to update.");
          this._callback({
            code: 0
          });
          this._am.setEventCallback(this.updateCb.bind(this));
          this._am.update();
          this._updating = true;
          cc.log("call update.");
          break;

         default:
          return;
        }
        this._updating = false;
      };
      HotUpdateManager.prototype.updateCb = function(event) {
        var needRestart = false;
        var failed = false;
        cc.log("updateCb Code: " + event.getEventCode());
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          cc.log("No local manifest file found, hot update skipped.");
          AlertWindow_1.default.alert("\u51fa\u9519\u4e86", "\u52a0\u8f7d\u672c\u5730\u7684manifest\u6587\u4ef6\u5931\u8d25,\u66f4\u65b0\u5931\u8d25.");
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_PROGRESSION:
          this._callback({
            code: 1,
            downloaded: event.getDownloadedFiles(),
            total: event.getTotalFiles()
          });
          cc.log("downloaded:" + event.getDownloadedFiles() + " / " + event.getTotalFiles());
          var msg = event.getMessage();
          msg && cc.log("Updated file: " + msg);
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          cc.log("Fail to download manifest file, hot update skipped.");
          failed = true;
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          cc.log("Already up to date with the latest remote version.");
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FINISHED:
          cc.log("Update finished. " + event.getMessage());
          this._callback({
            code: 2
          });
          needRestart = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FAILED:
          cc.log("Update failed. " + event.getMessage());
          this._updating = false;
          this._canRetry = true;
          break;

         case jsb.EventAssetsManager.ERROR_UPDATING:
          cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
          break;

         case jsb.EventAssetsManager.ERROR_DECOMPRESS:
          cc.log(event.getMessage());
        }
        if (failed) {
          this._am.setEventCallback(null);
          this._updating = false;
        }
        if (needRestart) {
          this._am.setEventCallback(null);
          var searchPaths = jsb.fileUtils.getSearchPaths();
          var newPaths = this._am.getLocalManifest().getSearchPaths();
          console.log(JSON.stringify(newPaths));
          Array.prototype.unshift.apply(searchPaths, newPaths);
          cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
          jsb.fileUtils.setSearchPaths(searchPaths);
          cc.audioEngine.stopAll();
          cc.game.restart();
        }
      };
      return HotUpdateManager;
    }();
    exports.default = HotUpdateManager;
    cc._RF.pop();
  }, {
    "../AlertWindow": "AlertWindow"
  } ],
  JoinTableEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "236b75l/31JOr5fUmWGNVAT", "JoinTableEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var JoinTableEventResponseHandler = function(_super) {
      __extends(JoinTableEventResponseHandler, _super);
      function JoinTableEventResponseHandler() {
        return _super.call(this) || this;
      }
      JoinTableEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).emit("join_table_success", response);
      };
      return JoinTableEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = JoinTableEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  JoinTableEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6b3a2BgaD1O+4Pu41bDMNOz", "JoinTableEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var JoinTableEventResponse = function(_super) {
      __extends(JoinTableEventResponse, _super);
      function JoinTableEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return JoinTableEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = JoinTableEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  JoinTableEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "96e52hvEaNMRq37PpKhk/p4", "JoinTableEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var JoinTableEvent = function(_super) {
      __extends(JoinTableEvent, _super);
      function JoinTableEvent(tableNo) {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 2;
        _this.tableNo = tableNo;
        return _this;
      }
      return JoinTableEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = JoinTableEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  LeaveTableEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "662cfPYS5xAiaK1Hj10Kqty", "LeaveTableEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var LeaveTableEvent = function(_super) {
      __extends(LeaveTableEvent, _super);
      function LeaveTableEvent() {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 4;
        return _this;
      }
      return LeaveTableEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = LeaveTableEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  LoadingWindow: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "48b6aWYWtJFbqwUNS9Ocmq1", "LoadingWindow");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var LoadingWindow = function(_super) {
      __extends(LoadingWindow, _super);
      function LoadingWindow() {
        return _super.call(this) || this;
      }
      LoadingWindow.getInst = function() {
        null == LoadingWindow.inst && (LoadingWindow.inst = new LoadingWindow());
        return LoadingWindow.inst;
      };
      LoadingWindow.loading = function(message) {
        var inst = LoadingWindow.getInst();
        inst.show();
        inst.contentPane.getChild("content").asTextField.text = message;
      };
      LoadingWindow.close = function() {
        var inst = LoadingWindow.getInst();
        inst.hide();
      };
      LoadingWindow.prototype.onInit = function() {
        this.contentPane = fgui.UIPackage.createObject("commons", "LoadingWindow").asCom;
        this.center();
      };
      return LoadingWindow;
    }(fgui.Window);
    exports.default = LoadingWindow;
    cc._RF.pop();
  }, {} ],
  LoginNotifyResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "382bfzcpttAo77TKGUOz3MF", "LoginNotifyResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var LoginNotifyResponseHandler = function(_super) {
      __extends(LoginNotifyResponseHandler, _super);
      function LoginNotifyResponseHandler() {
        return _super.call(this) || this;
      }
      LoginNotifyResponseHandler.prototype.handler = function(aiJWs, response) {};
      return LoginNotifyResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = LoginNotifyResponseHandler;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  MahjongAction: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c4eeaGnW6ZIz7J1BnEFGHKQ", "MahjongAction");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongAction;
    (function(MahjongAction) {
      MahjongAction["DISPATCH"] = "DISPATCH";
      MahjongAction["NOTIFY"] = "NOTIFY";
      MahjongAction["OUT"] = "OUT";
      MahjongAction["N"] = "N";
      MahjongAction["P"] = "P";
      MahjongAction["G"] = "G";
      MahjongAction["H"] = "H";
    })(MahjongAction = exports.MahjongAction || (exports.MahjongAction = {}));
    cc._RF.pop();
  }, {} ],
  MahjongDispatchCardEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8da7cuazHBCP7B9QfngOeiq", "MahjongDispatchCardEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongDispatchCardEventResponse = function(_super) {
      __extends(MahjongDispatchCardEventResponse, _super);
      function MahjongDispatchCardEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongDispatchCardEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongDispatchCardEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongDispathCardResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5c900vWz6tNOoFimNnuWI30", "MahjongDispathCardResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongGameStartResponseHandler = function(_super) {
      __extends(MahjongGameStartResponseHandler, _super);
      function MahjongGameStartResponseHandler() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      MahjongGameStartResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("dispatch_card", response);
      };
      return MahjongGameStartResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongGameStartResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongEndEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "45cc55MTndMYJbMJanf4NTX", "MahjongEndEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongEndEventResponseHandler = function(_super) {
      __extends(MahjongEndEventResponseHandler, _super);
      function MahjongEndEventResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongEndEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("end", response);
      };
      return MahjongEndEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongEndEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongEndEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b5c8cDoRlhG07kOj3U+UHbr", "MahjongEndEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongEndEventResponse = function(_super) {
      __extends(MahjongEndEventResponse, _super);
      function MahjongEndEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongEndEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongEndEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongErrorEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6d061BqslFJUYyW+tt33Pjy", "MahjongErrorEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongErrorEventResponseHandler = function(_super) {
      __extends(MahjongErrorEventResponseHandler, _super);
      function MahjongErrorEventResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongErrorEventResponseHandler.prototype.handler = function(aiJWs, response) {};
      return MahjongErrorEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongErrorEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongErrorEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "30778JeTGJHVahZP79qBdq7", "MahjongErrorEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongErrorEventResponse = function(_super) {
      __extends(MahjongErrorEventResponse, _super);
      function MahjongErrorEventResponse() {
        return _super.call(this) || this;
      }
      return MahjongErrorEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongErrorEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongGameActionRecord: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bc744Db9kBAMZ1SizdWYGnh", "MahjongGameActionRecord");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongGameActionRecord = function() {
      function MahjongGameActionRecord() {}
      return MahjongGameActionRecord;
    }();
    exports.default = MahjongGameActionRecord;
    cc._RF.pop();
  }, {} ],
  MahjongGameEndEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "41d60qY7pBKOYrdD6RzRfoI", "MahjongGameEndEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongGameEndEventResponseHandler = function(_super) {
      __extends(MahjongGameEndEventResponseHandler, _super);
      function MahjongGameEndEventResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongGameEndEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("game_end", response);
      };
      return MahjongGameEndEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongGameEndEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongGameEndEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4876a6Vz4dDpKTlU5tfogX7", "MahjongGameEndEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongGameEndEventResponse = function(_super) {
      __extends(MahjongGameEndEventResponse, _super);
      function MahjongGameEndEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongGameEndEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongGameEndEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongGameEngine: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f59f6utdDZDCKeTFD2TiC8Q", "MahjongGameEngine");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var AiJKit_1 = require("../../ws/AiJKit");
    var ClientReadyEvent_1 = require("../event/ClientReadyEvent");
    var _ = require("lodash");
    var MahjongWeaveItem_1 = require("./struct/MahjongWeaveItem");
    var MahjongWeaveType_1 = require("./struct/MahjongWeaveType");
    var HeroSceneResponse_1 = require("../response/HeroSceneResponse");
    var HeroManager_1 = require("../../hero/HeroManager");
    var HeroProfileEvent_1 = require("../event/HeroProfileEvent");
    var Hero_1 = require("../../hero/Hero");
    var AbstractRoomConfig_1 = require("../AbstractRoomConfig");
    var HeroMate = function() {
      function HeroMate(chair, online, sitDown, nickName) {
        this.chair = chair;
        this.online = online;
        this.sitDown = sitDown;
        this.nickName = nickName;
      }
      return HeroMate;
    }();
    exports.HeroMate = HeroMate;
    var MahjongGameEngine = function() {
      function MahjongGameEngine(gameLayer, objs) {
        var _this = this;
        this._heroMap = {};
        this._weavesMap = {};
        this._discardCardsMap = {};
        this._meChair = -1;
        this._chairCount = 4;
        this._leftCardCount = 0;
        this._totalNumber = 0;
        this._currentNumber = 0;
        this._clientReady = false;
        this._gameStart = false;
        this.clientReady = function() {
          _this._clientReady = true;
          AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new ClientReadyEvent_1.default());
        };
        this.dismissVoteCb = function(resp) {
          _this._gameLayer.renderDismissVote(resp.status, resp.agrees, resp.refuses, resp.voteTime, resp.countDown, _this._meChair);
        };
        this.gameHeroOfflineCb = function(resp) {
          var heroMate = _this._heroMap[resp.userId];
          heroMate.online = false;
          _this.renderOnline(heroMate);
        };
        this.gameHeroOnlineCb = function(resp) {
          var heroMate = _this._heroMap[resp.userId];
          heroMate.online = true;
          _this.renderOnline(heroMate);
        };
        this.gameHeroStandUpCb = function(resp) {
          var heroMate = _this._heroMap[resp.userId];
          heroMate.sitDown = false;
          _this.renderSitDown(heroMate);
        };
        this.gameHeroSitDownCb = function(resp) {
          var heroMate = _this._heroMap[resp.userId];
          heroMate.sitDown = true;
          _this.renderSitDown(heroMate);
        };
        this.gameHeroEnterCb = function(resp) {
          _this.heroEnter(resp.userId, resp.chair, resp.nickName);
        };
        this.gameHeroLeaveCb = function(resp) {
          var heroMate = _this._heroMap[resp.userId];
          _this.renderLeave(heroMate);
          delete _this._heroMap[resp.userId];
        };
        this.gameHeroSceneCb = function(resp) {
          var heroItem = new HeroSceneResponse_1.HeroItem();
          heroItem.userId = HeroManager_1.default.getInst().getMe().userId;
          var find = _.find(resp.heroes, heroItem);
          null != find && (_this._meChair = find.chair);
          -1 != _this._meChair && _.each(resp.heroes, function(hero) {
            _this._heroMap[hero.userId] = new HeroMate(hero.chair, hero.online, hero.sitDown, hero.nickName);
            _this.renderSitDown(_this._heroMap[hero.userId]);
            _this.renderOnline(_this._heroMap[hero.userId]);
            _this.getHeroProfile(hero.userId);
            _this._gameLayer.renderHeroSummary(hero.chair, hero.nickName);
          });
        };
        this.gameHeroProfileCb = function(resp) {
          var hero = new Hero_1.default(resp.userName, resp.userId, resp.nickName, resp.gender, resp.avatar, resp.distributorId, resp.address, resp.longitude, resp.latitude, resp.ip, resp.certStatus);
          HeroManager_1.default.getInst().addHero(hero);
          _this.renderHeroProfile(hero);
        };
        this.endCb = function(resp) {
          window.setTimeout(function() {
            for (var i = 0; i < _this._chairCount; i++) {
              var hero = HeroManager_1.default.getInst().getHero(_this.getUserId(i));
              _this._gameLayer.renderEnd(_this.switchView(i), resp.score[i], resp.actionStatistics[i], resp.startedTime, resp.endedTime, resp.tableNo, hero.userId == _this._joinTableEventResponse.ownerId, hero.distributorId);
            }
            _this._gameLayer.renderEndInfo(resp.tableNo, resp.startedTime, resp.endedTime);
          }, 4e3);
        };
        this.gameStartCb = function(resp) {
          _this._gameStart = true;
          _this._gameLayer.renderGameStart();
          _this._meChair = resp.chair;
          _this._chairCount = resp.chairCount;
          _this._cards = resp.cards;
          _this._leftCardCount = resp.leftCardCount;
          _this._totalNumber = resp.totalNumber;
          _this._currentNumber = resp.currentNumber;
          _this._gameLayer.renderLeftCardCount(_this._leftCardCount);
          _this._gameLayer.renderLeftNumber(_this._totalNumber - _this._currentNumber);
          for (var i = 0; i < resp.chairCount; i++) {
            _this._weavesMap[i] = [];
            _this._discardCardsMap[i] = [];
            _this.renderSitDown(new HeroMate(i, true, true, ""));
            var view = _this.switchView(i);
            _this._gameLayer.renderScore(view, resp.scores[i]);
            switch (view) {
             case 0:
              _this._gameLayer.renderSouthDiscardCard(_this._discardCardsMap[i]);
              _this._gameLayer.renderSouthCard(_.clone(_this._cards), _this.getWeaveItems(i));
              break;

             case 1:
              _this._gameLayer.renderEastDiscardCard(_this._discardCardsMap[i]);
              _this._gameLayer.renderEastCard(_this.getWeaveItems(i));
              break;

             case 2:
              _this._gameLayer.renderNorthDiscardCard(_this._discardCardsMap[i]);
              _this._gameLayer.renderNorthCard(_this.getWeaveItems(i));
              break;

             case 3:
              _this._gameLayer.renderWestDiscardCard(_this._discardCardsMap[i]);
              _this._gameLayer.renderWestCard(_this.getWeaveItems(i));
            }
          }
        };
        this.gamePlayingSceneCb = function(resp) {
          _this._gameLayer.renderGameStart();
          _this._gameStart = true;
          _this._meChair = resp.chair;
          _this._chairCount = resp.chairCount;
          _this._cards = resp.cards;
          _this._leftCardCount = resp.leftCardCount;
          _this._totalNumber = resp.totalNumber;
          _this._currentNumber = resp.currentNumber;
          if (resp.current == _this._meChair && -1 != resp.currCard) {
            var indexOf = _this._cards.indexOf(resp.currCard);
            _this._cards.splice(indexOf, 1);
            _this._cards.push(resp.currCard);
            _this._currCard = resp.currCard;
          }
          for (var i = 0; i < resp.chairCount; i++) {
            _this._discardCardsMap[i] = _.slice(resp.discardCards[i], 0, resp.discardCount[i]);
            _this._weavesMap[i] = resp.weaveItems[i];
            _this.renderSitDown(new HeroMate(i, true, true, ""));
            var view = _this.switchView(i);
            _this._gameLayer.renderScore(view, resp.scores[i]);
            switch (view) {
             case 0:
              _this._gameLayer.renderSouthDiscardCard(_.clone(_this._discardCardsMap[i]));
              _this._gameLayer.renderSouthCard(_.clone(_this._cards), _this.getWeaveItems(i), _this._currCard);
              break;

             case 1:
              _this._gameLayer.renderEastDiscardCard(_.clone(_this._discardCardsMap[i]));
              _this._gameLayer.renderEastCard(_this.getWeaveItems(i), i == resp.current ? 0 : -1);
              break;

             case 2:
              _this._gameLayer.renderNorthDiscardCard(_.clone(_this._discardCardsMap[i]));
              _this._gameLayer.renderNorthCard(_this.getWeaveItems(i), i == resp.current ? 0 : -1);
              break;

             case 3:
              _this._gameLayer.renderWestDiscardCard(_.clone(_this._discardCardsMap[i]));
              _this._gameLayer.renderWestCard(_this.getWeaveItems(i), i == resp.current ? 0 : -1);
            }
          }
          _this._gameLayer.renderLeftCardCount(_this._leftCardCount);
          _this._gameLayer.renderLeftNumber(_this._totalNumber - _this._currentNumber);
          _this._gameLayer.renderPilotLamp(_this.switchView(resp.current));
          0 != resp.action && _this._gameLayer.renderOperateNotify(resp.actionCard, 0 != (4 & resp.action), 0 != (2 & resp.action), 0 != (1 & resp.action), true, resp.actionCards);
        };
        this.gameEndCb = function(resp) {
          for (var i = 0; i < resp.chairCount; i++) {
            var currCard = -1 != _.indexOf(resp.chairs, i) ? resp.currCard : -1;
            if (-1 != _.indexOf(resp.chairs, resp.provider) && -1 != _.indexOf(resp.chairs, i)) {
              var indexOf = resp.cards[i].indexOf(currCard);
              resp.cards[i].splice(indexOf, 1);
            }
            var cards = _.clone(resp.cards[i]);
            -1 != _.indexOf(resp.chairs, i) && 0 == _this.switchView(i) && cards.push(currCard);
            switch (_this.switchView(i)) {
             case 0:
              _this._gameLayer.renderSouthCard(cards, resp.weaveItems[i], currCard);
              break;

             case 1:
              _this._gameLayer.renderEastCard(resp.weaveItems[i], currCard, cards);
              break;

             case 2:
              _this._gameLayer.renderNorthCard(resp.weaveItems[i], currCard, cards);
              break;

             case 3:
              _this._gameLayer.renderWestCard(resp.weaveItems[i], currCard, cards);
            }
          }
          window.setTimeout(function() {
            for (var i = 0; i < resp.chairCount; i++) {
              _this._gameLayer.renderGameEndCards(_this.switchView(i), resp.weaveItems[i], resp.cards[i], -1 != _.indexOf(resp.chairs, i), -1 == _.indexOf(resp.chairs, i) && resp.provider == i, resp.currCard);
              _this._gameLayer.renderGameEndFlag(_this.switchView(i), resp.infos[i], resp.totalScores[i], resp.scores[i], -1 != _.indexOf(resp.chairs, i), resp.banker == i);
            }
          }, 2e3);
        };
        this.gameDispatchCardCb = function(resp) {
          var weaveItems = _this.getWeaveItems(resp.chair);
          if (resp.chair == _this._meChair) {
            _this._cards.push(resp.card);
            _this._currCard = resp.card;
          }
          switch (_this.switchView(resp.chair)) {
           case 0:
            _this._gameLayer.renderSouthCard(_.clone(_this._cards), weaveItems, _this._currCard);
            break;

           case 1:
            _this._gameLayer.renderEastCard(weaveItems, 0);
            break;

           case 2:
            _this._gameLayer.renderNorthCard(weaveItems, 0);
            break;

           case 3:
            _this._gameLayer.renderWestCard(weaveItems, 0);
          }
          _this._gameLayer.renderLeftCardCount(--_this._leftCardCount);
          _this._gameLayer.renderDispatchCard();
          _this._gameLayer.renderPilotLamp(_this.switchView(resp.chair));
        };
        this.gameOutCardCb = function(resp) {
          var weaveItems = _this.getWeaveItems(resp.chair);
          var discards = _this.getDiscardCards(resp.chair);
          discards.push(resp.card);
          if (resp.chair == _this._meChair) {
            var indexOf = _this._cards.indexOf(resp.card);
            _this._cards.splice(indexOf, 1);
            _this._cards = _.sortBy(_this._cards);
          }
          switch (_this.switchView(resp.chair)) {
           case 0:
            _this._gameLayer.renderSouthDiscardCard(discards, true);
            _this._gameLayer.renderSouthCard(_.clone(_this._cards), weaveItems);
            break;

           case 1:
            _this._gameLayer.renderEastDiscardCard(discards, true);
            _this._gameLayer.renderEastCard(weaveItems);
            break;

           case 2:
            _this._gameLayer.renderNorthDiscardCard(discards, true);
            _this._gameLayer.renderNorthCard(weaveItems);
            break;

           case 3:
            _this._gameLayer.renderWestDiscardCard(discards, true);
            _this._gameLayer.renderWestCard(weaveItems);
          }
        };
        this.gameOperateNotifyCb = function(resp) {
          _this._meChair == resp.chair && _this._gameLayer.renderOperateNotify(resp.card, 0 != (4 & resp.action), 0 != (2 & resp.action), 0 != (1 & resp.action), true, resp.cards);
          _this._gameLayer.renderPilotLamp(-1);
        };
        this.gameOperateResultCb = function(resp) {
          var weaveItems = _this.getWeaveItems(resp.chair);
          var discards = _this.getDiscardCards(resp.provider);
          var count = 0;
          switch (resp.action) {
           case 0:
            break;

           case 1:
            _this._meChair == resp.chair && _.remove(_this._cards, function(card) {
              if (card == resp.card) return count++ < 2;
              return false;
            });
            if (resp.chair != resp.provider) {
              discards = _.dropRight(discards, 1);
              _this._discardCardsMap[resp.provider] = discards;
            }
            weaveItems.push(new MahjongWeaveItem_1.default(MahjongWeaveType_1.MahjongWeaveType.P, resp.card, true, resp.provider));
            break;

           case 2:
            var foundItem_1 = _.find(weaveItems, {
              centerCard: resp.card,
              weaveType: MahjongWeaveType_1.MahjongWeaveType.P
            });
            _this._meChair == resp.chair && _.remove(_this._cards, function(card) {
              if (card == resp.card) return count++ < (null == foundItem_1 ? resp.provider != resp.chair ? 3 : 4 : 1);
              return false;
            });
            if (resp.chair != resp.provider) {
              discards = _.dropRight(discards, 1);
              _this._discardCardsMap[resp.provider] = discards;
            }
            null == foundItem_1 ? weaveItems.push(new MahjongWeaveItem_1.default(MahjongWeaveType_1.MahjongWeaveType.G, resp.card, resp.provider != resp.chair, resp.provider)) : foundItem_1.weaveType = MahjongWeaveType_1.MahjongWeaveType.G;
          }
          switch (_this.switchView(resp.chair)) {
           case 0:
            _this._gameLayer.renderSouthCard(_.clone(_this._cards), weaveItems);
            break;

           case 1:
            _this._gameLayer.renderEastCard(weaveItems);
            break;

           case 2:
            _this._gameLayer.renderNorthCard(weaveItems);
            break;

           case 3:
            _this._gameLayer.renderWestCard(weaveItems);
          }
          switch (_this.switchView(resp.provider)) {
           case 0:
            _this._gameLayer.renderSouthDiscardCard(discards);
            break;

           case 1:
            _this._gameLayer.renderEastDiscardCard(discards);
            break;

           case 2:
            _this._gameLayer.renderNorthDiscardCard(discards);
            break;

           case 3:
            _this._gameLayer.renderWestDiscardCard(discards);
          }
          _this._gameLayer.renderPilotLamp(_this.switchView(resp.chair));
        };
        this.gameStatusCb = function(resp) {};
        this._gameLayer = gameLayer;
        this._joinTableEventResponse = objs;
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("game_start", this.gameStartCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("game_status", this.gameStatusCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("playing_scene", this.gamePlayingSceneCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("game_end", this.gameEndCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("dispatch_card", this.gameDispatchCardCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("out_card", this.gameOutCardCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("operate_notify", this.gameOperateNotifyCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("operate_result", this.gameOperateResultCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_profile", this.gameHeroProfileCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_scene", this.gameHeroSceneCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_enter", this.gameHeroEnterCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_leave", this.gameHeroLeaveCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_offline", this.gameHeroOfflineCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_online", this.gameHeroOnlineCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_sitDown", this.gameHeroSitDownCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("hero_standUp", this.gameHeroStandUpCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("end", this.endCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("dismiss_vote", this.dismissVoteCb, this);
      }
      MahjongGameEngine.prototype.destroy = function() {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).offGroup(this);
        AbstractRoomConfig_1.default.destroyInst();
      };
      MahjongGameEngine.prototype.heroEnter = function(userId, chair, nickName) {
        this._heroMap[userId] = new HeroMate(chair, true, false, nickName);
        userId == HeroManager_1.default.getInst().getMe().userId && (this._meChair = chair);
        this.getHeroProfile(userId);
        this._gameLayer.renderHeroSummary(chair, nickName);
      };
      MahjongGameEngine.prototype.getHeroProfile = function(userId) {
        null == HeroManager_1.default.getInst().getHero(userId) ? AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new HeroProfileEvent_1.default(userId)) : this.renderHeroProfile(HeroManager_1.default.getInst().getHero(userId));
      };
      MahjongGameEngine.prototype.renderLeave = function(heroMate) {
        this._clientReady && this._gameLayer.renderLeave(this.switchView(heroMate.chair));
      };
      MahjongGameEngine.prototype.renderHeroProfile = function(hero) {
        this._clientReady && this._gameLayer.renderHeroProfile(this.switchView(this._heroMap[hero.userId].chair), this._heroMap[hero.userId].chair, hero);
      };
      MahjongGameEngine.prototype.renderOnline = function(heroMate) {
        this._clientReady && this._gameLayer.renderOnline(this.switchView(heroMate.chair), heroMate.online);
      };
      MahjongGameEngine.prototype.renderSitDown = function(heroMate) {
        this._clientReady && this._gameLayer.renderSitDown(this.switchView(heroMate.chair), heroMate.sitDown, this._gameStart);
      };
      MahjongGameEngine.prototype.getWeaveItems = function(chair) {
        void 0 == this._weavesMap[chair] && (this._weavesMap[chair] = new Array());
        return this._weavesMap[chair];
      };
      MahjongGameEngine.prototype.getDiscardCards = function(chair) {
        void 0 == this._discardCardsMap[chair] && (this._discardCardsMap[chair] = new Array());
        return this._discardCardsMap[chair];
      };
      MahjongGameEngine.prototype.switchView = function(chair) {
        if (-1 == chair) return -1;
        return (chair + this._chairCount - this._meChair) % this._chairCount;
      };
      MahjongGameEngine.prototype.switchChair = function(view) {
        return (view + this._meChair) % this._chairCount;
      };
      MahjongGameEngine.prototype.getUserId = function(chair) {
        var _this = this;
        var key = "";
        _.each(_.keys(this._heroMap), function(k) {
          var heroMate = _this._heroMap[k];
          heroMate.chair == chair && (key = k);
        });
        return key;
      };
      MahjongGameEngine.prototype.getHeroMate = function(chair) {
        return this._heroMap[this.getUserId(chair)];
      };
      return MahjongGameEngine;
    }();
    exports.default = MahjongGameEngine;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../hero/Hero": "Hero",
    "../../hero/HeroManager": "HeroManager",
    "../../ws/AiJKit": "AiJKit",
    "../AbstractRoomConfig": "AbstractRoomConfig",
    "../event/ClientReadyEvent": "ClientReadyEvent",
    "../event/HeroProfileEvent": "HeroProfileEvent",
    "../response/HeroSceneResponse": "HeroSceneResponse",
    "./struct/MahjongWeaveItem": "MahjongWeaveItem",
    "./struct/MahjongWeaveType": "MahjongWeaveType",
    lodash: 7
  } ],
  MahjongGameLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "227feaS5QlMcJvZTEwOL1vd", "MahjongGameLayer");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ccclass = cc._decorator.ccclass;
    var AiJKit_1 = require("../../ws/AiJKit");
    var AppConfig_1 = require("../../AppConfig");
    var _ = require("lodash");
    var MahjongOutCardEvent_1 = require("./event/MahjongOutCardEvent");
    var MahjongGameEngine_1 = require("./MahjongGameEngine");
    var MahjongOperateEvent_1 = require("./event/MahjongOperateEvent");
    var MahjongWeaveType_1 = require("./struct/MahjongWeaveType");
    var md5 = require("md5");
    var SitDownTableEvent_1 = require("../event/SitDownTableEvent");
    var AiJCCComponent_1 = require("../../AiJCCComponent");
    var UIManger_1 = require("../../UIManger");
    var PlazaLayer_1 = require("../../plazz/PlazaLayer");
    var DismissVoteTableEvent_1 = require("../event/DismissVoteTableEvent");
    var LeaveTableEvent_1 = require("../event/LeaveTableEvent");
    var MahjongGameLayer = function(_super) {
      __extends(MahjongGameLayer, _super);
      function MahjongGameLayer() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this._headViewMap = {};
        _this._gameOverViewMap = {};
        _this._endViewMap = {};
        _this._countDown = 30;
        return _this;
      }
      MahjongGameLayer.prototype.onLoad = function() {
        var _this = this;
        this.loadPackage("mahjong", function() {
          fgui.UIPackage.addPackage("mahjong");
          _this._view = fgui.UIPackage.createObject("mahjong", "MahjongGameLayer").asCom;
          fgui.GRoot.inst.addChild(_this._view);
          _this.initView();
        });
      };
      MahjongGameLayer.prototype.onInitAiJCom = function(objs) {
        this._engine = new MahjongGameEngine_1.default(this, objs);
        this._engine.clientReady();
      };
      MahjongGameLayer.prototype.initFire = function() {};
      MahjongGameLayer.prototype.onDestroy = function() {
        this._engine.destroy();
        this._view.dispose();
      };
      MahjongGameLayer.prototype.initView = function() {
        this._southView = this._view.getChild("SouthComponent").asCom;
        this._southView.removeChildren();
        this._eastView = this._view.getChild("EastComponent").asCom;
        this._eastView.removeChildren();
        this._westView = this._view.getChild("WestComponent").asCom;
        this._westView.removeChildren();
        this._northView = this._view.getChild("NorthComponent").asCom;
        this._northView.removeChildren();
        this._southDiscardView = this._view.getChild("SouthDiscardComponent").asCom;
        this._southDiscardView.removeChildren();
        this._eastDiscardView = this._view.getChild("EastDiscardComponent").asCom;
        this._eastDiscardView.removeChildren();
        this._westDiscardView = this._view.getChild("WestDiscardComponent").asCom;
        this._westDiscardView.removeChildren();
        this._northDiscardView = this._view.getChild("NorthDiscardComponent").asCom;
        this._northDiscardView.removeChildren();
        this._operateNotifyView = this._view.getChild("OperateNotifyComponent").asCom;
        this._countDownText = this._view.getChild("CountDownText").asTextField;
        this._leftCardCountText = this._view.getChild("LeftCardCountText").asTextField;
        this._leftNumberText = this._view.getChild("LeftNumberText").asTextField;
        this._headViewMap[0] = this._view.getChild("SouthHeadComponent").asCom;
        this._headViewMap[1] = this._view.getChild("EastHeadComponent").asCom;
        this._headViewMap[2] = this._view.getChild("NorthHeadComponent").asCom;
        this._headViewMap[3] = this._view.getChild("WestHeadComponent").asCom;
        var gameEndGroup = this._view.getChild("GameEndGroup").asGroup;
        this._gameOverViewMap[0] = this._view.getChildInGroup("SouthGameOverItemComponent", gameEndGroup).asCom;
        this._gameOverViewMap[1] = this._view.getChildInGroup("EastGameOverItemComponent", gameEndGroup).asCom;
        this._gameOverViewMap[2] = this._view.getChildInGroup("NorthGameOverItemComponent", gameEndGroup).asCom;
        this._gameOverViewMap[3] = this._view.getChildInGroup("WestGameOverItemComponent", gameEndGroup).asCom;
        var endGroup = this._view.getChild("EndGroup").asGroup;
        this._endViewMap[0] = this._view.getChildInGroup("SouthEndItemComponent", endGroup).asCom;
        this._endViewMap[1] = this._view.getChildInGroup("EastEndItemComponent", endGroup).asCom;
        this._endViewMap[2] = this._view.getChildInGroup("NorthEndItemComponent", endGroup).asCom;
        this._endViewMap[3] = this._view.getChildInGroup("WestEndItemComponent", endGroup).asCom;
        var voteGroup = this._view.getChild("VoteGroup").asGroup;
        this._voteItemList = this._view.getChildInGroup("VoteItemList", voteGroup).asList;
        this._voteItemList.removeChildren();
        this._view.getChildInGroup("NextGameButton", gameEndGroup).asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new SitDownTableEvent_1.default());
        }, this);
        this._view.getChild("SitDownButton").asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new SitDownTableEvent_1.default());
        }, this);
        this._view.getChild("DismissVoteButton").asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new DismissVoteTableEvent_1.default(true));
        }, this);
        this._view.getChild("LeaveButton").asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new LeaveTableEvent_1.default());
        }, this);
        this._view.getChildInGroup("BackButton", endGroup).asButton.onClick(function() {
          UIManger_1.default.getInst().switchLayer(PlazaLayer_1.default);
        }, this);
        this._view.getChildInGroup("VoteAgreeButton", voteGroup).asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new DismissVoteTableEvent_1.default(true));
        }, this);
        this._view.getChildInGroup("VoteRefuseButton", voteGroup).asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new DismissVoteTableEvent_1.default(false));
        }, this);
      };
      MahjongGameLayer.prototype.renderGameStart = function() {
        this._view.getChild("SitDownButton").asButton.visible = false;
        this._view.getController("c1").setSelectedPage("playing");
      };
      MahjongGameLayer.prototype.renderLeftCardCount = function(leftCardCount) {
        this._leftCardCountText.text = _.padStart(leftCardCount.toString(10), 2, "0");
      };
      MahjongGameLayer.prototype.renderLeftNumber = function(leftNumber) {
        this._leftNumberText.text = _.padStart(leftNumber.toString(10), 2, "0");
      };
      MahjongGameLayer.prototype.renderDispatchCard = function() {
        this._countDown = 30;
      };
      MahjongGameLayer.prototype.renderPilotLamp = function(viewChair) {
        this._view.getChild("pilotLamp0").asImage.visible = false;
        this._view.getChild("pilotLamp1").asImage.visible = false;
        this._view.getChild("pilotLamp2").asImage.visible = false;
        this._view.getChild("pilotLamp3").asImage.visible = false;
        var gObject = this._view.getChild("pilotLamp" + viewChair);
        null != gObject && (gObject.asImage.visible = true);
      };
      MahjongGameLayer.prototype.renderWestCard = function(weaveItems, currCard, cards) {
        var _this = this;
        void 0 === currCard && (currCard = -1);
        void 0 === cards && (cards = null);
        this._westView.removeChildren();
        var y = 0;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "WestPengComponent" : "WestGangComponent").asCom;
          _weaveComponent.setPosition(0, y);
          y += _weaveComponent.height;
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
          }
          _this._westView.addChild(_weaveComponent);
        });
        var cardsCount = 13 - 3 * weaveItems.length;
        for (var i = 0; i < cardsCount; i++) {
          var _card = fgui.UIPackage.createObject("mahjong", "w_hand").asImage;
          if (null != cards) {
            _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
            _card.setScale(.75, .75);
          }
          _card.setPosition(0, y);
          y += 60;
          _card.sortingOrder = i;
          this._westView.addChild(_card);
        }
        if (-1 != currCard) {
          var _card = 0 == currCard ? fgui.UIPackage.createObject("mahjong", "w_hand").asImage : fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
          0 != currCard && _card.setScale(.75, .75);
          _card.setPosition(0, this._westView.height - _card.height);
          this._westView.addChild(_card);
        }
      };
      MahjongGameLayer.prototype.renderNorthCard = function(weaveItems, currCard, cards) {
        var _this = this;
        void 0 === currCard && (currCard = -1);
        void 0 === cards && (cards = null);
        this._northView.removeChildren();
        var x = this._northView.width;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "NorthPengComponent" : "NorthGangComponent").asCom;
          x -= _weaveComponent.width;
          _weaveComponent.setPosition(x, _this._northView.height - _weaveComponent.height);
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
          }
          _this._northView.addChild(_weaveComponent);
        });
        var cardsCount = 13 - 3 * weaveItems.length;
        for (var i = 0; i < cardsCount; i++) {
          var _card = null == cards ? fgui.UIPackage.createObject("mahjong", "n_hand").asImage : fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
          x -= _card.width;
          _card.setPosition(x, this._northView.height - _card.height);
          this._northView.addChild(_card);
        }
        if (-1 != currCard) {
          var _card = 0 == currCard ? fgui.UIPackage.createObject("mahjong", "n_hand").asImage : fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
          x -= _card.width + 45;
          _card.setPosition(x, this._northView.height - _card.height);
          this._northView.addChild(_card);
        }
      };
      MahjongGameLayer.prototype.renderEastCard = function(weaveItems, currCard, cards) {
        var _this = this;
        void 0 === currCard && (currCard = -1);
        void 0 === cards && (cards = null);
        this._eastView.removeChildren();
        var y = this._eastView.height;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "EastPengComponent" : "EastGangComponent").asCom;
          y -= _weaveComponent.height;
          _weaveComponent.setPosition(_this._eastView.width - _weaveComponent.width, y);
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
          }
          _this._eastView.addChild(_weaveComponent);
        });
        var cardsCount = 13 - 3 * weaveItems.length;
        for (var i = 0; i < cardsCount; i++) {
          var _card = fgui.UIPackage.createObject("mahjong", "e_hand").asImage;
          if (null != cards) {
            _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
            _card.setScale(.75, .75);
          }
          y -= 0 == i ? _card.height : 60;
          _card.setPosition(this._eastView.width - _card.width + .25 * _card.width, y);
          _card.sortingOrder = cardsCount - i;
          this._eastView.addChild(_card);
        }
        if (-1 != currCard) {
          var _card = 0 == currCard ? fgui.UIPackage.createObject("mahjong", "e_hand").asImage : fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
          0 != currCard && _card.setScale(.75, .75);
          _card.setPosition(this._eastView.width - _card.width + .25 * _card.width, 0);
          this._eastView.addChild(_card);
        }
      };
      MahjongGameLayer.prototype.renderSouthCard = function(cards, weaveItems, currCard) {
        var _this = this;
        void 0 === currCard && (currCard = -1);
        this._southView.removeChildren();
        this._operateNotifyView.removeChildren();
        var x = 0;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
          _weaveComponent.setPosition(x, _this._southView.height - _weaveComponent.height);
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
          }
          x += _weaveComponent.width;
          _this._southView.addChild(_weaveComponent);
        });
        _.each(cards, function(card, i) {
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "SouthCardComponent").asCom;
          _card.setPosition(x + i * _card.width + (i + 1 == cards.length && -1 != currCard ? 30 : 0), _this._southView.height - _card.height);
          _card.getChild("icon").asLoader.url = fgui.UIPackage.getItemURL("mahjong", "s_handmah_" + _cardHex);
          _card.draggable = true;
          _card.data = new MateData(_card.x, _card.y, card);
          _card.on(fgui.Event.DRAG_END, function(evt) {
            var target = fgui.GObject.cast(evt.currentTarget);
            var mate = target.data;
            if (target.y <= -100) {
              AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new MahjongOutCardEvent_1.default(mate.value));
              console.log("\u6ed1\u52a8\u51fa\u724c:" + mate.value);
            }
            target.setPosition(mate.x, mate.y);
          }, _this);
          _card.on(fgui.Event.CLICK, function(evt) {
            var target = fgui.GObject.cast(evt.currentTarget);
            var mate = target.data;
            if (mate.y == target.y) target.setPosition(mate.x, mate.y - 50); else {
              var localPos = target.globalToLocal(evt.pos.x, evt.pos.y);
              if (localPos.y <= 60) target.setPosition(mate.x, mate.y); else {
                AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new MahjongOutCardEvent_1.default(mate.value));
                console.log("\u70b9\u51fb\u51fa\u724c:" + mate.value);
              }
            }
          }, _this);
          _this._southView.addChild(_card);
        });
      };
      MahjongGameLayer.prototype.renderOperateNotify = function(card, hu, gang, peng, guo, cards) {
        void 0 === guo && (guo = true);
        void 0 === cards && (cards = []);
        this._operateNotifyView.removeChildren();
        var x = 0;
        var y = this._operateNotifyView.height;
        if (guo) {
          var button = fgui.UIPackage.createObject("mahjong", "GuoButton").asCom;
          button.setPosition(x, y - button.height);
          x += button.width + 20;
          button.data = card;
          button.on(fgui.Event.CLICK, function(evt) {
            var target = fgui.GObject.cast(evt.currentTarget);
            AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new MahjongOperateEvent_1.default(0, target.data));
          }, this);
          this._operateNotifyView.addChild(button);
        }
        if (peng) {
          var button = fgui.UIPackage.createObject("mahjong", "PengButton").asCom;
          button.setPosition(x, y - button.height);
          x += button.width + 20;
          button.data = card;
          button.on(fgui.Event.CLICK, function(evt) {
            var target = fgui.GObject.cast(evt.currentTarget);
            AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new MahjongOperateEvent_1.default(1, target.data));
          }, this);
          this._operateNotifyView.addChild(button);
        }
        if (gang) {
          var button = fgui.UIPackage.createObject("mahjong", "GangButton").asCom;
          button.setPosition(x, y - button.height);
          x += button.width + 20;
          button.data = card;
          button.on(fgui.Event.CLICK, function(evt) {
            var target = fgui.GObject.cast(evt.currentTarget);
            AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new MahjongOperateEvent_1.default(2, target.data));
          }, this);
          this._operateNotifyView.addChild(button);
        }
        if (hu) {
          var button = fgui.UIPackage.createObject("mahjong", "HuButton").asCom;
          button.setPosition(x, y - button.height);
          button.data = card;
          button.on(fgui.Event.CLICK, function(evt) {
            var target = fgui.GObject.cast(evt.currentTarget);
            AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new MahjongOperateEvent_1.default(4, target.data));
          }, this);
          this._operateNotifyView.addChild(button);
        }
      };
      MahjongGameLayer.prototype.renderSouthDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._southDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 11;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
          _card.setPosition(c * _card.width, _this._southDiscardView.height - (_card.height + r * (_card.height - 26)));
          _card.sortingOrder = maxCol - r;
          _this._southDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(10, -30));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongGameLayer.prototype.renderNorthDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._northDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 11;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
          _card.setPosition(_this._northDiscardView.width - (c + 1) * _card.width, r * (_card.height - 26));
          _card.sortingOrder = r;
          _this._northDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(10, -30));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongGameLayer.prototype.renderEastDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._eastDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 10;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage;
          _card.setPosition(_this._eastDiscardView.width - (r + 1) * _card.width, _this._eastDiscardView.height - (_card.height + c * (_card.height - 40)));
          _card.sortingOrder = maxCol - c;
          _this._eastDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(0, -20));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongGameLayer.prototype.renderWestDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._westDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 10;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage;
          _card.setPosition(r * _card.width, c * (_card.height - 40));
          _card.sortingOrder = c;
          _this._westDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(40, -20));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongGameLayer.prototype.renderHeroSummary = function(chair, nickName) {
        var child = this._voteItemList.getChild(chair.toString());
        null != child && this._voteItemList.removeChild(child);
        var voteItem = fgui.UIPackage.createObject("mahjong", "VoteItemComponent").asCom;
        voteItem.getChild("NickNameText").asTextField.text = nickName;
        voteItem.getChild("VoteResultText").asTextField.text = "\u7b49\u5f85";
        this._voteItemList.addChildAt(voteItem).name = chair.toString();
      };
      MahjongGameLayer.prototype.renderHeroProfile = function(view, chair, hero) {
        var userId = _.padStart(hero.userId, 6, "0");
        this._headViewMap[view].getChild("nickName").asTextField.text = hero.nickName;
        this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("NickNameText").asTextField.text = hero.nickName;
        this._endViewMap[view].getChild("NickNameText").asTextField.text = hero.nickName;
        this._endViewMap[view].getChild("UserIdText").asTextField.text = userId;
        this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("IdText").asTextField.text = userId;
        if (null != hero.avatar) {
          var md5png = "?name=" + md5(hero.avatar) + ".png";
          this._headViewMap[view].getChild("avatar").asLoader.url = hero.avatar + md5png;
          this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("Avatar").asLoader.url = hero.avatar + md5png;
          this._endViewMap[view].getChild("AvatarLoader").asLoader.url = hero.avatar + md5png;
        }
      };
      MahjongGameLayer.prototype.renderOnline = function(view, online) {
        this._headViewMap[view].getChild("OfflineImage").asImage.visible = !online;
      };
      MahjongGameLayer.prototype.renderSitDown = function(view, sitDown, gameStart) {
        this._headViewMap[view].getChild("SitDownImage").asImage.visible = sitDown && !gameStart;
      };
      MahjongGameLayer.prototype.renderLeave = function(view) {
        this._headViewMap[view].getChild("OfflineImage").asImage.visible = false;
        this._headViewMap[view].getChild("SitDownImage").asImage.visible = false;
        this._headViewMap[view].getChild("TalkImage").asImage.visible = false;
        this._headViewMap[view].getChild("avatar").asLoader.url = "";
        this._headViewMap[view].getChild("nickName").asTextField.text = "";
        this._headViewMap[view].getChild("scoreText").asTextField.text = "";
        0 == view && UIManger_1.default.getInst().switchLayer(PlazaLayer_1.default);
      };
      MahjongGameLayer.prototype.renderScore = function(view, score) {
        this._headViewMap[view].getChild("scoreText").asTextField.text = score >= 0 ? "+" + score.toString() : score.toString();
      };
      MahjongGameLayer.prototype.renderGameEndCards = function(view, weaveItems, cards, winner, loser, currCard) {
        this._view.getChild("SitDownButton").asButton.visible = true;
        this._view.getController("c1").setSelectedPage("gameEnd");
        var gameOverCardItemComponent = this._gameOverViewMap[view].getChild("GameOverCardItemComponent").asCom;
        gameOverCardItemComponent.removeChildren();
        var x = 0;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
          _weaveComponent.setPosition(x, gameOverCardItemComponent.height - _weaveComponent.height);
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
          }
          x += _weaveComponent.width;
          gameOverCardItemComponent.addChild(_weaveComponent);
        });
        _.each(cards, function(card, i) {
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
          _card.setPosition(x, gameOverCardItemComponent.height - _card.height);
          x += _card.width;
          gameOverCardItemComponent.addChild(_card);
        });
        if (winner) {
          var _cardHex = _.padStart(currCard.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
          _card.setPosition(x + 30, gameOverCardItemComponent.height - _card.height);
          gameOverCardItemComponent.addChild(_card);
        }
      };
      MahjongGameLayer.prototype.renderGameEndFlag = function(view, info, totalScore, score, winner, banker) {
        this._headViewMap[view].getChild("scoreText").asTextField.text = totalScore >= 0 ? "+" + totalScore.toString() : totalScore.toString();
        this._gameOverViewMap[view].getChild("winner").asImage.visible = winner;
        this._gameOverViewMap[view].getChild("InfoText").asTextField.text = info;
        this._gameOverViewMap[view].getChild("ScoreText").asTextField.text = score >= 0 ? "+" + score.toString() : score.toString();
        this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("Banker").asImage.visible = banker;
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
      };
      MahjongGameLayer.prototype.renderOutCardBadgeAnimate = function(x, y) {
        this._mahjongOutCardBadgeAnimate = fgui.UIPackage.createObject("mahjong", "MahjongOutCardBadgeAnimate").asMovieClip;
        this._mahjongOutCardBadgeAnimate.setPosition(x, y);
        this._view.addChild(this._mahjongOutCardBadgeAnimate);
      };
      MahjongGameLayer.prototype.renderEndInfo = function(tableNo, startedTime, endedTime) {
        var endGroup = this._view.getChild("EndGroup").asGroup;
        var tableNoTpl = this._view.getChildInGroup("TableNoText", endGroup).asTextField.data;
        var timeTpl = this._view.getChildInGroup("TimeInfoText", endGroup).asTextField.data;
        this._view.getChildInGroup("TableNoText", endGroup).asTextField.text = _.template(tableNoTpl)({
          tableNo: tableNo
        });
        this._view.getChildInGroup("TimeInfoText", endGroup).asTextField.text = _.template(timeTpl)({
          startedTime: startedTime,
          endedTime: endedTime
        });
        this._view.getController("c1").setSelectedPage("end");
      };
      MahjongGameLayer.prototype.renderEnd = function(view, score, actionStatistic, startedTime, endedTime, tableNo, owner, distributorId) {
        this._endViewMap[view].getChild("OwnerImage").asImage.visible = owner;
        this._endViewMap[view].getChild("AgentImage").asImage.visible = "" != distributorId;
        this._endViewMap[view].getChild("WinnerImage").asImage.visible = score > 0;
        this._endViewMap[view].getChild("ScoreText").asTextField.text = score >= 0 ? "+" + score.toString() : score.toString();
        this._endViewMap[view].getChild("0Text").asTextField.text = actionStatistic[0].toString();
        this._endViewMap[view].getChild("1Text").asTextField.text = actionStatistic[1].toString();
        this._endViewMap[view].getChild("2Text").asTextField.text = actionStatistic[2].toString();
        this._endViewMap[view].getChild("3Text").asTextField.text = actionStatistic[3].toString();
        this._endViewMap[view].getChild("4Text").asTextField.text = actionStatistic[4].toString();
        this._endViewMap[view].getChild("5Text").asTextField.text = actionStatistic[5].toString();
      };
      MahjongGameLayer.prototype.renderDismissVote = function(status, agrees, refuses, voteTime, countDown, meChair) {
        var _this = this;
        var gGroup = this._view.getChild("VoteGroup").asGroup;
        if (1 == status) {
          this._view.getChildInGroup("VoteTimeText", gGroup).asTextField.text = voteTime;
          this._view.getChildInGroup("VoteCountDownText", gGroup).asTextField.text = countDown.toString();
          this._view.getController("c1").setSelectedPage("vote");
          if (null != agrees) {
            if (-1 != _.indexOf(agrees, meChair)) {
              this._view.getChildInGroup("VoteAgreeButton", gGroup).asButton.visible = false;
              this._view.getChildInGroup("VoteRefuseButton", gGroup).asButton.visible = false;
            }
            _.each(agrees, function(chair) {
              _this._voteItemList.getChild(chair.toString()).asCom.getChild("VoteResultText").asTextField.text = "\u540c\u610f";
            });
          }
          if (null != refuses) {
            if (-1 != _.indexOf(refuses, meChair)) {
              this._view.getChildInGroup("VoteAgreeButton", gGroup).asButton.visible = false;
              this._view.getChildInGroup("VoteRefuseButton", gGroup).asButton.visible = false;
            }
            _.each(refuses, function(chair) {
              _this._voteItemList.getChild(chair.toString()).asCom.getChild("VoteResultText").asTextField.text = "\u62d2\u7edd";
            });
          }
        } else {
          this._view.getChildInGroup("VoteAgreeButton", gGroup).asButton.visible = true;
          this._view.getChildInGroup("VoteRefuseButton", gGroup).asButton.visible = true;
          this._view.getController("c1").setSelectedPage("playing");
          var numChildren = this._voteItemList.numChildren;
          for (var i = 0; i < numChildren; i++) this._voteItemList.getChild(i.toString()).asCom.getChild("VoteResultText").asTextField.text = "\u7b49\u5f85";
        }
      };
      MahjongGameLayer = __decorate([ ccclass ], MahjongGameLayer);
      return MahjongGameLayer;
    }(AiJCCComponent_1.default);
    exports.default = MahjongGameLayer;
    var MateData = function() {
      function MateData(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
      }
      return MateData;
    }();
    cc._RF.pop();
  }, {
    "../../AiJCCComponent": "AiJCCComponent",
    "../../AppConfig": "AppConfig",
    "../../UIManger": "UIManger",
    "../../plazz/PlazaLayer": "PlazaLayer",
    "../../ws/AiJKit": "AiJKit",
    "../event/DismissVoteTableEvent": "DismissVoteTableEvent",
    "../event/LeaveTableEvent": "LeaveTableEvent",
    "../event/SitDownTableEvent": "SitDownTableEvent",
    "./MahjongGameEngine": "MahjongGameEngine",
    "./event/MahjongOperateEvent": "MahjongOperateEvent",
    "./event/MahjongOutCardEvent": "MahjongOutCardEvent",
    "./struct/MahjongWeaveType": "MahjongWeaveType",
    lodash: 7,
    md5: 8
  } ],
  MahjongGameRecord: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "33ecet6YvBGKqP2pBtxFVBb", "MahjongGameRecord");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongGameRecord = function() {
      function MahjongGameRecord() {}
      return MahjongGameRecord;
    }();
    exports.default = MahjongGameRecord;
    cc._RF.pop();
  }, {} ],
  MahjongGameStartEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7a4d8ZjAxtIybJ3rggPZHz0", "MahjongGameStartEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongGameStartEventResponse = function(_super) {
      __extends(MahjongGameStartEventResponse, _super);
      function MahjongGameStartEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongGameStartEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongGameStartEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongGameStartRecord: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "63831n6n1dM95QAP7yqarLO", "MahjongGameStartRecord");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongGameStartRecord = function() {
      function MahjongGameStartRecord() {}
      return MahjongGameStartRecord;
    }();
    exports.default = MahjongGameStartRecord;
    cc._RF.pop();
  }, {} ],
  MahjongGameStartResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f5d97aB6DhMs7/Oe5CtAz9i", "MahjongGameStartResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongGameStartResponseHandler = function(_super) {
      __extends(MahjongGameStartResponseHandler, _super);
      function MahjongGameStartResponseHandler() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      MahjongGameStartResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("game_start", response);
      };
      return MahjongGameStartResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongGameStartResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongGameStatusResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "849baGkDD9MVLlVOhkPPl34", "MahjongGameStatusResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongGameStatusResponseHandler = function(_super) {
      __extends(MahjongGameStatusResponseHandler, _super);
      function MahjongGameStatusResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongGameStatusResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("game_status", response);
      };
      return MahjongGameStatusResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongGameStatusResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongGameStatusResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "998b70YMZxBN4za0V1hh/0X", "MahjongGameStatusResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongGameStatusResponse = function(_super) {
      __extends(MahjongGameStatusResponse, _super);
      function MahjongGameStatusResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongGameStatusResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongGameStatusResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOperateEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "aadf1LwziZHLKnPMXQ9/poU", "MahjongOperateEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongOperateEvent = function(_super) {
      __extends(MahjongOperateEvent, _super);
      function MahjongOperateEvent(action, card) {
        var _this = _super.call(this) || this;
        _this.action = action;
        _this.card = card;
        _this.mainType = 8;
        _this.subType = 1;
        return _this;
      }
      return MahjongOperateEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = MahjongOperateEvent;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOperateNotifyEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8a5cb/ROHRPF4kYxMqRmph5", "MahjongOperateNotifyEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongOperateNotifyEventResponseHandler = function(_super) {
      __extends(MahjongOperateNotifyEventResponseHandler, _super);
      function MahjongOperateNotifyEventResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongOperateNotifyEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("operate_notify", response);
      };
      return MahjongOperateNotifyEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongOperateNotifyEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOperateNotifyEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "13c957E0UlJv5IECe5iMoWn", "MahjongOperateNotifyEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongOperateNotifyEventResponse = function(_super) {
      __extends(MahjongOperateNotifyEventResponse, _super);
      function MahjongOperateNotifyEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongOperateNotifyEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongOperateNotifyEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOperateResultEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d2880CREslDYb9HnrBPZpOn", "MahjongOperateResultEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongOperateResultEventResponseHandler = function(_super) {
      __extends(MahjongOperateResultEventResponseHandler, _super);
      function MahjongOperateResultEventResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongOperateResultEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("operate_result", response);
      };
      return MahjongOperateResultEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongOperateResultEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOperateResultEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2d3942MIWZBe4jmwLTT5g6X", "MahjongOperateResultEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongOperateResultEventResponse = function(_super) {
      __extends(MahjongOperateResultEventResponse, _super);
      function MahjongOperateResultEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongOperateResultEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongOperateResultEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOutCardEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d35babWKElHz4e57Jq7PYpK", "MahjongOutCardEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongOutCardEventResponse = function(_super) {
      __extends(MahjongOutCardEventResponse, _super);
      function MahjongOutCardEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongOutCardEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongOutCardEventResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOutCardEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6c08b+kCS9PBagcebEAnMxq", "MahjongOutCardEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongOutCardEvent = function(_super) {
      __extends(MahjongOutCardEvent, _super);
      function MahjongOutCardEvent(card) {
        var _this = _super.call(this) || this;
        _this.mainType = 8;
        _this.subType = 0;
        _this.card = card;
        return _this;
      }
      return MahjongOutCardEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = MahjongOutCardEvent;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongOutCardResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ac3faVWXxFDrpRKqCJlIaRD", "MahjongOutCardResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongGameStartResponseHandler = function(_super) {
      __extends(MahjongGameStartResponseHandler, _super);
      function MahjongGameStartResponseHandler() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      MahjongGameStartResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("out_card", response);
      };
      return MahjongGameStartResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongGameStartResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongPlayerRecord: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a5475BID+hBT6ZZOQMI0wyV", "MahjongPlayerRecord");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongPlayerRecord = function() {
      function MahjongPlayerRecord() {}
      return MahjongPlayerRecord;
    }();
    exports.default = MahjongPlayerRecord;
    cc._RF.pop();
  }, {} ],
  MahjongPlayingGameSceneResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "07599nYPp1O3orkkeGXsWNX", "MahjongPlayingGameSceneResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var FireKit_1 = require("../../../fire/FireKit");
    var AppConfig_1 = require("../../../AppConfig");
    var MahjongPlayingGameSceneResponseHandler = function(_super) {
      __extends(MahjongPlayingGameSceneResponseHandler, _super);
      function MahjongPlayingGameSceneResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongPlayingGameSceneResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).fire("playing_scene", response);
      };
      return MahjongPlayingGameSceneResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongPlayingGameSceneResponseHandler;
    cc._RF.pop();
  }, {
    "../../../AppConfig": "AppConfig",
    "../../../fire/FireKit": "FireKit",
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongPlayingGameSceneResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "659dfY7o7lMQ4eeFCMLP0l+", "MahjongPlayingGameSceneResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongPlayingGameSceneResponse = function(_super) {
      __extends(MahjongPlayingGameSceneResponse, _super);
      function MahjongPlayingGameSceneResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongPlayingGameSceneResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongPlayingGameSceneResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongPrepareGameSceneResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "02c908c/k5JK7ZD5zO10WdA", "MahjongPrepareGameSceneResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongPrepareGameSceneResponseHandler = function(_super) {
      __extends(MahjongPrepareGameSceneResponseHandler, _super);
      function MahjongPrepareGameSceneResponseHandler() {
        return _super.call(this) || this;
      }
      MahjongPrepareGameSceneResponseHandler.prototype.handler = function(aiJWs, response) {};
      return MahjongPrepareGameSceneResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = MahjongPrepareGameSceneResponseHandler;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongPrepareGameSceneResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fda8bMSlNhLR54nhF1bG9D9", "MahjongPrepareGameSceneResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../../ws/AiJ");
    var MahjongPrepareGameSceneResponse = function(_super) {
      __extends(MahjongPrepareGameSceneResponse, _super);
      function MahjongPrepareGameSceneResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return MahjongPrepareGameSceneResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = MahjongPrepareGameSceneResponse;
    cc._RF.pop();
  }, {
    "../../../ws/AiJ": "AiJ"
  } ],
  MahjongRecord: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "612eeh5yplEbq/InWPMQ+YY", "MahjongRecord");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongRecord = function() {
      function MahjongRecord() {}
      return MahjongRecord;
    }();
    exports.default = MahjongRecord;
    cc._RF.pop();
  }, {} ],
  MahjongRoomConfig: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9c0e5cRlKRPf5H+vZYuLmty", "MahjongRoomConfig");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJKit_1 = require("../../ws/AiJKit");
    var FireKit_1 = require("../../fire/FireKit");
    var RoomLoginResponseHandler_1 = require("../handler/RoomLoginResponseHandler");
    var LoginNotifyResponseHandler_1 = require("../handler/LoginNotifyResponseHandler");
    var RoomMobileLoginEvent_1 = require("../event/RoomMobileLoginEvent");
    var AppConfig_1 = require("../../AppConfig");
    var CreateTableEventResponseHandler_1 = require("../handler/CreateTableEventResponseHandler");
    var JoinTableEvent_1 = require("../event/JoinTableEvent");
    var JoinTableEventResponseHandler_1 = require("../handler/JoinTableEventResponseHandler");
    var UIManger_1 = require("../../UIManger");
    var MahjongGameLayer_1 = require("./MahjongGameLayer");
    var RoomWsListener_1 = require("../RoomWsListener");
    var HeroOnlineEventResponseHandler_1 = require("../handler/HeroOnlineEventResponseHandler");
    var HeroEnterEventResponseHandler_1 = require("../handler/HeroEnterEventResponseHandler");
    var HeroLeaveEventResponseHandler_1 = require("../handler/HeroLeaveEventResponseHandler");
    var HeroOfflineEventResponseHandler_1 = require("../handler/HeroOfflineEventResponseHandler");
    var HeroSitDownEventResponseHandler_1 = require("../handler/HeroSitDownEventResponseHandler");
    var HeroStandUpEventResponseHandler_1 = require("../handler/HeroStandUpEventResponseHandler");
    var HeroSceneResponseHandler_1 = require("../handler/HeroSceneResponseHandler");
    var ChatEventResponseHandler_1 = require("../handler/ChatEventResponseHandler");
    var RoomCommonResponseHandler_1 = require("../handler/RoomCommonResponseHandler");
    var MahjongGameStartResponseHandler_1 = require("./handler/MahjongGameStartResponseHandler");
    var MahjongGameStatusResponseHandler_1 = require("./handler/MahjongGameStatusResponseHandler");
    var MahjongPlayingGameSceneResponseHandler_1 = require("./handler/MahjongPlayingGameSceneResponseHandler");
    var MahjongDispathCardResponseHandler_1 = require("./handler/MahjongDispathCardResponseHandler");
    var MahjongOutCardResponseHandler_1 = require("./handler/MahjongOutCardResponseHandler");
    var MahjongOperateNotifyEventResponseHandler_1 = require("./handler/MahjongOperateNotifyEventResponseHandler");
    var MahjongOperateResultEventResponseHandler_1 = require("./handler/MahjongOperateResultEventResponseHandler");
    var MahjongErrorEventResponseHandler_1 = require("./handler/MahjongErrorEventResponseHandler");
    var HeroProfileEventResponseHandler_1 = require("../handler/HeroProfileEventResponseHandler");
    var MahjongGameEndEventResponseHandler_1 = require("./handler/MahjongGameEndEventResponseHandler");
    var MahjongPrepareGameSceneResponseHandler_1 = require("./handler/MahjongPrepareGameSceneResponseHandler");
    var MahjongEndEventResponseHandler_1 = require("./handler/MahjongEndEventResponseHandler");
    var DismissVoteEventResponseHandler_1 = require("../handler/DismissVoteEventResponseHandler");
    var AbstractRoomConfig_1 = require("../AbstractRoomConfig");
    var MahjongRoomConfig = function(_super) {
      __extends(MahjongRoomConfig, _super);
      function MahjongRoomConfig(host, port) {
        var _this = _super.call(this, host, port) || this;
        _this._config.addRouter(0, 0, new RoomCommonResponseHandler_1.default());
        _this._config.addRouter(1, 1, new RoomLoginResponseHandler_1.default());
        _this._config.addRouter(1, 2, new LoginNotifyResponseHandler_1.default());
        _this._config.addRouter(2, 1, new CreateTableEventResponseHandler_1.default());
        _this._config.addRouter(2, 2, new JoinTableEventResponseHandler_1.default());
        _this._config.addRouter(2, 3, new HeroEnterEventResponseHandler_1.default());
        _this._config.addRouter(2, 4, new HeroLeaveEventResponseHandler_1.default());
        _this._config.addRouter(2, 5, new HeroOnlineEventResponseHandler_1.default());
        _this._config.addRouter(2, 6, new HeroOfflineEventResponseHandler_1.default());
        _this._config.addRouter(2, 7, new HeroSitDownEventResponseHandler_1.default());
        _this._config.addRouter(2, 8, new HeroStandUpEventResponseHandler_1.default());
        _this._config.addRouter(2, 9, new HeroSceneResponseHandler_1.default());
        _this._config.addRouter(2, 10, new ChatEventResponseHandler_1.default());
        _this._config.addRouter(2, 11, new HeroProfileEventResponseHandler_1.default());
        _this._config.addRouter(2, 12, new DismissVoteEventResponseHandler_1.default());
        _this._config.addRouter(8, -1, new MahjongErrorEventResponseHandler_1.default());
        _this._config.addRouter(8, 0, new MahjongGameStartResponseHandler_1.default());
        _this._config.addRouter(8, 1, new MahjongDispathCardResponseHandler_1.default());
        _this._config.addRouter(8, 2, new MahjongOutCardResponseHandler_1.default());
        _this._config.addRouter(8, 3, new MahjongOperateNotifyEventResponseHandler_1.default());
        _this._config.addRouter(8, 4, new MahjongOperateResultEventResponseHandler_1.default());
        _this._config.addRouter(8, 5, new MahjongGameStatusResponseHandler_1.default());
        _this._config.addRouter(8, 6, new MahjongPlayingGameSceneResponseHandler_1.default());
        _this._config.addRouter(8, 7, new MahjongPrepareGameSceneResponseHandler_1.default());
        _this._config.addRouter(8, 8, new MahjongGameEndEventResponseHandler_1.default());
        _this._config.addRouter(8, 9, new MahjongEndEventResponseHandler_1.default());
        _this._config.setWsEventListener(new RoomWsListener_1.default());
        return _this;
      }
      MahjongRoomConfig.prototype.onCreate = function() {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("open", MahjongRoomConfig.onOpen, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("create_table_success", MahjongRoomConfig.onCreateTableSuccess, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("join_table_success", MahjongRoomConfig.onJoinTableSuccess, this);
      };
      MahjongRoomConfig.prototype.onDestroy = function() {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).offGroup(this);
      };
      MahjongRoomConfig.onOpen = function() {
        var user = JSON.parse(cc.sys.localStorage.getItem("user"));
        AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new RoomMobileLoginEvent_1.default(user.username, user.password));
      };
      MahjongRoomConfig.onCreateTableSuccess = function(resp) {
        AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new JoinTableEvent_1.default(resp.tableNo));
      };
      MahjongRoomConfig.onJoinTableSuccess = function(resp) {
        UIManger_1.default.getInst().switchLayer(MahjongGameLayer_1.default, resp);
      };
      return MahjongRoomConfig;
    }(AbstractRoomConfig_1.default);
    exports.default = MahjongRoomConfig;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../UIManger": "UIManger",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJKit": "AiJKit",
    "../AbstractRoomConfig": "AbstractRoomConfig",
    "../RoomWsListener": "RoomWsListener",
    "../event/JoinTableEvent": "JoinTableEvent",
    "../event/RoomMobileLoginEvent": "RoomMobileLoginEvent",
    "../handler/ChatEventResponseHandler": "ChatEventResponseHandler",
    "../handler/CreateTableEventResponseHandler": "CreateTableEventResponseHandler",
    "../handler/DismissVoteEventResponseHandler": "DismissVoteEventResponseHandler",
    "../handler/HeroEnterEventResponseHandler": "HeroEnterEventResponseHandler",
    "../handler/HeroLeaveEventResponseHandler": "HeroLeaveEventResponseHandler",
    "../handler/HeroOfflineEventResponseHandler": "HeroOfflineEventResponseHandler",
    "../handler/HeroOnlineEventResponseHandler": "HeroOnlineEventResponseHandler",
    "../handler/HeroProfileEventResponseHandler": "HeroProfileEventResponseHandler",
    "../handler/HeroSceneResponseHandler": "HeroSceneResponseHandler",
    "../handler/HeroSitDownEventResponseHandler": "HeroSitDownEventResponseHandler",
    "../handler/HeroStandUpEventResponseHandler": "HeroStandUpEventResponseHandler",
    "../handler/JoinTableEventResponseHandler": "JoinTableEventResponseHandler",
    "../handler/LoginNotifyResponseHandler": "LoginNotifyResponseHandler",
    "../handler/RoomCommonResponseHandler": "RoomCommonResponseHandler",
    "../handler/RoomLoginResponseHandler": "RoomLoginResponseHandler",
    "./MahjongGameLayer": "MahjongGameLayer",
    "./handler/MahjongDispathCardResponseHandler": "MahjongDispathCardResponseHandler",
    "./handler/MahjongEndEventResponseHandler": "MahjongEndEventResponseHandler",
    "./handler/MahjongErrorEventResponseHandler": "MahjongErrorEventResponseHandler",
    "./handler/MahjongGameEndEventResponseHandler": "MahjongGameEndEventResponseHandler",
    "./handler/MahjongGameStartResponseHandler": "MahjongGameStartResponseHandler",
    "./handler/MahjongGameStatusResponseHandler": "MahjongGameStatusResponseHandler",
    "./handler/MahjongOperateNotifyEventResponseHandler": "MahjongOperateNotifyEventResponseHandler",
    "./handler/MahjongOperateResultEventResponseHandler": "MahjongOperateResultEventResponseHandler",
    "./handler/MahjongOutCardResponseHandler": "MahjongOutCardResponseHandler",
    "./handler/MahjongPlayingGameSceneResponseHandler": "MahjongPlayingGameSceneResponseHandler",
    "./handler/MahjongPrepareGameSceneResponseHandler": "MahjongPrepareGameSceneResponseHandler"
  } ],
  MahjongVideoLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e5def0aWTtHE4umGOs8M53V", "MahjongVideoLayer");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var md5 = require("md5");
    var ccclass = cc._decorator.ccclass;
    var AiJCCComponent_1 = require("../../AiJCCComponent");
    var _ = require("lodash");
    var HeroManager_1 = require("../../hero/HeroManager");
    var MahjongWeaveItem_1 = require("./struct/MahjongWeaveItem");
    var MahjongWeaveType_1 = require("./struct/MahjongWeaveType");
    var MahjongAction_1 = require("./record/MahjongAction");
    var MahjongVideoLayer = function(_super) {
      __extends(MahjongVideoLayer, _super);
      function MahjongVideoLayer() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this._headViewMap = {};
        _this._chairCards = {};
        _this._weavesMap = {};
        _this._discardCardsMap = {};
        _this._currentIndex = 0;
        _this._currCard = -1;
        _this._timeout = 1e3;
        _this._timeoutFnId = -1;
        return _this;
      }
      MahjongVideoLayer.prototype.onLoad = function() {
        var _this = this;
        this.loadPackage("mahjong", function() {
          fgui.UIPackage.addPackage("mahjong");
          _this._view = fgui.UIPackage.createObject("mahjong", "MahjongVideoLayer").asCom;
          fgui.GRoot.inst.addChild(_this._view);
          _this.initView();
        });
      };
      MahjongVideoLayer.prototype.onInitAiJCom = function(objs) {
        var mahjongRecord = JSON.parse(objs["detail"]);
        this._mahjongGameRecord = mahjongRecord.mahjongGameRecords[parseInt(objs["index"])];
        this._mahjongPlayerRecords = mahjongRecord.mahjongPlayerRecords;
        this._chairCount = this._mahjongPlayerRecords.length;
        this._meChair = this.getMeChair();
        this.renderHead();
        this.renderGameStart();
        this.playRecord();
      };
      MahjongVideoLayer.prototype.playRecord = function() {
        var _this = this;
        var length = this._mahjongGameRecord.mahjongGameActionRecords.length;
        this._countDownText.text = _.padStart((length - this._currentIndex - 1).toString(), 2, "0");
        var resp = this._mahjongGameRecord.mahjongGameActionRecords[this._currentIndex];
        console.log(JSON.stringify(resp));
        var timeout = this._timeout;
        switch (resp.mahjongAction) {
         case MahjongAction_1.MahjongAction.DISPATCH:
          this.dispatchCard(resp);
          break;

         case MahjongAction_1.MahjongAction.NOTIFY:
          break;

         case MahjongAction_1.MahjongAction.OUT:
          this.outCard(resp);
          break;

         case MahjongAction_1.MahjongAction.N:
          break;

         case MahjongAction_1.MahjongAction.P:
          this.operateCard(1, resp);
          break;

         case MahjongAction_1.MahjongAction.G:
          this.operateCard(2, resp);
          break;

         case MahjongAction_1.MahjongAction.H:
          this.operateCard(4, resp);
        }
        ++this._currentIndex < length && (this._timeoutFnId = window.setTimeout(function() {
          _this.playRecord();
        }, timeout));
      };
      MahjongVideoLayer.prototype.onDestroy = function() {
        this._view.dispose();
      };
      MahjongVideoLayer.prototype.initView = function() {
        var _this = this;
        this._southView = this._view.getChild("SouthComponent").asCom;
        this._southView.removeChildren();
        this._eastView = this._view.getChild("EastComponent").asCom;
        this._eastView.removeChildren();
        this._westView = this._view.getChild("WestComponent").asCom;
        this._westView.removeChildren();
        this._northView = this._view.getChild("NorthComponent").asCom;
        this._northView.removeChildren();
        this._southDiscardView = this._view.getChild("SouthDiscardComponent").asCom;
        this._southDiscardView.removeChildren();
        this._eastDiscardView = this._view.getChild("EastDiscardComponent").asCom;
        this._eastDiscardView.removeChildren();
        this._westDiscardView = this._view.getChild("WestDiscardComponent").asCom;
        this._westDiscardView.removeChildren();
        this._northDiscardView = this._view.getChild("NorthDiscardComponent").asCom;
        this._northDiscardView.removeChildren();
        this._headViewMap[0] = this._view.getChild("SouthHeadComponent").asCom;
        this._headViewMap[1] = this._view.getChild("EastHeadComponent").asCom;
        this._headViewMap[2] = this._view.getChild("NorthHeadComponent").asCom;
        this._headViewMap[3] = this._view.getChild("WestHeadComponent").asCom;
        this._countDownText = this._view.getChild("CountDownText").asTextField;
        this._view.getChild("BackwardButton").asButton.onClick(function() {
          _this._timeout < 4e3 && (_this._timeout += 100);
        }, this);
        this._view.getChild("PauseButton").asButton.onClick(function() {
          if (-1 == _this._timeoutFnId) {
            _this._view.getChild("PauseButton").asButton.icon = fgui.UIPackage.getItemURL("mahjong", "rec_pause");
            _this.playRecord();
          } else {
            window.clearTimeout(_this._timeoutFnId);
            _this._view.getChild("PauseButton").asButton.icon = fgui.UIPackage.getItemURL("mahjong", "rec_play");
            _this._timeoutFnId = -1;
          }
        }, this);
        this._view.getChild("ForwardButton").asButton.onClick(function() {
          _this._timeout > 300 && (_this._timeout -= 100);
        }, this);
        this._view.getChild("ExitButton").asButton.onClick(function() {
          -1 != _this._timeoutFnId && window.clearTimeout(_this._timeoutFnId);
          _this.destroy();
        }, this);
      };
      MahjongVideoLayer.prototype.renderHead = function() {
        var _this = this;
        _.each(this._mahjongPlayerRecords, function(mahjongPlayerRecord, i) {
          _this._headViewMap[i].getChild("nickName").asTextField.text = mahjongPlayerRecord.nickName;
          if (null != mahjongPlayerRecord.avatar) {
            var md5png = "?name=" + md5(mahjongPlayerRecord.avatar) + ".png";
            _this._headViewMap[i].getChild("avatar").asLoader.url = mahjongPlayerRecord.avatar + md5png;
          }
        });
      };
      MahjongVideoLayer.prototype.renderGameStart = function() {
        var _this = this;
        _.each(this._mahjongGameRecord.mahjongGameStartRecord, function(mahjongPlayerRecord, i) {
          switch (_this.switchView(i)) {
           case 0:
            _this.renderSouthCard(mahjongPlayerRecord.cards, []);
            break;

           case 1:
            _this.renderEastCard(mahjongPlayerRecord.cards, []);
            break;

           case 2:
            _this.renderNorthCard(mahjongPlayerRecord.cards, []);
            break;

           case 3:
            _this.renderWestCard(mahjongPlayerRecord.cards, []);
          }
          _this._chairCards[i] = mahjongPlayerRecord.cards;
        });
      };
      MahjongVideoLayer.prototype.renderSouthCard = function(cards, weaveItems, currCard) {
        var _this = this;
        void 0 === currCard && (currCard = -1);
        this._southView.removeChildren();
        var x = 0;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
          _weaveComponent.setPosition(x, _this._southView.height - _weaveComponent.height);
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
          }
          x += _weaveComponent.width;
          _this._southView.addChild(_weaveComponent);
        });
        _.each(cards, function(card, i) {
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
          _card.setPosition(x + i * _card.width + (i + 1 == cards.length && -1 != currCard ? 30 : 0), _this._southView.height - _card.height);
          _this._southView.addChild(_card);
        });
      };
      MahjongVideoLayer.prototype.renderEastCard = function(cards, weaveItems, currCard) {
        var _this = this;
        void 0 === cards && (cards = null);
        void 0 === currCard && (currCard = -1);
        this._eastView.removeChildren();
        var y = this._eastView.height;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "EastPengComponent" : "EastGangComponent").asCom;
          y -= _weaveComponent.height;
          _weaveComponent.setPosition(_this._eastView.width - _weaveComponent.width, y);
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
          }
          _this._eastView.addChild(_weaveComponent);
        });
        var cardsCount = 13 - 3 * weaveItems.length;
        for (var i = 0; i < cardsCount; i++) {
          var _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
          _card.setScale(.75, .75);
          y -= 0 == i ? _card.height : 60;
          _card.setPosition(this._eastView.width - _card.width + .25 * _card.width, y);
          _card.sortingOrder = cardsCount - i;
          this._eastView.addChild(_card);
        }
        if (-1 != currCard) {
          var _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
          _card.setScale(.75, .75);
          _card.setPosition(this._eastView.width - _card.width + .25 * _card.width, 0);
          this._eastView.addChild(_card);
        }
      };
      MahjongVideoLayer.prototype.renderNorthCard = function(cards, weaveItems, currCard) {
        var _this = this;
        void 0 === cards && (cards = null);
        void 0 === currCard && (currCard = -1);
        this._northView.removeChildren();
        var x = this._northView.width;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "NorthPengComponent" : "NorthGangComponent").asCom;
          x -= _weaveComponent.width;
          _weaveComponent.setPosition(x, _this._northView.height - _weaveComponent.height);
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
          }
          _this._northView.addChild(_weaveComponent);
        });
        var cardsCount = 13 - 3 * weaveItems.length;
        for (var i = 0; i < cardsCount; i++) {
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
          x -= _card.width;
          _card.setPosition(x, this._northView.height - _card.height);
          this._northView.addChild(_card);
        }
        if (-1 != currCard) {
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
          x -= _card.width + 45;
          _card.setPosition(x, this._northView.height - _card.height);
          this._northView.addChild(_card);
        }
      };
      MahjongVideoLayer.prototype.renderWestCard = function(cards, weaveItems, currCard) {
        var _this = this;
        void 0 === cards && (cards = null);
        void 0 === currCard && (currCard = -1);
        this._westView.removeChildren();
        var y = 0;
        _.each(weaveItems, function(weaveItem, i) {
          var _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
          var _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType_1.MahjongWeaveType.P ? "WestPengComponent" : "WestGangComponent").asCom;
          _weaveComponent.setPosition(0, y);
          y += _weaveComponent.height;
          switch (weaveItem.weaveType) {
           case MahjongWeaveType_1.MahjongWeaveType.P:
            _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            break;

           case MahjongWeaveType_1.MahjongWeaveType.G:
            if (weaveItem.open) {
              _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
              _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
            }
            _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
          }
          _this._westView.addChild(_weaveComponent);
        });
        var cardsCount = 13 - 3 * weaveItems.length;
        for (var i = 0; i < cardsCount; i++) {
          var _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
          _card.setScale(.75, .75);
          _card.setPosition(0, y);
          y += 60;
          _card.sortingOrder = i;
          this._westView.addChild(_card);
        }
        if (-1 != currCard) {
          var _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
          _card.setScale(.75, .75);
          _card.setPosition(0, this._westView.height - _card.height);
          this._westView.addChild(_card);
        }
      };
      MahjongVideoLayer.prototype.getWeaveItems = function(chair) {
        void 0 == this._weavesMap[chair] && (this._weavesMap[chair] = new Array());
        return this._weavesMap[chair];
      };
      MahjongVideoLayer.prototype.getDiscardCards = function(chair) {
        void 0 == this._discardCardsMap[chair] && (this._discardCardsMap[chair] = new Array());
        return this._discardCardsMap[chair];
      };
      MahjongVideoLayer.prototype.switchView = function(chair) {
        if (-1 == chair) return -1;
        return (chair + this._chairCount - this._meChair) % this._chairCount;
      };
      MahjongVideoLayer.prototype.switchChair = function(view) {
        return (view + this._meChair) % this._chairCount;
      };
      MahjongVideoLayer.prototype.getMeChair = function() {
        var _this = this;
        this._meChair = 0;
        _.each(this._mahjongPlayerRecords, function(mahjongPlayerRecord, i) {
          HeroManager_1.default.getInst().getMe().userId == mahjongPlayerRecord.userId && (_this._meChair = i);
        });
        return this._meChair;
      };
      MahjongVideoLayer.prototype.operateCard = function(type, resp) {
        var weaveItems = this.getWeaveItems(resp.chair);
        var discards = this.getDiscardCards(resp.provider);
        var count = 0;
        switch (type) {
         case 0:
          break;

         case 1:
          _.remove(this._chairCards[resp.chair], function(card) {
            if (card == resp.card) return count++ < 2;
            return false;
          });
          if (resp.chair != resp.provider) {
            discards = _.dropRight(discards, 1);
            this._discardCardsMap[resp.provider] = discards;
          }
          weaveItems.push(new MahjongWeaveItem_1.default(MahjongWeaveType_1.MahjongWeaveType.P, resp.card, true, resp.provider));
          break;

         case 2:
          var foundItem_1 = _.find(weaveItems, {
            centerCard: resp.card,
            weaveType: MahjongWeaveType_1.MahjongWeaveType.P
          });
          _.remove(this._chairCards[resp.chair], function(card) {
            if (card == resp.card) return count++ < (null == foundItem_1 ? 3 : 1);
            return false;
          });
          if (resp.chair != resp.provider) {
            discards = _.dropRight(discards, 1);
            this._discardCardsMap[resp.provider] = discards;
          }
          null == foundItem_1 ? weaveItems.push(new MahjongWeaveItem_1.default(MahjongWeaveType_1.MahjongWeaveType.G, resp.card, resp.provider != resp.chair, resp.provider)) : foundItem_1.weaveType = MahjongWeaveType_1.MahjongWeaveType.G;
          break;

         case 4:
          return;
        }
        switch (this.switchView(resp.chair)) {
         case 0:
          this.renderSouthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
          break;

         case 1:
          this.renderEastCard(_.clone(this._chairCards[resp.chair]), weaveItems);
          break;

         case 2:
          this.renderNorthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
          break;

         case 3:
          this.renderWestCard(_.clone(this._chairCards[resp.chair]), weaveItems);
        }
        switch (this.switchView(resp.provider)) {
         case 0:
          this.renderSouthDiscardCard(discards);
          break;

         case 1:
          this.renderEastDiscardCard(discards);
          break;

         case 2:
          this.renderNorthDiscardCard(discards);
          break;

         case 3:
          this.renderWestDiscardCard(discards);
        }
      };
      MahjongVideoLayer.prototype.dispatchCard = function(resp) {
        var weaveItems = this.getWeaveItems(resp.chair);
        this._chairCards[resp.chair].push(resp.card);
        this._currCard = resp.card;
        switch (this.switchView(resp.chair)) {
         case 0:
          this.renderSouthCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
          break;

         case 1:
          this.renderEastCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
          break;

         case 2:
          this.renderNorthCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
          break;

         case 3:
          this.renderWestCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
        }
      };
      MahjongVideoLayer.prototype.outCard = function(resp) {
        var weaveItems = this.getWeaveItems(resp.chair);
        var discards = this.getDiscardCards(resp.chair);
        discards.push(resp.card);
        var indexOf = this._chairCards[resp.chair].indexOf(resp.card);
        this._chairCards[resp.chair].splice(indexOf, 1);
        this._chairCards[resp.chair] = _.sortBy(this._chairCards[resp.chair]);
        switch (this.switchView(resp.chair)) {
         case 0:
          this.renderSouthDiscardCard(discards, true);
          this.renderSouthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
          break;

         case 1:
          this.renderEastDiscardCard(discards, true);
          this.renderEastCard(_.clone(this._chairCards[resp.chair]), weaveItems);
          break;

         case 2:
          this.renderNorthDiscardCard(discards, true);
          this.renderNorthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
          break;

         case 3:
          this.renderWestDiscardCard(discards, true);
          this.renderWestCard(_.clone(this._chairCards[resp.chair]), weaveItems);
        }
      };
      MahjongVideoLayer.prototype.renderSouthDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._southDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 11;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
          _card.setPosition(c * _card.width, _this._southDiscardView.height - (_card.height + r * (_card.height - 26)));
          _card.sortingOrder = maxCol - r;
          _this._southDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(10, -30));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongVideoLayer.prototype.renderNorthDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._northDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 11;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
          _card.setPosition(_this._northDiscardView.width - (c + 1) * _card.width, r * (_card.height - 26));
          _card.sortingOrder = r;
          _this._northDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(10, -30));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongVideoLayer.prototype.renderEastDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._eastDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 10;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage;
          _card.setPosition(_this._eastDiscardView.width - (r + 1) * _card.width, _this._eastDiscardView.height - (_card.height + c * (_card.height - 40)));
          _card.sortingOrder = maxCol - c;
          _this._eastDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(0, -20));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongVideoLayer.prototype.renderWestDiscardCard = function(discards, isOut) {
        var _this = this;
        void 0 === isOut && (isOut = false);
        this._westDiscardView.removeChildren();
        null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
        var maxCol = 10;
        _.each(discards, function(card, i) {
          var r = parseInt((i / maxCol).toString());
          var c = i % maxCol;
          var _cardHex = _.padStart(card.toString(16), 2, "0");
          var _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage;
          _card.setPosition(r * _card.width, c * (_card.height - 40));
          _card.sortingOrder = c;
          _this._westDiscardView.addChild(_card);
          if (isOut && i == discards.length - 1) {
            var screenPos = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
            screenPos = screenPos.addSelf(new cc.Vec2(40, -20));
            _this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
          }
        });
      };
      MahjongVideoLayer.prototype.renderOutCardBadgeAnimate = function(x, y) {
        this._mahjongOutCardBadgeAnimate = fgui.UIPackage.createObject("mahjong", "MahjongOutCardBadgeAnimate").asMovieClip;
        this._mahjongOutCardBadgeAnimate.setPosition(x, y);
        this._view.addChild(this._mahjongOutCardBadgeAnimate);
      };
      MahjongVideoLayer = __decorate([ ccclass ], MahjongVideoLayer);
      return MahjongVideoLayer;
    }(AiJCCComponent_1.default);
    exports.default = MahjongVideoLayer;
    cc._RF.pop();
  }, {
    "../../AiJCCComponent": "AiJCCComponent",
    "../../hero/HeroManager": "HeroManager",
    "./record/MahjongAction": "MahjongAction",
    "./struct/MahjongWeaveItem": "MahjongWeaveItem",
    "./struct/MahjongWeaveType": "MahjongWeaveType",
    lodash: 7,
    md5: 8
  } ],
  MahjongWeaveItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5372fwYt4hIZoJKE8latdwu", "MahjongWeaveItem");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongWeaveItem = function() {
      function MahjongWeaveItem(weaveType, centerCard, open, provider) {
        this.weaveType = weaveType;
        this.centerCard = centerCard;
        this.open = open;
        this.provider = provider;
      }
      return MahjongWeaveItem;
    }();
    exports.default = MahjongWeaveItem;
    cc._RF.pop();
  }, {} ],
  MahjongWeaveType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cef95gfvFpLZLotc9bSHbqF", "MahjongWeaveType");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var MahjongWeaveType;
    (function(MahjongWeaveType) {
      MahjongWeaveType[MahjongWeaveType["C"] = 1] = "C";
      MahjongWeaveType[MahjongWeaveType["P"] = 2] = "P";
      MahjongWeaveType[MahjongWeaveType["G"] = 3] = "G";
    })(MahjongWeaveType = exports.MahjongWeaveType || (exports.MahjongWeaveType = {}));
    cc._RF.pop();
  }, {} ],
  OnFire: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cbc4ejla2RKILNPeg/0yhii", "OnFire");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var OnFire = function() {
      function OnFire() {
        this.es = {};
        this.emit = this.fire;
      }
      OnFire.prototype.on = function(eventName, cb, once) {
        void 0 === once && (once = false);
        this.es[eventName] || (this.es[eventName] = []);
        this.es[eventName].push({
          cb: cb,
          once: once,
          group: ""
        });
      };
      OnFire.prototype.onGroup = function(eventName, cb, group) {
        this.es[eventName] || (this.es[eventName] = []);
        this.es[eventName].push({
          cb: cb,
          once: false,
          group: group
        });
      };
      OnFire.prototype.once = function(eventName, cb) {
        this.on(eventName, cb, true);
      };
      OnFire.prototype.fire = function(eventName) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) params[_i - 1] = arguments[_i];
        var listeners = this.es[eventName] || [];
        var l = listeners.length;
        for (var i = 0; i < l; i++) {
          var _a = listeners[i], cb = _a.cb, once = _a.once;
          cb.apply(this, params);
          if (once) {
            listeners.splice(i, 1);
            i--;
            l--;
          }
        }
      };
      OnFire.prototype.offGroup = function(group) {
        for (var esKey in this.es) {
          var listeners = this.es[esKey] || [];
          var l = listeners.length;
          for (var i = 0; i < l; i++) if (listeners[i].group === group) {
            listeners.splice(i, 1);
            i--;
            l--;
          }
        }
      };
      OnFire.prototype.off = function(eventName, cb) {
        if (void 0 === eventName) this.es = {}; else if (void 0 === cb) delete this.es[eventName]; else {
          var listeners = this.es[eventName] || [];
          var l = listeners.length;
          for (var i = 0; i < l; i++) if (listeners[i].cb === cb) {
            listeners.splice(i, 1);
            i--;
            l--;
          }
        }
      };
      OnFire.ver = "__VERSION__";
      return OnFire;
    }();
    exports.default = OnFire;
    cc._RF.pop();
  }, {} ],
  PlazaCommonResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "66dddx69sZIT65+KSMMzxtT", "PlazaCommonResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var AlertWindow_1 = require("../../AlertWindow");
    var PlazaCommonResponseHandler = function(_super) {
      __extends(PlazaCommonResponseHandler, _super);
      function PlazaCommonResponseHandler() {
        return _super.call(this) || this;
      }
      PlazaCommonResponseHandler.prototype.handler = function(aiJWs, response) {
        AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", response.message);
      };
      return PlazaCommonResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = PlazaCommonResponseHandler;
    cc._RF.pop();
  }, {
    "../../AlertWindow": "AlertWindow",
    "../../ws/AiJ": "AiJ"
  } ],
  PlazaConfig: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2a0a8PUb8JF9YDt/lToNXTh", "PlazaConfig");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../ws/AiJ");
    var AppConfig_1 = require("../AppConfig");
    var PlazaCommonResponseHandler_1 = require("./handler/PlazaCommonResponseHandler");
    var PlazaLoginHandler_1 = require("./handler/PlazaLoginHandler");
    var RoomEventResponseHandler_1 = require("./handler/RoomEventResponseHandler");
    var PlazaWsListener_1 = require("./PlazaWsListener");
    var AiJKit_1 = require("../ws/AiJKit");
    var PlazaMobileLoginEvent_1 = require("./event/PlazaMobileLoginEvent");
    var FireKit_1 = require("../fire/FireKit");
    var RoomRecordEventResponseHandler_1 = require("./handler/RoomRecordEventResponseHandler");
    var BroadcastEventResponseHandler_1 = require("./handler/BroadcastEventResponseHandler");
    var UserAssetEventResponseHandler_1 = require("./handler/UserAssetEventResponseHandler");
    var UserAssetTransEventResponseHandler_1 = require("./handler/UserAssetTransEventResponseHandler");
    var RechargeRecordEventResponseHandler_1 = require("./handler/RechargeRecordEventResponseHandler");
    var UserCertEventResponseHandler_1 = require("./handler/UserCertEventResponseHandler");
    var PlazaConfig = function() {
      function PlazaConfig(host, port) {
        this.login = function() {
          var userText = cc.sys.localStorage.getItem("user");
          if (null != userText && userText.length > 0) {
            var user = JSON.parse(userText);
            AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new PlazaMobileLoginEvent_1.default(user.username, user.password));
          }
        };
        this.url = "ws://" + host + ":" + port;
        this._config = new AiJ_1.AiJ.Config(this.url, new AiJ_1.AiJ.Options());
        this._config.addRouter(0, 0, new PlazaCommonResponseHandler_1.default());
        this._config.addRouter(1, 1, new PlazaLoginHandler_1.default());
        this._config.addRouter(2, 2, new BroadcastEventResponseHandler_1.default());
        this._config.addRouter(3, 1, new RoomEventResponseHandler_1.default());
        this._config.addRouter(3, 2, new RoomRecordEventResponseHandler_1.default());
        this._config.addRouter(4, 1, new UserAssetEventResponseHandler_1.default());
        this._config.addRouter(4, 2, new UserAssetTransEventResponseHandler_1.default());
        this._config.addRouter(4, 3, new RechargeRecordEventResponseHandler_1.default());
        this._config.addRouter(4, 4, new UserCertEventResponseHandler_1.default());
        this._config.setWsEventListener(new PlazaWsListener_1.default());
        FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).on("login", this.login);
        AiJKit_1.default.init(AppConfig_1.default.PLAZA_WS_NAME, this._config);
        this._aiJPro = AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME);
      }
      PlazaConfig.init = function(host, port) {
        null != PlazaConfig.inst && PlazaConfig.inst.close();
        PlazaConfig.inst = new PlazaConfig(host, port);
      };
      PlazaConfig.getInst = function() {
        return PlazaConfig.inst;
      };
      PlazaConfig.prototype.close = function() {
        AiJKit_1.default.close(AppConfig_1.default.PLAZA_WS_NAME);
        FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).off("login", this.login);
      };
      return PlazaConfig;
    }();
    exports.default = PlazaConfig;
    cc._RF.pop();
  }, {
    "../AppConfig": "AppConfig",
    "../fire/FireKit": "FireKit",
    "../ws/AiJ": "AiJ",
    "../ws/AiJKit": "AiJKit",
    "./PlazaWsListener": "PlazaWsListener",
    "./event/PlazaMobileLoginEvent": "PlazaMobileLoginEvent",
    "./handler/BroadcastEventResponseHandler": "BroadcastEventResponseHandler",
    "./handler/PlazaCommonResponseHandler": "PlazaCommonResponseHandler",
    "./handler/PlazaLoginHandler": "PlazaLoginHandler",
    "./handler/RechargeRecordEventResponseHandler": "RechargeRecordEventResponseHandler",
    "./handler/RoomEventResponseHandler": "RoomEventResponseHandler",
    "./handler/RoomRecordEventResponseHandler": "RoomRecordEventResponseHandler",
    "./handler/UserAssetEventResponseHandler": "UserAssetEventResponseHandler",
    "./handler/UserAssetTransEventResponseHandler": "UserAssetTransEventResponseHandler",
    "./handler/UserCertEventResponseHandler": "UserCertEventResponseHandler"
  } ],
  PlazaLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1a94965c7VLipk/Qy3eVYOh", "PlazaLayer");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ccclass = cc._decorator.ccclass;
    var UIManger_1 = require("../UIManger");
    var AppConfig_1 = require("../AppConfig");
    var RoomEvent_1 = require("../plazz/event/RoomEvent");
    var FireKit_1 = require("../fire/FireKit");
    var GameServiceManager_1 = require("../GameServiceManager");
    var AlertWindow_1 = require("../AlertWindow");
    var MahjongRoomConfig_1 = require("../room/mahjong/MahjongRoomConfig");
    var PlazaConfig_1 = require("../plazz/PlazaConfig");
    var _ = require("lodash");
    var AiJKit_1 = require("../ws/AiJKit");
    var CreateTableEvent_1 = require("../room/event/CreateTableEvent");
    var JoinTableEvent_1 = require("../room/event/JoinTableEvent");
    var RoomRecordEvent_1 = require("./event/RoomRecordEvent");
    var AiJCCComponent_1 = require("../AiJCCComponent");
    var RoomRecordLayer_1 = require("./RoomRecordLayer");
    var BroadcastEvent_1 = require("./event/BroadcastEvent");
    var UserAssetEvent_1 = require("./event/UserAssetEvent");
    var HeroManager_1 = require("../hero/HeroManager");
    var UserInfoWindow_1 = require("../UserInfoWindow");
    var UserAssetTransEvent_1 = require("./event/UserAssetTransEvent");
    var RechargeRecordLayer_1 = require("./RechargeRecordLayer");
    var RechargeRecordEvent_1 = require("./event/RechargeRecordEvent");
    var UserCertEvent_1 = require("./event/UserCertEvent");
    var SettingWindow_1 = require("../SettingWindow");
    var PlazaLayer = function(_super) {
      __extends(PlazaLayer, _super);
      function PlazaLayer() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.tableNo = [];
        _this.roomRecordCb = function(response) {
          UIManger_1.default.getInst().switchLayer(RoomRecordLayer_1.default, response);
        };
        _this.rechargeRecordCb = function(response) {
          UIManger_1.default.getInst().switchLayer(RechargeRecordLayer_1.default, response, false);
        };
        _this.roomCb = function(response) {
          GameServiceManager_1.default.getInst().initGameService(response.roomItems);
        };
        _this.broadcastCb = function(response) {
          _this._view.getChild("MessageText").asTextField.text = _.join(response.broadcasts, " ");
        };
        _this.userAssetCb = function(response) {
          _this._view.getChild("DiamondText").asTextField.text = response.assetsQuantity["diamond"].toString();
        };
        _this.assetTransCb = function(response) {
          "diamond" == response.assetCode && (_this._view.getChild("DiamondText").asTextField.text = response.quantity.toString());
          AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", response.tips);
        };
        _this.userCertCb = function(response) {
          1 == response.code && (_this._view.getChild("CertButton").asButton.visible = false);
          _this._view.getControllerAt(0).setSelectedIndex(0);
          AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", response.message);
        };
        _this.updateTableNoCb = function(self) {
          self.showInputTableNo();
          if (6 == self.tableNo.length) {
            var gameServices = GameServiceManager_1.default.getInst().getGameServiceByServiceId(_this.getServiceId(parseInt(_.join(_this.tableNo, ""))));
            if (null == gameServices) {
              AlertWindow_1.default.alert("\u63d0\u793a", "\u670d\u52a1\u5668\u672a\u542f\u52a8\uff0c\u65e0\u6cd5\u8fdb\u884c\u6e38\u620f!");
              return;
            }
            new MahjongRoomConfig_1.default(gameServices.address, gameServices.port);
          }
        };
        _this.getServiceId = function(tableNo) {
          var serviceId = parseInt((tableNo / 1e3).toString());
          if (serviceId < 200) return serviceId;
          while (serviceId > 200) serviceId -= 200;
          return serviceId;
        };
        _this.loginSuccessCb = function(resp) {
          var tableNo = _.join(_this.tableNo, "");
          0 == _this.tableNo.length ? AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new CreateTableEvent_1.default()) : AiJKit_1.default.use(AppConfig_1.default.GAME_WS_NAME).send(new JoinTableEvent_1.default(Number(tableNo)));
        };
        return _this;
      }
      PlazaLayer.prototype.onLoad = function() {
        var _this = this;
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("room", this.roomCb, this);
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("room_record", this.roomRecordCb, this);
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("broadcast", this.broadcastCb, this);
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("user_asset", this.userAssetCb, this);
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("user_cert", this.userCertCb, this);
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("asset_trans", this.assetTransCb, this);
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("recharge_record", this.rechargeRecordCb, this);
        FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).onGroup("update_table_no", this.updateTableNoCb, this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).onGroup("login_success", this.loginSuccessCb, this);
        this.loadPackage("plaza", function() {
          fgui.UIPackage.addPackage("plaza");
          _this._view = fgui.UIPackage.createObject("plaza", "PlazaLayer").asCom;
          _this.initService();
          _this.initView();
          fgui.GRoot.inst.addChild(_this._view);
        });
      };
      PlazaLayer.prototype.onInitAiJCom = function(objs) {
        AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new BroadcastEvent_1.default());
        AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new UserAssetEvent_1.default([ "diamond", "gold_coin", "room_card" ]));
      };
      PlazaLayer.prototype.onDestroy = function() {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).offGroup(this);
        FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).offGroup(this);
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).offGroup(this);
        clearInterval(this._RoomEventInterval);
        this._view.dispose();
      };
      PlazaLayer.prototype.initView = function() {
        var _this = this;
        this._view.getChild("NickNameText").asTextField.text = HeroManager_1.default.getInst().getMe().nickName;
        this._view.getChild("UserIdText").asTextField.text = _.padStart(HeroManager_1.default.getInst().getMe().userId, 8, "0");
        this._view.getChild("AvatarLoader").asLoader.url = HeroManager_1.default.getInst().getMe().avatar;
        this.initDistributorView();
        this.initTransView();
        this.initTransReviewView();
        this.initCertView();
        this.initGameCreateView();
        this._view.getChild("AvatarLoader").asLoader.onClick(function() {
          var me = HeroManager_1.default.getInst().getMe();
          UserInfoWindow_1.default.open(me.avatar, me.address, me.nickName, me.userId, me.ip);
        }, this);
        this._view.getChild("n21").asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new RoomRecordEvent_1.default(1, 10));
        }, this);
        this._view.getChild("SettingButton").asButton.onClick(function() {
          SettingWindow_1.default.setting(true);
        }, this);
        this._view.getChild("n4").asButton.onClick(function() {
          _this.tableNo = [];
          _this._view.getControllerAt(0).setSelectedIndex(2);
        }, this);
        this._view.getChild("n6").asButton.onClick(function() {
          _this.tableNo = [];
          FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).emit("update_table_no", _this);
          _this._view.getControllerAt(0).setSelectedIndex(4);
        }, this);
        var _loop_1 = function(name) {
          var numBtn = this_1._view.getChild("n68").asCom.getChild(name);
          numBtn.asButton.onClick(function() {
            if (_this.tableNo.length < 6) {
              _this.tableNo.push(numBtn.asButton.data);
              FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).emit("update_table_no", _this);
            }
          }, this_1);
        };
        var this_1 = this;
        for (var _i = 0, _a = [ "n13", "n14", "n15", "n16", "n17", "n18", "n19", "n20", "n21", "n22" ]; _i < _a.length; _i++) {
          var name = _a[_i];
          _loop_1(name);
        }
        this._view.getChild("n68").asCom.getChild("n24").asButton.onClick(function() {
          _this.tableNo = [];
          FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).emit("update_table_no", _this);
        }, this);
        this._view.getChild("n68").asCom.getChild("n25").asButton.onClick(function() {
          _this.tableNo = _.dropRight(_this.tableNo);
          FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).emit("update_table_no", _this);
        }, this);
      };
      PlazaLayer.prototype.initDistributorView = function() {
        var _this = this;
        this._view.getChild("DistributorButton").asButton.visible = _.isString(HeroManager_1.default.getInst().getMe().distributorId) && HeroManager_1.default.getInst().getMe().distributorId.length > 0;
        this._view.getChild("DistributorButton").asButton.onClick(function() {
          _this._view.getControllerAt(0).setSelectedIndex(5);
        }, this);
        var distributorGroup = this._view.getChild("distributor_group").asGroup;
        this._view.getChildInGroup("RechargeButton", distributorGroup).asButton.onClick(function() {
          _this._view.getControllerAt(0).setSelectedIndex(6);
        }, this);
        this._view.getChildInGroup("RechargeRecordButton", distributorGroup).asButton.onClick(function() {
          AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new RechargeRecordEvent_1.default(1, 50, "room_card"));
        }, this);
      };
      PlazaLayer.prototype.initTransView = function() {
        var _this = this;
        var rechargeGroup = this._view.getChild("recharge_group").asGroup;
        var rechargeReviewGroup = this._view.getChild("recharge_review_group").asGroup;
        this._view.getChildInGroup("RechargeReviewButton", rechargeGroup).asButton.onClick(function() {
          var receiveUserId = _this._view.getChildInGroup("RechargeUserIdTextField", rechargeGroup).asTextField.text;
          var quantity = _this._view.getChildInGroup("RechargeNumberTextField", rechargeGroup).asTextField.text;
          if (!_.isNumber(_.toNumber(quantity)) || parseInt(quantity) < 1) {
            AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u6570\u91cf!");
            return;
          }
          if (!_.isNumber(_.toNumber(receiveUserId)) || parseInt(receiveUserId) < 1) {
            AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u73a9\u5bb6ID!");
            return;
          }
          _this._view.getChildInGroup("RechargeAvatarLoader", rechargeReviewGroup).asLoader.url = "";
          _this._view.getChildInGroup("RechargeNickNameText", rechargeReviewGroup).asTextField.text = "";
          _this._view.getChildInGroup("RechargeUserIdText", rechargeReviewGroup).asTextField.text = receiveUserId;
          _this._view.getChildInGroup("RechargeNumberText", rechargeReviewGroup).asTextField.text = quantity;
          _this._view.getControllerAt(0).setSelectedIndex(7);
        }, this);
        this._view.getChildInGroup("RechargeCancelButton", rechargeGroup).asButton.onClick(function() {
          _this._view.getControllerAt(0).setSelectedIndex(5);
        }, this);
      };
      PlazaLayer.prototype.initTransReviewView = function() {
        var _this = this;
        var rechargeReviewGroup = this._view.getChild("recharge_review_group").asGroup;
        var rechargeGroup = this._view.getChild("recharge_group").asGroup;
        this._view.getChildInGroup("RechargeSubmitButton", rechargeReviewGroup).asButton.onClick(function() {
          var buyerId = _this._view.getChildInGroup("RechargeUserIdTextField", rechargeGroup).asTextField.text;
          var quantity = _this._view.getChildInGroup("RechargeNumberTextField", rechargeGroup).asTextField.text;
          if (!_.isNumber(_.toNumber(quantity)) || parseInt(quantity) < 1) {
            AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u6570\u91cf!");
            return;
          }
          if (!_.isNumber(_.toNumber(buyerId)) || parseInt(buyerId) < 1) {
            AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u73a9\u5bb6ID!");
            return;
          }
          AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new UserAssetTransEvent_1.default("room_card", buyerId, parseInt(quantity)));
          _this._view.getControllerAt(0).setSelectedIndex(5);
        }, this);
      };
      PlazaLayer.prototype.initCertView = function() {
        var _this = this;
        this._view.getChild("CertButton").asButton.visible = null == HeroManager_1.default.getInst().getMe().certStatus;
        var certificationGroup = this._view.getChild("certification_group").asGroup;
        this._view.getChildInGroup("SubmitCertButton", certificationGroup).asButton.onClick(function() {
          var certNameText = _this._view.getChildInGroup("CertNameTextField", certificationGroup).asTextField.text;
          var certCardText = _this._view.getChildInGroup("CertCardTextField", certificationGroup).asTextField.text;
          var certMobileText = _this._view.getChildInGroup("CertMobileTextField", certificationGroup).asTextField.text;
          if (certNameText.length < 2) {
            AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u59d3\u540d!");
            return;
          }
          if (certCardText.length < 6) {
            AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u8bc1\u4ef6\u53f7\u7801!");
            return;
          }
          if (certMobileText.length < 6) {
            AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u624b\u673a\u53f7\u7801!");
            return;
          }
          AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new UserCertEvent_1.default(certNameText, certCardText, certMobileText, "1"));
        }, this);
      };
      PlazaLayer.prototype.initGameCreateView = function() {
        var _this = this;
        var createGroup = this._view.getChild("create_group").asGroup;
        this._view.getChildInGroup("GameTypeList", createGroup).asList.getChild("mahjong").asButton.onClick(function() {
          _this._view.getControllerAt(0).setSelectedIndex(2);
        }, this);
        this._view.getChildInGroup("GameTypeList", createGroup).asList.getChild("poker").asButton.onClick(function() {
          _this._view.getControllerAt(0).setSelectedIndex(3);
        }, this);
        this._view.getChildInGroup("CreateSubGameButton", createGroup).asButton.onClick(function() {
          var gameServices = GameServiceManager_1.default.getInst().randomGameService("\u5357\u4e30\u9ebb\u5c06");
          null == gameServices ? AlertWindow_1.default.alert("\u63d0\u793a", "\u5357\u4e30\u9ebb\u5c06\u670d\u52a1\u5668\u672a\u542f\u52a8\uff0c\u65e0\u6cd5\u8fdb\u884c\u6e38\u620f!") : new MahjongRoomConfig_1.default(gameServices.address, gameServices.port);
        }, this);
      };
      PlazaLayer.prototype.showInputTableNo = function() {
        var _this = this;
        _.each([ "n31", "n32", "n33", "n34", "n35", "n36" ], function(name, i) {
          i < _this.tableNo.length ? _this._view.getChild("n68").asCom.getChild(name).asTextField.text = _this.tableNo[i] : _this._view.getChild("n68").asCom.getChild(name).asTextField.text = "";
        });
      };
      PlazaLayer.prototype.initService = function() {
        PlazaConfig_1.default.getInst()._aiJPro.send(new RoomEvent_1.default());
        this._RoomEventInterval = window.setInterval(function() {
          PlazaConfig_1.default.getInst()._aiJPro.send(new RoomEvent_1.default());
        }, 3e4);
      };
      PlazaLayer = __decorate([ ccclass ], PlazaLayer);
      return PlazaLayer;
    }(AiJCCComponent_1.default);
    exports.default = PlazaLayer;
    cc._RF.pop();
  }, {
    "../AiJCCComponent": "AiJCCComponent",
    "../AlertWindow": "AlertWindow",
    "../AppConfig": "AppConfig",
    "../GameServiceManager": "GameServiceManager",
    "../SettingWindow": "SettingWindow",
    "../UIManger": "UIManger",
    "../UserInfoWindow": "UserInfoWindow",
    "../fire/FireKit": "FireKit",
    "../hero/HeroManager": "HeroManager",
    "../plazz/PlazaConfig": "PlazaConfig",
    "../plazz/event/RoomEvent": "RoomEvent",
    "../room/event/CreateTableEvent": "CreateTableEvent",
    "../room/event/JoinTableEvent": "JoinTableEvent",
    "../room/mahjong/MahjongRoomConfig": "MahjongRoomConfig",
    "../ws/AiJKit": "AiJKit",
    "./RechargeRecordLayer": "RechargeRecordLayer",
    "./RoomRecordLayer": "RoomRecordLayer",
    "./event/BroadcastEvent": "BroadcastEvent",
    "./event/RechargeRecordEvent": "RechargeRecordEvent",
    "./event/RoomRecordEvent": "RoomRecordEvent",
    "./event/UserAssetEvent": "UserAssetEvent",
    "./event/UserAssetTransEvent": "UserAssetTransEvent",
    "./event/UserCertEvent": "UserCertEvent",
    lodash: 7
  } ],
  PlazaLoginEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6a116xSU/9HAbU9wLi9C7Iz", "PlazaLoginEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var PlazaLoginEventResponse = function(_super) {
      __extends(PlazaLoginEventResponse, _super);
      function PlazaLoginEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return PlazaLoginEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = PlazaLoginEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  PlazaLoginHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "79f07eBmtJJI49YPb5XxnWJ", "PlazaLoginHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var PlazaLoginHandler = function(_super) {
      __extends(PlazaLoginHandler, _super);
      function PlazaLoginHandler() {
        return _super.call(this) || this;
      }
      PlazaLoginHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).fire("login_success", response);
      };
      return PlazaLoginHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = PlazaLoginHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  PlazaMobileLoginEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "34f259CczdIeINvGbPnfeEl", "PlazaMobileLoginEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var PlazaMobileLoginEvent = function(_super) {
      __extends(PlazaMobileLoginEvent, _super);
      function PlazaMobileLoginEvent(mobile, password) {
        var _this = _super.call(this) || this;
        _this.mobile = mobile;
        _this.password = password;
        _this.mainType = 1;
        _this.subType = 1;
        return _this;
      }
      return PlazaMobileLoginEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = PlazaMobileLoginEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  PlazaWeiXinLoginEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d12caDKsTBFO50sPctvNtoJ", "PlazaWeiXinLoginEvent");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var PlazaWeiXinLoginEvent = function(_super) {
      __extends(PlazaWeiXinLoginEvent, _super);
      function PlazaWeiXinLoginEvent(code) {
        var _this = _super.call(this) || this;
        _this.code = code;
        _this.mainType = 1;
        _this.subType = 3;
        return _this;
      }
      return PlazaWeiXinLoginEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = PlazaWeiXinLoginEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  PlazaWsListener: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2f07eMZunRE3JN8FW+9wuYA", "PlazaWsListener");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var FireKit_1 = require("../fire/FireKit");
    var AppConfig_1 = require("../AppConfig");
    var LoadingWindow_1 = require("../LoadingWindow");
    var PlazaWsListener = function() {
      function PlazaWsListener() {}
      PlazaWsListener.prototype.onClose = function(aiJWs, event) {
        console.log("websocket close");
        LoadingWindow_1.default.close();
      };
      PlazaWsListener.prototype.onConnecting = function(aiJWs) {
        LoadingWindow_1.default.loading("\u6b63\u5728\u8fde\u63a5\u670d\u52a1\u5668!");
      };
      PlazaWsListener.prototype.onError = function(aiJWs, event) {};
      PlazaWsListener.prototype.onForcedClose = function(aiJWs, event) {
        LoadingWindow_1.default.close();
      };
      PlazaWsListener.prototype.onMessage = function(aiJWs, messageEvent) {};
      PlazaWsListener.prototype.onOpen = function(aiJWs, reconnectAttempts, event) {
        LoadingWindow_1.default.close();
        FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).fire("login");
      };
      PlazaWsListener.prototype.onReconnectAttempt = function(aiJWs, reconnectAttempts) {
        LoadingWindow_1.default.loading("\u7f51\u7edc\u8fde\u63a5\u5f02\u5e38\uff0c\u91cd\u65b0\u8fde\u63a5\u4e2d...\n\u7b2c" + reconnectAttempts + "\u6b21\u91cd\u8bd5");
      };
      PlazaWsListener.prototype.onReconnectFail = function(aiJWs, reconnectAttempts) {
        LoadingWindow_1.default.close();
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).emit("ws_error");
      };
      PlazaWsListener.prototype.onTimeout = function(aiJWs) {};
      return PlazaWsListener;
    }();
    exports.default = PlazaWsListener;
    cc._RF.pop();
  }, {
    "../AppConfig": "AppConfig",
    "../LoadingWindow": "LoadingWindow",
    "../fire/FireKit": "FireKit"
  } ],
  RechargeRecordEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "978cfDjc9xHdZ36wE8YX+zB", "RechargeRecordEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var RechargeRecordEventResponseHandler = function(_super) {
      __extends(RechargeRecordEventResponseHandler, _super);
      function RechargeRecordEventResponseHandler() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      RechargeRecordEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).fire("recharge_record", response);
      };
      return RechargeRecordEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = RechargeRecordEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  RechargeRecordEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fd906GStzdJAKt68hp1isox", "RechargeRecordEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RechargeRecordEventResponse = function(_super) {
      __extends(RechargeRecordEventResponse, _super);
      function RechargeRecordEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return RechargeRecordEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = RechargeRecordEventResponse;
    var RechargeRecord = function() {
      function RechargeRecord() {}
      return RechargeRecord;
    }();
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RechargeRecordEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "aa95fCR2/9Mw7+80DJnEBBy", "RechargeRecordEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RechargeRecordEvent = function(_super) {
      __extends(RechargeRecordEvent, _super);
      function RechargeRecordEvent(page, pageSize, assetCode) {
        var _this = _super.call(this) || this;
        _this.mainType = 4;
        _this.subType = 3;
        _this.page = page;
        _this.pageSize = pageSize;
        _this.assetCode = assetCode;
        return _this;
      }
      return RechargeRecordEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = RechargeRecordEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RechargeRecordLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9f573nh+UBN9oTeHbelqGEz", "RechargeRecordLayer");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJCCComponent_1 = require("../AiJCCComponent");
    var ccclass = cc._decorator.ccclass;
    var _ = require("lodash");
    var HeroManager_1 = require("../hero/HeroManager");
    var RechargeRecordLayer = function(_super) {
      __extends(RechargeRecordLayer, _super);
      function RechargeRecordLayer() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      RechargeRecordLayer.prototype.onLoad = function() {
        var _this = this;
        this.loadPackage("plaza", function() {
          fgui.UIPackage.addPackage("plaza");
          _this._view = fgui.UIPackage.createObject("plaza", "RechargeRecordLayer").asCom;
          _this.initView();
          fgui.GRoot.inst.addChild(_this._view);
        });
      };
      RechargeRecordLayer.prototype.onInitAiJCom = function(objs) {
        var _this = this;
        var rechargeRecordEventResponse = objs;
        _.each(rechargeRecordEventResponse.rechargeRecords, function(record) {
          var rechargeRecord = fgui.UIPackage.createObject("plaza", "RechargeRecordComponent").asCom;
          rechargeRecord.getChild("TransText").asTextField.text = record.sellerId == HeroManager_1.default.getInst().getMe().userId ? "\u5356" : "\u4e70";
          rechargeRecord.getChild("UserIdText").asTextField.text = _.padStart(record.sellerId == HeroManager_1.default.getInst().getMe().userId ? record.buyerId : record.sellerId, 8, "0");
          rechargeRecord.getChild("NickNameText").asTextField.text = record.sellerId == HeroManager_1.default.getInst().getMe().userId ? record.buyerName : record.sellerName;
          rechargeRecord.getChild("AssetNumberText").asTextField.text = record.quantity.toString();
          rechargeRecord.getChild("CreatedTimeText").asTextField.text = record.createdTime;
          _this._rechargeRecordList.addChildAt(rechargeRecord);
        });
      };
      RechargeRecordLayer.prototype.initView = function() {
        var _this = this;
        this._view.getChild("BackButton").asButton.onClick(function() {
          _this.destroy();
        }, this);
        this._rechargeRecordList = this._view.getChild("RechargeRecordList").asList;
        this._rechargeRecordList.removeChildren();
      };
      RechargeRecordLayer.prototype.onDestroy = function() {
        this._view.dispose();
      };
      RechargeRecordLayer = __decorate([ ccclass ], RechargeRecordLayer);
      return RechargeRecordLayer;
    }(AiJCCComponent_1.default);
    exports.default = RechargeRecordLayer;
    cc._RF.pop();
  }, {
    "../AiJCCComponent": "AiJCCComponent",
    "../hero/HeroManager": "HeroManager",
    lodash: 7
  } ],
  RoomCommonResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dbc8clNljlD/JJmRR4fGiVs", "RoomCommonResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var AlertWindow_1 = require("../../AlertWindow");
    var RoomCommonResponseHandler = function(_super) {
      __extends(RoomCommonResponseHandler, _super);
      function RoomCommonResponseHandler() {
        return _super.call(this) || this;
      }
      RoomCommonResponseHandler.prototype.handler = function(aiJWs, response) {
        AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", response.message);
      };
      return RoomCommonResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = RoomCommonResponseHandler;
    cc._RF.pop();
  }, {
    "../../AlertWindow": "AlertWindow",
    "../../ws/AiJ": "AiJ"
  } ],
  RoomEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7bffbONpaRDO7rBIX/oqcNZ", "RoomEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var RoomEventResponseHandler = function(_super) {
      __extends(RoomEventResponseHandler, _super);
      function RoomEventResponseHandler() {
        return _super.call(this) || this;
      }
      RoomEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).emit("room", response);
      };
      return RoomEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = RoomEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  RoomEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "50762pUNXhELq25onfmoGim", "RoomEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RoomEvent = function(_super) {
      __extends(RoomEvent, _super);
      function RoomEvent() {
        var _this = _super.call(this) || this;
        _this.mainType = 3;
        _this.subType = 1;
        return _this;
      }
      return RoomEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = RoomEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RoomLoginEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ed6bcNqupdLe5uwElIM2WRM", "RoomLoginEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RoomLoginEventResponse = function(_super) {
      __extends(RoomLoginEventResponse, _super);
      function RoomLoginEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return RoomLoginEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = RoomLoginEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RoomLoginResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6b8e9ySsnNK3YkB8YILd4G/", "RoomLoginResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var RoomLoginResponseHandler = function(_super) {
      __extends(RoomLoginResponseHandler, _super);
      function RoomLoginResponseHandler() {
        return _super.call(this) || this;
      }
      RoomLoginResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).emit("login_success", response);
      };
      return RoomLoginResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = RoomLoginResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  RoomMobileLoginEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5b50bjEbJ9Mu7BHPT/NgHRx", "RoomMobileLoginEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RoomMobileLoginEvent = function(_super) {
      __extends(RoomMobileLoginEvent, _super);
      function RoomMobileLoginEvent(mobile, password) {
        var _this = _super.call(this) || this;
        _this.mobile = mobile;
        _this.password = password;
        _this.mainType = 1;
        _this.subType = 1;
        return _this;
      }
      return RoomMobileLoginEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = RoomMobileLoginEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RoomRecordEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ec6d7NJ1RtMerrwVmPu4+of", "RoomRecordEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var RoomRecordEventResponseHandler = function(_super) {
      __extends(RoomRecordEventResponseHandler, _super);
      function RoomRecordEventResponseHandler() {
        return _super.call(this) || this;
      }
      RoomRecordEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).fire("room_record", response);
      };
      return RoomRecordEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = RoomRecordEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  RoomRecordEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "16ae2NgkKxA8q4w5EGSAsV4", "RoomRecordEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RoomRecordEventResponse = function(_super) {
      __extends(RoomRecordEventResponse, _super);
      function RoomRecordEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return RoomRecordEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = RoomRecordEventResponse;
    var RoomRecord = function() {
      function RoomRecord() {}
      return RoomRecord;
    }();
    exports.RoomRecord = RoomRecord;
    var RoomRecordSummary = function() {
      function RoomRecordSummary() {}
      return RoomRecordSummary;
    }();
    exports.RoomRecordSummary = RoomRecordSummary;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RoomRecordEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "03167sDvK5FVYYFI5molf+J", "RoomRecordEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RoomRecordEvent = function(_super) {
      __extends(RoomRecordEvent, _super);
      function RoomRecordEvent(page, pageSize) {
        var _this = _super.call(this) || this;
        _this.page = page;
        _this.pageSize = pageSize;
        _this.mainType = 3;
        _this.subType = 2;
        return _this;
      }
      return RoomRecordEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = RoomRecordEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RoomRecordLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "95b26Hb62tBoIK7+JM1fkyp", "RoomRecordLayer");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJCCComponent_1 = require("../AiJCCComponent");
    var ccclass = cc._decorator.ccclass;
    var _ = require("lodash");
    var UIManger_1 = require("../UIManger");
    var PlazaLayer_1 = require("./PlazaLayer");
    var MahjongVideoLayer_1 = require("../room/mahjong/MahjongVideoLayer");
    var RoomRecordLayer = function(_super) {
      __extends(RoomRecordLayer, _super);
      function RoomRecordLayer() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      RoomRecordLayer.prototype.onLoad = function() {
        var _this = this;
        this.loadPackage("plaza", function() {
          fgui.UIPackage.addPackage("plaza");
          _this._view = fgui.UIPackage.createObject("plaza", "RoomRecordLayer").asCom;
          _this.initView();
          fgui.GRoot.inst.addChild(_this._view);
        });
      };
      RoomRecordLayer.prototype.onInitAiJCom = function(objs) {
        var _this = this;
        var roomRecordEventResponse = objs;
        _.each(roomRecordEventResponse.roomRecords, function(record) {
          var roomRecord = fgui.UIPackage.createObject("plaza", "RoomRecordComponent").asCom;
          roomRecord.getChild("ServiceNameText").asTextField.text = record.serviceName;
          roomRecord.getChild("TableNoText").asTextField.text = record.tableNo.toString();
          roomRecord.getChild("NickNameText").asTextField.text = record.nickName;
          roomRecord.getChild("ScoreText").asTextField.text = (record.score >= 0 ? "+" : "") + record.score.toString();
          roomRecord.getChild("StartedTimeText").asTextField.text = record.startedTime;
          roomRecord.getChild("DetailButton").asButton.data = record;
          roomRecord.getChild("DetailButton").asButton.onClick(function(evt) {
            _this._roomRecordItemList.removeChildren();
            var target = fgui.GObject.cast(evt.currentTarget);
            _this._currRoomRecord = target.data;
            var summaries = JSON.parse(_this._currRoomRecord.summary);
            _.each(summaries, function(summary, i) {
              var roomRecordItem = fgui.UIPackage.createObject("plaza", "RoomRecordItemComponent").asCom;
              roomRecordItem.getChild("NumberText").asTextField.text = (i + 1).toString();
              roomRecordItem.getChild("PlayVideoButton").asButton.data = {
                index: i,
                detail: _this._currRoomRecord.detail
              };
              roomRecordItem.getChild("PlayVideoButton").asButton.onClick(function(evt) {
                var data = fgui.GObject.cast(evt.currentTarget).data;
                UIManger_1.default.getInst().switchLayer(MahjongVideoLayer_1.default, data, false);
              }, _this);
              var roomRecordItemScoreList = roomRecordItem.getChild("RoomRecordItemScoreList").asList;
              roomRecordItemScoreList.removeChildren();
              _.each(summary, function(roomRecordSummary, ii) {
                var roomRecordItemScore = fgui.UIPackage.createObject("plaza", "RoomRecordItemScoreComponent").asCom;
                roomRecordItemScore.getChild("NickNameText").asTextField.text = roomRecordSummary.nickName;
                roomRecordItemScore.getChild("ScoreText").asTextField.text = (roomRecordSummary.score >= 0 ? "+" : "") + roomRecordSummary.score;
                roomRecordItemScoreList.addChildAt(roomRecordItemScore);
              });
              _this._roomRecordItemList.addChildAt(roomRecordItem);
            });
            _this._view.getController("c1").setSelectedIndex(1);
          }, _this);
          _this._roomRecordList.addChildAt(roomRecord);
        });
      };
      RoomRecordLayer.prototype.initView = function() {
        this._view.getChild("BackButton").asButton.onClick(function() {
          UIManger_1.default.getInst().switchLayer(PlazaLayer_1.default);
        }, this);
        this._roomRecordList = this._view.getChild("RoomRecordList").asList;
        this._roomRecordItemList = this._view.getChildInGroup("RoomRecordItemList", this._view.getChild("RoomRecordItemGroup").asGroup).asList;
        this._roomRecordList.removeChildren();
      };
      RoomRecordLayer.prototype.onDestroy = function() {
        this._view.dispose();
      };
      RoomRecordLayer = __decorate([ ccclass ], RoomRecordLayer);
      return RoomRecordLayer;
    }(AiJCCComponent_1.default);
    exports.default = RoomRecordLayer;
    cc._RF.pop();
  }, {
    "../AiJCCComponent": "AiJCCComponent",
    "../UIManger": "UIManger",
    "../room/mahjong/MahjongVideoLayer": "MahjongVideoLayer",
    "./PlazaLayer": "PlazaLayer",
    lodash: 7
  } ],
  RoomServiceEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ee792OsYHhMJJYuQH8IziCo", "RoomServiceEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var RoomServiceEventResponse = function(_super) {
      __extends(RoomServiceEventResponse, _super);
      function RoomServiceEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return RoomServiceEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = RoomServiceEventResponse;
    var RoomItem = function() {
      function RoomItem() {}
      return RoomItem;
    }();
    exports.RoomItem = RoomItem;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  RoomWsListener: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "80c6abBpPtLR5wCEbbZp1TX", "RoomWsListener");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var FireKit_1 = require("../fire/FireKit");
    var AppConfig_1 = require("../AppConfig");
    var LoadingWindow_1 = require("../LoadingWindow");
    var RoomWsListener = function() {
      function RoomWsListener() {}
      RoomWsListener.prototype.onClose = function(aiJWs, event) {
        LoadingWindow_1.default.close();
      };
      RoomWsListener.prototype.onConnecting = function(aiJWs) {
        LoadingWindow_1.default.loading("\u6b63\u5728\u8fde\u63a5\u670d\u52a1\u5668!");
      };
      RoomWsListener.prototype.onError = function(aiJWs, event) {};
      RoomWsListener.prototype.onForcedClose = function(aiJWs, event) {};
      RoomWsListener.prototype.onMessage = function(aiJWs, messageEvent) {};
      RoomWsListener.prototype.onOpen = function(aiJWs, reconnectAttempts, event) {
        FireKit_1.default.use(AppConfig_1.default.GAME_FIRE).emit("open");
      };
      RoomWsListener.prototype.onReconnectAttempt = function(aiJWs, reconnectAttempts) {
        LoadingWindow_1.default.loading("\u7f51\u7edc\u8fde\u63a5\u5f02\u5e38\uff0c\u91cd\u65b0\u8fde\u63a5\u4e2d...\n\u7b2c" + reconnectAttempts + "\u6b21\u91cd\u8bd5");
      };
      RoomWsListener.prototype.onReconnectFail = function(aiJWs, reconnectAttempts) {
        LoadingWindow_1.default.close();
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).emit("ws_error");
      };
      RoomWsListener.prototype.onTimeout = function(aiJWs) {};
      return RoomWsListener;
    }();
    exports.default = RoomWsListener;
    cc._RF.pop();
  }, {
    "../AppConfig": "AppConfig",
    "../LoadingWindow": "LoadingWindow",
    "../fire/FireKit": "FireKit"
  } ],
  SettingWindow: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "376d1ULxx5JGZRw9LPkVq2v", "SettingWindow");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var UIManger_1 = require("./UIManger");
    var WelcomeLayer_1 = require("./WelcomeLayer");
    var Setting_1 = require("./Setting");
    var SettingWindow = function(_super) {
      __extends(SettingWindow, _super);
      function SettingWindow() {
        return _super.call(this) || this;
      }
      SettingWindow.getInst = function() {
        null == SettingWindow.inst && (SettingWindow.inst = new SettingWindow());
        return SettingWindow.inst;
      };
      SettingWindow.setting = function(account) {
        void 0 === account && (account = false);
        var inst = SettingWindow.getInst();
        inst.show();
        inst.contentPane.getChild("AccountGroup").asGroup.visible = account;
      };
      SettingWindow.prototype.onInit = function() {
        var _this = this;
        this.contentPane = fgui.UIPackage.createObject("commons", "SettingWindow").asCom;
        var asGroup = this.contentPane.getChild("AccountGroup").asGroup;
        this.contentPane.getChildInGroup("AccountToggleButton", asGroup).asButton.onClick(function() {
          cc.sys.localStorage.setItem("user", "");
          UIManger_1.default.getInst().switchLayer(WelcomeLayer_1.default);
        }, this);
        this.contentPane.getChildInGroup("ExitGameButton", asGroup).asButton.onClick(function() {
          cc.director.end();
        }, this);
        this.contentPane.getChild("MusicToggleButton").asButton.selected = Setting_1.default.getMusic();
        this.contentPane.getChild("SoundToggleButton").asButton.selected = Setting_1.default.getSound();
        this.contentPane.getChild("MusicToggleButton").asButton.onClick(function() {
          Setting_1.default.setMusic(_this.contentPane.getChild("MusicToggleButton").asButton.selected);
        }, this);
        this.contentPane.getChild("SoundToggleButton").asButton.onClick(function() {
          Setting_1.default.setSound(_this.contentPane.getChild("SoundToggleButton").asButton.selected);
        }, this);
        this.center();
      };
      return SettingWindow;
    }(fgui.Window);
    exports.default = SettingWindow;
    cc._RF.pop();
  }, {
    "./Setting": "Setting",
    "./UIManger": "UIManger",
    "./WelcomeLayer": "WelcomeLayer"
  } ],
  Setting: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2a17cMeaodJ5Yp+f8XLiaqs", "Setting");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var Setting = function() {
      function Setting() {}
      Setting.setMusic = function(enable) {
        this.set("music", enable);
      };
      Setting.getMusic = function() {
        return null == this.get("music") || this.get("music");
      };
      Setting.setSound = function(enable) {
        this.set("sound", enable);
      };
      Setting.getSound = function() {
        return null == this.get("sound") || this.get("sound");
      };
      Setting.set = function(key, value) {
        cc.sys.localStorage.setItem(key, value);
      };
      Setting.get = function(key) {
        return cc.sys.localStorage.getItem(key);
      };
      return Setting;
    }();
    exports.default = Setting;
    cc._RF.pop();
  }, {} ],
  SitDownTableEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6001bxoqg5Iobu52ySnieC5", "SitDownTableEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var SitDownTableEvent = function(_super) {
      __extends(SitDownTableEvent, _super);
      function SitDownTableEvent() {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 7;
        return _this;
      }
      return SitDownTableEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = SitDownTableEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  StandUpTableEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a8925kxw8dJB52DG8ejZlo+", "StandUpTableEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var StandUpTableEvent = function(_super) {
      __extends(StandUpTableEvent, _super);
      function StandUpTableEvent() {
        var _this = _super.call(this) || this;
        _this.mainType = 2;
        _this.subType = 8;
        return _this;
      }
      return StandUpTableEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = StandUpTableEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  UIManger: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "549a8k6I+RJW58dWYRmLs1o", "UIManger");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJCCComponent_1 = require("./AiJCCComponent");
    var AsyncLock = require("async-lock");
    var UIManger = function() {
      function UIManger() {
        this.lock = new AsyncLock();
      }
      UIManger.getInst = function() {
        null == UIManger.inst && (UIManger.inst = new UIManger());
        return this.inst;
      };
      UIManger.prototype.setRoot = function(root) {
        this.root = root;
      };
      UIManger.prototype.switchLayer = function(layer, object, remove) {
        void 0 === object && (object = {});
        void 0 === remove && (remove = true);
        this.preLayer = this.currentLayer;
        this.currentLayer = this.root.addComponent(layer);
        this.currentLayer instanceof AiJCCComponent_1.default && this.currentLayer.initAiJCom(object);
        remove && this.destroyPreLayer();
      };
      UIManger.prototype.destroyPreLayer = function() {
        null != this.preLayer && this.preLayer.destroy();
        this.preLayer = null;
      };
      return UIManger;
    }();
    exports.default = UIManger;
    cc._RF.pop();
  }, {
    "./AiJCCComponent": "AiJCCComponent",
    "async-lock": 2
  } ],
  UserAssetEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b3c4azvdqNAl6SR9n7knMwJ", "UserAssetEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var UserAssetEventResponseHandler = function(_super) {
      __extends(UserAssetEventResponseHandler, _super);
      function UserAssetEventResponseHandler() {
        return _super.call(this) || this;
      }
      UserAssetEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).fire("user_asset", response);
      };
      return UserAssetEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = UserAssetEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  UserAssetEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d4de0shmdtA3IW/vFv5dauU", "UserAssetEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var UserAssetEventResponse = function(_super) {
      __extends(UserAssetEventResponse, _super);
      function UserAssetEventResponse() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.assetsQuantity = {};
        return _this;
      }
      return UserAssetEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = UserAssetEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  UserAssetEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "14c2dv3GolLHL5/Y5FMeb4T", "UserAssetEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var UserAssetEvent = function(_super) {
      __extends(UserAssetEvent, _super);
      function UserAssetEvent(assetCodes) {
        var _this = _super.call(this) || this;
        _this.assetCodes = assetCodes;
        _this.mainType = 4;
        _this.subType = 1;
        return _this;
      }
      return UserAssetEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = UserAssetEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  UserAssetTransEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dfdb4m6BM1CnoBKtkNkFJCV", "UserAssetTransEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var UserAssetTransEventResponseHandler = function(_super) {
      __extends(UserAssetTransEventResponseHandler, _super);
      function UserAssetTransEventResponseHandler() {
        return _super.call(this) || this;
      }
      UserAssetTransEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).fire("asset_trans", response);
      };
      return UserAssetTransEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = UserAssetTransEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  UserAssetTransEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "be7f2p+Tu5DRqGijXvmuOj7", "UserAssetTransEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var UserAssetTransEventResponse = function(_super) {
      __extends(UserAssetTransEventResponse, _super);
      function UserAssetTransEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return UserAssetTransEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.default = UserAssetTransEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  UserAssetTransEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6da1byS729IT51pzHrRSzOY", "UserAssetTransEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var UserAssetTransEvent = function(_super) {
      __extends(UserAssetTransEvent, _super);
      function UserAssetTransEvent(assetCode, buyerId, quantity) {
        var _this = _super.call(this) || this;
        _this.mainType = 4;
        _this.subType = 2;
        _this.assetCode = assetCode;
        _this.buyerId = buyerId;
        _this.quantity = quantity;
        return _this;
      }
      return UserAssetTransEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = UserAssetTransEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  UserCertEventResponseHandler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "414909wZYJCi6NM+3AVt+IK", "UserCertEventResponseHandler");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var FireKit_1 = require("../../fire/FireKit");
    var AppConfig_1 = require("../../AppConfig");
    var UserCertEventResponseHandler = function(_super) {
      __extends(UserCertEventResponseHandler, _super);
      function UserCertEventResponseHandler() {
        return _super.call(this) || this;
      }
      UserCertEventResponseHandler.prototype.handler = function(aiJWs, response) {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).fire("user_cert", response);
      };
      return UserCertEventResponseHandler;
    }(AiJ_1.AiJ.ResponseHandler);
    exports.default = UserCertEventResponseHandler;
    cc._RF.pop();
  }, {
    "../../AppConfig": "AppConfig",
    "../../fire/FireKit": "FireKit",
    "../../ws/AiJ": "AiJ"
  } ],
  UserCertEventResponse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5e269SfphFLsYTJV8AdXAyz", "UserCertEventResponse");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var UserCertEventResponse = function(_super) {
      __extends(UserCertEventResponse, _super);
      function UserCertEventResponse() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      return UserCertEventResponse;
    }(AiJ_1.AiJ.Response);
    exports.UserCertEventResponse = UserCertEventResponse;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  UserCertEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2f259rMBJdEQqlAzXQytN6T", "UserCertEvent");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJ_1 = require("../../ws/AiJ");
    var UserCertEvent = function(_super) {
      __extends(UserCertEvent, _super);
      function UserCertEvent(certName, certCard, certMobile, certType) {
        var _this = _super.call(this) || this;
        _this.mainType = 4;
        _this.subType = 4;
        _this.certName = certName;
        _this.certCard = certCard;
        _this.certMobile = certMobile;
        _this.certType = certType;
        return _this;
      }
      return UserCertEvent;
    }(AiJ_1.AiJ.AiJEvent);
    exports.default = UserCertEvent;
    cc._RF.pop();
  }, {
    "../../ws/AiJ": "AiJ"
  } ],
  UserInfoWindow: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f7c66ZdEHhM+qOYHcP6iN3w", "UserInfoWindow");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _ = require("lodash");
    var UserInfoWindow = function(_super) {
      __extends(UserInfoWindow, _super);
      function UserInfoWindow() {
        return _super.call(this) || this;
      }
      UserInfoWindow.getInst = function() {
        null == UserInfoWindow.inst && (UserInfoWindow.inst = new UserInfoWindow());
        return UserInfoWindow.inst;
      };
      UserInfoWindow.open = function(url, address, nickName, id, ip) {
        var inst = UserInfoWindow.getInst();
        inst.show();
        inst.contentPane.getChild("UserAddressText").asTextField.text = address;
        inst.contentPane.getChild("NickNameText").asTextField.text = nickName;
        inst.contentPane.getChild("UserIdText").asTextField.text = _.padStart(id, 8, "0");
        inst.contentPane.getChild("UserIpText").asTextField.text = ip;
        inst.contentPane.getChild("AvatarLoader").asLoader.url = url;
      };
      UserInfoWindow.prototype.onInit = function() {
        this.contentPane = fgui.UIPackage.createObject("commons", "UserInfoWindow").asCom;
        this.center();
      };
      return UserInfoWindow;
    }(fgui.Window);
    exports.default = UserInfoWindow;
    cc._RF.pop();
  }, {
    lodash: 7
  } ],
  WelcomeLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6eae7xQrxhBRr15FAuzxirJ", "WelcomeLayer");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ccclass = cc._decorator.ccclass;
    var AppConfig_1 = require("./AppConfig");
    var AlertWindow_1 = require("./AlertWindow");
    var FireKit_1 = require("./fire/FireKit");
    var PlazaConfig_1 = require("./plazz/PlazaConfig");
    var UIManger_1 = require("./UIManger");
    var PlazaLayer_1 = require("./plazz/PlazaLayer");
    var AiJCCComponent_1 = require("./AiJCCComponent");
    var HeroManager_1 = require("./hero/HeroManager");
    var Hero_1 = require("./hero/Hero");
    var AudioManager_1 = require("./AudioManager");
    var WxHelper_1 = require("./WxHelper");
    var HotUpdateManager_1 = require("./hotupdate/HotUpdateManager");
    var WelcomeLayer = function(_super) {
      __extends(WelcomeLayer, _super);
      function WelcomeLayer() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.loginSuccessCb = function(resp) {
          HeroManager_1.default.getInst().setMe(new Hero_1.default(resp.userName, resp.userId, resp.nickName, resp.gender, resp.avatar, resp.distributorId, resp.address, resp.longitude, resp.latitude, resp.ip, resp.certStatus));
          UIManger_1.default.getInst().switchLayer(PlazaLayer_1.default);
        };
        _this.ws_error = function() {
          AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\uff01");
        };
        return _this;
      }
      WelcomeLayer.prototype.onLoad = function() {
        var _this = this;
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("ws_error", this.ws_error, this);
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).onGroup("login_success", this.loginSuccessCb, this);
        this.loadPackage("welcome", function() {
          fgui.UIPackage.addPackage("welcome");
          _this._view = fgui.UIPackage.createObject("welcome", "WelcomeLayer").asCom;
          _this._hotUpdateGroup = _this._view.getChild("hotUpdateGroup").asGroup;
          _this._hotUpdateProgressBar = _this._view.getChildInGroup("hotUpdateProgressBar", _this._hotUpdateGroup).asProgress;
          _this.initView();
          fgui.GRoot.inst.addChild(_this._view);
        });
      };
      WelcomeLayer.prototype.onInitAiJCom = function(objs) {
        var _this = this;
        PlazaConfig_1.default.init(AppConfig_1.default.PLAZA_WS_HOST, AppConfig_1.default.PLAZA_WS_PORT);
        AudioManager_1.default.play_music("commons", "bgm");
        if (cc.sys.isNative) {
          cc.log("hot update manager check");
          HotUpdateManager_1.default.getInst().checkAndUpdate(function(event) {
            switch (event["code"]) {
             case 0:
              _this._view.getControllerAt(0).setSelectedIndex(1);
              break;

             case 1:
              var downloaded = event["downloaded"];
              var total = event["total"];
              _this._hotUpdateProgressBar.max = total;
              _this._hotUpdateProgressBar.value = downloaded;
              break;

             case 2:
              _this._view.getControllerAt(0).setSelectedIndex(0);
            }
          });
        }
      };
      WelcomeLayer.prototype.onDestroy = function() {
        FireKit_1.default.use(AppConfig_1.default.PLAZA_FIRE).offGroup(this);
        this._view.dispose();
      };
      WelcomeLayer.prototype.initView = function() {
        var _this = this;
        this._view.getChild("username").asTextInput.text = "15000000004";
        this._view.getChild("password").asTextInput.text = "123456";
        this._view.getChild("login").asButton.onClick(function() {
          if (PlazaConfig_1.default.getInst()._aiJPro.isOpen()) {
            cc.sys.localStorage.setItem("user", JSON.stringify({
              username: _this.username(),
              password: _this.password()
            }));
            FireKit_1.default.use(AppConfig_1.default.LOCAL_FIRE).emit("login");
          } else AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u672a\u8fde\u63a5\u670d\u52a1\u5668\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\uff01");
        }, this);
        this._view.getChild("wx_login").asButton.onClick(function() {
          WxHelper_1.default.wxLogin();
        }, this);
      };
      WelcomeLayer.prototype.username = function() {
        return this._view.getChild("username").asTextInput.text;
      };
      WelcomeLayer.prototype.password = function() {
        return this._view.getChild("password").asTextInput.text;
      };
      WelcomeLayer = __decorate([ ccclass ], WelcomeLayer);
      return WelcomeLayer;
    }(AiJCCComponent_1.default);
    exports.default = WelcomeLayer;
    cc._RF.pop();
  }, {
    "./AiJCCComponent": "AiJCCComponent",
    "./AlertWindow": "AlertWindow",
    "./AppConfig": "AppConfig",
    "./AudioManager": "AudioManager",
    "./UIManger": "UIManger",
    "./WxHelper": "WxHelper",
    "./fire/FireKit": "FireKit",
    "./hero/Hero": "Hero",
    "./hero/HeroManager": "HeroManager",
    "./hotupdate/HotUpdateManager": "HotUpdateManager",
    "./plazz/PlazaConfig": "PlazaConfig",
    "./plazz/PlazaLayer": "PlazaLayer"
  } ],
  WxHelper: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2df913Ps7BMyZmC4wfyLsXJ", "WxHelper");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AiJKit_1 = require("./ws/AiJKit");
    var AppConfig_1 = require("./AppConfig");
    var PlazaWeiXinLoginEvent_1 = require("./plazz/event/PlazaWeiXinLoginEvent");
    var PlazaConfig_1 = require("./plazz/PlazaConfig");
    var AlertWindow_1 = require("./AlertWindow");
    var WxHelper = function() {
      function WxHelper() {}
      WxHelper.wxLogin = function() {
        cc.sys.os == cc.sys.OS_ANDROID && jsb.reflection.callStaticMethod("com/xiyoufang/aij/wx/WxHelper", "wxLogin", "()V");
      };
      WxHelper.onWxLogin = function(code) {
        cc.log("code:" + code);
        PlazaConfig_1.default.getInst()._aiJPro.isOpen() ? AiJKit_1.default.use(AppConfig_1.default.PLAZA_WS_NAME).send(new PlazaWeiXinLoginEvent_1.default(code)) : AlertWindow_1.default.alert("\u63d0\u793a\u4fe1\u606f", "\u672a\u8fde\u63a5\u670d\u52a1\u5668\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\uff01");
      };
      WxHelper.get = function(url, callback) {
        var request = cc.loader.getXMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onreadystatechange = function() {
          if (4 == request.readyState) {
            var httpStatus = request.statusText;
            null != callback && callback.perform(request.responseText);
          }
        };
        request.send();
      };
      WxHelper.appId = "wx7da1c028a41aeaf3";
      WxHelper.secret = "61fca66cdaf99017bbd2f78c4393b84a";
      return WxHelper;
    }();
    exports.default = WxHelper;
    cc["WxHelper"] = WxHelper;
    cc._RF.pop();
  }, {
    "./AlertWindow": "AlertWindow",
    "./AppConfig": "AppConfig",
    "./plazz/PlazaConfig": "PlazaConfig",
    "./plazz/event/PlazaWeiXinLoginEvent": "PlazaWeiXinLoginEvent",
    "./ws/AiJKit": "AiJKit"
  } ]
}, {}, [ "AiJApp", "AiJCCComponent", "AlertWindow", "AppConfig", "AudioManager", "GameServiceManager", "LoadingWindow", "Setting", "SettingWindow", "UIManger", "UserInfoWindow", "WelcomeLayer", "WxHelper", "FireKit", "OnFire", "Hero", "HeroManager", "HotUpdateManager", "PlazaConfig", "PlazaLayer", "PlazaWsListener", "RechargeRecordLayer", "RoomRecordLayer", "BroadcastEvent", "PlazaMobileLoginEvent", "PlazaWeiXinLoginEvent", "RechargeRecordEvent", "RoomEvent", "RoomRecordEvent", "UserAssetEvent", "UserAssetTransEvent", "UserCertEvent", "BroadcastEventResponseHandler", "PlazaCommonResponseHandler", "PlazaLoginHandler", "RechargeRecordEventResponseHandler", "RoomEventResponseHandler", "RoomRecordEventResponseHandler", "UserAssetEventResponseHandler", "UserAssetTransEventResponseHandler", "UserCertEventResponseHandler", "BroadcastEventResponse", "PlazaLoginEventResponse", "RechargeRecordEventResponse", "RoomRecordEventResponse", "RoomServiceEventResponse", "UserAssetEventResponse", "UserAssetTransEventResponse", "UserCertEventResponse", "AbstractRoomConfig", "RoomWsListener", "ClientReadyEvent", "CreateTableEvent", "DismissTableEvent", "DismissVoteTableEvent", "HeroProfileEvent", "JoinTableEvent", "LeaveTableEvent", "RoomMobileLoginEvent", "SitDownTableEvent", "StandUpTableEvent", "ChatEventResponseHandler", "CreateTableEventResponseHandler", "DismissVoteEventResponseHandler", "HeroEnterEventResponseHandler", "HeroLeaveEventResponseHandler", "HeroOfflineEventResponseHandler", "HeroOnlineEventResponseHandler", "HeroProfileEventResponseHandler", "HeroSceneResponseHandler", "HeroSitDownEventResponseHandler", "HeroStandUpEventResponseHandler", "JoinTableEventResponseHandler", "LoginNotifyResponseHandler", "RoomCommonResponseHandler", "RoomLoginResponseHandler", "MahjongGameEngine", "MahjongGameLayer", "MahjongRoomConfig", "MahjongVideoLayer", "MahjongOperateEvent", "MahjongOutCardEvent", "MahjongDispathCardResponseHandler", "MahjongEndEventResponseHandler", "MahjongErrorEventResponseHandler", "MahjongGameEndEventResponseHandler", "MahjongGameStartResponseHandler", "MahjongGameStatusResponseHandler", "MahjongOperateNotifyEventResponseHandler", "MahjongOperateResultEventResponseHandler", "MahjongOutCardResponseHandler", "MahjongPlayingGameSceneResponseHandler", "MahjongPrepareGameSceneResponseHandler", "MahjongAction", "MahjongGameActionRecord", "MahjongGameRecord", "MahjongGameStartRecord", "MahjongPlayerRecord", "MahjongRecord", "MahjongDispatchCardEventResponse", "MahjongEndEventResponse", "MahjongErrorEventResponse", "MahjongGameEndEventResponse", "MahjongGameStartEventResponse", "MahjongGameStatusResponse", "MahjongOperateNotifyEventResponse", "MahjongOperateResultEventResponse", "MahjongOutCardEventResponse", "MahjongPlayingGameSceneResponse", "MahjongPrepareGameSceneResponse", "MahjongWeaveItem", "MahjongWeaveType", "CreateTableEventResponse", "DismissVoteEventResponse", "HeroEnterEventResponse", "HeroLeaveEventResponse", "HeroOfflineEventResponse", "HeroOnlineEventResponse", "HeroProfileEventResponse", "HeroSceneResponse", "HeroSitDownEventResponse", "HeroStandUpEventResponse", "JoinTableEventResponse", "RoomLoginEventResponse", "AiJ", "AiJKit", "AiJPro" ]);