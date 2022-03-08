import {
  closeFile,
  getUserHome,
  isFileExist,
  openFile,
  readFile,
  writeFile,
} from "../../impl/ClicornAPI";
import { pathJoin } from "../../impl/Path";
import { copyFileRW } from "../commons/FileUtil";
import { getBasePath } from "./PathSolve";

let DATA_ROOT: string;
let DEFAULTS_ROOT: string;

export function initDataPaths(): void {
  DATA_ROOT = pathJoin(getUserHome(), "alicorn");
  DEFAULTS_ROOT = pathJoin(getBasePath(), "defaults");
}

export async function loadData(dataPath: string): Promise<string> {
  try {
    const fd = await openFile(getActualDataPath(dataPath), "rb");
    const dt = await readFile(fd);
    await closeFile(fd);
    return dt.toString();
  } catch (e) {
    console.log(e);
    return "";
  }
}

export function getPathInDefaults(pt: string): string {
  return pathJoin(DEFAULTS_ROOT, pt);
}

export function getActualDataPath(pt: string): string {
  return pathJoin(DATA_ROOT, pt);
}

export async function saveData(
  relativePath: string,
  data: string
): Promise<void> {
  try {
    const dest = getActualDataPath(relativePath);
    const fd = await openFile(dest, "wb");
    await writeFile(fd, Buffer.from(data));
    await closeFile(fd);
  } catch (e) {
    console.log(e);
  }
}

// Hint: DO NOT use 'fs.copyFile' here!
// 'No permission', I don't know why, but we have to do this manually

export async function saveDefaultData(dfPath: string): Promise<void> {
  try {
    const dest = getActualDataPath(dfPath);
    if (await isFileExist(dest)) {
      return;
    }
    await copyFileRW(pathJoin(DEFAULTS_ROOT, dfPath), dest);
  } catch {}
}

export async function saveDefaultDataAs(
  dfPath: string,
  filename: string
): Promise<void> {
  try {
    const dest = getActualDataPath(filename);
    if (await isFileExist(dest)) {
      return;
    }
    await copyFileRW(pathJoin(DEFAULTS_ROOT, dfPath), dest);
  } catch (e) {
    console.log(e);
  }
}
