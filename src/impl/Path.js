// Ported from NodeJS for Alicorn PE.
// ---------------------------------------------------
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

export async function initPaths() {
  (() => {
    function normalizeArray(t, r) {
      for (var e = [], i = 0; i < t.length; i++) {
        var n = t[i];
        n &&
          "." !== n &&
          (".." === n
            ? e.length && ".." !== e[e.length - 1]
              ? e.pop()
              : r && e.push("..")
            : e.push(n));
      }
      return e;
    }
    var splitDeviceRe =
        /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/,
      splitTailRe =
        /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/,
      win32 = {};
    function win32SplitPath(t) {
      var r = splitDeviceRe.exec(t),
        e = (r[1] || "") + (r[2] || ""),
        i = r[3] || "",
        n = splitTailRe.exec(i);
      return [e, n[1], n[2], n[3]];
    }
    function win32StatPath(t) {
      var r = splitDeviceRe.exec(t),
        e = r[1] || "",
        i = !!e && ":" !== e[1];
      return { device: e, isUnc: i, isAbsolute: i || !!r[2], tail: r[3] };
    }
    function normalizeUNCRoot(t) {
      return "\\\\" + t.replace(/^[\\\/]+/, "").replace(/[\\\/]+/g, "\\");
    }
    (win32.normalize = function (t) {
      var r = win32StatPath(t),
        e = r.device,
        i = r.isUnc,
        n = r.isAbsolute,
        o = r.tail,
        s = /[\\\/]$/.test(o);
      return (
        (o = normalizeArray(o.split(/[\\\/]+/), !n).join("\\")) ||
          n ||
          (o = "."),
        o && s && (o += "\\"),
        i && (e = normalizeUNCRoot(e)),
        e + (n ? "\\" : "") + o
      );
    }),
      (win32.isAbsolute = function (t) {
        return win32StatPath(t).isAbsolute;
      }),
      (win32.join = function () {
        for (var t = [], r = 0; r < arguments.length; r++) {
          var e = arguments[r];
          e && t.push(e);
        }
        var i = t.join("\\");
        return (
          /^[\\\/]{2}[^\\\/]/.test(t[0]) ||
            (i = i.replace(/^[\\\/]{2,}/, "\\")),
          win32.normalize(i)
        );
      }),
      (win32.dirname = function (t) {
        var r = win32SplitPath(t),
          e = r[0],
          i = r[1];
        return e || i ? (i && (i = i.substr(0, i.length - 1)), e + i) : ".";
      }),
      (win32.basename = function (t, r) {
        var e = win32SplitPath(t)[2];
        return (
          r &&
            e.substr(-1 * r.length) === r &&
            (e = e.substr(0, e.length - r.length)),
          e
        );
      }),
      (win32.sep = "\\"),
      (win32.delimiter = ";");
    var splitPathRe =
        /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,
      posix = {};
    function posixSplitPath(t) {
      return splitPathRe.exec(t).slice(1);
    }
    (posix.normalize = function (t) {
      var r = posix.isAbsolute(t),
        e = t && "/" === t[t.length - 1];
      return (
        (t = normalizeArray(t.split("/"), !r).join("/")) || r || (t = "."),
        t && e && (t += "/"),
        (r ? "/" : "") + t
      );
    }),
      (posix.isAbsolute = function (t) {
        return "/" === t.charAt(0);
      }),
      (posix.join = function () {
        for (var t = "", r = 0; r < arguments.length; r++) {
          var e = arguments[r];
          e && (t += t ? "/" + e : e);
        }
        return posix.normalize(t);
      }),
      (posix.dirname = function (t) {
        var r = posixSplitPath(t),
          e = r[0],
          i = r[1];
        return e || i ? (i && (i = i.substr(0, i.length - 1)), e + i) : ".";
      }),
      (posix.basename = function (t, r) {
        var e = posixSplitPath(t)[2];
        return (
          r &&
            e.substr(-1 * r.length) === r &&
            (e = e.substr(0, e.length - r.length)),
          e
        );
      }),
      (posix.sep = "/"),
      (posix.delimiter = ":"),
      (window._pathWin32 = win32),
      (window._pathPOSIX = posix);
  })();
  window._path = window._pathPOSIX;
  delete window._pathWin32;
  delete window._pathPOSIX;
}

export function pathJoin(...args) {
  return window._path.join(...args);
}

export function pathDirname(t) {
  return window._path.dirname(t);
}

export function pathBasename(t, e) {
  return window._path.basename(t, e);
}

export function pathIsAbsolute(t) {
  return window._path.isAbsolute(t);
}

export function pathDelimiter() {
  return window._path.delimiter;
}
export function pathNormalize(t) {
  return window._path.normalize(t);
}
export function pathExtName(t) {
  return window._path.extname(t);
}
