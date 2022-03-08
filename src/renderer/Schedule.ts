import leven from "js-levenshtein";
import mdiff from "mdiff";
import { readDirectory } from "../impl/ClicornAPI";
import { pathBasename, pathDirname, pathJoin } from "../impl/Path";

export function schedulePromiseTask<T>(
  fn: () => Promise<T> | T,
  timeout?: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    window.requestIdleCallback(
      () => {
        let t;
        try {
          t = fn();
        } catch (e) {
          reject(e);
          return;
        }
        if (t instanceof Promise) {
          t.then((r) => {
            resolve(r);
          }).catch((e) => {
            reject(e);
          });
        } else {
          resolve(t);
        }
      },
      timeout ? { timeout: timeout } : undefined
    );
  });
}

// Previous worker functions are here
export function strDiff0(str1: string, str2: string): number {
  const ed = leven(str1, str2);
  const lcs = mdiff(str1, str2).getLcs()?.length || 0;
  return ed * 2 - lcs * 8 + 30 + str2.length;
}

const DIR_BLACKLIST = [
  "proc",
  "etc",
  "node_modules",
  "tmp",
  "dev",
  "sys",
  "drivers",
  "var",
  "src",
  "config",
  "icons",
  "themes",
  ".npm",
  "cache",
  "font",
  "fonts",
  "doc",
];

const DIR_BLACKLIST_INCLUDE =
  /windows|microsoft|common files|\/usr\/share|\/usr\/local\/share|\/usr\/local\/include|\/usr\/lib\/firmware|\/usr\/lib\/python|\/usr\/lib\/[^/]+?-linux-gnu|\/usr\/include/i;

export async function diveSearch0(
  filename: string,
  rootDir: string,
  depth: number,
  counter: number,
  any: boolean
) {
  const arr: string[] = [];
  await _diveSearch(filename, rootDir, arr, depth, counter, any);
  return arr;
}

// SLOW reclusive function
function _diveSearch(
  fileName: string,
  rootDir: string,
  concatArray: string[],
  depth = 5,
  counter = 0,
  any = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  superres?: any
) {
  return new Promise<void>((res) => {
    void (async () => {
      if (depth !== 0 && counter > depth) {
        res();
        return;
      }
      try {
        const all = await readDirectory(rootDir);

        if (all.includes(fileName)) {
          const aPath = pathJoin(rootDir, fileName);
          if (pathBasename(pathDirname(aPath)).toLowerCase() === "bin") {
            concatArray.push(aPath);
            res(); // File found, no deeper
            if (any) {
              if (superres) {
                superres();
              }
            }
            return;
          }
        }
        await Promise.allSettled(
          all.map(async (s) => {
            const currentBase = pathJoin(rootDir, s);
            if (
              DIR_BLACKLIST.includes(s.toLowerCase()) ||
              DIR_BLACKLIST_INCLUDE.test(currentBase)
            ) {
              return;
            }
            try {
              await readDirectory(currentBase);
              await _diveSearch(
                fileName,
                currentBase,
                concatArray,
                depth,
                counter + 1,
                any,
                superres ? superres : any ? res : undefined
              );
            } catch {}
          })
        );
        res();
        return;
      } catch {
        res();
        return;
      }
    })();
  });
}
