window.__require = function e(t, n, r) {
function i(a, s) {
if (!n[a]) {
if (!t[a]) {
var u = a.split("/");
u = u[u.length - 1];
if (!t[u]) {
var c = "function" == typeof __require && __require;
if (!s && c) return c(u, !0);
if (o) return o(u, !0);
throw new Error("Cannot find module '" + a + "'");
}
}
var l = n[a] = {
exports: {}
};
t[a][0].call(l.exports, function(e) {
return i(t[a][1][e] || e);
}, l, l.exports, e, t, n, r);
}
return n[a].exports;
}
for (var o = "function" == typeof __require && __require, a = 0; a < r.length; a++) i(r[a]);
return i;
}({
1: [ function(e, t, n) {
var r, i, o = t.exports = {};
function a() {
throw new Error("setTimeout has not been defined");
}
function s() {
throw new Error("clearTimeout has not been defined");
}
(function() {
try {
r = "function" == typeof setTimeout ? setTimeout : a;
} catch (e) {
r = a;
}
try {
i = "function" == typeof clearTimeout ? clearTimeout : s;
} catch (e) {
i = s;
}
})();
function u(e) {
if (r === setTimeout) return setTimeout(e, 0);
if ((r === a || !r) && setTimeout) {
r = setTimeout;
return setTimeout(e, 0);
}
try {
return r(e, 0);
} catch (t) {
try {
return r.call(null, e, 0);
} catch (t) {
return r.call(this, e, 0);
}
}
}
function c(e) {
if (i === clearTimeout) return clearTimeout(e);
if ((i === s || !i) && clearTimeout) {
i = clearTimeout;
return clearTimeout(e);
}
try {
return i(e);
} catch (t) {
try {
return i.call(null, e);
} catch (t) {
return i.call(this, e);
}
}
}
var l, d = [], f = !1, h = -1;
function p() {
if (f && l) {
f = !1;
l.length ? d = l.concat(d) : h = -1;
d.length && g();
}
}
function g() {
if (!f) {
var e = u(p);
f = !0;
for (var t = d.length; t; ) {
l = d;
d = [];
for (;++h < t; ) l && l[h].run();
h = -1;
t = d.length;
}
l = null;
f = !1;
c(e);
}
}
o.nextTick = function(e) {
var t = new Array(arguments.length - 1);
if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
d.push(new _(e, t));
1 !== d.length || f || u(g);
};
function _(e, t) {
this.fun = e;
this.array = t;
}
_.prototype.run = function() {
this.fun.apply(null, this.array);
};
o.title = "browser";
o.browser = !0;
o.env = {};
o.argv = [];
o.version = "";
o.versions = {};
function v() {}
o.on = v;
o.addListener = v;
o.once = v;
o.off = v;
o.removeListener = v;
o.removeAllListeners = v;
o.emit = v;
o.prependListener = v;
o.prependOnceListener = v;
o.listeners = function(e) {
return [];
};
o.binding = function(e) {
throw new Error("process.binding is not supported");
};
o.cwd = function() {
return "/";
};
o.chdir = function(e) {
throw new Error("process.chdir is not supported");
};
o.umask = function() {
return 0;
};
}, {} ],
2: [ function(e, t, n) {
"use strict";
t.exports = e("./lib");
}, {
"./lib": 3
} ],
3: [ function(e, t, n) {
(function(e) {
"use strict";
var n = function(e) {
e = e || {};
this.Promise = e.Promise || Promise;
this.queues = {};
this.domains = {};
this.domainReentrant = e.domainReentrant || !1;
this.timeout = e.timeout || n.DEFAULT_TIMEOUT;
this.maxPending = e.maxPending || n.DEFAULT_MAX_PENDING;
};
n.DEFAULT_TIMEOUT = 0;
n.DEFAULT_MAX_PENDING = 1e3;
n.prototype.acquire = function(t, n, r, i) {
if (Array.isArray(t)) return this._acquireBatch(t, n, r, i);
if ("function" != typeof n) throw new Error("You must pass a function to execute");
var o = null;
if ("function" != typeof r) {
i = r;
r = null;
o = this._deferPromise();
}
i = i || {};
var a = !1, s = null, u = this, c = function(e, n, i) {
if (e) {
0 === u.queues[t].length && delete u.queues[t];
delete u.domains[t];
}
if (!a) {
o ? n ? o.reject(n) : o.resolve(i) : "function" == typeof r && r(n, i);
a = !0;
}
e && u.queues[t] && u.queues[t].length > 0 && u.queues[t].shift()();
}, l = function(r) {
if (a) return c(r);
if (s) {
clearTimeout(s);
s = null;
}
r && (u.domains[t] = e.domain);
if (1 === n.length) {
var i = !1;
n(function(e, t) {
if (!i) {
i = !0;
c(r, e, t);
}
});
} else u._promiseTry(function() {
return n();
}).then(function(e) {
c(r, void 0, e);
}, function(e) {
c(r, e);
});
};
e.domain && (l = e.domain.bind(l));
if (u.queues[t]) if (u.domainReentrant && e.domain && e.domain === u.domains[t]) l(!1); else if (u.queues[t].length >= u.maxPending) c(!1, new Error("Too much pending tasks")); else {
var d = function() {
l(!0);
};
i.skipQueue ? u.queues[t].unshift(d) : u.queues[t].push(d);
var f = i.timeout || u.timeout;
f && (s = setTimeout(function() {
s = null;
c(!1, new Error("async-lock timed out"));
}, f));
} else {
u.queues[t] = [];
l(!0);
}
return o ? o.promise : void 0;
};
n.prototype._acquireBatch = function(e, t, n, r) {
if ("function" != typeof n) {
r = n;
n = null;
}
var i = this, o = function(e, t) {
return function(n) {
i.acquire(e, t, n, r);
};
}, a = t;
e.reverse().forEach(function(e) {
a = o(e, a);
});
if ("function" != typeof n) {
var s = this._deferPromise();
1 === a.length ? a(function(e, t) {
e ? s.reject(e) : s.resolve(t);
}) : s.resolve(a());
return s.promise;
}
a(n);
};
n.prototype.isBusy = function(e) {
return e ? !!this.queues[e] : Object.keys(this.queues).length > 0;
};
n.prototype._promiseTry = function(e) {
try {
return this.Promise.resolve(e());
} catch (e) {
return this.Promise.reject(e);
}
};
n.prototype._deferPromise = function() {
if ("function" == typeof this.Promise.defer) return this.Promise.defer();
var e = {
reject: function(t) {
return Promise.resolve().then(function() {
e.reject(t);
});
},
resolve: function(t) {
return Promise.resolve().then(function() {
e.resolve(t);
});
},
promise: void 0
};
e.promise = new this.Promise(function(t, n) {
e.reject = n;
e.resolve = t;
});
return e;
};
t.exports = n;
}).call(this, e("_process"));
}, {
_process: 1
} ],
4: [ function(e, t, n) {
var r = {
utf8: {
stringToBytes: function(e) {
return r.bin.stringToBytes(unescape(encodeURIComponent(e)));
},
bytesToString: function(e) {
return decodeURIComponent(escape(r.bin.bytesToString(e)));
}
},
bin: {
stringToBytes: function(e) {
for (var t = [], n = 0; n < e.length; n++) t.push(255 & e.charCodeAt(n));
return t;
},
bytesToString: function(e) {
for (var t = [], n = 0; n < e.length; n++) t.push(String.fromCharCode(e[n]));
return t.join("");
}
}
};
t.exports = r;
}, {} ],
5: [ function(e, t, n) {
(function() {
var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", n = {
rotl: function(e, t) {
return e << t | e >>> 32 - t;
},
rotr: function(e, t) {
return e << 32 - t | e >>> t;
},
endian: function(e) {
if (e.constructor == Number) return 16711935 & n.rotl(e, 8) | 4278255360 & n.rotl(e, 24);
for (var t = 0; t < e.length; t++) e[t] = n.endian(e[t]);
return e;
},
randomBytes: function(e) {
for (var t = []; e > 0; e--) t.push(Math.floor(256 * Math.random()));
return t;
},
bytesToWords: function(e) {
for (var t = [], n = 0, r = 0; n < e.length; n++, r += 8) t[r >>> 5] |= e[n] << 24 - r % 32;
return t;
},
wordsToBytes: function(e) {
for (var t = [], n = 0; n < 32 * e.length; n += 8) t.push(e[n >>> 5] >>> 24 - n % 32 & 255);
return t;
},
bytesToHex: function(e) {
for (var t = [], n = 0; n < e.length; n++) {
t.push((e[n] >>> 4).toString(16));
t.push((15 & e[n]).toString(16));
}
return t.join("");
},
hexToBytes: function(e) {
for (var t = [], n = 0; n < e.length; n += 2) t.push(parseInt(e.substr(n, 2), 16));
return t;
},
bytesToBase64: function(t) {
for (var n = [], r = 0; r < t.length; r += 3) for (var i = t[r] << 16 | t[r + 1] << 8 | t[r + 2], o = 0; o < 4; o++) 8 * r + 6 * o <= 8 * t.length ? n.push(e.charAt(i >>> 6 * (3 - o) & 63)) : n.push("=");
return n.join("");
},
base64ToBytes: function(t) {
t = t.replace(/[^A-Z0-9+\/]/gi, "");
for (var n = [], r = 0, i = 0; r < t.length; i = ++r % 4) 0 != i && n.push((e.indexOf(t.charAt(r - 1)) & Math.pow(2, -2 * i + 8) - 1) << 2 * i | e.indexOf(t.charAt(r)) >>> 6 - 2 * i);
return n;
}
};
t.exports = n;
})();
}, {} ],
6: [ function(e, t, n) {
t.exports = function(e) {
return null != e && (r(e) || i(e) || !!e._isBuffer);
};
function r(e) {
return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e);
}
function i(e) {
return "function" == typeof e.readFloatLE && "function" == typeof e.slice && r(e.slice(0, 0));
}
}, {} ],
7: [ function(e, t, n) {
(function(e) {
(function() {
var r, i = 200, o = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", a = "Expected a function", s = "__lodash_hash_undefined__", u = 500, c = "__lodash_placeholder__", l = 1, d = 2, f = 4, h = 1, p = 2, g = 1, _ = 2, v = 4, m = 8, C = 16, w = 32, y = 64, R = 128, A = 256, b = 512, I = 30, E = "...", j = 800, M = 16, P = 1, F = 2, O = 1 / 0, L = 9007199254740991, J = 1.7976931348623157e308, x = NaN, T = 4294967295, S = T - 1, H = T >>> 1, U = [ [ "ary", R ], [ "bind", g ], [ "bindKey", _ ], [ "curry", m ], [ "curryRight", C ], [ "flip", b ], [ "partial", w ], [ "partialRight", y ], [ "rearg", A ] ], k = "[object Arguments]", G = "[object Array]", V = "[object AsyncFunction]", W = "[object Boolean]", N = "[object Date]", D = "[object DOMException]", B = "[object Error]", K = "[object Function]", z = "[object GeneratorFunction]", Z = "[object Map]", q = "[object Number]", Y = "[object Null]", X = "[object Object]", $ = "[object Proxy]", Q = "[object RegExp]", ee = "[object Set]", te = "[object String]", ne = "[object Symbol]", re = "[object Undefined]", ie = "[object WeakMap]", oe = "[object WeakSet]", ae = "[object ArrayBuffer]", se = "[object DataView]", ue = "[object Float32Array]", ce = "[object Float64Array]", le = "[object Int8Array]", de = "[object Int16Array]", fe = "[object Int32Array]", he = "[object Uint8Array]", pe = "[object Uint8ClampedArray]", ge = "[object Uint16Array]", _e = "[object Uint32Array]", ve = /\b__p \+= '';/g, me = /\b(__p \+=) '' \+/g, Ce = /(__e\(.*?\)|\b__t\)) \+\n'';/g, we = /&(?:amp|lt|gt|quot|#39);/g, ye = /[&<>"']/g, Re = RegExp(we.source), Ae = RegExp(ye.source), be = /<%-([\s\S]+?)%>/g, Ie = /<%([\s\S]+?)%>/g, Ee = /<%=([\s\S]+?)%>/g, je = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Me = /^\w*$/, Pe = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Fe = /[\\^$.*+?()[\]{}|]/g, Oe = RegExp(Fe.source), Le = /^\s+|\s+$/g, Je = /^\s+/, xe = /\s+$/, Te = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Se = /\{\n\/\* \[wrapped with (.+)\] \*/, He = /,? & /, Ue = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, ke = /\\(\\)?/g, Ge = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Ve = /\w*$/, We = /^[-+]0x[0-9a-f]+$/i, Ne = /^0b[01]+$/i, De = /^\[object .+?Constructor\]$/, Be = /^0o[0-7]+$/i, Ke = /^(?:0|[1-9]\d*)$/, ze = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Ze = /($^)/, qe = /['\n\r\u2028\u2029\\]/g, Ye = "\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff", Xe = "\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", $e = "[\\ud800-\\udfff]", Qe = "[" + Xe + "]", et = "[" + Ye + "]", tt = "\\d+", nt = "[\\u2700-\\u27bf]", rt = "[a-z\\xdf-\\xf6\\xf8-\\xff]", it = "[^\\ud800-\\udfff" + Xe + tt + "\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde]", ot = "\\ud83c[\\udffb-\\udfff]", at = "[^\\ud800-\\udfff]", st = "(?:\\ud83c[\\udde6-\\uddff]){2}", ut = "[\\ud800-\\udbff][\\udc00-\\udfff]", ct = "[A-Z\\xc0-\\xd6\\xd8-\\xde]", lt = "(?:" + rt + "|" + it + ")", dt = "(?:" + ct + "|" + it + ")", ft = "(?:" + et + "|" + ot + ")" + "?", ht = "[\\ufe0e\\ufe0f]?" + ft + ("(?:\\u200d(?:" + [ at, st, ut ].join("|") + ")[\\ufe0e\\ufe0f]?" + ft + ")*"), pt = "(?:" + [ nt, st, ut ].join("|") + ")" + ht, gt = "(?:" + [ at + et + "?", et, st, ut, $e ].join("|") + ")", _t = RegExp("['’]", "g"), vt = RegExp(et, "g"), mt = RegExp(ot + "(?=" + ot + ")|" + gt + ht, "g"), Ct = RegExp([ ct + "?" + rt + "+(?:['’](?:d|ll|m|re|s|t|ve))?(?=" + [ Qe, ct, "$" ].join("|") + ")", dt + "+(?:['’](?:D|LL|M|RE|S|T|VE))?(?=" + [ Qe, ct + lt, "$" ].join("|") + ")", ct + "?" + lt + "+(?:['’](?:d|ll|m|re|s|t|ve))?", ct + "+(?:['’](?:D|LL|M|RE|S|T|VE))?", "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", tt, pt ].join("|"), "g"), wt = RegExp("[\\u200d\\ud800-\\udfff" + Ye + "\\ufe0e\\ufe0f]"), yt = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Rt = [ "Array", "Buffer", "DataView", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Math", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "_", "clearTimeout", "isFinite", "parseInt", "setTimeout" ], At = -1, bt = {};
bt[ue] = bt[ce] = bt[le] = bt[de] = bt[fe] = bt[he] = bt[pe] = bt[ge] = bt[_e] = !0;
bt[k] = bt[G] = bt[ae] = bt[W] = bt[se] = bt[N] = bt[B] = bt[K] = bt[Z] = bt[q] = bt[X] = bt[Q] = bt[ee] = bt[te] = bt[ie] = !1;
var It = {};
It[k] = It[G] = It[ae] = It[se] = It[W] = It[N] = It[ue] = It[ce] = It[le] = It[de] = It[fe] = It[Z] = It[q] = It[X] = It[Q] = It[ee] = It[te] = It[ne] = It[he] = It[pe] = It[ge] = It[_e] = !0;
It[B] = It[K] = It[ie] = !1;
var Et = {
"\\": "\\",
"'": "'",
"\n": "n",
"\r": "r",
"\u2028": "u2028",
"\u2029": "u2029"
}, jt = parseFloat, Mt = parseInt, Pt = "object" == typeof e && e && e.Object === Object && e, Ft = "object" == typeof self && self && self.Object === Object && self, Ot = Pt || Ft || Function("return this")(), Lt = "object" == typeof n && n && !n.nodeType && n, Jt = Lt && "object" == typeof t && t && !t.nodeType && t, xt = Jt && Jt.exports === Lt, Tt = xt && Pt.process, St = function() {
try {
var e = Jt && Jt.require && Jt.require("util").types;
return e || Tt && Tt.binding && Tt.binding("util");
} catch (e) {}
}(), Ht = St && St.isArrayBuffer, Ut = St && St.isDate, kt = St && St.isMap, Gt = St && St.isRegExp, Vt = St && St.isSet, Wt = St && St.isTypedArray;
function Nt(e, t, n) {
switch (n.length) {
case 0:
return e.call(t);

case 1:
return e.call(t, n[0]);

case 2:
return e.call(t, n[0], n[1]);

case 3:
return e.call(t, n[0], n[1], n[2]);
}
return e.apply(t, n);
}
function Dt(e, t, n, r) {
for (var i = -1, o = null == e ? 0 : e.length; ++i < o; ) {
var a = e[i];
t(r, a, n(a), e);
}
return r;
}
function Bt(e, t) {
for (var n = -1, r = null == e ? 0 : e.length; ++n < r && !1 !== t(e[n], n, e); ) ;
return e;
}
function Kt(e, t) {
for (var n = null == e ? 0 : e.length; n-- && !1 !== t(e[n], n, e); ) ;
return e;
}
function zt(e, t) {
for (var n = -1, r = null == e ? 0 : e.length; ++n < r; ) if (!t(e[n], n, e)) return !1;
return !0;
}
function Zt(e, t) {
for (var n = -1, r = null == e ? 0 : e.length, i = 0, o = []; ++n < r; ) {
var a = e[n];
t(a, n, e) && (o[i++] = a);
}
return o;
}
function qt(e, t) {
return !!(null == e ? 0 : e.length) && un(e, t, 0) > -1;
}
function Yt(e, t, n) {
for (var r = -1, i = null == e ? 0 : e.length; ++r < i; ) if (n(t, e[r])) return !0;
return !1;
}
function Xt(e, t) {
for (var n = -1, r = null == e ? 0 : e.length, i = Array(r); ++n < r; ) i[n] = t(e[n], n, e);
return i;
}
function $t(e, t) {
for (var n = -1, r = t.length, i = e.length; ++n < r; ) e[i + n] = t[n];
return e;
}
function Qt(e, t, n, r) {
var i = -1, o = null == e ? 0 : e.length;
r && o && (n = e[++i]);
for (;++i < o; ) n = t(n, e[i], i, e);
return n;
}
function en(e, t, n, r) {
var i = null == e ? 0 : e.length;
r && i && (n = e[--i]);
for (;i--; ) n = t(n, e[i], i, e);
return n;
}
function tn(e, t) {
for (var n = -1, r = null == e ? 0 : e.length; ++n < r; ) if (t(e[n], n, e)) return !0;
return !1;
}
var nn = fn("length");
function rn(e) {
return e.split("");
}
function on(e) {
return e.match(Ue) || [];
}
function an(e, t, n) {
var r;
n(e, function(e, n, i) {
if (t(e, n, i)) {
r = n;
return !1;
}
});
return r;
}
function sn(e, t, n, r) {
for (var i = e.length, o = n + (r ? 1 : -1); r ? o-- : ++o < i; ) if (t(e[o], o, e)) return o;
return -1;
}
function un(e, t, n) {
return t == t ? Hn(e, t, n) : sn(e, ln, n);
}
function cn(e, t, n, r) {
for (var i = n - 1, o = e.length; ++i < o; ) if (r(e[i], t)) return i;
return -1;
}
function ln(e) {
return e != e;
}
function dn(e, t) {
var n = null == e ? 0 : e.length;
return n ? _n(e, t) / n : x;
}
function fn(e) {
return function(t) {
return null == t ? r : t[e];
};
}
function hn(e) {
return function(t) {
return null == e ? r : e[t];
};
}
function pn(e, t, n, r, i) {
i(e, function(e, i, o) {
n = r ? (r = !1, e) : t(n, e, i, o);
});
return n;
}
function gn(e, t) {
var n = e.length;
e.sort(t);
for (;n--; ) e[n] = e[n].value;
return e;
}
function _n(e, t) {
for (var n, i = -1, o = e.length; ++i < o; ) {
var a = t(e[i]);
a !== r && (n = n === r ? a : n + a);
}
return n;
}
function vn(e, t) {
for (var n = -1, r = Array(e); ++n < e; ) r[n] = t(n);
return r;
}
function mn(e, t) {
return Xt(t, function(t) {
return [ t, e[t] ];
});
}
function Cn(e) {
return function(t) {
return e(t);
};
}
function wn(e, t) {
return Xt(t, function(t) {
return e[t];
});
}
function yn(e, t) {
return e.has(t);
}
function Rn(e, t) {
for (var n = -1, r = e.length; ++n < r && un(t, e[n], 0) > -1; ) ;
return n;
}
function An(e, t) {
for (var n = e.length; n-- && un(t, e[n], 0) > -1; ) ;
return n;
}
function bn(e, t) {
for (var n = e.length, r = 0; n--; ) e[n] === t && ++r;
return r;
}
var In = hn({
"À": "A",
"Á": "A",
"Â": "A",
"Ã": "A",
"Ä": "A",
"Å": "A",
"à": "a",
"á": "a",
"â": "a",
"ã": "a",
"ä": "a",
"å": "a",
"Ç": "C",
"ç": "c",
"Ð": "D",
"ð": "d",
"È": "E",
"É": "E",
"Ê": "E",
"Ë": "E",
"è": "e",
"é": "e",
"ê": "e",
"ë": "e",
"Ì": "I",
"Í": "I",
"Î": "I",
"Ï": "I",
"ì": "i",
"í": "i",
"î": "i",
"ï": "i",
"Ñ": "N",
"ñ": "n",
"Ò": "O",
"Ó": "O",
"Ô": "O",
"Õ": "O",
"Ö": "O",
"Ø": "O",
"ò": "o",
"ó": "o",
"ô": "o",
"õ": "o",
"ö": "o",
"ø": "o",
"Ù": "U",
"Ú": "U",
"Û": "U",
"Ü": "U",
"ù": "u",
"ú": "u",
"û": "u",
"ü": "u",
"Ý": "Y",
"ý": "y",
"ÿ": "y",
"Æ": "Ae",
"æ": "ae",
"Þ": "Th",
"þ": "th",
"ß": "ss",
"Ā": "A",
"Ă": "A",
"Ą": "A",
"ā": "a",
"ă": "a",
"ą": "a",
"Ć": "C",
"Ĉ": "C",
"Ċ": "C",
"Č": "C",
"ć": "c",
"ĉ": "c",
"ċ": "c",
"č": "c",
"Ď": "D",
"Đ": "D",
"ď": "d",
"đ": "d",
"Ē": "E",
"Ĕ": "E",
"Ė": "E",
"Ę": "E",
"Ě": "E",
"ē": "e",
"ĕ": "e",
"ė": "e",
"ę": "e",
"ě": "e",
"Ĝ": "G",
"Ğ": "G",
"Ġ": "G",
"Ģ": "G",
"ĝ": "g",
"ğ": "g",
"ġ": "g",
"ģ": "g",
"Ĥ": "H",
"Ħ": "H",
"ĥ": "h",
"ħ": "h",
"Ĩ": "I",
"Ī": "I",
"Ĭ": "I",
"Į": "I",
"İ": "I",
"ĩ": "i",
"ī": "i",
"ĭ": "i",
"į": "i",
"ı": "i",
"Ĵ": "J",
"ĵ": "j",
"Ķ": "K",
"ķ": "k",
"ĸ": "k",
"Ĺ": "L",
"Ļ": "L",
"Ľ": "L",
"Ŀ": "L",
"Ł": "L",
"ĺ": "l",
"ļ": "l",
"ľ": "l",
"ŀ": "l",
"ł": "l",
"Ń": "N",
"Ņ": "N",
"Ň": "N",
"Ŋ": "N",
"ń": "n",
"ņ": "n",
"ň": "n",
"ŋ": "n",
"Ō": "O",
"Ŏ": "O",
"Ő": "O",
"ō": "o",
"ŏ": "o",
"ő": "o",
"Ŕ": "R",
"Ŗ": "R",
"Ř": "R",
"ŕ": "r",
"ŗ": "r",
"ř": "r",
"Ś": "S",
"Ŝ": "S",
"Ş": "S",
"Š": "S",
"ś": "s",
"ŝ": "s",
"ş": "s",
"š": "s",
"Ţ": "T",
"Ť": "T",
"Ŧ": "T",
"ţ": "t",
"ť": "t",
"ŧ": "t",
"Ũ": "U",
"Ū": "U",
"Ŭ": "U",
"Ů": "U",
"Ű": "U",
"Ų": "U",
"ũ": "u",
"ū": "u",
"ŭ": "u",
"ů": "u",
"ű": "u",
"ų": "u",
"Ŵ": "W",
"ŵ": "w",
"Ŷ": "Y",
"ŷ": "y",
"Ÿ": "Y",
"Ź": "Z",
"Ż": "Z",
"Ž": "Z",
"ź": "z",
"ż": "z",
"ž": "z",
"Ĳ": "IJ",
"ĳ": "ij",
"Œ": "Oe",
"œ": "oe",
"ŉ": "'n",
"ſ": "s"
}), En = hn({
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#39;"
});
function jn(e) {
return "\\" + Et[e];
}
function Mn(e, t) {
return null == e ? r : e[t];
}
function Pn(e) {
return wt.test(e);
}
function Fn(e) {
return yt.test(e);
}
function On(e) {
for (var t, n = []; !(t = e.next()).done; ) n.push(t.value);
return n;
}
function Ln(e) {
var t = -1, n = Array(e.size);
e.forEach(function(e, r) {
n[++t] = [ r, e ];
});
return n;
}
function Jn(e, t) {
return function(n) {
return e(t(n));
};
}
function xn(e, t) {
for (var n = -1, r = e.length, i = 0, o = []; ++n < r; ) {
var a = e[n];
if (a === t || a === c) {
e[n] = c;
o[i++] = n;
}
}
return o;
}
function Tn(e) {
var t = -1, n = Array(e.size);
e.forEach(function(e) {
n[++t] = e;
});
return n;
}
function Sn(e) {
var t = -1, n = Array(e.size);
e.forEach(function(e) {
n[++t] = [ e, e ];
});
return n;
}
function Hn(e, t, n) {
for (var r = n - 1, i = e.length; ++r < i; ) if (e[r] === t) return r;
return -1;
}
function Un(e, t, n) {
for (var r = n + 1; r--; ) if (e[r] === t) return r;
return r;
}
function kn(e) {
return Pn(e) ? Wn(e) : nn(e);
}
function Gn(e) {
return Pn(e) ? Nn(e) : rn(e);
}
var Vn = hn({
"&amp;": "&",
"&lt;": "<",
"&gt;": ">",
"&quot;": '"',
"&#39;": "'"
});
function Wn(e) {
for (var t = mt.lastIndex = 0; mt.test(e); ) ++t;
return t;
}
function Nn(e) {
return e.match(mt) || [];
}
function Dn(e) {
return e.match(Ct) || [];
}
var Bn = function e(t) {
var n = (t = null == t ? Ot : Bn.defaults(Ot.Object(), t, Bn.pick(Ot, Rt))).Array, Ue = t.Date, Ye = t.Error, Xe = t.Function, $e = t.Math, Qe = t.Object, et = t.RegExp, tt = t.String, nt = t.TypeError, rt = n.prototype, it = Xe.prototype, ot = Qe.prototype, at = t["__core-js_shared__"], st = it.toString, ut = ot.hasOwnProperty, ct = 0, lt = function() {
var e = /[^.]+$/.exec(at && at.keys && at.keys.IE_PROTO || "");
return e ? "Symbol(src)_1." + e : "";
}(), dt = ot.toString, ft = st.call(Qe), ht = Ot._, pt = et("^" + st.call(ut).replace(Fe, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), gt = xt ? t.Buffer : r, mt = t.Symbol, Ct = t.Uint8Array, wt = gt ? gt.allocUnsafe : r, yt = Jn(Qe.getPrototypeOf, Qe), Et = Qe.create, Pt = ot.propertyIsEnumerable, Ft = rt.splice, Lt = mt ? mt.isConcatSpreadable : r, Jt = mt ? mt.iterator : r, Tt = mt ? mt.toStringTag : r, St = function() {
try {
var e = da(Qe, "defineProperty");
e({}, "", {});
return e;
} catch (e) {}
}(), nn = t.clearTimeout !== Ot.clearTimeout && t.clearTimeout, rn = Ue && Ue.now !== Ot.Date.now && Ue.now, hn = t.setTimeout !== Ot.setTimeout && t.setTimeout, Hn = $e.ceil, Wn = $e.floor, Nn = Qe.getOwnPropertySymbols, Kn = gt ? gt.isBuffer : r, zn = t.isFinite, Zn = rt.join, qn = Jn(Qe.keys, Qe), Yn = $e.max, Xn = $e.min, $n = Ue.now, Qn = t.parseInt, er = $e.random, tr = rt.reverse, nr = da(t, "DataView"), rr = da(t, "Map"), ir = da(t, "Promise"), or = da(t, "Set"), ar = da(t, "WeakMap"), sr = da(Qe, "create"), ur = ar && new ar(), cr = {}, lr = qa(nr), dr = qa(rr), fr = qa(ir), hr = qa(or), pr = qa(ar), gr = mt ? mt.prototype : r, _r = gr ? gr.valueOf : r, vr = gr ? gr.toString : r;
function mr(e) {
if (hu(e) && !nu(e) && !(e instanceof Rr)) {
if (e instanceof yr) return e;
if (ut.call(e, "__wrapped__")) return Xa(e);
}
return new yr(e);
}
var Cr = function() {
function e() {}
return function(t) {
if (!fu(t)) return {};
if (Et) return Et(t);
e.prototype = t;
var n = new e();
e.prototype = r;
return n;
};
}();
function wr() {}
function yr(e, t) {
this.__wrapped__ = e;
this.__actions__ = [];
this.__chain__ = !!t;
this.__index__ = 0;
this.__values__ = r;
}
mr.templateSettings = {
escape: be,
evaluate: Ie,
interpolate: Ee,
variable: "",
imports: {
_: mr
}
};
mr.prototype = wr.prototype;
mr.prototype.constructor = mr;
yr.prototype = Cr(wr.prototype);
yr.prototype.constructor = yr;
function Rr(e) {
this.__wrapped__ = e;
this.__actions__ = [];
this.__dir__ = 1;
this.__filtered__ = !1;
this.__iteratees__ = [];
this.__takeCount__ = T;
this.__views__ = [];
}
Rr.prototype = Cr(wr.prototype);
Rr.prototype.constructor = Rr;
function Ar(e) {
var t = -1, n = null == e ? 0 : e.length;
this.clear();
for (;++t < n; ) {
var r = e[t];
this.set(r[0], r[1]);
}
}
Ar.prototype.clear = function() {
this.__data__ = sr ? sr(null) : {};
this.size = 0;
};
Ar.prototype.delete = function(e) {
var t = this.has(e) && delete this.__data__[e];
this.size -= t ? 1 : 0;
return t;
};
Ar.prototype.get = function(e) {
var t = this.__data__;
if (sr) {
var n = t[e];
return n === s ? r : n;
}
return ut.call(t, e) ? t[e] : r;
};
Ar.prototype.has = function(e) {
var t = this.__data__;
return sr ? t[e] !== r : ut.call(t, e);
};
Ar.prototype.set = function(e, t) {
var n = this.__data__;
this.size += this.has(e) ? 0 : 1;
n[e] = sr && t === r ? s : t;
return this;
};
function br(e) {
var t = -1, n = null == e ? 0 : e.length;
this.clear();
for (;++t < n; ) {
var r = e[t];
this.set(r[0], r[1]);
}
}
br.prototype.clear = function() {
this.__data__ = [];
this.size = 0;
};
br.prototype.delete = function(e) {
var t = this.__data__, n = xr(t, e);
if (n < 0) return !1;
n == t.length - 1 ? t.pop() : Ft.call(t, n, 1);
--this.size;
return !0;
};
br.prototype.get = function(e) {
var t = this.__data__, n = xr(t, e);
return n < 0 ? r : t[n][1];
};
br.prototype.has = function(e) {
return xr(this.__data__, e) > -1;
};
br.prototype.set = function(e, t) {
var n = this.__data__, r = xr(n, e);
if (r < 0) {
++this.size;
n.push([ e, t ]);
} else n[r][1] = t;
return this;
};
function Ir(e) {
var t = -1, n = null == e ? 0 : e.length;
this.clear();
for (;++t < n; ) {
var r = e[t];
this.set(r[0], r[1]);
}
}
Ir.prototype.clear = function() {
this.size = 0;
this.__data__ = {
hash: new Ar(),
map: new (rr || br)(),
string: new Ar()
};
};
Ir.prototype.delete = function(e) {
var t = ca(this, e).delete(e);
this.size -= t ? 1 : 0;
return t;
};
Ir.prototype.get = function(e) {
return ca(this, e).get(e);
};
Ir.prototype.has = function(e) {
return ca(this, e).has(e);
};
Ir.prototype.set = function(e, t) {
var n = ca(this, e), r = n.size;
n.set(e, t);
this.size += n.size == r ? 0 : 1;
return this;
};
function Er(e) {
var t = -1, n = null == e ? 0 : e.length;
this.__data__ = new Ir();
for (;++t < n; ) this.add(e[t]);
}
Er.prototype.add = Er.prototype.push = function(e) {
this.__data__.set(e, s);
return this;
};
Er.prototype.has = function(e) {
return this.__data__.has(e);
};
function jr(e) {
var t = this.__data__ = new br(e);
this.size = t.size;
}
jr.prototype.clear = function() {
this.__data__ = new br();
this.size = 0;
};
jr.prototype.delete = function(e) {
var t = this.__data__, n = t.delete(e);
this.size = t.size;
return n;
};
jr.prototype.get = function(e) {
return this.__data__.get(e);
};
jr.prototype.has = function(e) {
return this.__data__.has(e);
};
jr.prototype.set = function(e, t) {
var n = this.__data__;
if (n instanceof br) {
var r = n.__data__;
if (!rr || r.length < i - 1) {
r.push([ e, t ]);
this.size = ++n.size;
return this;
}
n = this.__data__ = new Ir(r);
}
n.set(e, t);
this.size = n.size;
return this;
};
function Mr(e, t) {
var n = nu(e), r = !n && tu(e), i = !n && !r && au(e), o = !n && !r && !i && yu(e), a = n || r || i || o, s = a ? vn(e.length, tt) : [], u = s.length;
for (var c in e) !t && !ut.call(e, c) || a && ("length" == c || i && ("offset" == c || "parent" == c) || o && ("buffer" == c || "byteLength" == c || "byteOffset" == c) || ba(c, u)) || s.push(c);
return s;
}
function Pr(e) {
var t = e.length;
return t ? e[Ti(0, t - 1)] : r;
}
function Fr(e, t) {
return Ka(Ro(e), Gr(t, 0, e.length));
}
function Or(e) {
return Ka(Ro(e));
}
function Lr(e, t, n) {
(n === r || $s(e[t], n)) && (n !== r || t in e) || Ur(e, t, n);
}
function Jr(e, t, n) {
var i = e[t];
ut.call(e, t) && $s(i, n) && (n !== r || t in e) || Ur(e, t, n);
}
function xr(e, t) {
for (var n = e.length; n--; ) if ($s(e[n][0], t)) return n;
return -1;
}
function Tr(e, t, n, r) {
Kr(e, function(e, i, o) {
t(r, e, n(e), o);
});
return r;
}
function Sr(e, t) {
return e && Ao(t, Nu(t), e);
}
function Hr(e, t) {
return e && Ao(t, Du(t), e);
}
function Ur(e, t, n) {
"__proto__" == t && St ? St(e, t, {
configurable: !0,
enumerable: !0,
value: n,
writable: !0
}) : e[t] = n;
}
function kr(e, t) {
for (var i = -1, o = t.length, a = n(o), s = null == e; ++i < o; ) a[i] = s ? r : Uu(e, t[i]);
return a;
}
function Gr(e, t, n) {
if (e == e) {
n !== r && (e = e <= n ? e : n);
t !== r && (e = e >= t ? e : t);
}
return e;
}
function Vr(e, t, n, i, o, a) {
var s, u = t & l, c = t & d, h = t & f;
n && (s = o ? n(e, i, o, a) : n(e));
if (s !== r) return s;
if (!fu(e)) return e;
var p = nu(e);
if (p) {
s = Ca(e);
if (!u) return Ro(e, s);
} else {
var g = ga(e), _ = g == K || g == z;
if (au(e)) return fo(e, u);
if (g == X || g == k || _ && !o) {
s = c || _ ? {} : wa(e);
if (!u) return c ? Io(e, Hr(s, e)) : bo(e, Sr(s, e));
} else {
if (!It[g]) return o ? e : {};
s = ya(e, g, u);
}
}
a || (a = new jr());
var v = a.get(e);
if (v) return v;
a.set(e, s);
if (mu(e)) {
e.forEach(function(r) {
s.add(Vr(r, t, n, r, e, a));
});
return s;
}
if (pu(e)) {
e.forEach(function(r, i) {
s.set(i, Vr(r, t, n, i, e, a));
});
return s;
}
var m = p ? r : (h ? c ? ia : ra : c ? Du : Nu)(e);
Bt(m || e, function(r, i) {
m && (r = e[i = r]);
Jr(s, i, Vr(r, t, n, i, e, a));
});
return s;
}
function Wr(e) {
var t = Nu(e);
return function(n) {
return Nr(n, e, t);
};
}
function Nr(e, t, n) {
var i = n.length;
if (null == e) return !i;
e = Qe(e);
for (;i--; ) {
var o = n[i], a = t[o], s = e[o];
if (s === r && !(o in e) || !a(s)) return !1;
}
return !0;
}
function Dr(e, t, n) {
if ("function" != typeof e) throw new nt(a);
return Wa(function() {
e.apply(r, n);
}, t);
}
function Br(e, t, n, r) {
var o = -1, a = qt, s = !0, u = e.length, c = [], l = t.length;
if (!u) return c;
n && (t = Xt(t, Cn(n)));
if (r) {
a = Yt;
s = !1;
} else if (t.length >= i) {
a = yn;
s = !1;
t = new Er(t);
}
e: for (;++o < u; ) {
var d = e[o], f = null == n ? d : n(d);
d = r || 0 !== d ? d : 0;
if (s && f == f) {
for (var h = l; h--; ) if (t[h] === f) continue e;
c.push(d);
} else a(t, f, r) || c.push(d);
}
return c;
}
var Kr = Mo(ti), zr = Mo(ni, !0);
function Zr(e, t) {
var n = !0;
Kr(e, function(e, r, i) {
return n = !!t(e, r, i);
});
return n;
}
function qr(e, t, n) {
for (var i = -1, o = e.length; ++i < o; ) {
var a = e[i], s = t(a);
if (null != s && (u === r ? s == s && !wu(s) : n(s, u))) var u = s, c = a;
}
return c;
}
function Yr(e, t, n, i) {
var o = e.length;
(n = Eu(n)) < 0 && (n = -n > o ? 0 : o + n);
(i = i === r || i > o ? o : Eu(i)) < 0 && (i += o);
i = n > i ? 0 : ju(i);
for (;n < i; ) e[n++] = t;
return e;
}
function Xr(e, t) {
var n = [];
Kr(e, function(e, r, i) {
t(e, r, i) && n.push(e);
});
return n;
}
function $r(e, t, n, r, i) {
var o = -1, a = e.length;
n || (n = Aa);
i || (i = []);
for (;++o < a; ) {
var s = e[o];
t > 0 && n(s) ? t > 1 ? $r(s, t - 1, n, r, i) : $t(i, s) : r || (i[i.length] = s);
}
return i;
}
var Qr = Po(), ei = Po(!0);
function ti(e, t) {
return e && Qr(e, t, Nu);
}
function ni(e, t) {
return e && ei(e, t, Nu);
}
function ri(e, t) {
return Zt(t, function(t) {
return cu(e[t]);
});
}
function ii(e, t) {
for (var n = 0, i = (t = so(t, e)).length; null != e && n < i; ) e = e[Za(t[n++])];
return n && n == i ? e : r;
}
function oi(e, t, n) {
var r = t(e);
return nu(e) ? r : $t(r, n(e));
}
function ai(e) {
return null == e ? e === r ? re : Y : Tt && Tt in Qe(e) ? fa(e) : Sa(e);
}
function si(e, t) {
return e > t;
}
function ui(e, t) {
return null != e && ut.call(e, t);
}
function ci(e, t) {
return null != e && t in Qe(e);
}
function li(e, t, n) {
return e >= Xn(t, n) && e < Yn(t, n);
}
function di(e, t, i) {
for (var o = i ? Yt : qt, a = e[0].length, s = e.length, u = s, c = n(s), l = Infinity, d = []; u--; ) {
var f = e[u];
u && t && (f = Xt(f, Cn(t)));
l = Xn(f.length, l);
c[u] = !i && (t || a >= 120 && f.length >= 120) ? new Er(u && f) : r;
}
f = e[0];
var h = -1, p = c[0];
e: for (;++h < a && d.length < l; ) {
var g = f[h], _ = t ? t(g) : g;
g = i || 0 !== g ? g : 0;
if (!(p ? yn(p, _) : o(d, _, i))) {
u = s;
for (;--u; ) {
var v = c[u];
if (!(v ? yn(v, _) : o(e[u], _, i))) continue e;
}
p && p.push(_);
d.push(g);
}
}
return d;
}
function fi(e, t, n, r) {
ti(e, function(e, i, o) {
t(r, n(e), i, o);
});
return r;
}
function hi(e, t, n) {
var i = null == (e = Ua(e, t = so(t, e))) ? e : e[Za(us(t))];
return null == i ? r : Nt(i, e, n);
}
function pi(e) {
return hu(e) && ai(e) == k;
}
function gi(e, t, n, r, i) {
return e === t || (null == e || null == t || !hu(e) && !hu(t) ? e != e && t != t : _i(e, t, n, r, gi, i));
}
function _i(e, t, n, r, i, o) {
var a = nu(e), s = nu(t), u = a ? G : ga(e), c = s ? G : ga(t), l = (u = u == k ? X : u) == X, d = (c = c == k ? X : c) == X, f = u == c;
if (f && au(e)) {
if (!au(t)) return !1;
a = !0;
l = !1;
}
if (f && !l) {
o || (o = new jr());
return a || yu(e) ? Qo(e, t, n, r, i, o) : ea(e, t, u, n, r, i, o);
}
if (!(n & h)) {
var p = l && ut.call(e, "__wrapped__"), g = d && ut.call(t, "__wrapped__");
if (p || g) {
var _ = p ? e.value() : e, v = g ? t.value() : t;
o || (o = new jr());
return i(_, v, n, r, o);
}
}
if (!f) return !1;
o || (o = new jr());
return ta(e, t, n, r, i, o);
}
function vi(e, t, n, i) {
var o = n.length, a = o, s = !i;
if (null == e) return !a;
e = Qe(e);
for (;o--; ) {
var u = n[o];
if (s && u[2] ? u[1] !== e[u[0]] : !(u[0] in e)) return !1;
}
for (;++o < a; ) {
var c = (u = n[o])[0], l = e[c], d = u[1];
if (s && u[2]) {
if (l === r && !(c in e)) return !1;
} else {
var f = new jr();
if (i) var g = i(l, d, c, e, t, f);
if (!(g === r ? gi(d, l, h | p, i, f) : g)) return !1;
}
}
return !0;
}
function mi(e) {
return !(!fu(e) || Pa(e)) && (cu(e) ? pt : De).test(qa(e));
}
function Ci(e) {
return "function" == typeof e ? e : null == e ? gc : "object" == typeof e ? nu(e) ? Ii(e[0], e[1]) : bi(e) : bc(e);
}
function wi(e) {
if (!Oa(e)) return qn(e);
var t = [];
for (var n in Qe(e)) ut.call(e, n) && "constructor" != n && t.push(n);
return t;
}
function yi(e) {
if (!fu(e)) return Ta(e);
var t = Oa(e), n = [];
for (var r in e) ("constructor" != r || !t && ut.call(e, r)) && n.push(r);
return n;
}
function Ri(e, t) {
return e < t;
}
function Ai(e, t) {
var r = -1, i = iu(e) ? n(e.length) : [];
Kr(e, function(e, n, o) {
i[++r] = t(e, n, o);
});
return i;
}
function bi(e) {
var t = la(e);
return 1 == t.length && t[0][2] ? Ja(t[0][0], t[0][1]) : function(n) {
return n === e || vi(n, e, t);
};
}
function Ii(e, t) {
return Ea(e) && La(t) ? Ja(Za(e), t) : function(n) {
var i = Uu(n, e);
return i === r && i === t ? ku(n, e) : gi(t, i, h | p);
};
}
function Ei(e, t, n, i, o) {
e !== t && Qr(t, function(a, s) {
if (fu(a)) {
o || (o = new jr());
ji(e, t, s, n, Ei, i, o);
} else {
var u = i ? i(Ga(e, s), a, s + "", e, t, o) : r;
u === r && (u = a);
Lr(e, s, u);
}
}, Du);
}
function ji(e, t, n, i, o, a, s) {
var u = Ga(e, n), c = Ga(t, n), l = s.get(c);
if (l) Lr(e, n, l); else {
var d = a ? a(u, c, n + "", e, t, s) : r, f = d === r;
if (f) {
var h = nu(c), p = !h && au(c), g = !h && !p && yu(c);
d = c;
if (h || p || g) if (nu(u)) d = u; else if (ou(u)) d = Ro(u); else if (p) {
f = !1;
d = fo(c, !0);
} else if (g) {
f = !1;
d = vo(c, !0);
} else d = []; else if (_u(c) || tu(c)) {
d = u;
tu(u) ? d = Pu(u) : fu(u) && !cu(u) || (d = wa(c));
} else f = !1;
}
if (f) {
s.set(c, d);
o(d, c, i, a, s);
s.delete(c);
}
Lr(e, n, d);
}
}
function Mi(e, t) {
var n = e.length;
if (n) return ba(t += t < 0 ? n : 0, n) ? e[t] : r;
}
function Pi(e, t, n) {
var r = -1;
t = Xt(t.length ? t : [ gc ], Cn(ua()));
return gn(Ai(e, function(e, n, i) {
return {
criteria: Xt(t, function(t) {
return t(e);
}),
index: ++r,
value: e
};
}), function(e, t) {
return Co(e, t, n);
});
}
function Fi(e, t) {
return Oi(e, t, function(t, n) {
return ku(e, n);
});
}
function Oi(e, t, n) {
for (var r = -1, i = t.length, o = {}; ++r < i; ) {
var a = t[r], s = ii(e, a);
n(s, a) && Vi(o, so(a, e), s);
}
return o;
}
function Li(e) {
return function(t) {
return ii(t, e);
};
}
function Ji(e, t, n, r) {
var i = r ? cn : un, o = -1, a = t.length, s = e;
e === t && (t = Ro(t));
n && (s = Xt(e, Cn(n)));
for (;++o < a; ) for (var u = 0, c = t[o], l = n ? n(c) : c; (u = i(s, l, u, r)) > -1; ) {
s !== e && Ft.call(s, u, 1);
Ft.call(e, u, 1);
}
return e;
}
function xi(e, t) {
for (var n = e ? t.length : 0, r = n - 1; n--; ) {
var i = t[n];
if (n == r || i !== o) {
var o = i;
ba(i) ? Ft.call(e, i, 1) : Qi(e, i);
}
}
return e;
}
function Ti(e, t) {
return e + Wn(er() * (t - e + 1));
}
function Si(e, t, r, i) {
for (var o = -1, a = Yn(Hn((t - e) / (r || 1)), 0), s = n(a); a--; ) {
s[i ? a : ++o] = e;
e += r;
}
return s;
}
function Hi(e, t) {
var n = "";
if (!e || t < 1 || t > L) return n;
do {
t % 2 && (n += e);
(t = Wn(t / 2)) && (e += e);
} while (t);
return n;
}
function Ui(e, t) {
return Na(Ha(e, t, gc), e + "");
}
function ki(e) {
return Pr($u(e));
}
function Gi(e, t) {
var n = $u(e);
return Ka(n, Gr(t, 0, n.length));
}
function Vi(e, t, n, i) {
if (!fu(e)) return e;
for (var o = -1, a = (t = so(t, e)).length, s = a - 1, u = e; null != u && ++o < a; ) {
var c = Za(t[o]), l = n;
if (o != s) {
var d = u[c];
(l = i ? i(d, c, u) : r) === r && (l = fu(d) ? d : ba(t[o + 1]) ? [] : {});
}
Jr(u, c, l);
u = u[c];
}
return e;
}
var Wi = ur ? function(e, t) {
ur.set(e, t);
return e;
} : gc, Ni = St ? function(e, t) {
return St(e, "toString", {
configurable: !0,
enumerable: !1,
value: fc(t),
writable: !0
});
} : gc;
function Di(e) {
return Ka($u(e));
}
function Bi(e, t, r) {
var i = -1, o = e.length;
t < 0 && (t = -t > o ? 0 : o + t);
(r = r > o ? o : r) < 0 && (r += o);
o = t > r ? 0 : r - t >>> 0;
t >>>= 0;
for (var a = n(o); ++i < o; ) a[i] = e[i + t];
return a;
}
function Ki(e, t) {
var n;
Kr(e, function(e, r, i) {
return !(n = t(e, r, i));
});
return !!n;
}
function zi(e, t, n) {
var r = 0, i = null == e ? r : e.length;
if ("number" == typeof t && t == t && i <= H) {
for (;r < i; ) {
var o = r + i >>> 1, a = e[o];
null !== a && !wu(a) && (n ? a <= t : a < t) ? r = o + 1 : i = o;
}
return i;
}
return Zi(e, t, gc, n);
}
function Zi(e, t, n, i) {
t = n(t);
for (var o = 0, a = null == e ? 0 : e.length, s = t != t, u = null === t, c = wu(t), l = t === r; o < a; ) {
var d = Wn((o + a) / 2), f = n(e[d]), h = f !== r, p = null === f, g = f == f, _ = wu(f);
if (s) var v = i || g; else v = l ? g && (i || h) : u ? g && h && (i || !p) : c ? g && h && !p && (i || !_) : !p && !_ && (i ? f <= t : f < t);
v ? o = d + 1 : a = d;
}
return Xn(a, S);
}
function qi(e, t) {
for (var n = -1, r = e.length, i = 0, o = []; ++n < r; ) {
var a = e[n], s = t ? t(a) : a;
if (!n || !$s(s, u)) {
var u = s;
o[i++] = 0 === a ? 0 : a;
}
}
return o;
}
function Yi(e) {
return "number" == typeof e ? e : wu(e) ? x : +e;
}
function Xi(e) {
if ("string" == typeof e) return e;
if (nu(e)) return Xt(e, Xi) + "";
if (wu(e)) return vr ? vr.call(e) : "";
var t = e + "";
return "0" == t && 1 / e == -O ? "-0" : t;
}
function $i(e, t, n) {
var r = -1, o = qt, a = e.length, s = !0, u = [], c = u;
if (n) {
s = !1;
o = Yt;
} else if (a >= i) {
var l = t ? null : zo(e);
if (l) return Tn(l);
s = !1;
o = yn;
c = new Er();
} else c = t ? [] : u;
e: for (;++r < a; ) {
var d = e[r], f = t ? t(d) : d;
d = n || 0 !== d ? d : 0;
if (s && f == f) {
for (var h = c.length; h--; ) if (c[h] === f) continue e;
t && c.push(f);
u.push(d);
} else if (!o(c, f, n)) {
c !== u && c.push(f);
u.push(d);
}
}
return u;
}
function Qi(e, t) {
return null == (e = Ua(e, t = so(t, e))) || delete e[Za(us(t))];
}
function eo(e, t, n, r) {
return Vi(e, t, n(ii(e, t)), r);
}
function to(e, t, n, r) {
for (var i = e.length, o = r ? i : -1; (r ? o-- : ++o < i) && t(e[o], o, e); ) ;
return n ? Bi(e, r ? 0 : o, r ? o + 1 : i) : Bi(e, r ? o + 1 : 0, r ? i : o);
}
function no(e, t) {
var n = e;
n instanceof Rr && (n = n.value());
return Qt(t, function(e, t) {
return t.func.apply(t.thisArg, $t([ e ], t.args));
}, n);
}
function ro(e, t, r) {
var i = e.length;
if (i < 2) return i ? $i(e[0]) : [];
for (var o = -1, a = n(i); ++o < i; ) for (var s = e[o], u = -1; ++u < i; ) u != o && (a[o] = Br(a[o] || s, e[u], t, r));
return $i($r(a, 1), t, r);
}
function io(e, t, n) {
for (var i = -1, o = e.length, a = t.length, s = {}; ++i < o; ) {
var u = i < a ? t[i] : r;
n(s, e[i], u);
}
return s;
}
function oo(e) {
return ou(e) ? e : [];
}
function ao(e) {
return "function" == typeof e ? e : gc;
}
function so(e, t) {
return nu(e) ? e : Ea(e, t) ? [ e ] : za(Fu(e));
}
var uo = Ui;
function co(e, t, n) {
var i = e.length;
n = n === r ? i : n;
return !t && n >= i ? e : Bi(e, t, n);
}
var lo = nn || function(e) {
return Ot.clearTimeout(e);
};
function fo(e, t) {
if (t) return e.slice();
var n = e.length, r = wt ? wt(n) : new e.constructor(n);
e.copy(r);
return r;
}
function ho(e) {
var t = new e.constructor(e.byteLength);
new Ct(t).set(new Ct(e));
return t;
}
function po(e, t) {
var n = t ? ho(e.buffer) : e.buffer;
return new e.constructor(n, e.byteOffset, e.byteLength);
}
function go(e) {
var t = new e.constructor(e.source, Ve.exec(e));
t.lastIndex = e.lastIndex;
return t;
}
function _o(e) {
return _r ? Qe(_r.call(e)) : {};
}
function vo(e, t) {
var n = t ? ho(e.buffer) : e.buffer;
return new e.constructor(n, e.byteOffset, e.length);
}
function mo(e, t) {
if (e !== t) {
var n = e !== r, i = null === e, o = e == e, a = wu(e), s = t !== r, u = null === t, c = t == t, l = wu(t);
if (!u && !l && !a && e > t || a && s && c && !u && !l || i && s && c || !n && c || !o) return 1;
if (!i && !a && !l && e < t || l && n && o && !i && !a || u && n && o || !s && o || !c) return -1;
}
return 0;
}
function Co(e, t, n) {
for (var r = -1, i = e.criteria, o = t.criteria, a = i.length, s = n.length; ++r < a; ) {
var u = mo(i[r], o[r]);
if (u) return r >= s ? u : u * ("desc" == n[r] ? -1 : 1);
}
return e.index - t.index;
}
function wo(e, t, r, i) {
for (var o = -1, a = e.length, s = r.length, u = -1, c = t.length, l = Yn(a - s, 0), d = n(c + l), f = !i; ++u < c; ) d[u] = t[u];
for (;++o < s; ) (f || o < a) && (d[r[o]] = e[o]);
for (;l--; ) d[u++] = e[o++];
return d;
}
function yo(e, t, r, i) {
for (var o = -1, a = e.length, s = -1, u = r.length, c = -1, l = t.length, d = Yn(a - u, 0), f = n(d + l), h = !i; ++o < d; ) f[o] = e[o];
for (var p = o; ++c < l; ) f[p + c] = t[c];
for (;++s < u; ) (h || o < a) && (f[p + r[s]] = e[o++]);
return f;
}
function Ro(e, t) {
var r = -1, i = e.length;
t || (t = n(i));
for (;++r < i; ) t[r] = e[r];
return t;
}
function Ao(e, t, n, i) {
var o = !n;
n || (n = {});
for (var a = -1, s = t.length; ++a < s; ) {
var u = t[a], c = i ? i(n[u], e[u], u, n, e) : r;
c === r && (c = e[u]);
o ? Ur(n, u, c) : Jr(n, u, c);
}
return n;
}
function bo(e, t) {
return Ao(e, ha(e), t);
}
function Io(e, t) {
return Ao(e, pa(e), t);
}
function Eo(e, t) {
return function(n, r) {
var i = nu(n) ? Dt : Tr, o = t ? t() : {};
return i(n, e, ua(r, 2), o);
};
}
function jo(e) {
return Ui(function(t, n) {
var i = -1, o = n.length, a = o > 1 ? n[o - 1] : r, s = o > 2 ? n[2] : r;
a = e.length > 3 && "function" == typeof a ? (o--, a) : r;
if (s && Ia(n[0], n[1], s)) {
a = o < 3 ? r : a;
o = 1;
}
t = Qe(t);
for (;++i < o; ) {
var u = n[i];
u && e(t, u, i, a);
}
return t;
});
}
function Mo(e, t) {
return function(n, r) {
if (null == n) return n;
if (!iu(n)) return e(n, r);
for (var i = n.length, o = t ? i : -1, a = Qe(n); (t ? o-- : ++o < i) && !1 !== r(a[o], o, a); ) ;
return n;
};
}
function Po(e) {
return function(t, n, r) {
for (var i = -1, o = Qe(t), a = r(t), s = a.length; s--; ) {
var u = a[e ? s : ++i];
if (!1 === n(o[u], u, o)) break;
}
return t;
};
}
function Fo(e, t, n) {
var r = t & g, i = Jo(e);
return function t() {
return (this && this !== Ot && this instanceof t ? i : e).apply(r ? n : this, arguments);
};
}
function Oo(e) {
return function(t) {
var n = Pn(t = Fu(t)) ? Gn(t) : r, i = n ? n[0] : t.charAt(0), o = n ? co(n, 1).join("") : t.slice(1);
return i[e]() + o;
};
}
function Lo(e) {
return function(t) {
return Qt(cc(tc(t).replace(_t, "")), e, "");
};
}
function Jo(e) {
return function() {
var t = arguments;
switch (t.length) {
case 0:
return new e();

case 1:
return new e(t[0]);

case 2:
return new e(t[0], t[1]);

case 3:
return new e(t[0], t[1], t[2]);

case 4:
return new e(t[0], t[1], t[2], t[3]);

case 5:
return new e(t[0], t[1], t[2], t[3], t[4]);

case 6:
return new e(t[0], t[1], t[2], t[3], t[4], t[5]);

case 7:
return new e(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
}
var n = Cr(e.prototype), r = e.apply(n, t);
return fu(r) ? r : n;
};
}
function xo(e, t, i) {
var o = Jo(e);
return function a() {
for (var s = arguments.length, u = n(s), c = s, l = sa(a); c--; ) u[c] = arguments[c];
var d = s < 3 && u[0] !== l && u[s - 1] !== l ? [] : xn(u, l);
return (s -= d.length) < i ? Bo(e, t, Ho, a.placeholder, r, u, d, r, r, i - s) : Nt(this && this !== Ot && this instanceof a ? o : e, this, u);
};
}
function To(e) {
return function(t, n, i) {
var o = Qe(t);
if (!iu(t)) {
var a = ua(n, 3);
t = Nu(t);
n = function(e) {
return a(o[e], e, o);
};
}
var s = e(t, n, i);
return s > -1 ? o[a ? t[s] : s] : r;
};
}
function So(e) {
return na(function(t) {
var n = t.length, i = n, o = yr.prototype.thru;
e && t.reverse();
for (;i--; ) {
var s = t[i];
if ("function" != typeof s) throw new nt(a);
if (o && !u && "wrapper" == aa(s)) var u = new yr([], !0);
}
i = u ? i : n;
for (;++i < n; ) {
var c = aa(s = t[i]), l = "wrapper" == c ? oa(s) : r;
u = l && Ma(l[0]) && l[1] == (R | m | w | A) && !l[4].length && 1 == l[9] ? u[aa(l[0])].apply(u, l[3]) : 1 == s.length && Ma(s) ? u[c]() : u.thru(s);
}
return function() {
var e = arguments, r = e[0];
if (u && 1 == e.length && nu(r)) return u.plant(r).value();
for (var i = 0, o = n ? t[i].apply(this, e) : r; ++i < n; ) o = t[i].call(this, o);
return o;
};
});
}
function Ho(e, t, i, o, a, s, u, c, l, d) {
var f = t & R, h = t & g, p = t & _, v = t & (m | C), w = t & b, y = p ? r : Jo(e);
return function r() {
for (var g = arguments.length, _ = n(g), m = g; m--; ) _[m] = arguments[m];
if (v) var C = sa(r), R = bn(_, C);
o && (_ = wo(_, o, a, v));
s && (_ = yo(_, s, u, v));
g -= R;
if (v && g < d) {
var A = xn(_, C);
return Bo(e, t, Ho, r.placeholder, i, _, A, c, l, d - g);
}
var b = h ? i : this, I = p ? b[e] : e;
g = _.length;
c ? _ = ka(_, c) : w && g > 1 && _.reverse();
f && l < g && (_.length = l);
this && this !== Ot && this instanceof r && (I = y || Jo(I));
return I.apply(b, _);
};
}
function Uo(e, t) {
return function(n, r) {
return fi(n, e, t(r), {});
};
}
function ko(e, t) {
return function(n, i) {
var o;
if (n === r && i === r) return t;
n !== r && (o = n);
if (i !== r) {
if (o === r) return i;
if ("string" == typeof n || "string" == typeof i) {
n = Xi(n);
i = Xi(i);
} else {
n = Yi(n);
i = Yi(i);
}
o = e(n, i);
}
return o;
};
}
function Go(e) {
return na(function(t) {
t = Xt(t, Cn(ua()));
return Ui(function(n) {
var r = this;
return e(t, function(e) {
return Nt(e, r, n);
});
});
});
}
function Vo(e, t) {
var n = (t = t === r ? " " : Xi(t)).length;
if (n < 2) return n ? Hi(t, e) : t;
var i = Hi(t, Hn(e / kn(t)));
return Pn(t) ? co(Gn(i), 0, e).join("") : i.slice(0, e);
}
function Wo(e, t, r, i) {
var o = t & g, a = Jo(e);
return function t() {
for (var s = -1, u = arguments.length, c = -1, l = i.length, d = n(l + u), f = this && this !== Ot && this instanceof t ? a : e; ++c < l; ) d[c] = i[c];
for (;u--; ) d[c++] = arguments[++s];
return Nt(f, o ? r : this, d);
};
}
function No(e) {
return function(t, n, i) {
i && "number" != typeof i && Ia(t, n, i) && (n = i = r);
t = Iu(t);
if (n === r) {
n = t;
t = 0;
} else n = Iu(n);
return Si(t, n, i = i === r ? t < n ? 1 : -1 : Iu(i), e);
};
}
function Do(e) {
return function(t, n) {
if ("string" != typeof t || "string" != typeof n) {
t = Mu(t);
n = Mu(n);
}
return e(t, n);
};
}
function Bo(e, t, n, i, o, a, s, u, c, l) {
var d = t & m;
t |= d ? w : y;
(t &= ~(d ? y : w)) & v || (t &= ~(g | _));
var f = [ e, t, o, d ? a : r, d ? s : r, d ? r : a, d ? r : s, u, c, l ], h = n.apply(r, f);
Ma(e) && Va(h, f);
h.placeholder = i;
return Da(h, e, t);
}
function Ko(e) {
var t = $e[e];
return function(e, n) {
e = Mu(e);
if (n = null == n ? 0 : Xn(Eu(n), 292)) {
var r = (Fu(e) + "e").split("e");
return +((r = (Fu(t(r[0] + "e" + (+r[1] + n))) + "e").split("e"))[0] + "e" + (+r[1] - n));
}
return t(e);
};
}
var zo = or && 1 / Tn(new or([ , -0 ]))[1] == O ? function(e) {
return new or(e);
} : wc;
function Zo(e) {
return function(t) {
var n = ga(t);
return n == Z ? Ln(t) : n == ee ? Sn(t) : mn(t, e(t));
};
}
function qo(e, t, n, i, o, s, u, c) {
var l = t & _;
if (!l && "function" != typeof e) throw new nt(a);
var d = i ? i.length : 0;
if (!d) {
t &= ~(w | y);
i = o = r;
}
u = u === r ? u : Yn(Eu(u), 0);
c = c === r ? c : Eu(c);
d -= o ? o.length : 0;
if (t & y) {
var f = i, h = o;
i = o = r;
}
var p = l ? r : oa(e), v = [ e, t, n, i, o, f, h, s, u, c ];
p && xa(v, p);
e = v[0];
t = v[1];
n = v[2];
i = v[3];
o = v[4];
!(c = v[9] = v[9] === r ? l ? 0 : e.length : Yn(v[9] - d, 0)) && t & (m | C) && (t &= ~(m | C));
if (t && t != g) R = t == m || t == C ? xo(e, t, c) : t != w && t != (g | w) || o.length ? Ho.apply(r, v) : Wo(e, t, n, i); else var R = Fo(e, t, n);
return Da((p ? Wi : Va)(R, v), e, t);
}
function Yo(e, t, n, i) {
return e === r || $s(e, ot[n]) && !ut.call(i, n) ? t : e;
}
function Xo(e, t, n, i, o, a) {
if (fu(e) && fu(t)) {
a.set(t, e);
Ei(e, t, r, Xo, a);
a.delete(t);
}
return e;
}
function $o(e) {
return _u(e) ? r : e;
}
function Qo(e, t, n, i, o, a) {
var s = n & h, u = e.length, c = t.length;
if (u != c && !(s && c > u)) return !1;
var l = a.get(e);
if (l && a.get(t)) return l == t;
var d = -1, f = !0, g = n & p ? new Er() : r;
a.set(e, t);
a.set(t, e);
for (;++d < u; ) {
var _ = e[d], v = t[d];
if (i) var m = s ? i(v, _, d, t, e, a) : i(_, v, d, e, t, a);
if (m !== r) {
if (m) continue;
f = !1;
break;
}
if (g) {
if (!tn(t, function(e, t) {
if (!yn(g, t) && (_ === e || o(_, e, n, i, a))) return g.push(t);
})) {
f = !1;
break;
}
} else if (_ !== v && !o(_, v, n, i, a)) {
f = !1;
break;
}
}
a.delete(e);
a.delete(t);
return f;
}
function ea(e, t, n, r, i, o, a) {
switch (n) {
case se:
if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1;
e = e.buffer;
t = t.buffer;

case ae:
return !(e.byteLength != t.byteLength || !o(new Ct(e), new Ct(t)));

case W:
case N:
case q:
return $s(+e, +t);

case B:
return e.name == t.name && e.message == t.message;

case Q:
case te:
return e == t + "";

case Z:
var s = Ln;

case ee:
var u = r & h;
s || (s = Tn);
if (e.size != t.size && !u) return !1;
var c = a.get(e);
if (c) return c == t;
r |= p;
a.set(e, t);
var l = Qo(s(e), s(t), r, i, o, a);
a.delete(e);
return l;

case ne:
if (_r) return _r.call(e) == _r.call(t);
}
return !1;
}
function ta(e, t, n, i, o, a) {
var s = n & h, u = ra(e), c = u.length;
if (c != ra(t).length && !s) return !1;
for (var l = c; l--; ) {
var d = u[l];
if (!(s ? d in t : ut.call(t, d))) return !1;
}
var f = a.get(e);
if (f && a.get(t)) return f == t;
var p = !0;
a.set(e, t);
a.set(t, e);
for (var g = s; ++l < c; ) {
var _ = e[d = u[l]], v = t[d];
if (i) var m = s ? i(v, _, d, t, e, a) : i(_, v, d, e, t, a);
if (!(m === r ? _ === v || o(_, v, n, i, a) : m)) {
p = !1;
break;
}
g || (g = "constructor" == d);
}
if (p && !g) {
var C = e.constructor, w = t.constructor;
C != w && "constructor" in e && "constructor" in t && !("function" == typeof C && C instanceof C && "function" == typeof w && w instanceof w) && (p = !1);
}
a.delete(e);
a.delete(t);
return p;
}
function na(e) {
return Na(Ha(e, r, rs), e + "");
}
function ra(e) {
return oi(e, Nu, ha);
}
function ia(e) {
return oi(e, Du, pa);
}
var oa = ur ? function(e) {
return ur.get(e);
} : wc;
function aa(e) {
for (var t = e.name + "", n = cr[t], r = ut.call(cr, t) ? n.length : 0; r--; ) {
var i = n[r], o = i.func;
if (null == o || o == e) return i.name;
}
return t;
}
function sa(e) {
return (ut.call(mr, "placeholder") ? mr : e).placeholder;
}
function ua() {
var e = mr.iteratee || _c;
e = e === _c ? Ci : e;
return arguments.length ? e(arguments[0], arguments[1]) : e;
}
function ca(e, t) {
var n = e.__data__;
return ja(t) ? n["string" == typeof t ? "string" : "hash"] : n.map;
}
function la(e) {
for (var t = Nu(e), n = t.length; n--; ) {
var r = t[n], i = e[r];
t[n] = [ r, i, La(i) ];
}
return t;
}
function da(e, t) {
var n = Mn(e, t);
return mi(n) ? n : r;
}
function fa(e) {
var t = ut.call(e, Tt), n = e[Tt];
try {
e[Tt] = r;
var i = !0;
} catch (e) {}
var o = dt.call(e);
i && (t ? e[Tt] = n : delete e[Tt]);
return o;
}
var ha = Nn ? function(e) {
if (null == e) return [];
e = Qe(e);
return Zt(Nn(e), function(t) {
return Pt.call(e, t);
});
} : jc, pa = Nn ? function(e) {
for (var t = []; e; ) {
$t(t, ha(e));
e = yt(e);
}
return t;
} : jc, ga = ai;
(nr && ga(new nr(new ArrayBuffer(1))) != se || rr && ga(new rr()) != Z || ir && "[object Promise]" != ga(ir.resolve()) || or && ga(new or()) != ee || ar && ga(new ar()) != ie) && (ga = function(e) {
var t = ai(e), n = t == X ? e.constructor : r, i = n ? qa(n) : "";
if (i) switch (i) {
case lr:
return se;

case dr:
return Z;

case fr:
return "[object Promise]";

case hr:
return ee;

case pr:
return ie;
}
return t;
});
function _a(e, t, n) {
for (var r = -1, i = n.length; ++r < i; ) {
var o = n[r], a = o.size;
switch (o.type) {
case "drop":
e += a;
break;

case "dropRight":
t -= a;
break;

case "take":
t = Xn(t, e + a);
break;

case "takeRight":
e = Yn(e, t - a);
}
}
return {
start: e,
end: t
};
}
function va(e) {
var t = e.match(Se);
return t ? t[1].split(He) : [];
}
function ma(e, t, n) {
for (var r = -1, i = (t = so(t, e)).length, o = !1; ++r < i; ) {
var a = Za(t[r]);
if (!(o = null != e && n(e, a))) break;
e = e[a];
}
return o || ++r != i ? o : !!(i = null == e ? 0 : e.length) && du(i) && ba(a, i) && (nu(e) || tu(e));
}
function Ca(e) {
var t = e.length, n = new e.constructor(t);
if (t && "string" == typeof e[0] && ut.call(e, "index")) {
n.index = e.index;
n.input = e.input;
}
return n;
}
function wa(e) {
return "function" != typeof e.constructor || Oa(e) ? {} : Cr(yt(e));
}
function ya(e, t, n) {
var r = e.constructor;
switch (t) {
case ae:
return ho(e);

case W:
case N:
return new r(+e);

case se:
return po(e, n);

case ue:
case ce:
case le:
case de:
case fe:
case he:
case pe:
case ge:
case _e:
return vo(e, n);

case Z:
return new r();

case q:
case te:
return new r(e);

case Q:
return go(e);

case ee:
return new r();

case ne:
return _o(e);
}
}
function Ra(e, t) {
var n = t.length;
if (!n) return e;
var r = n - 1;
t[r] = (n > 1 ? "& " : "") + t[r];
t = t.join(n > 2 ? ", " : " ");
return e.replace(Te, "{\n/* [wrapped with " + t + "] */\n");
}
function Aa(e) {
return nu(e) || tu(e) || !!(Lt && e && e[Lt]);
}
function ba(e, t) {
var n = typeof e;
return !!(t = null == t ? L : t) && ("number" == n || "symbol" != n && Ke.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
function Ia(e, t, n) {
if (!fu(n)) return !1;
var r = typeof t;
return !!("number" == r ? iu(n) && ba(t, n.length) : "string" == r && t in n) && $s(n[t], e);
}
function Ea(e, t) {
if (nu(e)) return !1;
var n = typeof e;
return !("number" != n && "symbol" != n && "boolean" != n && null != e && !wu(e)) || Me.test(e) || !je.test(e) || null != t && e in Qe(t);
}
function ja(e) {
var t = typeof e;
return "string" == t || "number" == t || "symbol" == t || "boolean" == t ? "__proto__" !== e : null === e;
}
function Ma(e) {
var t = aa(e), n = mr[t];
if ("function" != typeof n || !(t in Rr.prototype)) return !1;
if (e === n) return !0;
var r = oa(n);
return !!r && e === r[0];
}
function Pa(e) {
return !!lt && lt in e;
}
var Fa = at ? cu : Mc;
function Oa(e) {
var t = e && e.constructor;
return e === ("function" == typeof t && t.prototype || ot);
}
function La(e) {
return e == e && !fu(e);
}
function Ja(e, t) {
return function(n) {
return null != n && n[e] === t && (t !== r || e in Qe(n));
};
}
function xa(e, t) {
var n = e[1], r = t[1], i = n | r, o = i < (g | _ | R), a = r == R && n == m || r == R && n == A && e[7].length <= t[8] || r == (R | A) && t[7].length <= t[8] && n == m;
if (!o && !a) return e;
if (r & g) {
e[2] = t[2];
i |= n & g ? 0 : v;
}
var s = t[3];
if (s) {
var u = e[3];
e[3] = u ? wo(u, s, t[4]) : s;
e[4] = u ? xn(e[3], c) : t[4];
}
if (s = t[5]) {
u = e[5];
e[5] = u ? yo(u, s, t[6]) : s;
e[6] = u ? xn(e[5], c) : t[6];
}
(s = t[7]) && (e[7] = s);
r & R && (e[8] = null == e[8] ? t[8] : Xn(e[8], t[8]));
null == e[9] && (e[9] = t[9]);
e[0] = t[0];
e[1] = i;
return e;
}
function Ta(e) {
var t = [];
if (null != e) for (var n in Qe(e)) t.push(n);
return t;
}
function Sa(e) {
return dt.call(e);
}
function Ha(e, t, i) {
t = Yn(t === r ? e.length - 1 : t, 0);
return function() {
for (var r = arguments, o = -1, a = Yn(r.length - t, 0), s = n(a); ++o < a; ) s[o] = r[t + o];
o = -1;
for (var u = n(t + 1); ++o < t; ) u[o] = r[o];
u[t] = i(s);
return Nt(e, this, u);
};
}
function Ua(e, t) {
return t.length < 2 ? e : ii(e, Bi(t, 0, -1));
}
function ka(e, t) {
for (var n = e.length, i = Xn(t.length, n), o = Ro(e); i--; ) {
var a = t[i];
e[i] = ba(a, n) ? o[a] : r;
}
return e;
}
function Ga(e, t) {
if ("__proto__" != t) return e[t];
}
var Va = Ba(Wi), Wa = hn || function(e, t) {
return Ot.setTimeout(e, t);
}, Na = Ba(Ni);
function Da(e, t, n) {
var r = t + "";
return Na(e, Ra(r, Ya(va(r), n)));
}
function Ba(e) {
var t = 0, n = 0;
return function() {
var i = $n(), o = M - (i - n);
n = i;
if (o > 0) {
if (++t >= j) return arguments[0];
} else t = 0;
return e.apply(r, arguments);
};
}
function Ka(e, t) {
var n = -1, i = e.length, o = i - 1;
t = t === r ? i : t;
for (;++n < t; ) {
var a = Ti(n, o), s = e[a];
e[a] = e[n];
e[n] = s;
}
e.length = t;
return e;
}
var za = function(e) {
var t = Ks(e, function(e) {
n.size === u && n.clear();
return e;
}), n = t.cache;
return t;
}(function(e) {
var t = [];
46 === e.charCodeAt(0) && t.push("");
e.replace(Pe, function(e, n, r, i) {
t.push(r ? i.replace(ke, "$1") : n || e);
});
return t;
});
function Za(e) {
if ("string" == typeof e || wu(e)) return e;
var t = e + "";
return "0" == t && 1 / e == -O ? "-0" : t;
}
function qa(e) {
if (null != e) {
try {
return st.call(e);
} catch (e) {}
try {
return e + "";
} catch (e) {}
}
return "";
}
function Ya(e, t) {
Bt(U, function(n) {
var r = "_." + n[0];
t & n[1] && !qt(e, r) && e.push(r);
});
return e.sort();
}
function Xa(e) {
if (e instanceof Rr) return e.clone();
var t = new yr(e.__wrapped__, e.__chain__);
t.__actions__ = Ro(e.__actions__);
t.__index__ = e.__index__;
t.__values__ = e.__values__;
return t;
}
var $a = Ui(function(e, t) {
return ou(e) ? Br(e, $r(t, 1, ou, !0)) : [];
}), Qa = Ui(function(e, t) {
var n = us(t);
ou(n) && (n = r);
return ou(e) ? Br(e, $r(t, 1, ou, !0), ua(n, 2)) : [];
}), es = Ui(function(e, t) {
var n = us(t);
ou(n) && (n = r);
return ou(e) ? Br(e, $r(t, 1, ou, !0), r, n) : [];
});
function ts(e, t, n) {
var r = null == e ? 0 : e.length;
if (!r) return -1;
var i = null == n ? 0 : Eu(n);
i < 0 && (i = Yn(r + i, 0));
return sn(e, ua(t, 3), i);
}
function ns(e, t, n) {
var i = null == e ? 0 : e.length;
if (!i) return -1;
var o = i - 1;
if (n !== r) {
o = Eu(n);
o = n < 0 ? Yn(i + o, 0) : Xn(o, i - 1);
}
return sn(e, ua(t, 3), o, !0);
}
function rs(e) {
return null != e && e.length ? $r(e, 1) : [];
}
function is(e) {
return e && e.length ? e[0] : r;
}
var os = Ui(function(e) {
var t = Xt(e, oo);
return t.length && t[0] === e[0] ? di(t) : [];
}), as = Ui(function(e) {
var t = us(e), n = Xt(e, oo);
t === us(n) ? t = r : n.pop();
return n.length && n[0] === e[0] ? di(n, ua(t, 2)) : [];
}), ss = Ui(function(e) {
var t = us(e), n = Xt(e, oo);
(t = "function" == typeof t ? t : r) && n.pop();
return n.length && n[0] === e[0] ? di(n, r, t) : [];
});
function us(e) {
var t = null == e ? 0 : e.length;
return t ? e[t - 1] : r;
}
var cs = Ui(ls);
function ls(e, t) {
return e && e.length && t && t.length ? Ji(e, t) : e;
}
var ds = na(function(e, t) {
var n = null == e ? 0 : e.length, r = kr(e, t);
xi(e, Xt(t, function(e) {
return ba(e, n) ? +e : e;
}).sort(mo));
return r;
});
function fs(e) {
return null == e ? e : tr.call(e);
}
var hs = Ui(function(e) {
return $i($r(e, 1, ou, !0));
}), ps = Ui(function(e) {
var t = us(e);
ou(t) && (t = r);
return $i($r(e, 1, ou, !0), ua(t, 2));
}), gs = Ui(function(e) {
var t = us(e);
t = "function" == typeof t ? t : r;
return $i($r(e, 1, ou, !0), r, t);
});
function _s(e) {
if (!e || !e.length) return [];
var t = 0;
e = Zt(e, function(e) {
if (ou(e)) {
t = Yn(e.length, t);
return !0;
}
});
return vn(t, function(t) {
return Xt(e, fn(t));
});
}
function vs(e, t) {
if (!e || !e.length) return [];
var n = _s(e);
return null == t ? n : Xt(n, function(e) {
return Nt(t, r, e);
});
}
var ms = Ui(function(e, t) {
return ou(e) ? Br(e, t) : [];
}), Cs = Ui(function(e) {
return ro(Zt(e, ou));
}), ws = Ui(function(e) {
var t = us(e);
ou(t) && (t = r);
return ro(Zt(e, ou), ua(t, 2));
}), ys = Ui(function(e) {
var t = us(e);
t = "function" == typeof t ? t : r;
return ro(Zt(e, ou), r, t);
}), Rs = Ui(_s);
var As = Ui(function(e) {
var t = e.length, n = t > 1 ? e[t - 1] : r;
return vs(e, n = "function" == typeof n ? (e.pop(), n) : r);
});
function bs(e) {
var t = mr(e);
t.__chain__ = !0;
return t;
}
function Is(e, t) {
return t(e);
}
var Es = na(function(e) {
var t = e.length, n = t ? e[0] : 0, i = this.__wrapped__, o = function(t) {
return kr(t, e);
};
if (t > 1 || this.__actions__.length || !(i instanceof Rr) || !ba(n)) return this.thru(o);
(i = i.slice(n, +n + (t ? 1 : 0))).__actions__.push({
func: Is,
args: [ o ],
thisArg: r
});
return new yr(i, this.__chain__).thru(function(e) {
t && !e.length && e.push(r);
return e;
});
});
var js = Eo(function(e, t, n) {
ut.call(e, n) ? ++e[n] : Ur(e, n, 1);
});
var Ms = To(ts), Ps = To(ns);
function Fs(e, t) {
return (nu(e) ? Bt : Kr)(e, ua(t, 3));
}
function Os(e, t) {
return (nu(e) ? Kt : zr)(e, ua(t, 3));
}
var Ls = Eo(function(e, t, n) {
ut.call(e, n) ? e[n].push(t) : Ur(e, n, [ t ]);
});
var Js = Ui(function(e, t, r) {
var i = -1, o = "function" == typeof t, a = iu(e) ? n(e.length) : [];
Kr(e, function(e) {
a[++i] = o ? Nt(t, e, r) : hi(e, t, r);
});
return a;
}), xs = Eo(function(e, t, n) {
Ur(e, n, t);
});
function Ts(e, t) {
return (nu(e) ? Xt : Ai)(e, ua(t, 3));
}
var Ss = Eo(function(e, t, n) {
e[n ? 0 : 1].push(t);
}, function() {
return [ [], [] ];
});
var Hs = Ui(function(e, t) {
if (null == e) return [];
var n = t.length;
n > 1 && Ia(e, t[0], t[1]) ? t = [] : n > 2 && Ia(t[0], t[1], t[2]) && (t = [ t[0] ]);
return Pi(e, $r(t, 1), []);
}), Us = rn || function() {
return Ot.Date.now();
};
function ks(e, t, n) {
t = n ? r : t;
t = e && null == t ? e.length : t;
return qo(e, R, r, r, r, r, t);
}
function Gs(e, t) {
var n;
if ("function" != typeof t) throw new nt(a);
e = Eu(e);
return function() {
--e > 0 && (n = t.apply(this, arguments));
e <= 1 && (t = r);
return n;
};
}
var Vs = Ui(function(e, t, n) {
var r = g;
if (n.length) {
var i = xn(n, sa(Vs));
r |= w;
}
return qo(e, r, t, n, i);
}), Ws = Ui(function(e, t, n) {
var r = g | _;
if (n.length) {
var i = xn(n, sa(Ws));
r |= w;
}
return qo(t, r, e, n, i);
});
function Ns(e, t, n) {
var i, o, s, u, c, l, d = 0, f = !1, h = !1, p = !0;
if ("function" != typeof e) throw new nt(a);
t = Mu(t) || 0;
if (fu(n)) {
f = !!n.leading;
s = (h = "maxWait" in n) ? Yn(Mu(n.maxWait) || 0, t) : s;
p = "trailing" in n ? !!n.trailing : p;
}
function g(t) {
var n = i, a = o;
i = o = r;
d = t;
return u = e.apply(a, n);
}
function _(e) {
d = e;
c = Wa(C, t);
return f ? g(e) : u;
}
function v(e) {
var n = t - (e - l);
return h ? Xn(n, s - (e - d)) : n;
}
function m(e) {
var n = e - l;
return l === r || n >= t || n < 0 || h && e - d >= s;
}
function C() {
var e = Us();
if (m(e)) return w(e);
c = Wa(C, v(e));
}
function w(e) {
c = r;
if (p && i) return g(e);
i = o = r;
return u;
}
function y() {
var e = Us(), n = m(e);
i = arguments;
o = this;
l = e;
if (n) {
if (c === r) return _(l);
if (h) {
c = Wa(C, t);
return g(l);
}
}
c === r && (c = Wa(C, t));
return u;
}
y.cancel = function() {
c !== r && lo(c);
d = 0;
i = l = o = c = r;
};
y.flush = function() {
return c === r ? u : w(Us());
};
return y;
}
var Ds = Ui(function(e, t) {
return Dr(e, 1, t);
}), Bs = Ui(function(e, t, n) {
return Dr(e, Mu(t) || 0, n);
});
function Ks(e, t) {
if ("function" != typeof e || null != t && "function" != typeof t) throw new nt(a);
var n = function() {
var r = arguments, i = t ? t.apply(this, r) : r[0], o = n.cache;
if (o.has(i)) return o.get(i);
var a = e.apply(this, r);
n.cache = o.set(i, a) || o;
return a;
};
n.cache = new (Ks.Cache || Ir)();
return n;
}
Ks.Cache = Ir;
function zs(e) {
if ("function" != typeof e) throw new nt(a);
return function() {
var t = arguments;
switch (t.length) {
case 0:
return !e.call(this);

case 1:
return !e.call(this, t[0]);

case 2:
return !e.call(this, t[0], t[1]);

case 3:
return !e.call(this, t[0], t[1], t[2]);
}
return !e.apply(this, t);
};
}
var Zs = uo(function(e, t) {
var n = (t = 1 == t.length && nu(t[0]) ? Xt(t[0], Cn(ua())) : Xt($r(t, 1), Cn(ua()))).length;
return Ui(function(r) {
for (var i = -1, o = Xn(r.length, n); ++i < o; ) r[i] = t[i].call(this, r[i]);
return Nt(e, this, r);
});
}), qs = Ui(function(e, t) {
var n = xn(t, sa(qs));
return qo(e, w, r, t, n);
}), Ys = Ui(function(e, t) {
var n = xn(t, sa(Ys));
return qo(e, y, r, t, n);
}), Xs = na(function(e, t) {
return qo(e, A, r, r, r, t);
});
function $s(e, t) {
return e === t || e != e && t != t;
}
var Qs = Do(si), eu = Do(function(e, t) {
return e >= t;
}), tu = pi(function() {
return arguments;
}()) ? pi : function(e) {
return hu(e) && ut.call(e, "callee") && !Pt.call(e, "callee");
}, nu = n.isArray, ru = Ht ? Cn(Ht) : function(e) {
return hu(e) && ai(e) == ae;
};
function iu(e) {
return null != e && du(e.length) && !cu(e);
}
function ou(e) {
return hu(e) && iu(e);
}
var au = Kn || Mc, su = Ut ? Cn(Ut) : function(e) {
return hu(e) && ai(e) == N;
};
function uu(e) {
if (!hu(e)) return !1;
var t = ai(e);
return t == B || t == D || "string" == typeof e.message && "string" == typeof e.name && !_u(e);
}
function cu(e) {
if (!fu(e)) return !1;
var t = ai(e);
return t == K || t == z || t == V || t == $;
}
function lu(e) {
return "number" == typeof e && e == Eu(e);
}
function du(e) {
return "number" == typeof e && e > -1 && e % 1 == 0 && e <= L;
}
function fu(e) {
var t = typeof e;
return null != e && ("object" == t || "function" == t);
}
function hu(e) {
return null != e && "object" == typeof e;
}
var pu = kt ? Cn(kt) : function(e) {
return hu(e) && ga(e) == Z;
};
function gu(e) {
return "number" == typeof e || hu(e) && ai(e) == q;
}
function _u(e) {
if (!hu(e) || ai(e) != X) return !1;
var t = yt(e);
if (null === t) return !0;
var n = ut.call(t, "constructor") && t.constructor;
return "function" == typeof n && n instanceof n && st.call(n) == ft;
}
var vu = Gt ? Cn(Gt) : function(e) {
return hu(e) && ai(e) == Q;
};
var mu = Vt ? Cn(Vt) : function(e) {
return hu(e) && ga(e) == ee;
};
function Cu(e) {
return "string" == typeof e || !nu(e) && hu(e) && ai(e) == te;
}
function wu(e) {
return "symbol" == typeof e || hu(e) && ai(e) == ne;
}
var yu = Wt ? Cn(Wt) : function(e) {
return hu(e) && du(e.length) && !!bt[ai(e)];
};
var Ru = Do(Ri), Au = Do(function(e, t) {
return e <= t;
});
function bu(e) {
if (!e) return [];
if (iu(e)) return Cu(e) ? Gn(e) : Ro(e);
if (Jt && e[Jt]) return On(e[Jt]());
var t = ga(e);
return (t == Z ? Ln : t == ee ? Tn : $u)(e);
}
function Iu(e) {
return e ? (e = Mu(e)) === O || e === -O ? (e < 0 ? -1 : 1) * J : e == e ? e : 0 : 0 === e ? e : 0;
}
function Eu(e) {
var t = Iu(e), n = t % 1;
return t == t ? n ? t - n : t : 0;
}
function ju(e) {
return e ? Gr(Eu(e), 0, T) : 0;
}
function Mu(e) {
if ("number" == typeof e) return e;
if (wu(e)) return x;
if (fu(e)) {
var t = "function" == typeof e.valueOf ? e.valueOf() : e;
e = fu(t) ? t + "" : t;
}
if ("string" != typeof e) return 0 === e ? e : +e;
e = e.replace(Le, "");
var n = Ne.test(e);
return n || Be.test(e) ? Mt(e.slice(2), n ? 2 : 8) : We.test(e) ? x : +e;
}
function Pu(e) {
return Ao(e, Du(e));
}
function Fu(e) {
return null == e ? "" : Xi(e);
}
var Ou = jo(function(e, t) {
if (Oa(t) || iu(t)) Ao(t, Nu(t), e); else for (var n in t) ut.call(t, n) && Jr(e, n, t[n]);
}), Lu = jo(function(e, t) {
Ao(t, Du(t), e);
}), Ju = jo(function(e, t, n, r) {
Ao(t, Du(t), e, r);
}), xu = jo(function(e, t, n, r) {
Ao(t, Nu(t), e, r);
}), Tu = na(kr);
var Su = Ui(function(e, t) {
e = Qe(e);
var n = -1, i = t.length, o = i > 2 ? t[2] : r;
o && Ia(t[0], t[1], o) && (i = 1);
for (;++n < i; ) for (var a = t[n], s = Du(a), u = -1, c = s.length; ++u < c; ) {
var l = s[u], d = e[l];
(d === r || $s(d, ot[l]) && !ut.call(e, l)) && (e[l] = a[l]);
}
return e;
}), Hu = Ui(function(e) {
e.push(r, Xo);
return Nt(Ku, r, e);
});
function Uu(e, t, n) {
var i = null == e ? r : ii(e, t);
return i === r ? n : i;
}
function ku(e, t) {
return null != e && ma(e, t, ci);
}
var Gu = Uo(function(e, t, n) {
null != t && "function" != typeof t.toString && (t = dt.call(t));
e[t] = n;
}, fc(gc)), Vu = Uo(function(e, t, n) {
null != t && "function" != typeof t.toString && (t = dt.call(t));
ut.call(e, t) ? e[t].push(n) : e[t] = [ n ];
}, ua), Wu = Ui(hi);
function Nu(e) {
return iu(e) ? Mr(e) : wi(e);
}
function Du(e) {
return iu(e) ? Mr(e, !0) : yi(e);
}
var Bu = jo(function(e, t, n) {
Ei(e, t, n);
}), Ku = jo(function(e, t, n, r) {
Ei(e, t, n, r);
}), zu = na(function(e, t) {
var n = {};
if (null == e) return n;
var r = !1;
t = Xt(t, function(t) {
t = so(t, e);
r || (r = t.length > 1);
return t;
});
Ao(e, ia(e), n);
r && (n = Vr(n, l | d | f, $o));
for (var i = t.length; i--; ) Qi(n, t[i]);
return n;
});
var Zu = na(function(e, t) {
return null == e ? {} : Fi(e, t);
});
function qu(e, t) {
if (null == e) return {};
var n = Xt(ia(e), function(e) {
return [ e ];
});
t = ua(t);
return Oi(e, n, function(e, n) {
return t(e, n[0]);
});
}
var Yu = Zo(Nu), Xu = Zo(Du);
function $u(e) {
return null == e ? [] : wn(e, Nu(e));
}
var Qu = Lo(function(e, t, n) {
t = t.toLowerCase();
return e + (n ? ec(t) : t);
});
function ec(e) {
return uc(Fu(e).toLowerCase());
}
function tc(e) {
return (e = Fu(e)) && e.replace(ze, In).replace(vt, "");
}
var nc = Lo(function(e, t, n) {
return e + (n ? "-" : "") + t.toLowerCase();
}), rc = Lo(function(e, t, n) {
return e + (n ? " " : "") + t.toLowerCase();
}), ic = Oo("toLowerCase");
var oc = Lo(function(e, t, n) {
return e + (n ? "_" : "") + t.toLowerCase();
});
var ac = Lo(function(e, t, n) {
return e + (n ? " " : "") + uc(t);
});
var sc = Lo(function(e, t, n) {
return e + (n ? " " : "") + t.toUpperCase();
}), uc = Oo("toUpperCase");
function cc(e, t, n) {
e = Fu(e);
return (t = n ? r : t) === r ? Fn(e) ? Dn(e) : on(e) : e.match(t) || [];
}
var lc = Ui(function(e, t) {
try {
return Nt(e, r, t);
} catch (e) {
return uu(e) ? e : new Ye(e);
}
}), dc = na(function(e, t) {
Bt(t, function(t) {
t = Za(t);
Ur(e, t, Vs(e[t], e));
});
return e;
});
function fc(e) {
return function() {
return e;
};
}
var hc = So(), pc = So(!0);
function gc(e) {
return e;
}
function _c(e) {
return Ci("function" == typeof e ? e : Vr(e, l));
}
var vc = Ui(function(e, t) {
return function(n) {
return hi(n, e, t);
};
}), mc = Ui(function(e, t) {
return function(n) {
return hi(e, n, t);
};
});
function Cc(e, t, n) {
var r = Nu(t), i = ri(t, r);
if (null == n && (!fu(t) || !i.length && r.length)) {
n = t;
t = e;
e = this;
i = ri(t, Nu(t));
}
var o = !(fu(n) && "chain" in n && !n.chain), a = cu(e);
Bt(i, function(n) {
var r = t[n];
e[n] = r;
a && (e.prototype[n] = function() {
var t = this.__chain__;
if (o || t) {
var n = e(this.__wrapped__);
(n.__actions__ = Ro(this.__actions__)).push({
func: r,
args: arguments,
thisArg: e
});
n.__chain__ = t;
return n;
}
return r.apply(e, $t([ this.value() ], arguments));
});
});
return e;
}
function wc() {}
var yc = Go(Xt), Rc = Go(zt), Ac = Go(tn);
function bc(e) {
return Ea(e) ? fn(Za(e)) : Li(e);
}
var Ic = No(), Ec = No(!0);
function jc() {
return [];
}
function Mc() {
return !1;
}
var Pc = ko(function(e, t) {
return e + t;
}, 0), Fc = Ko("ceil"), Oc = ko(function(e, t) {
return e / t;
}, 1), Lc = Ko("floor");
var Jc = ko(function(e, t) {
return e * t;
}, 1), xc = Ko("round"), Tc = ko(function(e, t) {
return e - t;
}, 0);
mr.after = function(e, t) {
if ("function" != typeof t) throw new nt(a);
e = Eu(e);
return function() {
if (--e < 1) return t.apply(this, arguments);
};
};
mr.ary = ks;
mr.assign = Ou;
mr.assignIn = Lu;
mr.assignInWith = Ju;
mr.assignWith = xu;
mr.at = Tu;
mr.before = Gs;
mr.bind = Vs;
mr.bindAll = dc;
mr.bindKey = Ws;
mr.castArray = function() {
if (!arguments.length) return [];
var e = arguments[0];
return nu(e) ? e : [ e ];
};
mr.chain = bs;
mr.chunk = function(e, t, i) {
t = (i ? Ia(e, t, i) : t === r) ? 1 : Yn(Eu(t), 0);
var o = null == e ? 0 : e.length;
if (!o || t < 1) return [];
for (var a = 0, s = 0, u = n(Hn(o / t)); a < o; ) u[s++] = Bi(e, a, a += t);
return u;
};
mr.compact = function(e) {
for (var t = -1, n = null == e ? 0 : e.length, r = 0, i = []; ++t < n; ) {
var o = e[t];
o && (i[r++] = o);
}
return i;
};
mr.concat = function() {
var e = arguments.length;
if (!e) return [];
for (var t = n(e - 1), r = arguments[0], i = e; i--; ) t[i - 1] = arguments[i];
return $t(nu(r) ? Ro(r) : [ r ], $r(t, 1));
};
mr.cond = function(e) {
var t = null == e ? 0 : e.length, n = ua();
e = t ? Xt(e, function(e) {
if ("function" != typeof e[1]) throw new nt(a);
return [ n(e[0]), e[1] ];
}) : [];
return Ui(function(n) {
for (var r = -1; ++r < t; ) {
var i = e[r];
if (Nt(i[0], this, n)) return Nt(i[1], this, n);
}
});
};
mr.conforms = function(e) {
return Wr(Vr(e, l));
};
mr.constant = fc;
mr.countBy = js;
mr.create = function(e, t) {
var n = Cr(e);
return null == t ? n : Sr(n, t);
};
mr.curry = function e(t, n, i) {
var o = qo(t, m, r, r, r, r, r, n = i ? r : n);
o.placeholder = e.placeholder;
return o;
};
mr.curryRight = function e(t, n, i) {
var o = qo(t, C, r, r, r, r, r, n = i ? r : n);
o.placeholder = e.placeholder;
return o;
};
mr.debounce = Ns;
mr.defaults = Su;
mr.defaultsDeep = Hu;
mr.defer = Ds;
mr.delay = Bs;
mr.difference = $a;
mr.differenceBy = Qa;
mr.differenceWith = es;
mr.drop = function(e, t, n) {
var i = null == e ? 0 : e.length;
return i ? Bi(e, (t = n || t === r ? 1 : Eu(t)) < 0 ? 0 : t, i) : [];
};
mr.dropRight = function(e, t, n) {
var i = null == e ? 0 : e.length;
return i ? Bi(e, 0, (t = i - (t = n || t === r ? 1 : Eu(t))) < 0 ? 0 : t) : [];
};
mr.dropRightWhile = function(e, t) {
return e && e.length ? to(e, ua(t, 3), !0, !0) : [];
};
mr.dropWhile = function(e, t) {
return e && e.length ? to(e, ua(t, 3), !0) : [];
};
mr.fill = function(e, t, n, r) {
var i = null == e ? 0 : e.length;
if (!i) return [];
if (n && "number" != typeof n && Ia(e, t, n)) {
n = 0;
r = i;
}
return Yr(e, t, n, r);
};
mr.filter = function(e, t) {
return (nu(e) ? Zt : Xr)(e, ua(t, 3));
};
mr.flatMap = function(e, t) {
return $r(Ts(e, t), 1);
};
mr.flatMapDeep = function(e, t) {
return $r(Ts(e, t), O);
};
mr.flatMapDepth = function(e, t, n) {
n = n === r ? 1 : Eu(n);
return $r(Ts(e, t), n);
};
mr.flatten = rs;
mr.flattenDeep = function(e) {
return null != e && e.length ? $r(e, O) : [];
};
mr.flattenDepth = function(e, t) {
return null != e && e.length ? $r(e, t = t === r ? 1 : Eu(t)) : [];
};
mr.flip = function(e) {
return qo(e, b);
};
mr.flow = hc;
mr.flowRight = pc;
mr.fromPairs = function(e) {
for (var t = -1, n = null == e ? 0 : e.length, r = {}; ++t < n; ) {
var i = e[t];
r[i[0]] = i[1];
}
return r;
};
mr.functions = function(e) {
return null == e ? [] : ri(e, Nu(e));
};
mr.functionsIn = function(e) {
return null == e ? [] : ri(e, Du(e));
};
mr.groupBy = Ls;
mr.initial = function(e) {
return null != e && e.length ? Bi(e, 0, -1) : [];
};
mr.intersection = os;
mr.intersectionBy = as;
mr.intersectionWith = ss;
mr.invert = Gu;
mr.invertBy = Vu;
mr.invokeMap = Js;
mr.iteratee = _c;
mr.keyBy = xs;
mr.keys = Nu;
mr.keysIn = Du;
mr.map = Ts;
mr.mapKeys = function(e, t) {
var n = {};
t = ua(t, 3);
ti(e, function(e, r, i) {
Ur(n, t(e, r, i), e);
});
return n;
};
mr.mapValues = function(e, t) {
var n = {};
t = ua(t, 3);
ti(e, function(e, r, i) {
Ur(n, r, t(e, r, i));
});
return n;
};
mr.matches = function(e) {
return bi(Vr(e, l));
};
mr.matchesProperty = function(e, t) {
return Ii(e, Vr(t, l));
};
mr.memoize = Ks;
mr.merge = Bu;
mr.mergeWith = Ku;
mr.method = vc;
mr.methodOf = mc;
mr.mixin = Cc;
mr.negate = zs;
mr.nthArg = function(e) {
e = Eu(e);
return Ui(function(t) {
return Mi(t, e);
});
};
mr.omit = zu;
mr.omitBy = function(e, t) {
return qu(e, zs(ua(t)));
};
mr.once = function(e) {
return Gs(2, e);
};
mr.orderBy = function(e, t, n, i) {
if (null == e) return [];
nu(t) || (t = null == t ? [] : [ t ]);
nu(n = i ? r : n) || (n = null == n ? [] : [ n ]);
return Pi(e, t, n);
};
mr.over = yc;
mr.overArgs = Zs;
mr.overEvery = Rc;
mr.overSome = Ac;
mr.partial = qs;
mr.partialRight = Ys;
mr.partition = Ss;
mr.pick = Zu;
mr.pickBy = qu;
mr.property = bc;
mr.propertyOf = function(e) {
return function(t) {
return null == e ? r : ii(e, t);
};
};
mr.pull = cs;
mr.pullAll = ls;
mr.pullAllBy = function(e, t, n) {
return e && e.length && t && t.length ? Ji(e, t, ua(n, 2)) : e;
};
mr.pullAllWith = function(e, t, n) {
return e && e.length && t && t.length ? Ji(e, t, r, n) : e;
};
mr.pullAt = ds;
mr.range = Ic;
mr.rangeRight = Ec;
mr.rearg = Xs;
mr.reject = function(e, t) {
return (nu(e) ? Zt : Xr)(e, zs(ua(t, 3)));
};
mr.remove = function(e, t) {
var n = [];
if (!e || !e.length) return n;
var r = -1, i = [], o = e.length;
t = ua(t, 3);
for (;++r < o; ) {
var a = e[r];
if (t(a, r, e)) {
n.push(a);
i.push(r);
}
}
xi(e, i);
return n;
};
mr.rest = function(e, t) {
if ("function" != typeof e) throw new nt(a);
return Ui(e, t = t === r ? t : Eu(t));
};
mr.reverse = fs;
mr.sampleSize = function(e, t, n) {
t = (n ? Ia(e, t, n) : t === r) ? 1 : Eu(t);
return (nu(e) ? Fr : Gi)(e, t);
};
mr.set = function(e, t, n) {
return null == e ? e : Vi(e, t, n);
};
mr.setWith = function(e, t, n, i) {
i = "function" == typeof i ? i : r;
return null == e ? e : Vi(e, t, n, i);
};
mr.shuffle = function(e) {
return (nu(e) ? Or : Di)(e);
};
mr.slice = function(e, t, n) {
var i = null == e ? 0 : e.length;
if (!i) return [];
if (n && "number" != typeof n && Ia(e, t, n)) {
t = 0;
n = i;
} else {
t = null == t ? 0 : Eu(t);
n = n === r ? i : Eu(n);
}
return Bi(e, t, n);
};
mr.sortBy = Hs;
mr.sortedUniq = function(e) {
return e && e.length ? qi(e) : [];
};
mr.sortedUniqBy = function(e, t) {
return e && e.length ? qi(e, ua(t, 2)) : [];
};
mr.split = function(e, t, n) {
n && "number" != typeof n && Ia(e, t, n) && (t = n = r);
return (n = n === r ? T : n >>> 0) ? (e = Fu(e)) && ("string" == typeof t || null != t && !vu(t)) && !(t = Xi(t)) && Pn(e) ? co(Gn(e), 0, n) : e.split(t, n) : [];
};
mr.spread = function(e, t) {
if ("function" != typeof e) throw new nt(a);
t = null == t ? 0 : Yn(Eu(t), 0);
return Ui(function(n) {
var r = n[t], i = co(n, 0, t);
r && $t(i, r);
return Nt(e, this, i);
});
};
mr.tail = function(e) {
var t = null == e ? 0 : e.length;
return t ? Bi(e, 1, t) : [];
};
mr.take = function(e, t, n) {
return e && e.length ? Bi(e, 0, (t = n || t === r ? 1 : Eu(t)) < 0 ? 0 : t) : [];
};
mr.takeRight = function(e, t, n) {
var i = null == e ? 0 : e.length;
return i ? Bi(e, (t = i - (t = n || t === r ? 1 : Eu(t))) < 0 ? 0 : t, i) : [];
};
mr.takeRightWhile = function(e, t) {
return e && e.length ? to(e, ua(t, 3), !1, !0) : [];
};
mr.takeWhile = function(e, t) {
return e && e.length ? to(e, ua(t, 3)) : [];
};
mr.tap = function(e, t) {
t(e);
return e;
};
mr.throttle = function(e, t, n) {
var r = !0, i = !0;
if ("function" != typeof e) throw new nt(a);
if (fu(n)) {
r = "leading" in n ? !!n.leading : r;
i = "trailing" in n ? !!n.trailing : i;
}
return Ns(e, t, {
leading: r,
maxWait: t,
trailing: i
});
};
mr.thru = Is;
mr.toArray = bu;
mr.toPairs = Yu;
mr.toPairsIn = Xu;
mr.toPath = function(e) {
return nu(e) ? Xt(e, Za) : wu(e) ? [ e ] : Ro(za(Fu(e)));
};
mr.toPlainObject = Pu;
mr.transform = function(e, t, n) {
var r = nu(e), i = r || au(e) || yu(e);
t = ua(t, 4);
if (null == n) {
var o = e && e.constructor;
n = i ? r ? new o() : [] : fu(e) && cu(o) ? Cr(yt(e)) : {};
}
(i ? Bt : ti)(e, function(e, r, i) {
return t(n, e, r, i);
});
return n;
};
mr.unary = function(e) {
return ks(e, 1);
};
mr.union = hs;
mr.unionBy = ps;
mr.unionWith = gs;
mr.uniq = function(e) {
return e && e.length ? $i(e) : [];
};
mr.uniqBy = function(e, t) {
return e && e.length ? $i(e, ua(t, 2)) : [];
};
mr.uniqWith = function(e, t) {
t = "function" == typeof t ? t : r;
return e && e.length ? $i(e, r, t) : [];
};
mr.unset = function(e, t) {
return null == e || Qi(e, t);
};
mr.unzip = _s;
mr.unzipWith = vs;
mr.update = function(e, t, n) {
return null == e ? e : eo(e, t, ao(n));
};
mr.updateWith = function(e, t, n, i) {
i = "function" == typeof i ? i : r;
return null == e ? e : eo(e, t, ao(n), i);
};
mr.values = $u;
mr.valuesIn = function(e) {
return null == e ? [] : wn(e, Du(e));
};
mr.without = ms;
mr.words = cc;
mr.wrap = function(e, t) {
return qs(ao(t), e);
};
mr.xor = Cs;
mr.xorBy = ws;
mr.xorWith = ys;
mr.zip = Rs;
mr.zipObject = function(e, t) {
return io(e || [], t || [], Jr);
};
mr.zipObjectDeep = function(e, t) {
return io(e || [], t || [], Vi);
};
mr.zipWith = As;
mr.entries = Yu;
mr.entriesIn = Xu;
mr.extend = Lu;
mr.extendWith = Ju;
Cc(mr, mr);
mr.add = Pc;
mr.attempt = lc;
mr.camelCase = Qu;
mr.capitalize = ec;
mr.ceil = Fc;
mr.clamp = function(e, t, n) {
if (n === r) {
n = t;
t = r;
}
n !== r && (n = (n = Mu(n)) == n ? n : 0);
t !== r && (t = (t = Mu(t)) == t ? t : 0);
return Gr(Mu(e), t, n);
};
mr.clone = function(e) {
return Vr(e, f);
};
mr.cloneDeep = function(e) {
return Vr(e, l | f);
};
mr.cloneDeepWith = function(e, t) {
return Vr(e, l | f, t = "function" == typeof t ? t : r);
};
mr.cloneWith = function(e, t) {
return Vr(e, f, t = "function" == typeof t ? t : r);
};
mr.conformsTo = function(e, t) {
return null == t || Nr(e, t, Nu(t));
};
mr.deburr = tc;
mr.defaultTo = function(e, t) {
return null == e || e != e ? t : e;
};
mr.divide = Oc;
mr.endsWith = function(e, t, n) {
e = Fu(e);
t = Xi(t);
var i = e.length, o = n = n === r ? i : Gr(Eu(n), 0, i);
return (n -= t.length) >= 0 && e.slice(n, o) == t;
};
mr.eq = $s;
mr.escape = function(e) {
return (e = Fu(e)) && Ae.test(e) ? e.replace(ye, En) : e;
};
mr.escapeRegExp = function(e) {
return (e = Fu(e)) && Oe.test(e) ? e.replace(Fe, "\\$&") : e;
};
mr.every = function(e, t, n) {
var i = nu(e) ? zt : Zr;
n && Ia(e, t, n) && (t = r);
return i(e, ua(t, 3));
};
mr.find = Ms;
mr.findIndex = ts;
mr.findKey = function(e, t) {
return an(e, ua(t, 3), ti);
};
mr.findLast = Ps;
mr.findLastIndex = ns;
mr.findLastKey = function(e, t) {
return an(e, ua(t, 3), ni);
};
mr.floor = Lc;
mr.forEach = Fs;
mr.forEachRight = Os;
mr.forIn = function(e, t) {
return null == e ? e : Qr(e, ua(t, 3), Du);
};
mr.forInRight = function(e, t) {
return null == e ? e : ei(e, ua(t, 3), Du);
};
mr.forOwn = function(e, t) {
return e && ti(e, ua(t, 3));
};
mr.forOwnRight = function(e, t) {
return e && ni(e, ua(t, 3));
};
mr.get = Uu;
mr.gt = Qs;
mr.gte = eu;
mr.has = function(e, t) {
return null != e && ma(e, t, ui);
};
mr.hasIn = ku;
mr.head = is;
mr.identity = gc;
mr.includes = function(e, t, n, r) {
e = iu(e) ? e : $u(e);
n = n && !r ? Eu(n) : 0;
var i = e.length;
n < 0 && (n = Yn(i + n, 0));
return Cu(e) ? n <= i && e.indexOf(t, n) > -1 : !!i && un(e, t, n) > -1;
};
mr.indexOf = function(e, t, n) {
var r = null == e ? 0 : e.length;
if (!r) return -1;
var i = null == n ? 0 : Eu(n);
i < 0 && (i = Yn(r + i, 0));
return un(e, t, i);
};
mr.inRange = function(e, t, n) {
t = Iu(t);
if (n === r) {
n = t;
t = 0;
} else n = Iu(n);
return li(e = Mu(e), t, n);
};
mr.invoke = Wu;
mr.isArguments = tu;
mr.isArray = nu;
mr.isArrayBuffer = ru;
mr.isArrayLike = iu;
mr.isArrayLikeObject = ou;
mr.isBoolean = function(e) {
return !0 === e || !1 === e || hu(e) && ai(e) == W;
};
mr.isBuffer = au;
mr.isDate = su;
mr.isElement = function(e) {
return hu(e) && 1 === e.nodeType && !_u(e);
};
mr.isEmpty = function(e) {
if (null == e) return !0;
if (iu(e) && (nu(e) || "string" == typeof e || "function" == typeof e.splice || au(e) || yu(e) || tu(e))) return !e.length;
var t = ga(e);
if (t == Z || t == ee) return !e.size;
if (Oa(e)) return !wi(e).length;
for (var n in e) if (ut.call(e, n)) return !1;
return !0;
};
mr.isEqual = function(e, t) {
return gi(e, t);
};
mr.isEqualWith = function(e, t, n) {
var i = (n = "function" == typeof n ? n : r) ? n(e, t) : r;
return i === r ? gi(e, t, r, n) : !!i;
};
mr.isError = uu;
mr.isFinite = function(e) {
return "number" == typeof e && zn(e);
};
mr.isFunction = cu;
mr.isInteger = lu;
mr.isLength = du;
mr.isMap = pu;
mr.isMatch = function(e, t) {
return e === t || vi(e, t, la(t));
};
mr.isMatchWith = function(e, t, n) {
n = "function" == typeof n ? n : r;
return vi(e, t, la(t), n);
};
mr.isNaN = function(e) {
return gu(e) && e != +e;
};
mr.isNative = function(e) {
if (Fa(e)) throw new Ye(o);
return mi(e);
};
mr.isNil = function(e) {
return null == e;
};
mr.isNull = function(e) {
return null === e;
};
mr.isNumber = gu;
mr.isObject = fu;
mr.isObjectLike = hu;
mr.isPlainObject = _u;
mr.isRegExp = vu;
mr.isSafeInteger = function(e) {
return lu(e) && e >= -L && e <= L;
};
mr.isSet = mu;
mr.isString = Cu;
mr.isSymbol = wu;
mr.isTypedArray = yu;
mr.isUndefined = function(e) {
return e === r;
};
mr.isWeakMap = function(e) {
return hu(e) && ga(e) == ie;
};
mr.isWeakSet = function(e) {
return hu(e) && ai(e) == oe;
};
mr.join = function(e, t) {
return null == e ? "" : Zn.call(e, t);
};
mr.kebabCase = nc;
mr.last = us;
mr.lastIndexOf = function(e, t, n) {
var i = null == e ? 0 : e.length;
if (!i) return -1;
var o = i;
n !== r && (o = (o = Eu(n)) < 0 ? Yn(i + o, 0) : Xn(o, i - 1));
return t == t ? Un(e, t, o) : sn(e, ln, o, !0);
};
mr.lowerCase = rc;
mr.lowerFirst = ic;
mr.lt = Ru;
mr.lte = Au;
mr.max = function(e) {
return e && e.length ? qr(e, gc, si) : r;
};
mr.maxBy = function(e, t) {
return e && e.length ? qr(e, ua(t, 2), si) : r;
};
mr.mean = function(e) {
return dn(e, gc);
};
mr.meanBy = function(e, t) {
return dn(e, ua(t, 2));
};
mr.min = function(e) {
return e && e.length ? qr(e, gc, Ri) : r;
};
mr.minBy = function(e, t) {
return e && e.length ? qr(e, ua(t, 2), Ri) : r;
};
mr.stubArray = jc;
mr.stubFalse = Mc;
mr.stubObject = function() {
return {};
};
mr.stubString = function() {
return "";
};
mr.stubTrue = function() {
return !0;
};
mr.multiply = Jc;
mr.nth = function(e, t) {
return e && e.length ? Mi(e, Eu(t)) : r;
};
mr.noConflict = function() {
Ot._ === this && (Ot._ = ht);
return this;
};
mr.noop = wc;
mr.now = Us;
mr.pad = function(e, t, n) {
e = Fu(e);
var r = (t = Eu(t)) ? kn(e) : 0;
if (!t || r >= t) return e;
var i = (t - r) / 2;
return Vo(Wn(i), n) + e + Vo(Hn(i), n);
};
mr.padEnd = function(e, t, n) {
e = Fu(e);
var r = (t = Eu(t)) ? kn(e) : 0;
return t && r < t ? e + Vo(t - r, n) : e;
};
mr.padStart = function(e, t, n) {
e = Fu(e);
var r = (t = Eu(t)) ? kn(e) : 0;
return t && r < t ? Vo(t - r, n) + e : e;
};
mr.parseInt = function(e, t, n) {
n || null == t ? t = 0 : t && (t = +t);
return Qn(Fu(e).replace(Je, ""), t || 0);
};
mr.random = function(e, t, n) {
n && "boolean" != typeof n && Ia(e, t, n) && (t = n = r);
if (n === r) if ("boolean" == typeof t) {
n = t;
t = r;
} else if ("boolean" == typeof e) {
n = e;
e = r;
}
if (e === r && t === r) {
e = 0;
t = 1;
} else {
e = Iu(e);
if (t === r) {
t = e;
e = 0;
} else t = Iu(t);
}
if (e > t) {
var i = e;
e = t;
t = i;
}
if (n || e % 1 || t % 1) {
var o = er();
return Xn(e + o * (t - e + jt("1e-" + ((o + "").length - 1))), t);
}
return Ti(e, t);
};
mr.reduce = function(e, t, n) {
var r = nu(e) ? Qt : pn, i = arguments.length < 3;
return r(e, ua(t, 4), n, i, Kr);
};
mr.reduceRight = function(e, t, n) {
var r = nu(e) ? en : pn, i = arguments.length < 3;
return r(e, ua(t, 4), n, i, zr);
};
mr.repeat = function(e, t, n) {
t = (n ? Ia(e, t, n) : t === r) ? 1 : Eu(t);
return Hi(Fu(e), t);
};
mr.replace = function() {
var e = arguments, t = Fu(e[0]);
return e.length < 3 ? t : t.replace(e[1], e[2]);
};
mr.result = function(e, t, n) {
var i = -1, o = (t = so(t, e)).length;
if (!o) {
o = 1;
e = r;
}
for (;++i < o; ) {
var a = null == e ? r : e[Za(t[i])];
if (a === r) {
i = o;
a = n;
}
e = cu(a) ? a.call(e) : a;
}
return e;
};
mr.round = xc;
mr.runInContext = e;
mr.sample = function(e) {
return (nu(e) ? Pr : ki)(e);
};
mr.size = function(e) {
if (null == e) return 0;
if (iu(e)) return Cu(e) ? kn(e) : e.length;
var t = ga(e);
return t == Z || t == ee ? e.size : wi(e).length;
};
mr.snakeCase = oc;
mr.some = function(e, t, n) {
var i = nu(e) ? tn : Ki;
n && Ia(e, t, n) && (t = r);
return i(e, ua(t, 3));
};
mr.sortedIndex = function(e, t) {
return zi(e, t);
};
mr.sortedIndexBy = function(e, t, n) {
return Zi(e, t, ua(n, 2));
};
mr.sortedIndexOf = function(e, t) {
var n = null == e ? 0 : e.length;
if (n) {
var r = zi(e, t);
if (r < n && $s(e[r], t)) return r;
}
return -1;
};
mr.sortedLastIndex = function(e, t) {
return zi(e, t, !0);
};
mr.sortedLastIndexBy = function(e, t, n) {
return Zi(e, t, ua(n, 2), !0);
};
mr.sortedLastIndexOf = function(e, t) {
if (null != e && e.length) {
var n = zi(e, t, !0) - 1;
if ($s(e[n], t)) return n;
}
return -1;
};
mr.startCase = ac;
mr.startsWith = function(e, t, n) {
e = Fu(e);
n = null == n ? 0 : Gr(Eu(n), 0, e.length);
t = Xi(t);
return e.slice(n, n + t.length) == t;
};
mr.subtract = Tc;
mr.sum = function(e) {
return e && e.length ? _n(e, gc) : 0;
};
mr.sumBy = function(e, t) {
return e && e.length ? _n(e, ua(t, 2)) : 0;
};
mr.template = function(e, t, n) {
var i = mr.templateSettings;
n && Ia(e, t, n) && (t = r);
e = Fu(e);
t = Ju({}, t, i, Yo);
var o, a, s = Ju({}, t.imports, i.imports, Yo), u = Nu(s), c = wn(s, u), l = 0, d = t.interpolate || Ze, f = "__p += '", h = et((t.escape || Ze).source + "|" + d.source + "|" + (d === Ee ? Ge : Ze).source + "|" + (t.evaluate || Ze).source + "|$", "g"), p = "//# sourceURL=" + ("sourceURL" in t ? t.sourceURL : "lodash.templateSources[" + ++At + "]") + "\n";
e.replace(h, function(t, n, r, i, s, u) {
r || (r = i);
f += e.slice(l, u).replace(qe, jn);
if (n) {
o = !0;
f += "' +\n__e(" + n + ") +\n'";
}
if (s) {
a = !0;
f += "';\n" + s + ";\n__p += '";
}
r && (f += "' +\n((__t = (" + r + ")) == null ? '' : __t) +\n'");
l = u + t.length;
return t;
});
f += "';\n";
var g = t.variable;
g || (f = "with (obj) {\n" + f + "\n}\n");
f = (a ? f.replace(ve, "") : f).replace(me, "$1").replace(Ce, "$1;");
f = "function(" + (g || "obj") + ") {\n" + (g ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (o ? ", __e = _.escape" : "") + (a ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + f + "return __p\n}";
var _ = lc(function() {
return Xe(u, p + "return " + f).apply(r, c);
});
_.source = f;
if (uu(_)) throw _;
return _;
};
mr.times = function(e, t) {
if ((e = Eu(e)) < 1 || e > L) return [];
var n = T, r = Xn(e, T);
t = ua(t);
e -= T;
for (var i = vn(r, t); ++n < e; ) t(n);
return i;
};
mr.toFinite = Iu;
mr.toInteger = Eu;
mr.toLength = ju;
mr.toLower = function(e) {
return Fu(e).toLowerCase();
};
mr.toNumber = Mu;
mr.toSafeInteger = function(e) {
return e ? Gr(Eu(e), -L, L) : 0 === e ? e : 0;
};
mr.toString = Fu;
mr.toUpper = function(e) {
return Fu(e).toUpperCase();
};
mr.trim = function(e, t, n) {
if ((e = Fu(e)) && (n || t === r)) return e.replace(Le, "");
if (!e || !(t = Xi(t))) return e;
var i = Gn(e), o = Gn(t);
return co(i, Rn(i, o), An(i, o) + 1).join("");
};
mr.trimEnd = function(e, t, n) {
if ((e = Fu(e)) && (n || t === r)) return e.replace(xe, "");
if (!e || !(t = Xi(t))) return e;
var i = Gn(e);
return co(i, 0, An(i, Gn(t)) + 1).join("");
};
mr.trimStart = function(e, t, n) {
if ((e = Fu(e)) && (n || t === r)) return e.replace(Je, "");
if (!e || !(t = Xi(t))) return e;
var i = Gn(e);
return co(i, Rn(i, Gn(t))).join("");
};
mr.truncate = function(e, t) {
var n = I, i = E;
if (fu(t)) {
var o = "separator" in t ? t.separator : o;
n = "length" in t ? Eu(t.length) : n;
i = "omission" in t ? Xi(t.omission) : i;
}
var a = (e = Fu(e)).length;
if (Pn(e)) {
var s = Gn(e);
a = s.length;
}
if (n >= a) return e;
var u = n - kn(i);
if (u < 1) return i;
var c = s ? co(s, 0, u).join("") : e.slice(0, u);
if (o === r) return c + i;
s && (u += c.length - u);
if (vu(o)) {
if (e.slice(u).search(o)) {
var l, d = c;
o.global || (o = et(o.source, Fu(Ve.exec(o)) + "g"));
o.lastIndex = 0;
for (;l = o.exec(d); ) var f = l.index;
c = c.slice(0, f === r ? u : f);
}
} else if (e.indexOf(Xi(o), u) != u) {
var h = c.lastIndexOf(o);
h > -1 && (c = c.slice(0, h));
}
return c + i;
};
mr.unescape = function(e) {
return (e = Fu(e)) && Re.test(e) ? e.replace(we, Vn) : e;
};
mr.uniqueId = function(e) {
var t = ++ct;
return Fu(e) + t;
};
mr.upperCase = sc;
mr.upperFirst = uc;
mr.each = Fs;
mr.eachRight = Os;
mr.first = is;
Cc(mr, function() {
var e = {};
ti(mr, function(t, n) {
ut.call(mr.prototype, n) || (e[n] = t);
});
return e;
}(), {
chain: !1
});
mr.VERSION = "4.17.11";
Bt([ "bind", "bindKey", "curry", "curryRight", "partial", "partialRight" ], function(e) {
mr[e].placeholder = mr;
});
Bt([ "drop", "take" ], function(e, t) {
Rr.prototype[e] = function(n) {
n = n === r ? 1 : Yn(Eu(n), 0);
var i = this.__filtered__ && !t ? new Rr(this) : this.clone();
i.__filtered__ ? i.__takeCount__ = Xn(n, i.__takeCount__) : i.__views__.push({
size: Xn(n, T),
type: e + (i.__dir__ < 0 ? "Right" : "")
});
return i;
};
Rr.prototype[e + "Right"] = function(t) {
return this.reverse()[e](t).reverse();
};
});
Bt([ "filter", "map", "takeWhile" ], function(e, t) {
var n = t + 1, r = n == P || 3 == n;
Rr.prototype[e] = function(e) {
var t = this.clone();
t.__iteratees__.push({
iteratee: ua(e, 3),
type: n
});
t.__filtered__ = t.__filtered__ || r;
return t;
};
});
Bt([ "head", "last" ], function(e, t) {
var n = "take" + (t ? "Right" : "");
Rr.prototype[e] = function() {
return this[n](1).value()[0];
};
});
Bt([ "initial", "tail" ], function(e, t) {
var n = "drop" + (t ? "" : "Right");
Rr.prototype[e] = function() {
return this.__filtered__ ? new Rr(this) : this[n](1);
};
});
Rr.prototype.compact = function() {
return this.filter(gc);
};
Rr.prototype.find = function(e) {
return this.filter(e).head();
};
Rr.prototype.findLast = function(e) {
return this.reverse().find(e);
};
Rr.prototype.invokeMap = Ui(function(e, t) {
return "function" == typeof e ? new Rr(this) : this.map(function(n) {
return hi(n, e, t);
});
});
Rr.prototype.reject = function(e) {
return this.filter(zs(ua(e)));
};
Rr.prototype.slice = function(e, t) {
e = Eu(e);
var n = this;
if (n.__filtered__ && (e > 0 || t < 0)) return new Rr(n);
e < 0 ? n = n.takeRight(-e) : e && (n = n.drop(e));
t !== r && (n = (t = Eu(t)) < 0 ? n.dropRight(-t) : n.take(t - e));
return n;
};
Rr.prototype.takeRightWhile = function(e) {
return this.reverse().takeWhile(e).reverse();
};
Rr.prototype.toArray = function() {
return this.take(T);
};
ti(Rr.prototype, function(e, t) {
var n = /^(?:filter|find|map|reject)|While$/.test(t), i = /^(?:head|last)$/.test(t), o = mr[i ? "take" + ("last" == t ? "Right" : "") : t], a = i || /^find/.test(t);
o && (mr.prototype[t] = function() {
var t = this.__wrapped__, s = i ? [ 1 ] : arguments, u = t instanceof Rr, c = s[0], l = u || nu(t), d = function(e) {
var t = o.apply(mr, $t([ e ], s));
return i && f ? t[0] : t;
};
l && n && "function" == typeof c && 1 != c.length && (u = l = !1);
var f = this.__chain__, h = !!this.__actions__.length, p = a && !f, g = u && !h;
if (!a && l) {
t = g ? t : new Rr(this);
var _ = e.apply(t, s);
_.__actions__.push({
func: Is,
args: [ d ],
thisArg: r
});
return new yr(_, f);
}
if (p && g) return e.apply(this, s);
_ = this.thru(d);
return p ? i ? _.value()[0] : _.value() : _;
});
});
Bt([ "pop", "push", "shift", "sort", "splice", "unshift" ], function(e) {
var t = rt[e], n = /^(?:push|sort|unshift)$/.test(e) ? "tap" : "thru", r = /^(?:pop|shift)$/.test(e);
mr.prototype[e] = function() {
var e = arguments;
if (r && !this.__chain__) {
var i = this.value();
return t.apply(nu(i) ? i : [], e);
}
return this[n](function(n) {
return t.apply(nu(n) ? n : [], e);
});
};
});
ti(Rr.prototype, function(e, t) {
var n = mr[t];
if (n) {
var r = n.name + "";
(cr[r] || (cr[r] = [])).push({
name: t,
func: n
});
}
});
cr[Ho(r, _).name] = [ {
name: "wrapper",
func: r
} ];
Rr.prototype.clone = function() {
var e = new Rr(this.__wrapped__);
e.__actions__ = Ro(this.__actions__);
e.__dir__ = this.__dir__;
e.__filtered__ = this.__filtered__;
e.__iteratees__ = Ro(this.__iteratees__);
e.__takeCount__ = this.__takeCount__;
e.__views__ = Ro(this.__views__);
return e;
};
Rr.prototype.reverse = function() {
if (this.__filtered__) {
var e = new Rr(this);
e.__dir__ = -1;
e.__filtered__ = !0;
} else (e = this.clone()).__dir__ *= -1;
return e;
};
Rr.prototype.value = function() {
var e = this.__wrapped__.value(), t = this.__dir__, n = nu(e), r = t < 0, i = n ? e.length : 0, o = _a(0, i, this.__views__), a = o.start, s = o.end, u = s - a, c = r ? s : a - 1, l = this.__iteratees__, d = l.length, f = 0, h = Xn(u, this.__takeCount__);
if (!n || !r && i == u && h == u) return no(e, this.__actions__);
var p = [];
e: for (;u-- && f < h; ) {
for (var g = -1, _ = e[c += t]; ++g < d; ) {
var v = l[g], m = v.iteratee, C = v.type, w = m(_);
if (C == F) _ = w; else if (!w) {
if (C == P) continue e;
break e;
}
}
p[f++] = _;
}
return p;
};
mr.prototype.at = Es;
mr.prototype.chain = function() {
return bs(this);
};
mr.prototype.commit = function() {
return new yr(this.value(), this.__chain__);
};
mr.prototype.next = function() {
this.__values__ === r && (this.__values__ = bu(this.value()));
var e = this.__index__ >= this.__values__.length;
return {
done: e,
value: e ? r : this.__values__[this.__index__++]
};
};
mr.prototype.plant = function(e) {
for (var t, n = this; n instanceof wr; ) {
var i = Xa(n);
i.__index__ = 0;
i.__values__ = r;
t ? o.__wrapped__ = i : t = i;
var o = i;
n = n.__wrapped__;
}
o.__wrapped__ = e;
return t;
};
mr.prototype.reverse = function() {
var e = this.__wrapped__;
if (e instanceof Rr) {
var t = e;
this.__actions__.length && (t = new Rr(this));
(t = t.reverse()).__actions__.push({
func: Is,
args: [ fs ],
thisArg: r
});
return new yr(t, this.__chain__);
}
return this.thru(fs);
};
mr.prototype.toJSON = mr.prototype.valueOf = mr.prototype.value = function() {
return no(this.__wrapped__, this.__actions__);
};
mr.prototype.first = mr.prototype.head;
Jt && (mr.prototype[Jt] = function() {
return this;
});
return mr;
}();
if ("function" == typeof define && "object" == typeof define.amd && define.amd) {
Ot._ = Bn;
define(function() {
return Bn;
});
} else if (Jt) {
(Jt.exports = Bn)._ = Bn;
Lt._ = Bn;
} else Ot._ = Bn;
}).call(this);
}).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
}, {} ],
8: [ function(e, t, n) {
(function() {
var n = e("crypt"), r = e("charenc").utf8, i = e("is-buffer"), o = e("charenc").bin, a = function(e, t) {
e.constructor == String ? e = t && "binary" === t.encoding ? o.stringToBytes(e) : r.stringToBytes(e) : i(e) ? e = Array.prototype.slice.call(e, 0) : Array.isArray(e) || (e = e.toString());
for (var s = n.bytesToWords(e), u = 8 * e.length, c = 1732584193, l = -271733879, d = -1732584194, f = 271733878, h = 0; h < s.length; h++) s[h] = 16711935 & (s[h] << 8 | s[h] >>> 24) | 4278255360 & (s[h] << 24 | s[h] >>> 8);
s[u >>> 5] |= 128 << u % 32;
s[14 + (u + 64 >>> 9 << 4)] = u;
var p = a._ff, g = a._gg, _ = a._hh, v = a._ii;
for (h = 0; h < s.length; h += 16) {
var m = c, C = l, w = d, y = f;
l = v(l = v(l = v(l = v(l = _(l = _(l = _(l = _(l = g(l = g(l = g(l = g(l = p(l = p(l = p(l = p(l, d = p(d, f = p(f, c = p(c, l, d, f, s[h + 0], 7, -680876936), l, d, s[h + 1], 12, -389564586), c, l, s[h + 2], 17, 606105819), f, c, s[h + 3], 22, -1044525330), d = p(d, f = p(f, c = p(c, l, d, f, s[h + 4], 7, -176418897), l, d, s[h + 5], 12, 1200080426), c, l, s[h + 6], 17, -1473231341), f, c, s[h + 7], 22, -45705983), d = p(d, f = p(f, c = p(c, l, d, f, s[h + 8], 7, 1770035416), l, d, s[h + 9], 12, -1958414417), c, l, s[h + 10], 17, -42063), f, c, s[h + 11], 22, -1990404162), d = p(d, f = p(f, c = p(c, l, d, f, s[h + 12], 7, 1804603682), l, d, s[h + 13], 12, -40341101), c, l, s[h + 14], 17, -1502002290), f, c, s[h + 15], 22, 1236535329), d = g(d, f = g(f, c = g(c, l, d, f, s[h + 1], 5, -165796510), l, d, s[h + 6], 9, -1069501632), c, l, s[h + 11], 14, 643717713), f, c, s[h + 0], 20, -373897302), d = g(d, f = g(f, c = g(c, l, d, f, s[h + 5], 5, -701558691), l, d, s[h + 10], 9, 38016083), c, l, s[h + 15], 14, -660478335), f, c, s[h + 4], 20, -405537848), d = g(d, f = g(f, c = g(c, l, d, f, s[h + 9], 5, 568446438), l, d, s[h + 14], 9, -1019803690), c, l, s[h + 3], 14, -187363961), f, c, s[h + 8], 20, 1163531501), d = g(d, f = g(f, c = g(c, l, d, f, s[h + 13], 5, -1444681467), l, d, s[h + 2], 9, -51403784), c, l, s[h + 7], 14, 1735328473), f, c, s[h + 12], 20, -1926607734), d = _(d, f = _(f, c = _(c, l, d, f, s[h + 5], 4, -378558), l, d, s[h + 8], 11, -2022574463), c, l, s[h + 11], 16, 1839030562), f, c, s[h + 14], 23, -35309556), d = _(d, f = _(f, c = _(c, l, d, f, s[h + 1], 4, -1530992060), l, d, s[h + 4], 11, 1272893353), c, l, s[h + 7], 16, -155497632), f, c, s[h + 10], 23, -1094730640), d = _(d, f = _(f, c = _(c, l, d, f, s[h + 13], 4, 681279174), l, d, s[h + 0], 11, -358537222), c, l, s[h + 3], 16, -722521979), f, c, s[h + 6], 23, 76029189), d = _(d, f = _(f, c = _(c, l, d, f, s[h + 9], 4, -640364487), l, d, s[h + 12], 11, -421815835), c, l, s[h + 15], 16, 530742520), f, c, s[h + 2], 23, -995338651), d = v(d, f = v(f, c = v(c, l, d, f, s[h + 0], 6, -198630844), l, d, s[h + 7], 10, 1126891415), c, l, s[h + 14], 15, -1416354905), f, c, s[h + 5], 21, -57434055), d = v(d, f = v(f, c = v(c, l, d, f, s[h + 12], 6, 1700485571), l, d, s[h + 3], 10, -1894986606), c, l, s[h + 10], 15, -1051523), f, c, s[h + 1], 21, -2054922799), d = v(d, f = v(f, c = v(c, l, d, f, s[h + 8], 6, 1873313359), l, d, s[h + 15], 10, -30611744), c, l, s[h + 6], 15, -1560198380), f, c, s[h + 13], 21, 1309151649), d = v(d, f = v(f, c = v(c, l, d, f, s[h + 4], 6, -145523070), l, d, s[h + 11], 10, -1120210379), c, l, s[h + 2], 15, 718787259), f, c, s[h + 9], 21, -343485551);
c = c + m >>> 0;
l = l + C >>> 0;
d = d + w >>> 0;
f = f + y >>> 0;
}
return n.endian([ c, l, d, f ]);
};
a._ff = function(e, t, n, r, i, o, a) {
var s = e + (t & n | ~t & r) + (i >>> 0) + a;
return (s << o | s >>> 32 - o) + t;
};
a._gg = function(e, t, n, r, i, o, a) {
var s = e + (t & r | n & ~r) + (i >>> 0) + a;
return (s << o | s >>> 32 - o) + t;
};
a._hh = function(e, t, n, r, i, o, a) {
var s = e + (t ^ n ^ r) + (i >>> 0) + a;
return (s << o | s >>> 32 - o) + t;
};
a._ii = function(e, t, n, r, i, o, a) {
var s = e + (n ^ (t | ~r)) + (i >>> 0) + a;
return (s << o | s >>> 32 - o) + t;
};
a._blocksize = 16;
a._digestsize = 16;
t.exports = function(e, t) {
if (void 0 === e || null === e) throw new Error("Illegal argument " + e);
var r = n.wordsToBytes(a(e, t));
return t && t.asBytes ? r : t && t.asString ? o.bytesToString(r) : n.bytesToHex(r);
};
})();
}, {
charenc: 4,
crypt: 5,
"is-buffer": 6
} ],
AbstractRoomConfig: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "fe2ea2y47tJ9LHTi2h2jaZ4", "AbstractRoomConfig");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../ws/AiJ"), i = e("../ws/AiJKit"), o = e("../AppConfig"), a = function() {
function e(t, n) {
this.host = t;
this.port = n;
this.url = "ws://" + t + ":" + n;
this._config = new r.AiJ.Config(this.url, new r.AiJ.Options());
e.destroyInst();
e.createInst(this);
}
e.getInst = function() {
return e._inst;
};
e.destroyInst = function() {
if (null != e._inst) {
e._inst.destroy();
e._inst = null;
}
};
e.createInst = function(t) {
e._inst = t;
e._inst.create();
};
e.prototype.create = function() {
this.onCreate();
i.default.init(o.default.GAME_WS_NAME, this._config);
};
e.prototype.destroy = function() {
i.default.close(o.default.GAME_WS_NAME);
this.onDestroy();
};
return e;
}();
n.default = a;
cc._RF.pop();
}, {
"../AppConfig": "AppConfig",
"../ws/AiJ": "AiJ",
"../ws/AiJKit": "AiJKit"
} ],
AiJApp: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "45dc7jmSU9FfJq1niV8UwFC", "AiJApp");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = cc._decorator.ccclass, i = e("./WelcomeLayer"), o = e("./UIManger"), a = e("./AppConfig"), s = e("./fire/FireKit"), u = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
n = t;
t.prototype.onLoad = function() {
var e = this;
fgui.addLoadHandler();
fgui.GRoot.create();
fgui.UIPackage.loadPackage("commons", function() {
fgui.UIPackage.addPackage("commons");
n.initFire();
n.initDialog();
o.default.getInst().setRoot(e);
o.default.getInst().switchLayer(i.default);
});
};
t.initFire = function() {
s.default.init(a.default.LOCAL_FIRE);
s.default.init(a.default.PLAZA_FIRE);
s.default.init(a.default.GAME_FIRE);
};
t.initDialog = function() {};
var n;
return t = n = __decorate([ r ], t);
}(cc.Component);
n.default = u;
cc._RF.pop();
}, {
"./AppConfig": "AppConfig",
"./UIManger": "UIManger",
"./WelcomeLayer": "WelcomeLayer",
"./fire/FireKit": "FireKit"
} ],
AiJCCComponent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "156e3BCfORM8ZPUdyCulBbz", "AiJCCComponent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("async-lock"), i = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.lock = new r();
t.UI_LOCK_KEY = "ui_key";
return t;
}
t.prototype.loadPackage = function(e, t) {
this.lock.acquire(this.UI_LOCK_KEY, function(n) {
fgui.UIPackage.loadPackage(e, function() {
t();
n();
});
}, function() {
console.log("Load package success!");
});
};
t.prototype.initAiJCom = function(e) {
var t = this;
this.lock.acquire(this.UI_LOCK_KEY, function(n) {
t.onInitAiJCom(e);
n();
}, function() {
console.log("AiJCom init success");
});
};
return t;
}(cc.Component);
n.default = i;
cc._RF.pop();
}, {
"async-lock": 2
} ],
AiJKit: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "463e3s0Xb1DoLzbqIFnzE6E", "AiJKit");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("./AiJPro"), i = function() {
function e() {}
e.init = function(t, n) {
if (e.exist(t)) throw Error("Websocket " + t + " 已经存在");
e.aiJProDict[t] = new r.default(n);
};
e.exist = function(e) {
return null != this.aiJProDict[e];
};
e.use = function(t) {
return e.aiJProDict[t];
};
e.close = function(t) {
e.aiJProDict[t].close();
delete e.aiJProDict[t];
};
e.aiJProDict = {};
return e;
}();
n.default = i;
cc._RF.pop();
}, {
"./AiJPro": "AiJPro"
} ],
AiJPro: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "7aa80HptUZONLMv/KLoQsPT", "AiJPro");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("./AiJ"), i = function() {
function e(e) {
this.aij = new r.AiJ(e);
}
e.prototype.isOpen = function() {
return this.aij.aiJWs.readyState == this.aij.aiJWs.ws.OPEN;
};
e.prototype.send = function(e) {
this.aij.send(e);
};
e.prototype.connect = function() {
this.aij.aiJWs.connect(!1);
};
e.prototype.close = function() {
this.aij.aiJWs.close();
};
return e;
}();
n.default = i;
cc._RF.pop();
}, {
"./AiJ": "AiJ"
} ],
AiJ: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "5ea82+0RpRAdZXgBDaIywJJ", "AiJ");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
function e(t) {
void 0 === this.aiJWs && (this.aiJWs = null);
this.aiJWs = new e.AiJWs(t);
}
e.prototype.send = function(e) {
this.aiJWs.send(e);
};
return e;
}();
n.AiJ = r;
r.__class = "AiJ";
(function(e) {
var t = function() {
return function() {
void 0 === this.mainType && (this.mainType = 0);
void 0 === this.subType && (this.subType = 0);
};
}();
e.AiJEvent = t;
t.__class = "AiJ.AiJEvent";
var n = function() {
return function() {
void 0 === this.mainType && (this.mainType = 0);
void 0 === this.subType && (this.subType = 0);
void 0 === this.code && (this.code = 0);
void 0 === this.message && (this.message = null);
void 0 === this.text && (this.text = null);
};
}();
e.Response = n;
n.__class = "AiJ.Response";
var r = function() {
return function() {};
}();
e.ResponseHandler = r;
r.__class = "AiJ.ResponseHandler";
var i = function() {
return function() {
this.connectionTimeout = 1e4;
this.reconnectInterval = 1e3;
this.reconnectDecay = 1.1;
this.maxReconnectInterval = 3e4;
this.maxRetries = 10;
this.debug = !0;
this.allowReconnect = !0;
this.automaticOpen = !0;
};
}();
e.Options = i;
i.__class = "AiJ.Options";
var o = function() {
function t(n, r) {
this.mapping = new Object();
this.options = new e.Options();
this.wsEventListener = new t.Config$0(this);
void 0 === this.ws && (this.ws = null);
this.ws = n;
this.options.connectionTimeout = null != r.connectionTimeout ? r.connectionTimeout : this.options.connectionTimeout;
this.options.maxRetries = null != r.maxRetries ? r.maxRetries : this.options.maxRetries;
this.options.debug = null != r.debug ? r.debug : this.options.debug;
this.options.allowReconnect = null != r.allowReconnect ? r.allowReconnect : this.options.allowReconnect;
this.options.automaticOpen = null != r.automaticOpen ? r.automaticOpen : this.options.automaticOpen;
this.options.maxReconnectInterval = null != r.maxReconnectInterval ? r.maxReconnectInterval : this.options.maxReconnectInterval;
this.options.reconnectInterval = null != r.reconnectInterval ? r.reconnectInterval : this.options.reconnectInterval;
this.options.reconnectDecay = null != r.reconnectDecay ? r.reconnectDecay : this.options.reconnectDecay;
}
t.prototype.setWsEventListener = function(e) {
this.wsEventListener = e;
};
t.prototype.addRouter = function(e, t, n) {
var r = this.mapping[new String(e).toString()];
if (null == r) {
r = new Object();
this.mapping[new String(e).toString()] = r;
}
var i = r[new String(t).toString()];
if (null == i) {
i = [];
r[new String(t).toString()] = i;
}
i.push(n);
};
return t;
}();
e.Config = o;
o.__class = "AiJ.Config";
(function(e) {
var t = function() {
function e(e) {
this.__parent = e;
}
e.prototype.onConnecting = function(e) {
e.config.options.debug && window.console.log("onConnecting");
};
e.prototype.onOpen = function(e, t, n) {
e.config.options.debug && window.console.log("onOpen");
};
e.prototype.onClose = function(e, t) {
e.config.options.debug && window.console.log("onClose");
};
e.prototype.onForcedClose = function(e, t) {
e.config.options.debug && window.console.log("onForcedClose");
};
e.prototype.onError = function(e, t) {
e.config.options.debug && window.console.log("onError");
};
e.prototype.onMessage = function(e, t) {
e.config.options.debug && window.console.log("onMessage");
};
e.prototype.onTimeout = function(e) {
e.config.options.debug && window.console.log("onTimeout");
};
e.prototype.onReconnectAttempt = function(e, t) {
e.config.options.debug && window.console.log("onReconnectAttempt");
};
e.prototype.onReconnectFail = function(e, t) {
e.config.options.debug && window.console.log("onReconnectFail");
};
return e;
}();
e.Config$0 = t;
t.__interfaces = [ "AiJ.WsEventListener" ];
})(o = e.Config || (e.Config = {}));
var a = function() {
function e(e) {
this.reconnectAttempts = 0;
this.readyState = -1;
this.forcedClose = !1;
this.timedOut = !1;
void 0 === this.self && (this.self = null);
void 0 === this.ws && (this.ws = null);
void 0 === this.config && (this.config = null);
this.self = this;
this.config = e;
this.config.options.automaticOpen && this.connect(!1);
}
e.prototype.reconnect = function() {
var e = this;
this.reconnectAttempts++;
if (this.reconnectAttempts > this.config.options.maxRetries) this.config.wsEventListener.onReconnectFail(this, this.reconnectAttempts); else {
this.config.wsEventListener.onReconnectAttempt(this, this.reconnectAttempts);
var t = this.self.config.options.reconnectInterval * Math.pow(this.self.config.options.reconnectDecay, this.self.reconnectAttempts);
window.setTimeout(function() {
return e.self.connect(!0);
}, t > this.self.config.options.maxReconnectInterval ? this.self.config.options.maxReconnectInterval : t);
}
};
e.prototype.connect = function(e) {
var t = this;
e || (this.reconnectAttempts = 0);
this.ws = new WebSocket(this.config.ws);
this.forcedClose = !1;
this.readyState = this.ws.CONNECTING;
this.config.wsEventListener.onConnecting(this.self);
var n = window.setTimeout(function() {
t.timedOut = !0;
t.config.wsEventListener.onTimeout(t.self);
t.ws.close();
t.timedOut = !1;
}, this.config.options.connectionTimeout);
this.ws.onopen = function(e) {
window.clearTimeout(n);
t.self.readyState = t.ws.OPEN;
t.self.reconnectAttempts = 0;
t.config.wsEventListener.onOpen(t.self, t.self.reconnectAttempts, e);
return new Object();
};
this.ws.onclose = function(r) {
window.clearTimeout(n);
if (t.forcedClose) {
t.self.readyState = t.ws.CLOSED;
t.config.wsEventListener.onForcedClose(t.self, r);
} else {
e || t.timedOut || t.config.wsEventListener.onClose(t.self, r);
t.reconnect();
}
return new Object();
};
this.ws.onerror = function(e) {
window.clearTimeout(n);
t.config.wsEventListener.onError(t.self, e);
return new Object();
};
this.ws.onmessage = function(e) {
t.config.options.debug && window.console.log("接收信息:" + JSON.stringify(e.data));
try {
var n = JSON.parse(e.data);
if (null != n) {
n.text = e.data;
var r = t.config.mapping[new String(n.mainType).toString()];
if (null != r) {
var i = r[new String(n.subType).toString()];
if (null != i) for (var o = 0; o < i.length; o++) i[o].handler(t.self, n); else t.config.options.debug && window.console.log("mainType:" + n.mainType + " subType:" + n.subType + " no mapping");
} else t.config.options.debug && window.console.log("mainType:" + n.mainType + " no mapping");
}
} finally {
t.config.wsEventListener.onMessage(t.self, e);
}
return new Object();
};
};
e.prototype.send = function(e) {
this.config.options.debug && window.console.log("发送信息:" + JSON.stringify(e));
this.ws.send(JSON.stringify(e));
};
e.prototype.close = function() {
this.forcedClose = !0;
this.ws.close();
};
return e;
}();
e.AiJWs = a;
a.__class = "AiJ.AiJWs";
})(r = n.AiJ || (n.AiJ = {}));
n.AiJ = r;
cc._RF.pop();
}, {} ],
AlertWindow: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "139f4lZ/vJKdZWWze0ku7BE", "AlertWindow");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.getInst = function() {
null == t.inst && (t.inst = new t());
return t.inst;
};
t.alert = function(e, n) {
var r = t.getInst();
r.show();
r.contentPane.getChild("title").asTextField.text = e;
r.contentPane.getChild("content").asTextField.text = n;
};
t.prototype.onInit = function() {
this.contentPane = fgui.UIPackage.createObject("commons", "AlertWindow").asCom;
this.center();
};
return t;
}(fgui.Window);
n.default = r;
cc._RF.pop();
}, {} ],
AppConfig: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "12cf41W7tlPzoLZVTcrbgP8", "AppConfig");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
function e() {}
e.PLAZA_WS_HOST = "192.168.1.6";
e.PLAZA_WS_PORT = 8082;
e.PLATFORM_URL = "http://192.168.1.6:8090/";
e.PLAZA_WS_NAME = "PLAZA_WS";
e.LOCAL_FIRE = "LOCAL_FIRE";
e.PLAZA_FIRE = "PLAZA_FIRE";
e.GAME_FIRE = "GAME_FIRE";
e.GAME_WS_NAME = "GAME_WS_NAME";
return e;
}();
n.default = r;
cc._RF.pop();
}, {} ],
AudioManager: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "1f3aatSwUNFM61nLb0C+xEA", "AudioManager");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
function e() {}
e.play_music = function(e, t) {
var n = fgui.UIPackage.getItemByURL(fgui.UIPackage.getItemURL(e, t));
cc.audioEngine.playMusic(n.owner.getItemAsset(n), !0);
};
e.play_effect = function(e, t) {
var n = fgui.UIPackage.getItemByURL(fgui.UIPackage.getItemURL(e, t));
cc.audioEngine.playEffect(n.owner.getItemAsset(n), !0);
};
e.stop_music = function() {
cc.audioEngine.stopMusic();
};
return e;
}();
n.default = r;
cc._RF.pop();
}, {} ],
BroadcastEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "975ccaM1Z1LyqRUh3utBqKl", "BroadcastEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).emit("broadcast", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
BroadcastEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "5146dXpdVZIHYqmg98/wgoI", "BroadcastEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.broadcasts = [];
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
BroadcastEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "0ffd3PxugRGGYpAK+d8lgM6", "BroadcastEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.mainType = 2;
t.subType = 2;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
ChatEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "a53a7mCafxNb7S79qSuo3kS", "ChatEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {};
return t;
}(e("../../ws/AiJ").AiJ.ResponseHandler);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
ClientReadyEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "41539WwHgRIn4zyS9TZx6oU", "ClientReadyEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.mainType = 2;
t.subType = 5;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
CreateTableEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "96f7a7y86JNSpxX6OkM5bdk", "CreateTableEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).emit("create_table_success", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
CreateTableEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "0ff8cwDxFNMSLp6GUqjnra9", "CreateTableEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
CreateTableEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "28eddJWtRZHF5UW+YtHPijP", "CreateTableEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.ruleText = "{}";
t.mainType = 2;
t.subType = 1;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
DismissTableEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "185f9WIuxtAs7bEWdjloWmU", "DismissTableEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.mainType = 2;
t.subType = 3;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
DismissVoteEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "98f17cD2ldOV4Ifm1IQutYc", "DismissVoteEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("dismiss_vote", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
DismissVoteEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "21bd1IxHp1EWbOw4qTWo6hw", "DismissVoteEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
DismissVoteTableEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "78639sPZXpInrC5BKyNAFBs", "DismissVoteTableEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t) {
var n = e.call(this) || this;
n.mainType = 2;
n.subType = 9;
n.agree = t;
return n;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
FireKit: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "75c871UmTpLjpK6atYRj6Hj", "FireKit");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("./OnFire"), i = function() {
function e() {}
e.init = function(t) {
null == e.fireDict[t] && (e.fireDict[t] = new r.default());
};
e.use = function(t) {
return e.fireDict[t];
};
e.fireDict = {};
return e;
}();
n.default = i;
cc._RF.pop();
}, {
"./OnFire": "OnFire"
} ],
GameServiceManager: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "b2dc1/0dMtPtZy0HabQ6zpy", "GameServiceManager");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("lodash"), i = function() {
function e() {}
e.getInst = function() {
null == e.inst && (e.inst = new e());
return e.inst;
};
e.prototype.initGameService = function(e) {
this.serviceItems = e;
};
e.prototype.getGameService = function(e) {
return r.filter(this.serviceItems, {
name: e
});
};
e.prototype.getGameServiceByServiceId = function(e) {
return r.find(this.serviceItems, {
serviceId: e
});
};
e.prototype.randomGameService = function(e) {
var t = r.filter(this.serviceItems, {
name: e
});
return 0 == t.length ? null : r.shuffle(t)[0];
};
return e;
}();
n.default = i;
cc._RF.pop();
}, {
lodash: 7
} ],
HeroEnterEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "9262bUVcJ1OMrncc71qlLLd", "HeroEnterEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_enter", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroEnterEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6557bWuuOZGEaj7f/o9w4ew", "HeroEnterEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroLeaveEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "59312p2OLVMVpxrIa2DeHgr", "HeroLeaveEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_leave", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroLeaveEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "896faIVO4lN17aVbV+D8xoP", "HeroLeaveEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroManager: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "bf0a6u1ii9AXrLaSJD1Gaqa", "HeroManager");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
function e() {
this.heroes = {};
}
e.getInst = function() {
null == e.inst && (e.inst = new e());
return e.inst;
};
e.prototype.getHero = function(e) {
return this.heroes[e];
};
e.prototype.addHero = function(e) {
this.heroes[e.userId] = e;
};
e.prototype.setMe = function(e) {
this.addHero(e);
this._me = e;
};
e.prototype.getMe = function() {
return this._me;
};
return e;
}();
n.default = r;
cc._RF.pop();
}, {} ],
HeroOfflineEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "cc232+JEc9IXbgRURJmYipn", "HeroOfflineEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_offline", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroOfflineEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "1a7e34baSxGgJCeOXRk/Pim", "HeroOfflineEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroOnlineEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2bdcb4akB5PCIDM60Gtql4g", "HeroOnlineEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_online", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroOnlineEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "4c020l2/ghJm64BE+cEUUNu", "HeroOnlineEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroProfileEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "8398dN+QoNMJZuGkjs1WeW8", "HeroProfileEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_profile", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroProfileEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "f4b52Qov3VIar4WJEvMWsFc", "HeroProfileEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroProfileEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "d26e8iNpoJIG5rmQRuBNG6h", "HeroProfileEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t) {
var n = e.call(this) || this;
n.mainType = 2;
n.subType = 6;
n.userId = t;
return n;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroSceneResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "bf9a3GjD+lFpbalV5Ux7wLj", "HeroSceneResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_scene", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroSceneResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "bd4fbg6viBFxLkJAUT7kzlq", "HeroSceneResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
var i = function() {
return function() {};
}();
n.HeroItem = i;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroSitDownEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "1315cKkiT9PL5X4OgpjKilw", "HeroSitDownEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_sitDown", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroSitDownEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "ed87dB8W6NFmK16uagR4DDS", "HeroSitDownEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
HeroStandUpEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "1f024N+AvpNdJhzaVKvJ3EU", "HeroStandUpEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("hero_standUp", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
HeroStandUpEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "74f61ofS2FIwI523dkqOntK", "HeroStandUpEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
Hero: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "b9b294yHEFEZ7636zwoW9o7", "Hero");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../AppConfig"), i = function() {
return function(e, t, n, i, o, a, s, u, c, l, d) {
this.userName = e;
this.userId = t;
this.nickName = n;
this.gender = i;
this.avatar = cc.sys.isBrowser ? r.default.PLATFORM_URL + "avatar?url=" + encodeURIComponent(o) : o;
this.distributorId = a;
this.address = s;
this.longitude = u;
this.latitude = c;
this.ip = l;
this.certStatus = d;
};
}();
n.default = i;
cc._RF.pop();
}, {
"../AppConfig": "AppConfig"
} ],
JoinTableEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "236b75l/31JOr5fUmWGNVAT", "JoinTableEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).emit("join_table_success", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
JoinTableEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6b3a2BgaD1O+4Pu41bDMNOz", "JoinTableEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
JoinTableEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "96e52hvEaNMRq37PpKhk/p4", "JoinTableEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t) {
var n = e.call(this) || this;
n.mainType = 2;
n.subType = 2;
n.tableNo = t;
return n;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
LeaveTableEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "662cfPYS5xAiaK1Hj10Kqty", "LeaveTableEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.mainType = 2;
t.subType = 4;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
LoadingWindow: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "48b6aWYWtJFbqwUNS9Ocmq1", "LoadingWindow");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.getInst = function() {
null == t.inst && (t.inst = new t());
return t.inst;
};
t.loading = function(e) {
var n = t.getInst();
n.show();
n.contentPane.getChild("content").asTextField.text = e;
};
t.close = function() {
t.getInst().hide();
};
t.prototype.onInit = function() {
this.contentPane = fgui.UIPackage.createObject("commons", "LoadingWindow").asCom;
this.center();
};
return t;
}(fgui.Window);
n.default = r;
cc._RF.pop();
}, {} ],
LoginNotifyResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "382bfzcpttAo77TKGUOz3MF", "LoginNotifyResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {};
return t;
}(e("../../ws/AiJ").AiJ.ResponseHandler);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
MahjongAction: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "c4eeaGnW6ZIz7J1BnEFGHKQ", "MahjongAction");
Object.defineProperty(n, "__esModule", {
value: !0
});
(function(e) {
e.DISPATCH = "DISPATCH";
e.NOTIFY = "NOTIFY";
e.OUT = "OUT";
e.N = "N";
e.P = "P";
e.G = "G";
e.H = "H";
})(n.MahjongAction || (n.MahjongAction = {}));
cc._RF.pop();
}, {} ],
MahjongDispatchCardEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "8da7cuazHBCP7B9QfngOeiq", "MahjongDispatchCardEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongDispathCardResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "5c900vWz6tNOoFimNnuWI30", "MahjongDispathCardResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("dispatch_card", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongEndEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "45cc55MTndMYJbMJanf4NTX", "MahjongEndEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("end", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongEndEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "b5c8cDoRlhG07kOj3U+UHbr", "MahjongEndEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongErrorEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6d061BqslFJUYyW+tt33Pjy", "MahjongErrorEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {};
return t;
}(e("../../../ws/AiJ").AiJ.ResponseHandler);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongErrorEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "30778JeTGJHVahZP79qBdq7", "MahjongErrorEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongGameActionRecord: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "bc744Db9kBAMZ1SizdWYGnh", "MahjongGameActionRecord");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
return function() {};
}();
n.default = r;
cc._RF.pop();
}, {} ],
MahjongGameEndEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "41d60qY7pBKOYrdD6RzRfoI", "MahjongGameEndEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("game_end", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongGameEndEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "4876a6Vz4dDpKTlU5tfogX7", "MahjongGameEndEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongGameEngine: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "f59f6utdDZDCKeTFD2TiC8Q", "MahjongGameEngine");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../fire/FireKit"), i = e("../../AppConfig"), o = e("../../ws/AiJKit"), a = e("../event/ClientReadyEvent"), s = e("lodash"), u = e("./struct/MahjongWeaveItem"), c = e("./struct/MahjongWeaveType"), l = e("../response/HeroSceneResponse"), d = e("../../hero/HeroManager"), f = e("../event/HeroProfileEvent"), h = e("../../hero/Hero"), p = e("../AbstractRoomConfig"), g = function() {
return function(e, t, n, r) {
this.chair = e;
this.online = t;
this.sitDown = n;
this.nickName = r;
};
}();
n.HeroMate = g;
var _ = function() {
function e(e, t) {
var n = this;
this._heroMap = {};
this._weavesMap = {};
this._discardCardsMap = {};
this._meChair = -1;
this._chairCount = 4;
this._leftCardCount = 0;
this._totalNumber = 0;
this._currentNumber = 0;
this._clientReady = !1;
this._gameStart = !1;
this.clientReady = function() {
n._clientReady = !0;
o.default.use(i.default.GAME_WS_NAME).send(new a.default());
};
this.dismissVoteCb = function(e) {
n._gameLayer.renderDismissVote(e.status, e.agrees, e.refuses, e.voteTime, e.countDown, n._meChair);
};
this.gameHeroOfflineCb = function(e) {
var t = n._heroMap[e.userId];
t.online = !1;
n.renderOnline(t);
};
this.gameHeroOnlineCb = function(e) {
var t = n._heroMap[e.userId];
t.online = !0;
n.renderOnline(t);
};
this.gameHeroStandUpCb = function(e) {
var t = n._heroMap[e.userId];
t.sitDown = !1;
n.renderSitDown(t);
};
this.gameHeroSitDownCb = function(e) {
var t = n._heroMap[e.userId];
t.sitDown = !0;
n.renderSitDown(t);
};
this.gameHeroEnterCb = function(e) {
n.heroEnter(e.userId, e.chair, e.nickName);
};
this.gameHeroLeaveCb = function(e) {
var t = n._heroMap[e.userId];
n.renderLeave(t);
delete n._heroMap[e.userId];
};
this.gameHeroSceneCb = function(e) {
var t = new l.HeroItem();
t.userId = d.default.getInst().getMe().userId;
var r = s.find(e.heroes, t);
null != r && (n._meChair = r.chair);
-1 != n._meChair && s.each(e.heroes, function(e) {
n._heroMap[e.userId] = new g(e.chair, e.online, e.sitDown, e.nickName);
n.renderSitDown(n._heroMap[e.userId]);
n.renderOnline(n._heroMap[e.userId]);
n.getHeroProfile(e.userId);
n._gameLayer.renderHeroSummary(e.chair, e.nickName);
});
};
this.gameHeroProfileCb = function(e) {
var t = new h.default(e.userName, e.userId, e.nickName, e.gender, e.avatar, e.distributorId, e.address, e.longitude, e.latitude, e.ip, e.certStatus);
d.default.getInst().addHero(t);
n.renderHeroProfile(t);
};
this.endCb = function(e) {
window.setTimeout(function() {
for (var t = 0; t < n._chairCount; t++) {
var r = d.default.getInst().getHero(n.getUserId(t));
n._gameLayer.renderEnd(n.switchView(t), e.score[t], e.actionStatistics[t], e.startedTime, e.endedTime, e.tableNo, r.userId == n._joinTableEventResponse.ownerId, r.distributorId);
}
n._gameLayer.renderEndInfo(e.tableNo, e.startedTime, e.endedTime);
}, 4e3);
};
this.gameStartCb = function(e) {
n._gameStart = !0;
n._gameLayer.renderGameStart();
n._meChair = e.chair;
n._chairCount = e.chairCount;
n._cards = e.cards;
n._leftCardCount = e.leftCardCount;
n._totalNumber = e.totalNumber;
n._currentNumber = e.currentNumber;
n._gameLayer.renderLeftCardCount(n._leftCardCount);
n._gameLayer.renderLeftNumber(n._totalNumber - n._currentNumber);
for (var t = 0; t < e.chairCount; t++) {
n._weavesMap[t] = [];
n._discardCardsMap[t] = [];
n.renderSitDown(new g(t, !0, !0, ""));
var r = n.switchView(t);
n._gameLayer.renderScore(r, e.scores[t]);
switch (r) {
case 0:
n._gameLayer.renderSouthDiscardCard(n._discardCardsMap[t]);
n._gameLayer.renderSouthCard(s.clone(n._cards), n.getWeaveItems(t));
break;

case 1:
n._gameLayer.renderEastDiscardCard(n._discardCardsMap[t]);
n._gameLayer.renderEastCard(n.getWeaveItems(t));
break;

case 2:
n._gameLayer.renderNorthDiscardCard(n._discardCardsMap[t]);
n._gameLayer.renderNorthCard(n.getWeaveItems(t));
break;

case 3:
n._gameLayer.renderWestDiscardCard(n._discardCardsMap[t]);
n._gameLayer.renderWestCard(n.getWeaveItems(t));
}
}
};
this.gamePlayingSceneCb = function(e) {
n._gameLayer.renderGameStart();
n._gameStart = !0;
n._meChair = e.chair;
n._chairCount = e.chairCount;
n._cards = e.cards;
n._leftCardCount = e.leftCardCount;
n._totalNumber = e.totalNumber;
n._currentNumber = e.currentNumber;
if (e.current == n._meChair && -1 != e.currCard) {
var t = n._cards.indexOf(e.currCard);
n._cards.splice(t, 1);
n._cards.push(e.currCard);
n._currCard = e.currCard;
}
for (var r = 0; r < e.chairCount; r++) {
n._discardCardsMap[r] = s.slice(e.discardCards[r], 0, e.discardCount[r]);
n._weavesMap[r] = e.weaveItems[r];
n.renderSitDown(new g(r, !0, !0, ""));
var i = n.switchView(r);
n._gameLayer.renderScore(i, e.scores[r]);
switch (i) {
case 0:
n._gameLayer.renderSouthDiscardCard(s.clone(n._discardCardsMap[r]));
n._gameLayer.renderSouthCard(s.clone(n._cards), n.getWeaveItems(r), n._currCard);
break;

case 1:
n._gameLayer.renderEastDiscardCard(s.clone(n._discardCardsMap[r]));
n._gameLayer.renderEastCard(n.getWeaveItems(r), r == e.current ? 0 : -1);
break;

case 2:
n._gameLayer.renderNorthDiscardCard(s.clone(n._discardCardsMap[r]));
n._gameLayer.renderNorthCard(n.getWeaveItems(r), r == e.current ? 0 : -1);
break;

case 3:
n._gameLayer.renderWestDiscardCard(s.clone(n._discardCardsMap[r]));
n._gameLayer.renderWestCard(n.getWeaveItems(r), r == e.current ? 0 : -1);
}
}
n._gameLayer.renderLeftCardCount(n._leftCardCount);
n._gameLayer.renderLeftNumber(n._totalNumber - n._currentNumber);
n._gameLayer.renderPilotLamp(n.switchView(e.current));
0 != e.action && n._gameLayer.renderOperateNotify(e.actionCard, 0 != (4 & e.action), 0 != (2 & e.action), 0 != (1 & e.action), !0, e.actionCards);
};
this.gameEndCb = function(e) {
for (var t = 0; t < e.chairCount; t++) {
var r = -1 != s.indexOf(e.chairs, t) ? e.currCard : -1;
if (-1 != s.indexOf(e.chairs, e.provider) && -1 != s.indexOf(e.chairs, t)) {
var i = e.cards[t].indexOf(r);
e.cards[t].splice(i, 1);
}
var o = s.clone(e.cards[t]);
-1 != s.indexOf(e.chairs, t) && 0 == n.switchView(t) && o.push(r);
switch (n.switchView(t)) {
case 0:
n._gameLayer.renderSouthCard(o, e.weaveItems[t], r);
break;

case 1:
n._gameLayer.renderEastCard(e.weaveItems[t], r, o);
break;

case 2:
n._gameLayer.renderNorthCard(e.weaveItems[t], r, o);
break;

case 3:
n._gameLayer.renderWestCard(e.weaveItems[t], r, o);
}
}
window.setTimeout(function() {
for (var t = 0; t < e.chairCount; t++) {
n._gameLayer.renderGameEndCards(n.switchView(t), e.weaveItems[t], e.cards[t], -1 != s.indexOf(e.chairs, t), -1 == s.indexOf(e.chairs, t) && e.provider == t, e.currCard);
n._gameLayer.renderGameEndFlag(n.switchView(t), e.infos[t], e.totalScores[t], e.scores[t], -1 != s.indexOf(e.chairs, t), e.banker == t);
}
}, 2e3);
};
this.gameDispatchCardCb = function(e) {
var t = n.getWeaveItems(e.chair);
if (e.chair == n._meChair) {
n._cards.push(e.card);
n._currCard = e.card;
}
switch (n.switchView(e.chair)) {
case 0:
n._gameLayer.renderSouthCard(s.clone(n._cards), t, n._currCard);
break;

case 1:
n._gameLayer.renderEastCard(t, 0);
break;

case 2:
n._gameLayer.renderNorthCard(t, 0);
break;

case 3:
n._gameLayer.renderWestCard(t, 0);
}
n._gameLayer.renderLeftCardCount(--n._leftCardCount);
n._gameLayer.renderDispatchCard();
n._gameLayer.renderPilotLamp(n.switchView(e.chair));
};
this.gameOutCardCb = function(e) {
var t = n.getWeaveItems(e.chair), r = n.getDiscardCards(e.chair);
r.push(e.card);
if (e.chair == n._meChair) {
var i = n._cards.indexOf(e.card);
n._cards.splice(i, 1);
n._cards = s.sortBy(n._cards);
}
switch (n.switchView(e.chair)) {
case 0:
n._gameLayer.renderSouthDiscardCard(r, !0);
n._gameLayer.renderSouthCard(s.clone(n._cards), t);
break;

case 1:
n._gameLayer.renderEastDiscardCard(r, !0);
n._gameLayer.renderEastCard(t);
break;

case 2:
n._gameLayer.renderNorthDiscardCard(r, !0);
n._gameLayer.renderNorthCard(t);
break;

case 3:
n._gameLayer.renderWestDiscardCard(r, !0);
n._gameLayer.renderWestCard(t);
}
};
this.gameOperateNotifyCb = function(e) {
n._meChair == e.chair && n._gameLayer.renderOperateNotify(e.card, 0 != (4 & e.action), 0 != (2 & e.action), 0 != (1 & e.action), !0, e.cards);
n._gameLayer.renderPilotLamp(-1);
};
this.gameOperateResultCb = function(e) {
var t = n.getWeaveItems(e.chair), r = n.getDiscardCards(e.provider), i = 0;
switch (e.action) {
case 0:
break;

case 1:
n._meChair == e.chair && s.remove(n._cards, function(t) {
return t == e.card && i++ < 2;
});
if (e.chair != e.provider) {
r = s.dropRight(r, 1);
n._discardCardsMap[e.provider] = r;
}
t.push(new u.default(c.MahjongWeaveType.P, e.card, !0, e.provider));
break;

case 2:
var o = s.find(t, {
centerCard: e.card,
weaveType: c.MahjongWeaveType.P
});
n._meChair == e.chair && s.remove(n._cards, function(t) {
return t == e.card && i++ < (null == o ? e.provider != e.chair ? 3 : 4 : 1);
});
if (e.chair != e.provider) {
r = s.dropRight(r, 1);
n._discardCardsMap[e.provider] = r;
}
null == o ? t.push(new u.default(c.MahjongWeaveType.G, e.card, e.provider != e.chair, e.provider)) : o.weaveType = c.MahjongWeaveType.G;
}
switch (n.switchView(e.chair)) {
case 0:
n._gameLayer.renderSouthCard(s.clone(n._cards), t);
break;

case 1:
n._gameLayer.renderEastCard(t);
break;

case 2:
n._gameLayer.renderNorthCard(t);
break;

case 3:
n._gameLayer.renderWestCard(t);
}
switch (n.switchView(e.provider)) {
case 0:
n._gameLayer.renderSouthDiscardCard(r);
break;

case 1:
n._gameLayer.renderEastDiscardCard(r);
break;

case 2:
n._gameLayer.renderNorthDiscardCard(r);
break;

case 3:
n._gameLayer.renderWestDiscardCard(r);
}
n._gameLayer.renderPilotLamp(n.switchView(e.chair));
};
this.gameStatusCb = function(e) {};
this._gameLayer = e;
this._joinTableEventResponse = t;
r.default.use(i.default.GAME_FIRE).onGroup("game_start", this.gameStartCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("game_status", this.gameStatusCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("playing_scene", this.gamePlayingSceneCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("game_end", this.gameEndCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("dispatch_card", this.gameDispatchCardCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("out_card", this.gameOutCardCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("operate_notify", this.gameOperateNotifyCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("operate_result", this.gameOperateResultCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_profile", this.gameHeroProfileCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_scene", this.gameHeroSceneCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_enter", this.gameHeroEnterCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_leave", this.gameHeroLeaveCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_offline", this.gameHeroOfflineCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_online", this.gameHeroOnlineCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_sitDown", this.gameHeroSitDownCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("hero_standUp", this.gameHeroStandUpCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("end", this.endCb, this);
r.default.use(i.default.GAME_FIRE).onGroup("dismiss_vote", this.dismissVoteCb, this);
}
e.prototype.destroy = function() {
r.default.use(i.default.GAME_FIRE).offGroup(this);
p.default.destroyInst();
};
e.prototype.heroEnter = function(e, t, n) {
this._heroMap[e] = new g(t, !0, !1, n);
e == d.default.getInst().getMe().userId && (this._meChair = t);
this.getHeroProfile(e);
this._gameLayer.renderHeroSummary(t, n);
};
e.prototype.getHeroProfile = function(e) {
null == d.default.getInst().getHero(e) ? o.default.use(i.default.GAME_WS_NAME).send(new f.default(e)) : this.renderHeroProfile(d.default.getInst().getHero(e));
};
e.prototype.renderLeave = function(e) {
this._clientReady && this._gameLayer.renderLeave(this.switchView(e.chair));
};
e.prototype.renderHeroProfile = function(e) {
this._clientReady && this._gameLayer.renderHeroProfile(this.switchView(this._heroMap[e.userId].chair), this._heroMap[e.userId].chair, e);
};
e.prototype.renderOnline = function(e) {
this._clientReady && this._gameLayer.renderOnline(this.switchView(e.chair), e.online);
};
e.prototype.renderSitDown = function(e) {
this._clientReady && this._gameLayer.renderSitDown(this.switchView(e.chair), e.sitDown, this._gameStart);
};
e.prototype.getWeaveItems = function(e) {
void 0 == this._weavesMap[e] && (this._weavesMap[e] = new Array());
return this._weavesMap[e];
};
e.prototype.getDiscardCards = function(e) {
void 0 == this._discardCardsMap[e] && (this._discardCardsMap[e] = new Array());
return this._discardCardsMap[e];
};
e.prototype.switchView = function(e) {
return -1 == e ? -1 : (e + this._chairCount - this._meChair) % this._chairCount;
};
e.prototype.switchChair = function(e) {
return (e + this._meChair) % this._chairCount;
};
e.prototype.getUserId = function(e) {
var t = this, n = "";
s.each(s.keys(this._heroMap), function(r) {
t._heroMap[r].chair == e && (n = r);
});
return n;
};
e.prototype.getHeroMate = function(e) {
return this._heroMap[this.getUserId(e)];
};
return e;
}();
n.default = _;
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
MahjongGameLayer: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "227feaS5QlMcJvZTEwOL1vd", "MahjongGameLayer");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = cc._decorator.ccclass, i = e("../../ws/AiJKit"), o = e("../../AppConfig"), a = e("lodash"), s = e("./event/MahjongOutCardEvent"), u = e("./MahjongGameEngine"), c = e("./event/MahjongOperateEvent"), l = e("./struct/MahjongWeaveType"), d = e("md5"), f = e("../event/SitDownTableEvent"), h = e("../../AiJCCComponent"), p = e("../../UIManger"), g = e("../../plazz/PlazaLayer"), _ = e("../event/DismissVoteTableEvent"), v = e("../event/LeaveTableEvent"), m = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t._headViewMap = {};
t._gameOverViewMap = {};
t._endViewMap = {};
t._countDown = 30;
return t;
}
t.prototype.onLoad = function() {
var e = this;
this.loadPackage("mahjong", function() {
fgui.UIPackage.addPackage("mahjong");
e._view = fgui.UIPackage.createObject("mahjong", "MahjongGameLayer").asCom;
fgui.GRoot.inst.addChild(e._view);
e.initView();
});
};
t.prototype.onInitAiJCom = function(e) {
this._engine = new u.default(this, e);
this._engine.clientReady();
};
t.prototype.initFire = function() {};
t.prototype.onDestroy = function() {
this._engine.destroy();
this._view.dispose();
};
t.prototype.initView = function() {
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
var e = this._view.getChild("GameEndGroup").asGroup;
this._gameOverViewMap[0] = this._view.getChildInGroup("SouthGameOverItemComponent", e).asCom;
this._gameOverViewMap[1] = this._view.getChildInGroup("EastGameOverItemComponent", e).asCom;
this._gameOverViewMap[2] = this._view.getChildInGroup("NorthGameOverItemComponent", e).asCom;
this._gameOverViewMap[3] = this._view.getChildInGroup("WestGameOverItemComponent", e).asCom;
var t = this._view.getChild("EndGroup").asGroup;
this._endViewMap[0] = this._view.getChildInGroup("SouthEndItemComponent", t).asCom;
this._endViewMap[1] = this._view.getChildInGroup("EastEndItemComponent", t).asCom;
this._endViewMap[2] = this._view.getChildInGroup("NorthEndItemComponent", t).asCom;
this._endViewMap[3] = this._view.getChildInGroup("WestEndItemComponent", t).asCom;
var n = this._view.getChild("VoteGroup").asGroup;
this._voteItemList = this._view.getChildInGroup("VoteItemList", n).asList;
this._voteItemList.removeChildren();
this._view.getChildInGroup("NextGameButton", e).asButton.onClick(function() {
i.default.use(o.default.GAME_WS_NAME).send(new f.default());
}, this);
this._view.getChild("SitDownButton").asButton.onClick(function() {
i.default.use(o.default.GAME_WS_NAME).send(new f.default());
}, this);
this._view.getChild("DismissVoteButton").asButton.onClick(function() {
i.default.use(o.default.GAME_WS_NAME).send(new _.default(!0));
}, this);
this._view.getChild("LeaveButton").asButton.onClick(function() {
i.default.use(o.default.GAME_WS_NAME).send(new v.default());
}, this);
this._view.getChildInGroup("BackButton", t).asButton.onClick(function() {
p.default.getInst().switchLayer(g.default);
}, this);
this._view.getChildInGroup("VoteAgreeButton", n).asButton.onClick(function() {
i.default.use(o.default.GAME_WS_NAME).send(new _.default(!0));
}, this);
this._view.getChildInGroup("VoteRefuseButton", n).asButton.onClick(function() {
i.default.use(o.default.GAME_WS_NAME).send(new _.default(!1));
}, this);
};
t.prototype.renderGameStart = function() {
this._view.getChild("SitDownButton").asButton.visible = !1;
this._view.getController("c1").setSelectedPage("playing");
};
t.prototype.renderLeftCardCount = function(e) {
this._leftCardCountText.text = a.padStart(e.toString(10), 2, "0");
};
t.prototype.renderLeftNumber = function(e) {
this._leftNumberText.text = a.padStart(e.toString(10), 2, "0");
};
t.prototype.renderDispatchCard = function() {
this._countDown = 30;
};
t.prototype.renderPilotLamp = function(e) {
this._view.getChild("pilotLamp0").asImage.visible = !1;
this._view.getChild("pilotLamp1").asImage.visible = !1;
this._view.getChild("pilotLamp2").asImage.visible = !1;
this._view.getChild("pilotLamp3").asImage.visible = !1;
var t = this._view.getChild("pilotLamp" + e);
null != t && (t.asImage.visible = !0);
};
t.prototype.renderWestCard = function(e, t, n) {
var r = this;
void 0 === t && (t = -1);
void 0 === n && (n = null);
this._westView.removeChildren();
var i = 0;
a.each(e, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), o = fgui.UIPackage.createObject("mahjong", e.weaveType == l.MahjongWeaveType.P ? "WestPengComponent" : "WestGangComponent").asCom;
o.setPosition(0, i);
i += o.height;
switch (e.weaveType) {
case l.MahjongWeaveType.P:
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
break;

case l.MahjongWeaveType.G:
if (e.open) {
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
}
o.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
}
r._westView.addChild(o);
});
for (var o = 13 - 3 * e.length, s = 0; s < o; s++) {
var u = fgui.UIPackage.createObject("mahjong", "w_hand").asImage;
null != n && (u = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + a.padStart(n[s].toString(16), 2, "0")).asImage).setScale(.75, .75);
u.setPosition(0, i);
i += 60;
u.sortingOrder = s;
this._westView.addChild(u);
}
if (-1 != t) {
u = 0 == t ? fgui.UIPackage.createObject("mahjong", "w_hand").asImage : fgui.UIPackage.createObject("mahjong", "w_mingmah_" + a.padStart(t.toString(16), 2, "0")).asImage;
0 != t && u.setScale(.75, .75);
u.setPosition(0, this._westView.height - u.height);
this._westView.addChild(u);
}
};
t.prototype.renderNorthCard = function(e, t, n) {
var r = this;
void 0 === t && (t = -1);
void 0 === n && (n = null);
this._northView.removeChildren();
var i = this._northView.width;
a.each(e, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), o = fgui.UIPackage.createObject("mahjong", e.weaveType == l.MahjongWeaveType.P ? "NorthPengComponent" : "NorthGangComponent").asCom;
i -= o.width;
o.setPosition(i, r._northView.height - o.height);
switch (e.weaveType) {
case l.MahjongWeaveType.P:
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
break;

case l.MahjongWeaveType.G:
if (e.open) {
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
o.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
r._northView.addChild(o);
});
for (var o = 13 - 3 * e.length, s = 0; s < o; s++) {
var u = null == n ? fgui.UIPackage.createObject("mahjong", "n_hand").asImage : fgui.UIPackage.createObject("mahjong", "s_mingmah_" + a.padStart(n[s].toString(16), 2, "0")).asImage;
i -= u.width;
u.setPosition(i, this._northView.height - u.height);
this._northView.addChild(u);
}
if (-1 != t) {
u = 0 == t ? fgui.UIPackage.createObject("mahjong", "n_hand").asImage : fgui.UIPackage.createObject("mahjong", "s_mingmah_" + a.padStart(t.toString(16), 2, "0")).asImage;
i -= u.width + 45;
u.setPosition(i, this._northView.height - u.height);
this._northView.addChild(u);
}
};
t.prototype.renderEastCard = function(e, t, n) {
var r = this;
void 0 === t && (t = -1);
void 0 === n && (n = null);
this._eastView.removeChildren();
var i = this._eastView.height;
a.each(e, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), o = fgui.UIPackage.createObject("mahjong", e.weaveType == l.MahjongWeaveType.P ? "EastPengComponent" : "EastGangComponent").asCom;
i -= o.height;
o.setPosition(r._eastView.width - o.width, i);
switch (e.weaveType) {
case l.MahjongWeaveType.P:
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
break;

case l.MahjongWeaveType.G:
if (e.open) {
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
}
o.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
}
r._eastView.addChild(o);
});
for (var o = 13 - 3 * e.length, s = 0; s < o; s++) {
var u = fgui.UIPackage.createObject("mahjong", "e_hand").asImage;
null != n && (u = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + a.padStart(n[s].toString(16), 2, "0")).asImage).setScale(.75, .75);
i -= 0 == s ? u.height : 60;
u.setPosition(this._eastView.width - u.width + .25 * u.width, i);
u.sortingOrder = o - s;
this._eastView.addChild(u);
}
if (-1 != t) {
u = 0 == t ? fgui.UIPackage.createObject("mahjong", "e_hand").asImage : fgui.UIPackage.createObject("mahjong", "e_mingmah_" + a.padStart(t.toString(16), 2, "0")).asImage;
0 != t && u.setScale(.75, .75);
u.setPosition(this._eastView.width - u.width + .25 * u.width, 0);
this._eastView.addChild(u);
}
};
t.prototype.renderSouthCard = function(e, t, n) {
var r = this;
void 0 === n && (n = -1);
this._southView.removeChildren();
this._operateNotifyView.removeChildren();
var u = 0;
a.each(t, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), i = fgui.UIPackage.createObject("mahjong", e.weaveType == l.MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
i.setPosition(u, r._southView.height - i.height);
switch (e.weaveType) {
case l.MahjongWeaveType.P:
i.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
i.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
i.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
break;

case l.MahjongWeaveType.G:
if (e.open) {
i.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
i.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
i.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
i.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
u += i.width;
r._southView.addChild(i);
});
a.each(e, function(t, c) {
var l = a.padStart(t.toString(16), 2, "0"), d = fgui.UIPackage.createObject("mahjong", "SouthCardComponent").asCom;
d.setPosition(u + c * d.width + (c + 1 == e.length && -1 != n ? 30 : 0), r._southView.height - d.height);
d.getChild("icon").asLoader.url = fgui.UIPackage.getItemURL("mahjong", "s_handmah_" + l);
d.draggable = !0;
d.data = new C(d.x, d.y, t);
d.on(fgui.Event.DRAG_END, function(e) {
var t = fgui.GObject.cast(e.currentTarget), n = t.data;
if (t.y <= -100) {
i.default.use(o.default.GAME_WS_NAME).send(new s.default(n.value));
console.log("滑动出牌:" + n.value);
}
t.setPosition(n.x, n.y);
}, r);
d.on(fgui.Event.CLICK, function(e) {
var t = fgui.GObject.cast(e.currentTarget), n = t.data;
if (n.y == t.y) t.setPosition(n.x, n.y - 50); else {
if (t.globalToLocal(e.pos.x, e.pos.y).y <= 60) t.setPosition(n.x, n.y); else {
i.default.use(o.default.GAME_WS_NAME).send(new s.default(n.value));
console.log("点击出牌:" + n.value);
}
}
}, r);
r._southView.addChild(d);
});
};
t.prototype.renderOperateNotify = function(e, t, n, r, a, s) {
void 0 === a && (a = !0);
void 0 === s && (s = []);
this._operateNotifyView.removeChildren();
var u = 0, l = this._operateNotifyView.height;
if (a) {
(d = fgui.UIPackage.createObject("mahjong", "GuoButton").asCom).setPosition(u, l - d.height);
u += d.width + 20;
d.data = e;
d.on(fgui.Event.CLICK, function(e) {
var t = fgui.GObject.cast(e.currentTarget);
i.default.use(o.default.GAME_WS_NAME).send(new c.default(0, t.data));
}, this);
this._operateNotifyView.addChild(d);
}
if (r) {
(d = fgui.UIPackage.createObject("mahjong", "PengButton").asCom).setPosition(u, l - d.height);
u += d.width + 20;
d.data = e;
d.on(fgui.Event.CLICK, function(e) {
var t = fgui.GObject.cast(e.currentTarget);
i.default.use(o.default.GAME_WS_NAME).send(new c.default(1, t.data));
}, this);
this._operateNotifyView.addChild(d);
}
if (n) {
(d = fgui.UIPackage.createObject("mahjong", "GangButton").asCom).setPosition(u, l - d.height);
u += d.width + 20;
d.data = e;
d.on(fgui.Event.CLICK, function(e) {
var t = fgui.GObject.cast(e.currentTarget);
i.default.use(o.default.GAME_WS_NAME).send(new c.default(2, t.data));
}, this);
this._operateNotifyView.addChild(d);
}
if (t) {
var d;
(d = fgui.UIPackage.createObject("mahjong", "HuButton").asCom).setPosition(u, l - d.height);
d.data = e;
d.on(fgui.Event.CLICK, function(e) {
var t = fgui.GObject.cast(e.currentTarget);
i.default.use(o.default.GAME_WS_NAME).send(new c.default(4, t.data));
}, this);
this._operateNotifyView.addChild(d);
}
};
t.prototype.renderSouthDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._southDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 11).toString()), s = i % 11, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + u).asImage;
c.setPosition(s * c.width, n._southDiscardView.height - (c.height + o * (c.height - 26)));
c.sortingOrder = 11 - o;
n._southDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(10, -30));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderNorthDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._northDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 11).toString()), s = i % 11, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + u).asImage;
c.setPosition(n._northDiscardView.width - (s + 1) * c.width, o * (c.height - 26));
c.sortingOrder = o;
n._northDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(10, -30));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderEastDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._eastDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 10).toString()), s = i % 10, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + u).asImage;
c.setPosition(n._eastDiscardView.width - (o + 1) * c.width, n._eastDiscardView.height - (c.height + s * (c.height - 40)));
c.sortingOrder = 10 - s;
n._eastDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(0, -20));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderWestDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._westDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 10).toString()), s = i % 10, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + u).asImage;
c.setPosition(o * c.width, s * (c.height - 40));
c.sortingOrder = s;
n._westDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(40, -20));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderHeroSummary = function(e, t) {
var n = this._voteItemList.getChild(e.toString());
null != n && this._voteItemList.removeChild(n);
var r = fgui.UIPackage.createObject("mahjong", "VoteItemComponent").asCom;
r.getChild("NickNameText").asTextField.text = t;
r.getChild("VoteResultText").asTextField.text = "等待";
this._voteItemList.addChildAt(r).name = e.toString();
};
t.prototype.renderHeroProfile = function(e, t, n) {
var r = a.padStart(n.userId, 6, "0");
this._headViewMap[e].getChild("nickName").asTextField.text = n.nickName;
this._gameOverViewMap[e].getChild("GameOverHeadItemComponent").asCom.getChild("NickNameText").asTextField.text = n.nickName;
this._endViewMap[e].getChild("NickNameText").asTextField.text = n.nickName;
this._endViewMap[e].getChild("UserIdText").asTextField.text = r;
this._gameOverViewMap[e].getChild("GameOverHeadItemComponent").asCom.getChild("IdText").asTextField.text = r;
if (null != n.avatar) {
var i = "?name=" + d(n.avatar) + ".png";
this._headViewMap[e].getChild("avatar").asLoader.url = n.avatar + i;
this._gameOverViewMap[e].getChild("GameOverHeadItemComponent").asCom.getChild("Avatar").asLoader.url = n.avatar + i;
this._endViewMap[e].getChild("AvatarLoader").asLoader.url = n.avatar + i;
}
};
t.prototype.renderOnline = function(e, t) {
this._headViewMap[e].getChild("OfflineImage").asImage.visible = !t;
};
t.prototype.renderSitDown = function(e, t, n) {
this._headViewMap[e].getChild("SitDownImage").asImage.visible = t && !n;
};
t.prototype.renderLeave = function(e) {
this._headViewMap[e].getChild("OfflineImage").asImage.visible = !1;
this._headViewMap[e].getChild("SitDownImage").asImage.visible = !1;
this._headViewMap[e].getChild("TalkImage").asImage.visible = !1;
this._headViewMap[e].getChild("avatar").asLoader.url = "";
this._headViewMap[e].getChild("nickName").asTextField.text = "";
this._headViewMap[e].getChild("scoreText").asTextField.text = "";
0 == e && p.default.getInst().switchLayer(g.default);
};
t.prototype.renderScore = function(e, t) {
this._headViewMap[e].getChild("scoreText").asTextField.text = t >= 0 ? "+" + t.toString() : t.toString();
};
t.prototype.renderGameEndCards = function(e, t, n, r, i, o) {
this._view.getChild("SitDownButton").asButton.visible = !0;
this._view.getController("c1").setSelectedPage("gameEnd");
var s = this._gameOverViewMap[e].getChild("GameOverCardItemComponent").asCom;
s.removeChildren();
var u = 0;
a.each(t, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), r = fgui.UIPackage.createObject("mahjong", e.weaveType == l.MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
r.setPosition(u, s.height - r.height);
switch (e.weaveType) {
case l.MahjongWeaveType.P:
r.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
r.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
r.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
break;

case l.MahjongWeaveType.G:
if (e.open) {
r.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
r.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
r.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
r.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
u += r.width;
s.addChild(r);
});
a.each(n, function(e, t) {
var n = a.padStart(e.toString(16), 2, "0"), r = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage;
r.setPosition(u, s.height - r.height);
u += r.width;
s.addChild(r);
});
if (r) {
var c = a.padStart(o.toString(16), 2, "0"), d = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + c).asImage;
d.setPosition(u + 30, s.height - d.height);
s.addChild(d);
}
};
t.prototype.renderGameEndFlag = function(e, t, n, r, i, o) {
this._headViewMap[e].getChild("scoreText").asTextField.text = n >= 0 ? "+" + n.toString() : n.toString();
this._gameOverViewMap[e].getChild("winner").asImage.visible = i;
this._gameOverViewMap[e].getChild("InfoText").asTextField.text = t;
this._gameOverViewMap[e].getChild("ScoreText").asTextField.text = r >= 0 ? "+" + r.toString() : r.toString();
this._gameOverViewMap[e].getChild("GameOverHeadItemComponent").asCom.getChild("Banker").asImage.visible = o;
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
};
t.prototype.renderOutCardBadgeAnimate = function(e, t) {
this._mahjongOutCardBadgeAnimate = fgui.UIPackage.createObject("mahjong", "MahjongOutCardBadgeAnimate").asMovieClip;
this._mahjongOutCardBadgeAnimate.setPosition(e, t);
this._view.addChild(this._mahjongOutCardBadgeAnimate);
};
t.prototype.renderEndInfo = function(e, t, n) {
var r = this._view.getChild("EndGroup").asGroup, i = this._view.getChildInGroup("TableNoText", r).asTextField.data, o = this._view.getChildInGroup("TimeInfoText", r).asTextField.data;
this._view.getChildInGroup("TableNoText", r).asTextField.text = a.template(i)({
tableNo: e
});
this._view.getChildInGroup("TimeInfoText", r).asTextField.text = a.template(o)({
startedTime: t,
endedTime: n
});
this._view.getController("c1").setSelectedPage("end");
};
t.prototype.renderEnd = function(e, t, n, r, i, o, a, s) {
this._endViewMap[e].getChild("OwnerImage").asImage.visible = a;
this._endViewMap[e].getChild("AgentImage").asImage.visible = "" != s;
this._endViewMap[e].getChild("WinnerImage").asImage.visible = t > 0;
this._endViewMap[e].getChild("ScoreText").asTextField.text = t >= 0 ? "+" + t.toString() : t.toString();
this._endViewMap[e].getChild("0Text").asTextField.text = n[0].toString();
this._endViewMap[e].getChild("1Text").asTextField.text = n[1].toString();
this._endViewMap[e].getChild("2Text").asTextField.text = n[2].toString();
this._endViewMap[e].getChild("3Text").asTextField.text = n[3].toString();
this._endViewMap[e].getChild("4Text").asTextField.text = n[4].toString();
this._endViewMap[e].getChild("5Text").asTextField.text = n[5].toString();
};
t.prototype.renderDismissVote = function(e, t, n, r, i, o) {
var s = this, u = this._view.getChild("VoteGroup").asGroup;
if (1 == e) {
this._view.getChildInGroup("VoteTimeText", u).asTextField.text = r;
this._view.getChildInGroup("VoteCountDownText", u).asTextField.text = i.toString();
this._view.getController("c1").setSelectedPage("vote");
if (null != t) {
if (-1 != a.indexOf(t, o)) {
this._view.getChildInGroup("VoteAgreeButton", u).asButton.visible = !1;
this._view.getChildInGroup("VoteRefuseButton", u).asButton.visible = !1;
}
a.each(t, function(e) {
s._voteItemList.getChild(e.toString()).asCom.getChild("VoteResultText").asTextField.text = "同意";
});
}
if (null != n) {
if (-1 != a.indexOf(n, o)) {
this._view.getChildInGroup("VoteAgreeButton", u).asButton.visible = !1;
this._view.getChildInGroup("VoteRefuseButton", u).asButton.visible = !1;
}
a.each(n, function(e) {
s._voteItemList.getChild(e.toString()).asCom.getChild("VoteResultText").asTextField.text = "拒绝";
});
}
} else {
this._view.getChildInGroup("VoteAgreeButton", u).asButton.visible = !0;
this._view.getChildInGroup("VoteRefuseButton", u).asButton.visible = !0;
this._view.getController("c1").setSelectedPage("playing");
for (var c = this._voteItemList.numChildren, l = 0; l < c; l++) this._voteItemList.getChild(l.toString()).asCom.getChild("VoteResultText").asTextField.text = "等待";
}
};
return t = __decorate([ r ], t);
}(h.default);
n.default = m;
var C = function() {
return function(e, t, n) {
this.x = e;
this.y = t;
this.value = n;
};
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
MahjongGameRecord: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "33ecet6YvBGKqP2pBtxFVBb", "MahjongGameRecord");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
return function() {};
}();
n.default = r;
cc._RF.pop();
}, {} ],
MahjongGameStartEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "7a4d8ZjAxtIybJ3rggPZHz0", "MahjongGameStartEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongGameStartRecord: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "63831n6n1dM95QAP7yqarLO", "MahjongGameStartRecord");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
return function() {};
}();
n.default = r;
cc._RF.pop();
}, {} ],
MahjongGameStartResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "f5d97aB6DhMs7/Oe5CtAz9i", "MahjongGameStartResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("game_start", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongGameStatusResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "849baGkDD9MVLlVOhkPPl34", "MahjongGameStatusResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("game_status", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongGameStatusResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "998b70YMZxBN4za0V1hh/0X", "MahjongGameStatusResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongOperateEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "aadf1LwziZHLKnPMXQ9/poU", "MahjongOperateEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t, n) {
var r = e.call(this) || this;
r.action = t;
r.card = n;
r.mainType = 8;
r.subType = 1;
return r;
}
return t;
}(e("../../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongOperateNotifyEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "8a5cb/ROHRPF4kYxMqRmph5", "MahjongOperateNotifyEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("operate_notify", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongOperateNotifyEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "13c957E0UlJv5IECe5iMoWn", "MahjongOperateNotifyEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongOperateResultEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "d2880CREslDYb9HnrBPZpOn", "MahjongOperateResultEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("operate_result", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongOperateResultEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2d3942MIWZBe4jmwLTT5g6X", "MahjongOperateResultEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongOutCardEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "d35babWKElHz4e57Jq7PYpK", "MahjongOutCardEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongOutCardEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6c08b+kCS9PBagcebEAnMxq", "MahjongOutCardEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t) {
var n = e.call(this) || this;
n.mainType = 8;
n.subType = 0;
n.card = t;
return n;
}
return t;
}(e("../../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongOutCardResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "ac3faVWXxFDrpRKqCJlIaRD", "MahjongOutCardResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("out_card", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongPlayerRecord: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "a5475BID+hBT6ZZOQMI0wyV", "MahjongPlayerRecord");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
return function() {};
}();
n.default = r;
cc._RF.pop();
}, {} ],
MahjongPlayingGameSceneResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "07599nYPp1O3orkkeGXsWNX", "MahjongPlayingGameSceneResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../../ws/AiJ"), i = e("../../../fire/FireKit"), o = e("../../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).fire("playing_scene", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../../AppConfig": "AppConfig",
"../../../fire/FireKit": "FireKit",
"../../../ws/AiJ": "AiJ"
} ],
MahjongPlayingGameSceneResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "659dfY7o7lMQ4eeFCMLP0l+", "MahjongPlayingGameSceneResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongPrepareGameSceneResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "02c908c/k5JK7ZD5zO10WdA", "MahjongPrepareGameSceneResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {};
return t;
}(e("../../../ws/AiJ").AiJ.ResponseHandler);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongPrepareGameSceneResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "fda8bMSlNhLR54nhF1bG9D9", "MahjongPrepareGameSceneResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../../ws/AiJ": "AiJ"
} ],
MahjongRecord: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "612eeh5yplEbq/InWPMQ+YY", "MahjongRecord");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
return function() {};
}();
n.default = r;
cc._RF.pop();
}, {} ],
MahjongRoomConfig: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "9c0e5cRlKRPf5H+vZYuLmty", "MahjongRoomConfig");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJKit"), i = e("../../fire/FireKit"), o = e("../handler/RoomLoginResponseHandler"), a = e("../handler/LoginNotifyResponseHandler"), s = e("../event/RoomMobileLoginEvent"), u = e("../../AppConfig"), c = e("../handler/CreateTableEventResponseHandler"), l = e("../event/JoinTableEvent"), d = e("../handler/JoinTableEventResponseHandler"), f = e("../../UIManger"), h = e("./MahjongGameLayer"), p = e("../RoomWsListener"), g = e("../handler/HeroOnlineEventResponseHandler"), _ = e("../handler/HeroEnterEventResponseHandler"), v = e("../handler/HeroLeaveEventResponseHandler"), m = e("../handler/HeroOfflineEventResponseHandler"), C = e("../handler/HeroSitDownEventResponseHandler"), w = e("../handler/HeroStandUpEventResponseHandler"), y = e("../handler/HeroSceneResponseHandler"), R = e("../handler/ChatEventResponseHandler"), A = e("../handler/RoomCommonResponseHandler"), b = e("./handler/MahjongGameStartResponseHandler"), I = e("./handler/MahjongGameStatusResponseHandler"), E = e("./handler/MahjongPlayingGameSceneResponseHandler"), j = e("./handler/MahjongDispathCardResponseHandler"), M = e("./handler/MahjongOutCardResponseHandler"), P = e("./handler/MahjongOperateNotifyEventResponseHandler"), F = e("./handler/MahjongOperateResultEventResponseHandler"), O = e("./handler/MahjongErrorEventResponseHandler"), L = e("../handler/HeroProfileEventResponseHandler"), J = e("./handler/MahjongGameEndEventResponseHandler"), x = e("./handler/MahjongPrepareGameSceneResponseHandler"), T = e("./handler/MahjongEndEventResponseHandler"), S = e("../handler/DismissVoteEventResponseHandler"), H = function(e) {
__extends(t, e);
function t(t, n) {
var r = e.call(this, t, n) || this;
r._config.addRouter(0, 0, new A.default());
r._config.addRouter(1, 1, new o.default());
r._config.addRouter(1, 2, new a.default());
r._config.addRouter(2, 1, new c.default());
r._config.addRouter(2, 2, new d.default());
r._config.addRouter(2, 3, new _.default());
r._config.addRouter(2, 4, new v.default());
r._config.addRouter(2, 5, new g.default());
r._config.addRouter(2, 6, new m.default());
r._config.addRouter(2, 7, new C.default());
r._config.addRouter(2, 8, new w.default());
r._config.addRouter(2, 9, new y.default());
r._config.addRouter(2, 10, new R.default());
r._config.addRouter(2, 11, new L.default());
r._config.addRouter(2, 12, new S.default());
r._config.addRouter(8, -1, new O.default());
r._config.addRouter(8, 0, new b.default());
r._config.addRouter(8, 1, new j.default());
r._config.addRouter(8, 2, new M.default());
r._config.addRouter(8, 3, new P.default());
r._config.addRouter(8, 4, new F.default());
r._config.addRouter(8, 5, new I.default());
r._config.addRouter(8, 6, new E.default());
r._config.addRouter(8, 7, new x.default());
r._config.addRouter(8, 8, new J.default());
r._config.addRouter(8, 9, new T.default());
r._config.setWsEventListener(new p.default());
return r;
}
t.prototype.onCreate = function() {
i.default.use(u.default.GAME_FIRE).onGroup("open", t.onOpen, this);
i.default.use(u.default.GAME_FIRE).onGroup("create_table_success", t.onCreateTableSuccess, this);
i.default.use(u.default.GAME_FIRE).onGroup("join_table_success", t.onJoinTableSuccess, this);
};
t.prototype.onDestroy = function() {
i.default.use(u.default.GAME_FIRE).offGroup(this);
};
t.onOpen = function() {
var e = JSON.parse(cc.sys.localStorage.getItem("user"));
r.default.use(u.default.GAME_WS_NAME).send(new s.default(e.username, e.password));
};
t.onCreateTableSuccess = function(e) {
r.default.use(u.default.GAME_WS_NAME).send(new l.default(e.tableNo));
};
t.onJoinTableSuccess = function(e) {
f.default.getInst().switchLayer(h.default, e);
};
return t;
}(e("../AbstractRoomConfig").default);
n.default = H;
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
MahjongVideoLayer: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "e5def0aWTtHE4umGOs8M53V", "MahjongVideoLayer");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("md5"), i = cc._decorator.ccclass, o = e("../../AiJCCComponent"), a = e("lodash"), s = e("../../hero/HeroManager"), u = e("./struct/MahjongWeaveItem"), c = e("./struct/MahjongWeaveType"), l = e("./record/MahjongAction"), d = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t._headViewMap = {};
t._chairCards = {};
t._weavesMap = {};
t._discardCardsMap = {};
t._currentIndex = 0;
t._currCard = -1;
t._timeout = 1e3;
t._timeoutFnId = -1;
return t;
}
t.prototype.onLoad = function() {
var e = this;
this.loadPackage("mahjong", function() {
fgui.UIPackage.addPackage("mahjong");
e._view = fgui.UIPackage.createObject("mahjong", "MahjongVideoLayer").asCom;
fgui.GRoot.inst.addChild(e._view);
e.initView();
});
};
t.prototype.onInitAiJCom = function(e) {
var t = JSON.parse(e.detail);
this._mahjongGameRecord = t.mahjongGameRecords[parseInt(e.index)];
this._mahjongPlayerRecords = t.mahjongPlayerRecords;
this._chairCount = this._mahjongPlayerRecords.length;
this._meChair = this.getMeChair();
this.renderHead();
this.renderGameStart();
this.playRecord();
};
t.prototype.playRecord = function() {
var e = this, t = this._mahjongGameRecord.mahjongGameActionRecords.length;
this._countDownText.text = a.padStart((t - this._currentIndex - 1).toString(), 2, "0");
var n = this._mahjongGameRecord.mahjongGameActionRecords[this._currentIndex];
console.log(JSON.stringify(n));
var r = this._timeout;
switch (n.mahjongAction) {
case l.MahjongAction.DISPATCH:
this.dispatchCard(n);
break;

case l.MahjongAction.NOTIFY:
break;

case l.MahjongAction.OUT:
this.outCard(n);
break;

case l.MahjongAction.N:
break;

case l.MahjongAction.P:
this.operateCard(1, n);
break;

case l.MahjongAction.G:
this.operateCard(2, n);
break;

case l.MahjongAction.H:
this.operateCard(4, n);
}
++this._currentIndex < t && (this._timeoutFnId = window.setTimeout(function() {
e.playRecord();
}, r));
};
t.prototype.onDestroy = function() {
this._view.dispose();
};
t.prototype.initView = function() {
var e = this;
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
e._timeout < 4e3 && (e._timeout += 100);
}, this);
this._view.getChild("PauseButton").asButton.onClick(function() {
if (-1 == e._timeoutFnId) {
e._view.getChild("PauseButton").asButton.icon = fgui.UIPackage.getItemURL("mahjong", "rec_pause");
e.playRecord();
} else {
window.clearTimeout(e._timeoutFnId);
e._view.getChild("PauseButton").asButton.icon = fgui.UIPackage.getItemURL("mahjong", "rec_play");
e._timeoutFnId = -1;
}
}, this);
this._view.getChild("ForwardButton").asButton.onClick(function() {
e._timeout > 300 && (e._timeout -= 100);
}, this);
this._view.getChild("ExitButton").asButton.onClick(function() {
-1 != e._timeoutFnId && window.clearTimeout(e._timeoutFnId);
e.destroy();
}, this);
};
t.prototype.renderHead = function() {
var e = this;
a.each(this._mahjongPlayerRecords, function(t, n) {
e._headViewMap[n].getChild("nickName").asTextField.text = t.nickName;
if (null != t.avatar) {
var i = "?name=" + r(t.avatar) + ".png";
e._headViewMap[n].getChild("avatar").asLoader.url = t.avatar + i;
}
});
};
t.prototype.renderGameStart = function() {
var e = this;
a.each(this._mahjongGameRecord.mahjongGameStartRecord, function(t, n) {
switch (e.switchView(n)) {
case 0:
e.renderSouthCard(t.cards, []);
break;

case 1:
e.renderEastCard(t.cards, []);
break;

case 2:
e.renderNorthCard(t.cards, []);
break;

case 3:
e.renderWestCard(t.cards, []);
}
e._chairCards[n] = t.cards;
});
};
t.prototype.renderSouthCard = function(e, t, n) {
var r = this;
void 0 === n && (n = -1);
this._southView.removeChildren();
var i = 0;
a.each(t, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), o = fgui.UIPackage.createObject("mahjong", e.weaveType == c.MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
o.setPosition(i, r._southView.height - o.height);
switch (e.weaveType) {
case c.MahjongWeaveType.P:
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
break;

case c.MahjongWeaveType.G:
if (e.open) {
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
o.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
i += o.width;
r._southView.addChild(o);
});
a.each(e, function(t, o) {
a.padStart(t.toString(16), 2, "0");
var s = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + a.padStart(e[o].toString(16), 2, "0")).asImage;
s.setPosition(i + o * s.width + (o + 1 == e.length && -1 != n ? 30 : 0), r._southView.height - s.height);
r._southView.addChild(s);
});
};
t.prototype.renderEastCard = function(e, t, n) {
var r = this;
void 0 === e && (e = null);
void 0 === n && (n = -1);
this._eastView.removeChildren();
var i = this._eastView.height;
a.each(t, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), o = fgui.UIPackage.createObject("mahjong", e.weaveType == c.MahjongWeaveType.P ? "EastPengComponent" : "EastGangComponent").asCom;
i -= o.height;
o.setPosition(r._eastView.width - o.width, i);
switch (e.weaveType) {
case c.MahjongWeaveType.P:
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
break;

case c.MahjongWeaveType.G:
if (e.open) {
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
}
o.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + n).asImage.resourceURL;
}
r._eastView.addChild(o);
});
for (var o = 13 - 3 * t.length, s = 0; s < o; s++) {
(u = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + a.padStart(e[s].toString(16), 2, "0")).asImage).setScale(.75, .75);
i -= 0 == s ? u.height : 60;
u.setPosition(this._eastView.width - u.width + .25 * u.width, i);
u.sortingOrder = o - s;
this._eastView.addChild(u);
}
if (-1 != n) {
var u;
(u = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + a.padStart(n.toString(16), 2, "0")).asImage).setScale(.75, .75);
u.setPosition(this._eastView.width - u.width + .25 * u.width, 0);
this._eastView.addChild(u);
}
};
t.prototype.renderNorthCard = function(e, t, n) {
var r = this;
void 0 === e && (e = null);
void 0 === n && (n = -1);
this._northView.removeChildren();
var i = this._northView.width;
a.each(t, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), o = fgui.UIPackage.createObject("mahjong", e.weaveType == c.MahjongWeaveType.P ? "NorthPengComponent" : "NorthGangComponent").asCom;
i -= o.width;
o.setPosition(i, r._northView.height - o.height);
switch (e.weaveType) {
case c.MahjongWeaveType.P:
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
break;

case c.MahjongWeaveType.G:
if (e.open) {
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
o.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + n).asImage.resourceURL;
}
r._northView.addChild(o);
});
for (var o = 13 - 3 * t.length, s = 0; s < o; s++) {
var u = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + a.padStart(e[s].toString(16), 2, "0")).asImage;
i -= u.width;
u.setPosition(i, this._northView.height - u.height);
this._northView.addChild(u);
}
if (-1 != n) {
u = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + a.padStart(n.toString(16), 2, "0")).asImage;
i -= u.width + 45;
u.setPosition(i, this._northView.height - u.height);
this._northView.addChild(u);
}
};
t.prototype.renderWestCard = function(e, t, n) {
var r = this;
void 0 === e && (e = null);
void 0 === n && (n = -1);
this._westView.removeChildren();
var i = 0;
a.each(t, function(e, t) {
var n = a.padStart(e.centerCard.toString(16), 2, "0"), o = fgui.UIPackage.createObject("mahjong", e.weaveType == c.MahjongWeaveType.P ? "WestPengComponent" : "WestGangComponent").asCom;
o.setPosition(0, i);
i += o.height;
switch (e.weaveType) {
case c.MahjongWeaveType.P:
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
break;

case c.MahjongWeaveType.G:
if (e.open) {
o.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
o.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
}
o.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + n).asImage.resourceURL;
}
r._westView.addChild(o);
});
for (var o = 13 - 3 * t.length, s = 0; s < o; s++) {
(u = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + a.padStart(e[s].toString(16), 2, "0")).asImage).setScale(.75, .75);
u.setPosition(0, i);
i += 60;
u.sortingOrder = s;
this._westView.addChild(u);
}
if (-1 != n) {
var u;
(u = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + a.padStart(n.toString(16), 2, "0")).asImage).setScale(.75, .75);
u.setPosition(0, this._westView.height - u.height);
this._westView.addChild(u);
}
};
t.prototype.getWeaveItems = function(e) {
void 0 == this._weavesMap[e] && (this._weavesMap[e] = new Array());
return this._weavesMap[e];
};
t.prototype.getDiscardCards = function(e) {
void 0 == this._discardCardsMap[e] && (this._discardCardsMap[e] = new Array());
return this._discardCardsMap[e];
};
t.prototype.switchView = function(e) {
return -1 == e ? -1 : (e + this._chairCount - this._meChair) % this._chairCount;
};
t.prototype.switchChair = function(e) {
return (e + this._meChair) % this._chairCount;
};
t.prototype.getMeChair = function() {
var e = this;
this._meChair = 0;
a.each(this._mahjongPlayerRecords, function(t, n) {
s.default.getInst().getMe().userId == t.userId && (e._meChair = n);
});
return this._meChair;
};
t.prototype.operateCard = function(e, t) {
var n = this.getWeaveItems(t.chair), r = this.getDiscardCards(t.provider), i = 0;
switch (e) {
case 0:
break;

case 1:
a.remove(this._chairCards[t.chair], function(e) {
return e == t.card && i++ < 2;
});
if (t.chair != t.provider) {
r = a.dropRight(r, 1);
this._discardCardsMap[t.provider] = r;
}
n.push(new u.default(c.MahjongWeaveType.P, t.card, !0, t.provider));
break;

case 2:
var o = a.find(n, {
centerCard: t.card,
weaveType: c.MahjongWeaveType.P
});
a.remove(this._chairCards[t.chair], function(e) {
return e == t.card && i++ < (null == o ? 3 : 1);
});
if (t.chair != t.provider) {
r = a.dropRight(r, 1);
this._discardCardsMap[t.provider] = r;
}
null == o ? n.push(new u.default(c.MahjongWeaveType.G, t.card, t.provider != t.chair, t.provider)) : o.weaveType = c.MahjongWeaveType.G;
break;

case 4:
return;
}
switch (this.switchView(t.chair)) {
case 0:
this.renderSouthCard(a.clone(this._chairCards[t.chair]), n);
break;

case 1:
this.renderEastCard(a.clone(this._chairCards[t.chair]), n);
break;

case 2:
this.renderNorthCard(a.clone(this._chairCards[t.chair]), n);
break;

case 3:
this.renderWestCard(a.clone(this._chairCards[t.chair]), n);
}
switch (this.switchView(t.provider)) {
case 0:
this.renderSouthDiscardCard(r);
break;

case 1:
this.renderEastDiscardCard(r);
break;

case 2:
this.renderNorthDiscardCard(r);
break;

case 3:
this.renderWestDiscardCard(r);
}
};
t.prototype.dispatchCard = function(e) {
var t = this.getWeaveItems(e.chair);
this._chairCards[e.chair].push(e.card);
this._currCard = e.card;
switch (this.switchView(e.chair)) {
case 0:
this.renderSouthCard(a.clone(this._chairCards[e.chair]), t, this._currCard);
break;

case 1:
this.renderEastCard(a.clone(this._chairCards[e.chair]), t, this._currCard);
break;

case 2:
this.renderNorthCard(a.clone(this._chairCards[e.chair]), t, this._currCard);
break;

case 3:
this.renderWestCard(a.clone(this._chairCards[e.chair]), t, this._currCard);
}
};
t.prototype.outCard = function(e) {
var t = this.getWeaveItems(e.chair), n = this.getDiscardCards(e.chair);
n.push(e.card);
var r = this._chairCards[e.chair].indexOf(e.card);
this._chairCards[e.chair].splice(r, 1);
this._chairCards[e.chair] = a.sortBy(this._chairCards[e.chair]);
switch (this.switchView(e.chair)) {
case 0:
this.renderSouthDiscardCard(n, !0);
this.renderSouthCard(a.clone(this._chairCards[e.chair]), t);
break;

case 1:
this.renderEastDiscardCard(n, !0);
this.renderEastCard(a.clone(this._chairCards[e.chair]), t);
break;

case 2:
this.renderNorthDiscardCard(n, !0);
this.renderNorthCard(a.clone(this._chairCards[e.chair]), t);
break;

case 3:
this.renderWestDiscardCard(n, !0);
this.renderWestCard(a.clone(this._chairCards[e.chair]), t);
}
};
t.prototype.renderSouthDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._southDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 11).toString()), s = i % 11, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + u).asImage;
c.setPosition(s * c.width, n._southDiscardView.height - (c.height + o * (c.height - 26)));
c.sortingOrder = 11 - o;
n._southDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(10, -30));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderNorthDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._northDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 11).toString()), s = i % 11, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + u).asImage;
c.setPosition(n._northDiscardView.width - (s + 1) * c.width, o * (c.height - 26));
c.sortingOrder = o;
n._northDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(10, -30));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderEastDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._eastDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 10).toString()), s = i % 10, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + u).asImage;
c.setPosition(n._eastDiscardView.width - (o + 1) * c.width, n._eastDiscardView.height - (c.height + s * (c.height - 40)));
c.sortingOrder = 10 - s;
n._eastDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(0, -20));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderWestDiscardCard = function(e, t) {
var n = this;
void 0 === t && (t = !1);
this._westDiscardView.removeChildren();
null != this._mahjongOutCardBadgeAnimate && this._mahjongOutCardBadgeAnimate.removeFromParent();
a.each(e, function(r, i) {
var o = parseInt((i / 10).toString()), s = i % 10, u = a.padStart(r.toString(16), 2, "0"), c = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + u).asImage;
c.setPosition(o * c.width, s * (c.height - 40));
c.sortingOrder = s;
n._westDiscardView.addChild(c);
if (t && i == e.length - 1) {
var l = c.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
l = l.addSelf(new cc.Vec2(40, -20));
n.renderOutCardBadgeAnimate(l.x, l.y);
}
});
};
t.prototype.renderOutCardBadgeAnimate = function(e, t) {
this._mahjongOutCardBadgeAnimate = fgui.UIPackage.createObject("mahjong", "MahjongOutCardBadgeAnimate").asMovieClip;
this._mahjongOutCardBadgeAnimate.setPosition(e, t);
this._view.addChild(this._mahjongOutCardBadgeAnimate);
};
return t = __decorate([ i ], t);
}(o.default);
n.default = d;
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
MahjongWeaveItem: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "5372fwYt4hIZoJKE8latdwu", "MahjongWeaveItem");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
return function(e, t, n, r) {
this.weaveType = e;
this.centerCard = t;
this.open = n;
this.provider = r;
};
}();
n.default = r;
cc._RF.pop();
}, {} ],
MahjongWeaveType: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "cef95gfvFpLZLotc9bSHbqF", "MahjongWeaveType");
Object.defineProperty(n, "__esModule", {
value: !0
});
(function(e) {
e[e.C = 1] = "C";
e[e.P = 2] = "P";
e[e.G = 3] = "G";
})(n.MahjongWeaveType || (n.MahjongWeaveType = {}));
cc._RF.pop();
}, {} ],
OnFire: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "cbc4ejla2RKILNPeg/0yhii", "OnFire");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
function e() {
this.es = {};
this.emit = this.fire;
}
e.prototype.on = function(e, t, n) {
void 0 === n && (n = !1);
this.es[e] || (this.es[e] = []);
this.es[e].push({
cb: t,
once: n,
group: ""
});
};
e.prototype.onGroup = function(e, t, n) {
this.es[e] || (this.es[e] = []);
this.es[e].push({
cb: t,
once: !1,
group: n
});
};
e.prototype.once = function(e, t) {
this.on(e, t, !0);
};
e.prototype.fire = function(e) {
for (var t = [], n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
for (var r = this.es[e] || [], i = r.length, o = 0; o < i; o++) {
var a = r[o], s = a.cb, u = a.once;
s.apply(this, t);
if (u) {
r.splice(o, 1);
o--;
i--;
}
}
};
e.prototype.offGroup = function(e) {
for (var t in this.es) for (var n = this.es[t] || [], r = n.length, i = 0; i < r; i++) if (n[i].group === e) {
n.splice(i, 1);
i--;
r--;
}
};
e.prototype.off = function(e, t) {
if (void 0 === e) this.es = {}; else if (void 0 === t) delete this.es[e]; else for (var n = this.es[e] || [], r = n.length, i = 0; i < r; i++) if (n[i].cb === t) {
n.splice(i, 1);
i--;
r--;
}
};
e.ver = "__VERSION__";
return e;
}();
n.default = r;
cc._RF.pop();
}, {} ],
PlazaCommonResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "66dddx69sZIT65+KSMMzxtT", "PlazaCommonResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../AlertWindow"), o = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.alert("提示信息", t.message);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = o;
cc._RF.pop();
}, {
"../../AlertWindow": "AlertWindow",
"../../ws/AiJ": "AiJ"
} ],
PlazaConfig: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2a0a8PUb8JF9YDt/lToNXTh", "PlazaConfig");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../ws/AiJ"), i = e("../AppConfig"), o = e("./handler/PlazaCommonResponseHandler"), a = e("./handler/PlazaLoginHandler"), s = e("./handler/RoomEventResponseHandler"), u = e("./PlazaWsListener"), c = e("../ws/AiJKit"), l = e("./event/PlazaMobileLoginEvent"), d = e("../fire/FireKit"), f = e("./handler/RoomRecordEventResponseHandler"), h = e("./handler/BroadcastEventResponseHandler"), p = e("./handler/UserAssetEventResponseHandler"), g = e("./handler/UserAssetTransEventResponseHandler"), _ = e("./handler/RechargeRecordEventResponseHandler"), v = e("./handler/UserCertEventResponseHandler"), m = function() {
function e(e, t) {
this.login = function() {
var e = cc.sys.localStorage.getItem("user");
if (null != e && e.length > 0) {
var t = JSON.parse(e);
c.default.use(i.default.PLAZA_WS_NAME).send(new l.default(t.username, t.password));
}
};
this.url = "ws://" + e + ":" + t;
this._config = new r.AiJ.Config(this.url, new r.AiJ.Options());
this._config.addRouter(0, 0, new o.default());
this._config.addRouter(1, 1, new a.default());
this._config.addRouter(2, 2, new h.default());
this._config.addRouter(3, 1, new s.default());
this._config.addRouter(3, 2, new f.default());
this._config.addRouter(4, 1, new p.default());
this._config.addRouter(4, 2, new g.default());
this._config.addRouter(4, 3, new _.default());
this._config.addRouter(4, 4, new v.default());
this._config.setWsEventListener(new u.default());
d.default.use(i.default.LOCAL_FIRE).on("login", this.login);
c.default.init(i.default.PLAZA_WS_NAME, this._config);
this._aiJPro = c.default.use(i.default.PLAZA_WS_NAME);
}
e.init = function(t, n) {
null != e.inst && e.inst.close();
e.inst = new e(t, n);
};
e.getInst = function() {
return e.inst;
};
e.prototype.close = function() {
c.default.close(i.default.PLAZA_WS_NAME);
d.default.use(i.default.LOCAL_FIRE).off("login", this.login);
};
return e;
}();
n.default = m;
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
PlazaLayer: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "1a94965c7VLipk/Qy3eVYOh", "PlazaLayer");
var r = this && this.__extends || function() {
var e = function(t, n) {
return (e = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
})(t, n);
};
return function(t, n) {
e(t, n);
function r() {
this.constructor = t;
}
t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r());
};
}(), i = this && this.__decorate || function(e, t, n, r) {
var i, o = arguments.length, a = o < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, n) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, n, r); else for (var s = e.length - 1; s >= 0; s--) (i = e[s]) && (a = (o < 3 ? i(a) : o > 3 ? i(t, n, a) : i(t, n)) || a);
return o > 3 && a && Object.defineProperty(t, n, a), a;
};
Object.defineProperty(n, "__esModule", {
value: !0
});
var o = cc._decorator.ccclass, a = e("../UIManger"), s = e("../AppConfig"), u = e("../plazz/event/RoomEvent"), c = e("../fire/FireKit"), l = e("../GameServiceManager"), d = e("../AlertWindow"), f = e("../room/mahjong/MahjongRoomConfig"), h = e("../plazz/PlazaConfig"), p = e("lodash"), g = e("../ws/AiJKit"), _ = e("../room/event/CreateTableEvent"), v = e("../room/event/JoinTableEvent"), m = e("./event/RoomRecordEvent"), C = e("../AiJCCComponent"), w = e("./RoomRecordLayer"), y = e("./event/BroadcastEvent"), R = e("./event/UserAssetEvent"), A = e("../hero/HeroManager"), b = e("../UserInfoWindow"), I = e("./event/UserAssetTransEvent"), E = e("./RechargeRecordLayer"), j = e("./event/RechargeRecordEvent"), M = e("./event/UserCertEvent"), P = e("../SettingWindow"), F = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.tableNo = [];
t.roomRecordCb = function(e) {
a.default.getInst().switchLayer(w.default, e);
};
t.rechargeRecordCb = function(e) {
a.default.getInst().switchLayer(E.default, e, !1);
};
t.roomCb = function(e) {
l.default.getInst().initGameService(e.roomItems);
};
t.broadcastCb = function(e) {
t._view.getChild("MessageText").asTextField.text = p.join(e.broadcasts, " ");
};
t.userAssetCb = function(e) {
t._view.getChild("DiamondText").asTextField.text = e.assetsQuantity.diamond.toString();
};
t.assetTransCb = function(e) {
"diamond" == e.assetCode && (t._view.getChild("DiamondText").asTextField.text = e.quantity.toString());
d.default.alert("提示信息", e.tips);
};
t.userCertCb = function(e) {
1 == e.code && (t._view.getChild("CertButton").asButton.visible = !1);
t._view.getControllerAt(0).setSelectedIndex(0);
d.default.alert("提示信息", e.message);
};
t.updateTableNoCb = function(e) {
e.showInputTableNo();
if (6 == e.tableNo.length) {
var n = l.default.getInst().getGameServiceByServiceId(t.getServiceId(parseInt(p.join(t.tableNo, ""))));
if (null == n) {
d.default.alert("提示", "服务器未启动，无法进行游戏!");
return;
}
new f.default(n.address, n.port);
}
};
t.getServiceId = function(e) {
var t = parseInt((e / 1e3).toString());
if (t < 200) return t;
for (;t > 200; ) t -= 200;
return t;
};
t.loginSuccessCb = function(e) {
var n = p.join(t.tableNo, "");
0 == t.tableNo.length ? g.default.use(s.default.GAME_WS_NAME).send(new _.default()) : g.default.use(s.default.GAME_WS_NAME).send(new v.default(Number(n)));
};
return t;
}
t.prototype.onLoad = function() {
var e = this;
c.default.use(s.default.PLAZA_FIRE).onGroup("room", this.roomCb, this);
c.default.use(s.default.PLAZA_FIRE).onGroup("room_record", this.roomRecordCb, this);
c.default.use(s.default.PLAZA_FIRE).onGroup("broadcast", this.broadcastCb, this);
c.default.use(s.default.PLAZA_FIRE).onGroup("user_asset", this.userAssetCb, this);
c.default.use(s.default.PLAZA_FIRE).onGroup("user_cert", this.userCertCb, this);
c.default.use(s.default.PLAZA_FIRE).onGroup("asset_trans", this.assetTransCb, this);
c.default.use(s.default.PLAZA_FIRE).onGroup("recharge_record", this.rechargeRecordCb, this);
c.default.use(s.default.LOCAL_FIRE).onGroup("update_table_no", this.updateTableNoCb, this);
c.default.use(s.default.GAME_FIRE).onGroup("login_success", this.loginSuccessCb, this);
this.loadPackage("plaza", function() {
fgui.UIPackage.addPackage("plaza");
e._view = fgui.UIPackage.createObject("plaza", "PlazaLayer").asCom;
e.initService();
e.initView();
fgui.GRoot.inst.addChild(e._view);
});
};
t.prototype.onInitAiJCom = function(e) {
g.default.use(s.default.PLAZA_WS_NAME).send(new y.default());
g.default.use(s.default.PLAZA_WS_NAME).send(new R.default([ "diamond", "gold_coin", "room_card" ]));
};
t.prototype.onDestroy = function() {
c.default.use(s.default.PLAZA_FIRE).offGroup(this);
c.default.use(s.default.LOCAL_FIRE).offGroup(this);
c.default.use(s.default.GAME_FIRE).offGroup(this);
clearInterval(this._RoomEventInterval);
this._view.dispose();
};
t.prototype.initView = function() {
var e = this;
this._view.getChild("NickNameText").asTextField.text = A.default.getInst().getMe().nickName;
this._view.getChild("UserIdText").asTextField.text = p.padStart(A.default.getInst().getMe().userId, 8, "0");
this._view.getChild("AvatarLoader").asLoader.url = A.default.getInst().getMe().avatar;
this.initDistributorView();
this.initTransView();
this.initTransReviewView();
this.initCertView();
this.initGameCreateView();
this._view.getChild("AvatarLoader").asLoader.onClick(function() {
var e = A.default.getInst().getMe();
b.default.open(e.avatar, e.address, e.nickName, e.userId, e.ip);
}, this);
this._view.getChild("n21").asButton.onClick(function() {
g.default.use(s.default.PLAZA_WS_NAME).send(new m.default(1, 10));
}, this);
this._view.getChild("SettingButton").asButton.onClick(function() {
P.default.setting(!0);
}, this);
this._view.getChild("n4").asButton.onClick(function() {
e.tableNo = [];
e._view.getControllerAt(0).setSelectedIndex(2);
}, this);
this._view.getChild("n6").asButton.onClick(function() {
e.tableNo = [];
c.default.use(s.default.LOCAL_FIRE).emit("update_table_no", e);
e._view.getControllerAt(0).setSelectedIndex(4);
}, this);
for (var t = function(t) {
var r = n._view.getChild("n68").asCom.getChild(t);
r.asButton.onClick(function() {
if (e.tableNo.length < 6) {
e.tableNo.push(r.asButton.data);
c.default.use(s.default.LOCAL_FIRE).emit("update_table_no", e);
}
}, n);
}, n = this, r = 0, i = [ "n13", "n14", "n15", "n16", "n17", "n18", "n19", "n20", "n21", "n22" ]; r < i.length; r++) {
t(i[r]);
}
this._view.getChild("n68").asCom.getChild("n24").asButton.onClick(function() {
e.tableNo = [];
c.default.use(s.default.LOCAL_FIRE).emit("update_table_no", e);
}, this);
this._view.getChild("n68").asCom.getChild("n25").asButton.onClick(function() {
e.tableNo = p.dropRight(e.tableNo);
c.default.use(s.default.LOCAL_FIRE).emit("update_table_no", e);
}, this);
};
t.prototype.initDistributorView = function() {
var e = this;
this._view.getChild("DistributorButton").asButton.visible = p.isString(A.default.getInst().getMe().distributorId) && A.default.getInst().getMe().distributorId.length > 0;
this._view.getChild("DistributorButton").asButton.onClick(function() {
e._view.getControllerAt(0).setSelectedIndex(5);
}, this);
var t = this._view.getChild("distributor_group").asGroup;
this._view.getChildInGroup("RechargeButton", t).asButton.onClick(function() {
e._view.getControllerAt(0).setSelectedIndex(6);
}, this);
this._view.getChildInGroup("RechargeRecordButton", t).asButton.onClick(function() {
g.default.use(s.default.PLAZA_WS_NAME).send(new j.default(1, 50, "room_card"));
}, this);
};
t.prototype.initTransView = function() {
var e = this, t = this._view.getChild("recharge_group").asGroup, n = this._view.getChild("recharge_review_group").asGroup;
this._view.getChildInGroup("RechargeReviewButton", t).asButton.onClick(function() {
var r = e._view.getChildInGroup("RechargeUserIdTextField", t).asTextField.text, i = e._view.getChildInGroup("RechargeNumberTextField", t).asTextField.text;
if (!p.isNumber(p.toNumber(i)) || parseInt(i) < 1) d.default.alert("提示信息", "请输入正确的数量!"); else if (!p.isNumber(p.toNumber(r)) || parseInt(r) < 1) d.default.alert("提示信息", "请输入正确的玩家ID!"); else {
e._view.getChildInGroup("RechargeAvatarLoader", n).asLoader.url = "";
e._view.getChildInGroup("RechargeNickNameText", n).asTextField.text = "";
e._view.getChildInGroup("RechargeUserIdText", n).asTextField.text = r;
e._view.getChildInGroup("RechargeNumberText", n).asTextField.text = i;
e._view.getControllerAt(0).setSelectedIndex(7);
}
}, this);
this._view.getChildInGroup("RechargeCancelButton", t).asButton.onClick(function() {
e._view.getControllerAt(0).setSelectedIndex(5);
}, this);
};
t.prototype.initTransReviewView = function() {
var e = this, t = this._view.getChild("recharge_review_group").asGroup, n = this._view.getChild("recharge_group").asGroup;
this._view.getChildInGroup("RechargeSubmitButton", t).asButton.onClick(function() {
var t = e._view.getChildInGroup("RechargeUserIdTextField", n).asTextField.text, r = e._view.getChildInGroup("RechargeNumberTextField", n).asTextField.text;
if (!p.isNumber(p.toNumber(r)) || parseInt(r) < 1) d.default.alert("提示信息", "请输入正确的数量!"); else if (!p.isNumber(p.toNumber(t)) || parseInt(t) < 1) d.default.alert("提示信息", "请输入正确的玩家ID!"); else {
g.default.use(s.default.PLAZA_WS_NAME).send(new I.default("room_card", t, parseInt(r)));
e._view.getControllerAt(0).setSelectedIndex(5);
}
}, this);
};
t.prototype.initCertView = function() {
var e = this;
this._view.getChild("CertButton").asButton.visible = null == A.default.getInst().getMe().certStatus;
var t = this._view.getChild("certification_group").asGroup;
this._view.getChildInGroup("SubmitCertButton", t).asButton.onClick(function() {
var n = e._view.getChildInGroup("CertNameTextField", t).asTextField.text, r = e._view.getChildInGroup("CertCardTextField", t).asTextField.text, i = e._view.getChildInGroup("CertMobileTextField", t).asTextField.text;
n.length < 2 ? d.default.alert("提示信息", "请输入正确的姓名!") : r.length < 6 ? d.default.alert("提示信息", "请输入正确的证件号码!") : i.length < 6 ? d.default.alert("提示信息", "请输入正确的手机号码!") : g.default.use(s.default.PLAZA_WS_NAME).send(new M.default(n, r, i, "1"));
}, this);
};
t.prototype.initGameCreateView = function() {
var e = this, t = this._view.getChild("create_group").asGroup;
this._view.getChildInGroup("GameTypeList", t).asList.getChild("mahjong").asButton.onClick(function() {
e._view.getControllerAt(0).setSelectedIndex(2);
}, this);
this._view.getChildInGroup("GameTypeList", t).asList.getChild("poker").asButton.onClick(function() {
e._view.getControllerAt(0).setSelectedIndex(3);
}, this);
this._view.getChildInGroup("CreateSubGameButton", t).asButton.onClick(function() {
var e = l.default.getInst().randomGameService("南丰麻将");
null == e ? d.default.alert("提示", "南丰麻将服务器未启动，无法进行游戏!") : new f.default(e.address, e.port);
}, this);
};
t.prototype.showInputTableNo = function() {
var e = this;
p.each([ "n31", "n32", "n33", "n34", "n35", "n36" ], function(t, n) {
n < e.tableNo.length ? e._view.getChild("n68").asCom.getChild(t).asTextField.text = e.tableNo[n] : e._view.getChild("n68").asCom.getChild(t).asTextField.text = "";
});
};
t.prototype.initService = function() {
h.default.getInst()._aiJPro.send(new u.default());
this._RoomEventInterval = window.setInterval(function() {
h.default.getInst()._aiJPro.send(new u.default());
}, 3e4);
};
return t = i([ o ], t);
}(C.default);
n.default = F;
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
PlazaLoginEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6a116xSU/9HAbU9wLi9C7Iz", "PlazaLoginEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
PlazaLoginHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "79f07eBmtJJI49YPb5XxnWJ", "PlazaLoginHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).fire("login_success", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
PlazaMobileLoginEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "34f259CczdIeINvGbPnfeEl", "PlazaMobileLoginEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t, n) {
var r = e.call(this) || this;
r.mobile = t;
r.password = n;
r.mainType = 1;
r.subType = 1;
return r;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
PlazaWeiXinLoginEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "d12caDKsTBFO50sPctvNtoJ", "PlazaWeiXinLoginEvent");
var r = this && this.__extends || function() {
var e = function(t, n) {
return (e = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
})(t, n);
};
return function(t, n) {
e(t, n);
function r() {
this.constructor = t;
}
t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r());
};
}();
Object.defineProperty(n, "__esModule", {
value: !0
});
var i = function(e) {
r(t, e);
function t(t) {
var n = e.call(this) || this;
n.code = t;
n.mainType = 1;
n.subType = 3;
return n;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = i;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
PlazaWsListener: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2f07eMZunRE3JN8FW+9wuYA", "PlazaWsListener");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../fire/FireKit"), i = e("../AppConfig"), o = e("../LoadingWindow"), a = function() {
function e() {}
e.prototype.onClose = function(e, t) {
console.log("websocket close");
o.default.close();
};
e.prototype.onConnecting = function(e) {
o.default.loading("正在连接服务器!");
};
e.prototype.onError = function(e, t) {};
e.prototype.onForcedClose = function(e, t) {
o.default.close();
};
e.prototype.onMessage = function(e, t) {};
e.prototype.onOpen = function(e, t, n) {
o.default.close();
r.default.use(i.default.LOCAL_FIRE).fire("login");
};
e.prototype.onReconnectAttempt = function(e, t) {
o.default.loading("网络连接异常，重新连接中...\n第" + t + "次重试");
};
e.prototype.onReconnectFail = function(e, t) {
o.default.close();
r.default.use(i.default.PLAZA_FIRE).emit("ws_error");
};
e.prototype.onTimeout = function(e) {};
return e;
}();
n.default = a;
cc._RF.pop();
}, {
"../AppConfig": "AppConfig",
"../LoadingWindow": "LoadingWindow",
"../fire/FireKit": "FireKit"
} ],
RechargeRecordEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "978cfDjc9xHdZ36wE8YX+zB", "RechargeRecordEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).fire("recharge_record", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
RechargeRecordEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "fd906GStzdJAKt68hp1isox", "RechargeRecordEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RechargeRecordEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "aa95fCR2/9Mw7+80DJnEBBy", "RechargeRecordEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t, n, r) {
var i = e.call(this) || this;
i.mainType = 4;
i.subType = 3;
i.page = t;
i.pageSize = n;
i.assetCode = r;
return i;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RechargeRecordLayer: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "9f573nh+UBN9oTeHbelqGEz", "RechargeRecordLayer");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../AiJCCComponent"), i = cc._decorator.ccclass, o = e("lodash"), a = e("../hero/HeroManager"), s = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onLoad = function() {
var e = this;
this.loadPackage("plaza", function() {
fgui.UIPackage.addPackage("plaza");
e._view = fgui.UIPackage.createObject("plaza", "RechargeRecordLayer").asCom;
e.initView();
fgui.GRoot.inst.addChild(e._view);
});
};
t.prototype.onInitAiJCom = function(e) {
var t = this, n = e;
o.each(n.rechargeRecords, function(e) {
var n = fgui.UIPackage.createObject("plaza", "RechargeRecordComponent").asCom;
n.getChild("TransText").asTextField.text = e.sellerId == a.default.getInst().getMe().userId ? "卖" : "买";
n.getChild("UserIdText").asTextField.text = o.padStart(e.sellerId == a.default.getInst().getMe().userId ? e.buyerId : e.sellerId, 8, "0");
n.getChild("NickNameText").asTextField.text = e.sellerId == a.default.getInst().getMe().userId ? e.buyerName : e.sellerName;
n.getChild("AssetNumberText").asTextField.text = e.quantity.toString();
n.getChild("CreatedTimeText").asTextField.text = e.createdTime;
t._rechargeRecordList.addChildAt(n);
});
};
t.prototype.initView = function() {
var e = this;
this._view.getChild("BackButton").asButton.onClick(function() {
e.destroy();
}, this);
this._rechargeRecordList = this._view.getChild("RechargeRecordList").asList;
this._rechargeRecordList.removeChildren();
};
t.prototype.onDestroy = function() {
this._view.dispose();
};
return t = __decorate([ i ], t);
}(r.default);
n.default = s;
cc._RF.pop();
}, {
"../AiJCCComponent": "AiJCCComponent",
"../hero/HeroManager": "HeroManager",
lodash: 7
} ],
RoomCommonResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "dbc8clNljlD/JJmRR4fGiVs", "RoomCommonResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../AlertWindow"), o = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.alert("提示信息", t.message);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = o;
cc._RF.pop();
}, {
"../../AlertWindow": "AlertWindow",
"../../ws/AiJ": "AiJ"
} ],
RoomEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "7bffbONpaRDO7rBIX/oqcNZ", "RoomEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).emit("room", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
RoomEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "50762pUNXhELq25onfmoGim", "RoomEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.mainType = 3;
t.subType = 1;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RoomLoginEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "ed6bcNqupdLe5uwElIM2WRM", "RoomLoginEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RoomLoginResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6b8e9ySsnNK3YkB8YILd4G/", "RoomLoginResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.GAME_FIRE).emit("login_success", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
RoomMobileLoginEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "5b50bjEbJ9Mu7BHPT/NgHRx", "RoomMobileLoginEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t, n) {
var r = e.call(this) || this;
r.mobile = t;
r.password = n;
r.mainType = 1;
r.subType = 1;
return r;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RoomRecordEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "ec6d7NJ1RtMerrwVmPu4+of", "RoomRecordEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).fire("room_record", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
RoomRecordEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "16ae2NgkKxA8q4w5EGSAsV4", "RoomRecordEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
var i = function() {
return function() {};
}();
n.RoomRecord = i;
var o = function() {
return function() {};
}();
n.RoomRecordSummary = o;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RoomRecordEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "03167sDvK5FVYYFI5molf+J", "RoomRecordEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t, n) {
var r = e.call(this) || this;
r.page = t;
r.pageSize = n;
r.mainType = 3;
r.subType = 2;
return r;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RoomRecordLayer: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "95b26Hb62tBoIK7+JM1fkyp", "RoomRecordLayer");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../AiJCCComponent"), i = cc._decorator.ccclass, o = e("lodash"), a = e("../UIManger"), s = e("./PlazaLayer"), u = e("../room/mahjong/MahjongVideoLayer"), c = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.onLoad = function() {
var e = this;
this.loadPackage("plaza", function() {
fgui.UIPackage.addPackage("plaza");
e._view = fgui.UIPackage.createObject("plaza", "RoomRecordLayer").asCom;
e.initView();
fgui.GRoot.inst.addChild(e._view);
});
};
t.prototype.onInitAiJCom = function(e) {
var t = this, n = e;
o.each(n.roomRecords, function(e) {
var n = fgui.UIPackage.createObject("plaza", "RoomRecordComponent").asCom;
n.getChild("ServiceNameText").asTextField.text = e.serviceName;
n.getChild("TableNoText").asTextField.text = e.tableNo.toString();
n.getChild("NickNameText").asTextField.text = e.nickName;
n.getChild("ScoreText").asTextField.text = (e.score >= 0 ? "+" : "") + e.score.toString();
n.getChild("StartedTimeText").asTextField.text = e.startedTime;
n.getChild("DetailButton").asButton.data = e;
n.getChild("DetailButton").asButton.onClick(function(e) {
t._roomRecordItemList.removeChildren();
var n = fgui.GObject.cast(e.currentTarget);
t._currRoomRecord = n.data;
var r = JSON.parse(t._currRoomRecord.summary);
o.each(r, function(e, n) {
var r = fgui.UIPackage.createObject("plaza", "RoomRecordItemComponent").asCom;
r.getChild("NumberText").asTextField.text = (n + 1).toString();
r.getChild("PlayVideoButton").asButton.data = {
index: n,
detail: t._currRoomRecord.detail
};
r.getChild("PlayVideoButton").asButton.onClick(function(e) {
var t = fgui.GObject.cast(e.currentTarget).data;
a.default.getInst().switchLayer(u.default, t, !1);
}, t);
var i = r.getChild("RoomRecordItemScoreList").asList;
i.removeChildren();
o.each(e, function(e, t) {
var n = fgui.UIPackage.createObject("plaza", "RoomRecordItemScoreComponent").asCom;
n.getChild("NickNameText").asTextField.text = e.nickName;
n.getChild("ScoreText").asTextField.text = (e.score >= 0 ? "+" : "") + e.score;
i.addChildAt(n);
});
t._roomRecordItemList.addChildAt(r);
});
t._view.getController("c1").setSelectedIndex(1);
}, t);
t._roomRecordList.addChildAt(n);
});
};
t.prototype.initView = function() {
this._view.getChild("BackButton").asButton.onClick(function() {
a.default.getInst().switchLayer(s.default);
}, this);
this._roomRecordList = this._view.getChild("RoomRecordList").asList;
this._roomRecordItemList = this._view.getChildInGroup("RoomRecordItemList", this._view.getChild("RoomRecordItemGroup").asGroup).asList;
this._roomRecordList.removeChildren();
};
t.prototype.onDestroy = function() {
this._view.dispose();
};
return t = __decorate([ i ], t);
}(r.default);
n.default = c;
cc._RF.pop();
}, {
"../AiJCCComponent": "AiJCCComponent",
"../UIManger": "UIManger",
"../room/mahjong/MahjongVideoLayer": "MahjongVideoLayer",
"./PlazaLayer": "PlazaLayer",
lodash: 7
} ],
RoomServiceEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "ee792OsYHhMJJYuQH8IziCo", "RoomServiceEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
var i = function() {
return function() {};
}();
n.RoomItem = i;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
RoomWsListener: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "80c6abBpPtLR5wCEbbZp1TX", "RoomWsListener");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../fire/FireKit"), i = e("../AppConfig"), o = e("../LoadingWindow"), a = function() {
function e() {}
e.prototype.onClose = function(e, t) {
o.default.close();
};
e.prototype.onConnecting = function(e) {
o.default.loading("正在连接服务器!");
};
e.prototype.onError = function(e, t) {};
e.prototype.onForcedClose = function(e, t) {};
e.prototype.onMessage = function(e, t) {};
e.prototype.onOpen = function(e, t, n) {
r.default.use(i.default.GAME_FIRE).emit("open");
};
e.prototype.onReconnectAttempt = function(e, t) {
o.default.loading("网络连接异常，重新连接中...\n第" + t + "次重试");
};
e.prototype.onReconnectFail = function(e, t) {
o.default.close();
r.default.use(i.default.PLAZA_FIRE).emit("ws_error");
};
e.prototype.onTimeout = function(e) {};
return e;
}();
n.default = a;
cc._RF.pop();
}, {
"../AppConfig": "AppConfig",
"../LoadingWindow": "LoadingWindow",
"../fire/FireKit": "FireKit"
} ],
SettingWindow: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "376d1ULxx5JGZRw9LPkVq2v", "SettingWindow");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("./UIManger"), i = e("./WelcomeLayer"), o = e("./Setting"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.getInst = function() {
null == t.inst && (t.inst = new t());
return t.inst;
};
t.setting = function(e) {
void 0 === e && (e = !1);
var n = t.getInst();
n.show();
n.contentPane.getChild("AccountGroup").asGroup.visible = e;
};
t.prototype.onInit = function() {
var e = this;
this.contentPane = fgui.UIPackage.createObject("commons", "SettingWindow").asCom;
var t = this.contentPane.getChild("AccountGroup").asGroup;
this.contentPane.getChildInGroup("AccountToggleButton", t).asButton.onClick(function() {
cc.sys.localStorage.setItem("user", "");
r.default.getInst().switchLayer(i.default);
}, this);
this.contentPane.getChildInGroup("ExitGameButton", t).asButton.onClick(function() {
cc.director.end();
}, this);
this.contentPane.getChild("MusicToggleButton").asButton.selected = o.default.getMusic();
this.contentPane.getChild("SoundToggleButton").asButton.selected = o.default.getSound();
this.contentPane.getChild("MusicToggleButton").asButton.onClick(function() {
o.default.setMusic(e.contentPane.getChild("MusicToggleButton").asButton.selected);
}, this);
this.contentPane.getChild("SoundToggleButton").asButton.onClick(function() {
o.default.setSound(e.contentPane.getChild("SoundToggleButton").asButton.selected);
}, this);
this.center();
};
return t;
}(fgui.Window);
n.default = a;
cc._RF.pop();
}, {
"./Setting": "Setting",
"./UIManger": "UIManger",
"./WelcomeLayer": "WelcomeLayer"
} ],
Setting: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2a17cMeaodJ5Yp+f8XLiaqs", "Setting");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function() {
function e() {}
e.setMusic = function(e) {
this.set("music", e);
};
e.getMusic = function() {
return null == this.get("music") || this.get("music");
};
e.setSound = function(e) {
this.set("sound", e);
};
e.getSound = function() {
return null == this.get("sound") || this.get("sound");
};
e.set = function(e, t) {
cc.sys.localStorage.setItem(e, t);
};
e.get = function(e) {
return cc.sys.localStorage.getItem(e);
};
return e;
}();
n.default = r;
cc._RF.pop();
}, {} ],
SitDownTableEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6001bxoqg5Iobu52ySnieC5", "SitDownTableEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.mainType = 2;
t.subType = 7;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
StandUpTableEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "a8925kxw8dJB52DG8ejZlo+", "StandUpTableEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t.mainType = 2;
t.subType = 8;
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
UIManger: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "549a8k6I+RJW58dWYRmLs1o", "UIManger");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("./AiJCCComponent"), i = e("async-lock"), o = function() {
function e() {
this.lock = new i();
}
e.getInst = function() {
null == e.inst && (e.inst = new e());
return this.inst;
};
e.prototype.setRoot = function(e) {
this.root = e;
};
e.prototype.switchLayer = function(e, t, n) {
void 0 === t && (t = {});
void 0 === n && (n = !0);
this.preLayer = this.currentLayer;
this.currentLayer = this.root.addComponent(e);
this.currentLayer instanceof r.default && this.currentLayer.initAiJCom(t);
n && this.destroyPreLayer();
};
e.prototype.destroyPreLayer = function() {
null != this.preLayer && this.preLayer.destroy();
this.preLayer = null;
};
return e;
}();
n.default = o;
cc._RF.pop();
}, {
"./AiJCCComponent": "AiJCCComponent",
"async-lock": 2
} ],
UserAssetEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "b3c4azvdqNAl6SR9n7knMwJ", "UserAssetEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).fire("user_asset", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
UserAssetEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "d4de0shmdtA3IW/vFv5dauU", "UserAssetEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.assetsQuantity = {};
return t;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
UserAssetEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "14c2dv3GolLHL5/Y5FMeb4T", "UserAssetEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t) {
var n = e.call(this) || this;
n.assetCodes = t;
n.mainType = 4;
n.subType = 1;
return n;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
UserAssetTransEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "dfdb4m6BM1CnoBKtkNkFJCV", "UserAssetTransEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).fire("asset_trans", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
UserAssetTransEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "be7f2p+Tu5DRqGijXvmuOj7", "UserAssetTransEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
UserAssetTransEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6da1byS729IT51pzHrRSzOY", "UserAssetTransEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t, n, r) {
var i = e.call(this) || this;
i.mainType = 4;
i.subType = 2;
i.assetCode = t;
i.buyerId = n;
i.quantity = r;
return i;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
UserCertEventResponseHandler: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "414909wZYJCi6NM+3AVt+IK", "UserCertEventResponseHandler");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("../../ws/AiJ"), i = e("../../fire/FireKit"), o = e("../../AppConfig"), a = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.prototype.handler = function(e, t) {
i.default.use(o.default.PLAZA_FIRE).fire("user_cert", t);
};
return t;
}(r.AiJ.ResponseHandler);
n.default = a;
cc._RF.pop();
}, {
"../../AppConfig": "AppConfig",
"../../fire/FireKit": "FireKit",
"../../ws/AiJ": "AiJ"
} ],
UserCertEventResponse: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "5e269SfphFLsYTJV8AdXAyz", "UserCertEventResponse");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
return t;
}(e("../../ws/AiJ").AiJ.Response);
n.UserCertEventResponse = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
UserCertEvent: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2f259rMBJdEQqlAzXQytN6T", "UserCertEvent");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = function(e) {
__extends(t, e);
function t(t, n, r, i) {
var o = e.call(this) || this;
o.mainType = 4;
o.subType = 4;
o.certName = t;
o.certCard = n;
o.certMobile = r;
o.certType = i;
return o;
}
return t;
}(e("../../ws/AiJ").AiJ.AiJEvent);
n.default = r;
cc._RF.pop();
}, {
"../../ws/AiJ": "AiJ"
} ],
UserInfoWindow: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "f7c66ZdEHhM+qOYHcP6iN3w", "UserInfoWindow");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("lodash"), i = function(e) {
__extends(t, e);
function t() {
return e.call(this) || this;
}
t.getInst = function() {
null == t.inst && (t.inst = new t());
return t.inst;
};
t.open = function(e, n, i, o, a) {
var s = t.getInst();
s.show();
s.contentPane.getChild("UserAddressText").asTextField.text = n;
s.contentPane.getChild("NickNameText").asTextField.text = i;
s.contentPane.getChild("UserIdText").asTextField.text = r.padStart(o, 8, "0");
s.contentPane.getChild("UserIpText").asTextField.text = a;
s.contentPane.getChild("AvatarLoader").asLoader.url = e;
};
t.prototype.onInit = function() {
this.contentPane = fgui.UIPackage.createObject("commons", "UserInfoWindow").asCom;
this.center();
};
return t;
}(fgui.Window);
n.default = i;
cc._RF.pop();
}, {
lodash: 7
} ],
WelcomeLayer: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "6eae7xQrxhBRr15FAuzxirJ", "WelcomeLayer");
var r = this && this.__extends || function() {
var e = function(t, n) {
return (e = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
})(t, n);
};
return function(t, n) {
e(t, n);
function r() {
this.constructor = t;
}
t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r());
};
}(), i = this && this.__decorate || function(e, t, n, r) {
var i, o = arguments.length, a = o < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, n) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, n, r); else for (var s = e.length - 1; s >= 0; s--) (i = e[s]) && (a = (o < 3 ? i(a) : o > 3 ? i(t, n, a) : i(t, n)) || a);
return o > 3 && a && Object.defineProperty(t, n, a), a;
};
Object.defineProperty(n, "__esModule", {
value: !0
});
var o = cc._decorator.ccclass, a = e("./AppConfig"), s = e("./AlertWindow"), u = e("./fire/FireKit"), c = e("./plazz/PlazaConfig"), l = e("./UIManger"), d = e("./plazz/PlazaLayer"), f = e("./AiJCCComponent"), h = e("./hero/HeroManager"), p = e("./hero/Hero"), g = e("./AudioManager"), _ = e("./WxHelper"), v = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.loginSuccessCb = function(e) {
h.default.getInst().setMe(new p.default(e.userName, e.userId, e.nickName, e.gender, e.avatar, e.distributorId, e.address, e.longitude, e.latitude, e.ip, e.certStatus));
l.default.getInst().switchLayer(d.default);
};
t.ws_error = function() {
s.default.alert("提示信息", "网络错误，请稍后再试！");
};
return t;
}
t.prototype.onLoad = function() {
var e = this;
u.default.use(a.default.PLAZA_FIRE).onGroup("ws_error", this.ws_error, this);
u.default.use(a.default.PLAZA_FIRE).onGroup("login_success", this.loginSuccessCb, this);
this.loadPackage("welcome", function() {
fgui.UIPackage.addPackage("welcome");
e._view = fgui.UIPackage.createObject("welcome", "WelcomeLayer").asCom;
e.initView();
fgui.GRoot.inst.addChild(e._view);
});
};
t.prototype.onInitAiJCom = function(e) {
c.default.init(a.default.PLAZA_WS_HOST, a.default.PLAZA_WS_PORT);
g.default.play_music("commons", "bgm");
};
t.prototype.onDestroy = function() {
u.default.use(a.default.PLAZA_FIRE).offGroup(this);
this._view.dispose();
};
t.prototype.initView = function() {
var e = this;
this._view.getChild("username").asTextInput.text = "15000000004";
this._view.getChild("password").asTextInput.text = "123456";
this._view.getChild("login").asButton.onClick(function() {
if (c.default.getInst()._aiJPro.isOpen()) {
cc.sys.localStorage.setItem("user", JSON.stringify({
username: e.username(),
password: e.password()
}));
u.default.use(a.default.LOCAL_FIRE).emit("login");
} else s.default.alert("提示信息", "未连接服务器，请稍后再试！");
}, this);
this._view.getChild("wx_login").asButton.onClick(function() {
_.default.wxLogin();
}, this);
};
t.prototype.username = function() {
return this._view.getChild("username").asTextInput.text;
};
t.prototype.password = function() {
return this._view.getChild("password").asTextInput.text;
};
return t = i([ o ], t);
}(f.default);
n.default = v;
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
"./plazz/PlazaConfig": "PlazaConfig",
"./plazz/PlazaLayer": "PlazaLayer"
} ],
WxHelper: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "2df913Ps7BMyZmC4wfyLsXJ", "WxHelper");
Object.defineProperty(n, "__esModule", {
value: !0
});
var r = e("./ws/AiJKit"), i = e("./AppConfig"), o = e("./plazz/event/PlazaWeiXinLoginEvent"), a = e("./plazz/PlazaConfig"), s = e("./AlertWindow"), u = function() {
function e() {}
e.wxLogin = function() {
cc.sys.ANDROID && jsb.reflection.callStaticMethod("com/xiyoufang/aij/wx/WxHelper", "wxLogin", "()V");
};
e.onWxLogin = function(e) {
cc.log("code:" + e);
a.default.getInst()._aiJPro.isOpen() ? r.default.use(i.default.PLAZA_WS_NAME).send(new o.default(e)) : s.default.alert("提示信息", "未连接服务器，请稍后再试！");
};
e.get = function(e, t) {
var n = cc.loader.getXMLHttpRequest();
n.open("GET", e, !0);
n.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
n.onreadystatechange = function() {
if (4 == n.readyState) {
n.statusText;
null != t && t.perform(n.responseText);
}
};
n.send();
};
e.appId = "wx7da1c028a41aeaf3";
e.secret = "61fca66cdaf99017bbd2f78c4393b84a";
return e;
}();
n.default = u;
cc.WxHelper = u;
cc._RF.pop();
}, {
"./AlertWindow": "AlertWindow",
"./AppConfig": "AppConfig",
"./plazz/PlazaConfig": "PlazaConfig",
"./plazz/event/PlazaWeiXinLoginEvent": "PlazaWeiXinLoginEvent",
"./ws/AiJKit": "AiJKit"
} ]
}, {}, [ "AiJApp", "AiJCCComponent", "AlertWindow", "AppConfig", "AudioManager", "GameServiceManager", "LoadingWindow", "Setting", "SettingWindow", "UIManger", "UserInfoWindow", "WelcomeLayer", "WxHelper", "FireKit", "OnFire", "Hero", "HeroManager", "PlazaConfig", "PlazaLayer", "PlazaWsListener", "RechargeRecordLayer", "RoomRecordLayer", "BroadcastEvent", "PlazaMobileLoginEvent", "PlazaWeiXinLoginEvent", "RechargeRecordEvent", "RoomEvent", "RoomRecordEvent", "UserAssetEvent", "UserAssetTransEvent", "UserCertEvent", "BroadcastEventResponseHandler", "PlazaCommonResponseHandler", "PlazaLoginHandler", "RechargeRecordEventResponseHandler", "RoomEventResponseHandler", "RoomRecordEventResponseHandler", "UserAssetEventResponseHandler", "UserAssetTransEventResponseHandler", "UserCertEventResponseHandler", "BroadcastEventResponse", "PlazaLoginEventResponse", "RechargeRecordEventResponse", "RoomRecordEventResponse", "RoomServiceEventResponse", "UserAssetEventResponse", "UserAssetTransEventResponse", "UserCertEventResponse", "AbstractRoomConfig", "RoomWsListener", "ClientReadyEvent", "CreateTableEvent", "DismissTableEvent", "DismissVoteTableEvent", "HeroProfileEvent", "JoinTableEvent", "LeaveTableEvent", "RoomMobileLoginEvent", "SitDownTableEvent", "StandUpTableEvent", "ChatEventResponseHandler", "CreateTableEventResponseHandler", "DismissVoteEventResponseHandler", "HeroEnterEventResponseHandler", "HeroLeaveEventResponseHandler", "HeroOfflineEventResponseHandler", "HeroOnlineEventResponseHandler", "HeroProfileEventResponseHandler", "HeroSceneResponseHandler", "HeroSitDownEventResponseHandler", "HeroStandUpEventResponseHandler", "JoinTableEventResponseHandler", "LoginNotifyResponseHandler", "RoomCommonResponseHandler", "RoomLoginResponseHandler", "MahjongGameEngine", "MahjongGameLayer", "MahjongRoomConfig", "MahjongVideoLayer", "MahjongOperateEvent", "MahjongOutCardEvent", "MahjongDispathCardResponseHandler", "MahjongEndEventResponseHandler", "MahjongErrorEventResponseHandler", "MahjongGameEndEventResponseHandler", "MahjongGameStartResponseHandler", "MahjongGameStatusResponseHandler", "MahjongOperateNotifyEventResponseHandler", "MahjongOperateResultEventResponseHandler", "MahjongOutCardResponseHandler", "MahjongPlayingGameSceneResponseHandler", "MahjongPrepareGameSceneResponseHandler", "MahjongAction", "MahjongGameActionRecord", "MahjongGameRecord", "MahjongGameStartRecord", "MahjongPlayerRecord", "MahjongRecord", "MahjongDispatchCardEventResponse", "MahjongEndEventResponse", "MahjongErrorEventResponse", "MahjongGameEndEventResponse", "MahjongGameStartEventResponse", "MahjongGameStatusResponse", "MahjongOperateNotifyEventResponse", "MahjongOperateResultEventResponse", "MahjongOutCardEventResponse", "MahjongPlayingGameSceneResponse", "MahjongPrepareGameSceneResponse", "MahjongWeaveItem", "MahjongWeaveType", "CreateTableEventResponse", "DismissVoteEventResponse", "HeroEnterEventResponse", "HeroLeaveEventResponse", "HeroOfflineEventResponse", "HeroOnlineEventResponse", "HeroProfileEventResponse", "HeroSceneResponse", "HeroSitDownEventResponse", "HeroStandUpEventResponse", "JoinTableEventResponse", "RoomLoginEventResponse", "AiJ", "AiJKit", "AiJPro" ]);