import { isFileExist } from "../../impl/ClicornAPI";
import { pathNormalize } from "../../impl/Path";
import { ALICORN_DATA_SUFFIX } from "../commons/Constants";
import { buildMap, parseMap } from "../commons/MapUtil";
import { isNull } from "../commons/Null";
import { getActualDataPath, loadData, saveData } from "../config/DataSupport";

const VALIDATE_FILE = "f.record" + ALICORN_DATA_SUFFIX;
let VF: Map<string, string> = new Map();

async function saveDefaultVF(): Promise<void> {
  if (!(await isFileExist(getActualDataPath(VALIDATE_FILE)))) {
    await saveData(VALIDATE_FILE, "");
  }
}

async function loadVF(): Promise<void> {
  try {
    VF = parseMap(await loadData(VALIDATE_FILE));
  } catch {}
}

export async function initVF(): Promise<void> {
  await saveDefaultVF();
  await loadVF();
}

export function getLastValidateModified(file: string): Date {
  const f = VF.get(pathNormalize(file));
  return new Date(isNull(f) ? 0 : String(f));
}

export function updateRecord(file: string): void {
  VF.set(pathNormalize(file), new Date().toUTCString());
}

export function deleteRecord(file: string): void {
  VF.delete(pathNormalize(file));
}

export async function saveVF(): Promise<void> {
  await saveData(VALIDATE_FILE, buildMap(VF));
}
