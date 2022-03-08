import { getOsType, isFileExist, spawnProc } from "../../impl/ClicornAPI";
import { pathDirname, pathJoin } from "../../impl/Path";
import { diveSearch0 } from "../../renderer/Schedule";
import { getBoolean, getNumber } from "../config/ConfigSupport";
import { resetJavaList } from "./JavaInfo";

// This function is VERY SLOW!
// It searches the whole os directory to find 'java.exe'(or 'java' on unix-liked)

export async function whereJava(
  useCache = false,
  justExist = false
): Promise<string[]> {
  let all: string[] = [];
  all = all.concat(await findJavaViaCommand());
  all.push(await findJavaInPATH());
  if (justExist && all.length > 0) {
    const p = await chkJava(all);
    if (p.length > 0) {
      return p;
    }
  }
  if (!getBoolean("java.simple-search")) {
    if (getOsType() === "win32") {
      all = all.concat(await findJavaInProgramFilesWin32(justExist));
    } else {
      all = all.concat(await findJavaUNIX(justExist));
    }
  }

  const res = await chkJava(all);

  if (useCache) {
    resetJavaList(res);
  }
  return res;
}

async function chkJava(all: string[]): Promise<string[]> {
  const res: string[] = [];
  for (const a of all) {
    if (await isFileExist(a)) {
      const trimA = pathDirname(pathDirname(a.trim()));
      if (trimA !== "" && !res.includes(trimA)) {
        res.push(trimA);
        // Get Java home
      }
    }
  }
  return res;
}

async function findJavaUNIX(any = false): Promise<string[]> {
  if (getOsType() === "win32") {
    return [];
  }
  const programBase = "/usr/";
  const all: string[] = [];
  await diveSearch(
    "java",
    programBase,
    all,
    getNumber("java.search-depth", 8),
    0,
    any
  );
  return all;
}

async function findJavaInPATH(): Promise<string> {
  const javaPath = process.env["JAVA_HOME"];
  if (javaPath === undefined) {
    return "";
  }
  let javaName = "java";
  if (getOsType() === "win32") {
    javaName = "java.exe";
  }
  const testJavaPath = pathJoin(javaPath, "bin", javaName);
  if (await isFileExist(testJavaPath)) {
    return testJavaPath;
  }
  return "";
}

async function findJavaInProgramFilesWin32(any = false): Promise<string[]> {
  if (getOsType() !== "win32") {
    return [];
  }
  const programBaseMain = "C:\\Program Files";
  const programBase86 = "C:\\Program Files (x86)";
  const all: string[] = [];

  await diveSearch(
    "java.exe",
    programBaseMain,
    all,
    getNumber("java.search-depth", 5),
    0,
    any
  );
  await diveSearch(
    "java.exe",
    programBase86,
    all,
    getNumber("java.search-depth", 5),
    0,
    any
  );
  // Find 32 bit, diveSearch can 'afford' error
  return all;
}

// Use command to locate
async function findJavaViaCommand(): Promise<string[]> {
  let command = "which java";
  if (getOsType() === "win32") {
    command = "where java";
  }
  const pc = await spawnProc(command);
  const resultRaw: string[] = [];
  const result = [];

  for (const r of resultRaw) {
    const trimR = r.trim();
    if (trimR !== "") {
      result.push(trimR);
    }
  }
  return result;
}

async function diveSearch(
  fileName: string,
  rootDir: string,
  concatArray: string[],
  depth = 5,
  counter = 0,
  any = false
): Promise<void> {
  const res = await diveSearch0(fileName, rootDir, depth, counter, any);
  if (res instanceof Array) {
    res.forEach((s) => {
      concatArray.push(s);
    });
  }
}
