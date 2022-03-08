// Self Init
export async function initClicornAPI() {
  window._USER_HOME = await window._getUserHome();
  window._OS_TYPE = await window._getOsType();
  window.Buffer = require("buffer/").Buffer;
}

// Dev
export function print(msg) {
  return window._print(msg);
}

// File System
export function openFile(path, mode) {
  return window._openFile(path, mode);
}
export function closeFile(fd) {
  return window._closeFile(fd);
}
export function getFileSize(fd) {
  return window._getFileSize(fd);
}
export async function readFile(fd) {
  const d = await window._readFile(fd);
  return Buffer.from(d, "base64");
}
export function writeFile(fd, data) {
  return window._writeFile(fd, data.toString("base64"));
}
export function appendFile(fd, data) {
  return window._appendFile(fd, data.toString("base64"));
}
export function getUserHome() {
  return window._USER_HOME;
}
export function ensureDir(pt) {
  // It seems ensureDir is smarter... However, for compatibility, we still need to perform some checks.
  if (window._OS_TYPE === "linux") {
    if (!pt.endsWith("/")) {
      pt += "/";
    }
  }
  if (window._OS_TYPE === "win32") {
    if (!pt.endsWith("\\")) {
      pt += "\\";
    }
  }
  return window._ensureDir(pt);
}
export function unZip(origin, dest) {
  return window._unZip(origin, dest);
}
export function isFileExist(pt) {
  return window._isFileExist(pt);
}
export function readDirectory(pt) {
  return window._readDirectory(pt);
}
export function remove(pt) {
  return window._remove(pt);
}
export function getModificationTime(pt) {
  return window._getModificationTime(pt);
}
export function linkFile(o, t) {
  return window._linkFile(o, t);
}
export function getSHA1(pt) {
  return window._getSHA1(pt);
}
// App
export function resize(w, h) {
  return window._resize(w, h);
}
export function openExternal(s) {
  return window._openExternal(s);
}

// Os
export function getOsType() {
  return window._OS_TYPE;
}

export function spawnProc(cmd) {
  return window._spawnProc(cmd);
}

export function getFreeMemory() {
  return window._getFreeMemory(pc);
}
export function getTotalMemory() {
  return window._getTotalMemory(pc);
}
export function chdir(pt) {
  return window._chdir(pt);
}

// Net
export function downloadFile(url, pt, timeout) {
  return window._downloadFile(url, pt, timeout);
}

export async function netGet(url, hd, timeout) {
  const { status, body } = await window._netGet(url, hd, timeout);
  return { status: status, body: Buffer.from(body, "base64") };
}
export async function netPost(url, hd, bd, timeout) {
  const { status, body } = await window._netPost(url, hd, bd, timeout);
  return { status: status, body: Buffer.from(body, "base64") };
}
