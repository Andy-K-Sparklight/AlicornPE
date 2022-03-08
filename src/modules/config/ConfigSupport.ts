import {
  closeFile,
  ensureDir,
  getUserHome,
  openFile,
  readFile,
  writeFile,
} from "../../impl/ClicornAPI";
import { pathJoin } from "../../impl/Path";
import { getBasePath } from "./PathSolve";

let CONFIG_FILE: string;

let DEFAULT_CONFIG_FILE: string;

let cachedConfig = {};
let defaultConfig = {};

export function initConfigPaths(): void {
  CONFIG_FILE = pathJoin(getUserHome(), "alicorn", "alicorn.config.json");
  DEFAULT_CONFIG_FILE = pathJoin(
    getBasePath(),
    "defaults",
    "alicorn.config.json"
  );
}

export function set(key: string, value: unknown): void {
  // @ts-ignore
  cachedConfig[key] = value;
}

export function get(key: string, def: unknown): unknown {
  // @ts-ignore
  const v = cachedConfig[key];
  return v === undefined ? def : v;
}

function fixConfig(
  cur: Record<string, unknown>,
  def: Record<string, unknown>
): void {
  const curKeys = Object.keys(cur);
  const defKeys = Object.keys(def);
  for (const k of defKeys) {
    if (!k.endsWith("?") && !curKeys.includes(k)) {
      cur[k] = def[k];
    }
  }
}

export function getBoolean(key: string, def = false): boolean {
  return !!get(key, def);
}

export function getString(key: string, def = "", nonEmpty = false): string {
  const val = get(key, def);
  if (typeof val === "string") {
    if (!nonEmpty || val.length > 0) {
      return val;
    }
  }
  if (typeof val === "object" && val !== null) {
    return val.toString();
  }
  return String(val) || def;
}

export function getNumber(key: string, def = 0): number {
  return parseNum(get(key, def), def);
}

export function ensureDataDir(): Promise<void> {
  return ensureDir(pathJoin(getUserHome(), "alicorn"));
}
export async function loadConfig(): Promise<void> {
  try {
    const fd = await openFile(CONFIG_FILE, "r");
    const data = await readFile(fd);
    await closeFile(fd);
    cachedConfig = JSON.parse(data.toString());
  } catch {
    try {
      const fd = await openFile(DEFAULT_CONFIG_FILE, "r");
      const data = await readFile(fd);
      await closeFile(fd);
      cachedConfig = JSON.parse(data.toString());
    } catch (e) {
      console.log(e);
      return;
    }
  }
  try {
    const fd = await openFile(
      pathJoin(getBasePath(), "defaults", "alicorn.config.json"),
      "r"
    );
    const data = await readFile(fd);
    await closeFile(fd);
    defaultConfig = Object.freeze(JSON.parse(data.toString()));
  } catch (e) {
    console.log(e);
    return;
  }
  fixConfig(cachedConfig, defaultConfig);
}

export async function saveConfig(): Promise<void> {
  const dat = JSON.stringify(cachedConfig, null, 4);
  const fd = await openFile(CONFIG_FILE, "w");
  await writeFile(fd, Buffer.from(dat));
  await closeFile(fd);
}

export function parseNum(val: unknown, def = 0): number {
  if (typeof val === "number") {
    return val;
  }
  if (typeof val === "string") {
    const pInt = parseInt(val);
    if (!isNaN(pInt)) {
      return pInt;
    }
    const pFloat = parseFloat(val);
    if (!isNaN(pFloat)) {
      return pFloat;
    }
  }
  return def;
}

// The main program does not read any config, instead, optn should be send to main by renderer
export async function saveAndReloadMain(): Promise<void> {
  await saveConfig();
}
