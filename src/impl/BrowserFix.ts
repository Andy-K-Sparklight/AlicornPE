import { buildMap, parseMap } from "../modules/commons/MapUtil";
import { getActualDataPath } from "../modules/config/DataSupport";
import { closeFile, openFile, readFile, writeFile } from "./ClicornAPI";

const _cSessionStorage = new Map<string, string>();
const cSessionStorage = {
  setItem(k: string, v: unknown): void {
    _cSessionStorage.set(k, String(v));
  },
  getItem(k: string): string | null {
    const v = _cSessionStorage.get(k);
    if (v === undefined) {
      return null;
    }
    return v;
  },
  removeItem(k: string): void {
    _cSessionStorage.delete(k);
  },
};
const _cLocalStorage = new Map<string, string>();
export async function cInit() {
  try {
    const f = await openFile(getActualDataPath("cLocalStorage.ald"), "r");
    const dat = (await readFile(f)).toString();
    await closeFile(f);
    const mp = parseMap<string>(dat, "@@BF_CLICORN@@");
    for (const [k, v] of mp.entries()) {
      _cLocalStorage.set(k, v);
    }
  } catch {}
}
export async function cSync() {
  try {
    const f = await openFile(getActualDataPath("cLocalStorage.ald"), "w");
    const dat = buildMap(_cLocalStorage, "@@BF_CLICORN@@");
    await writeFile(f, Buffer.from(dat));
    await closeFile(f);
  } catch {}
}
const cLocalStorage = {
  setItem(k: string, v: unknown): void {
    _cLocalStorage.set(k, String(v));
  },
  getItem(k: string): string | null {
    const v = _cLocalStorage.get(k);
    if (v === undefined) {
      return null;
    }
    return v;
  },
  removeItem(k: string): void {
    _cLocalStorage.delete(k);
  },
};

export { cSessionStorage, cLocalStorage };
