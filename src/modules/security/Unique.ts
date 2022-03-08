import {
  closeFile,
  isFileExist,
  openFile,
  readFile,
  writeFile,
} from "../../impl/ClicornAPI";
import { uniqueHash } from "../commons/BasicHash";
import { getActualDataPath } from "../config/DataSupport";

let machineIDCache = "";

export async function getMachineUniqueID(): Promise<string> {
  if (machineIDCache !== "") {
    return machineIDCache;
  }
  const id = await genMachineId();
  machineIDCache = id;
  return id;
}

const MAC_FILE = "mid.ald";

async function genMachineId(): Promise<string> {
  const f = getActualDataPath(MAC_FILE);
  if (await isFileExist(f)) {
    const fd = await openFile(f, "r");
    const d = await readFile(fd);
    await closeFile(fd);
    return d.toString().trim();
  } else {
    const rad = uniqueHash(Math.random().toString());
    const fd = await openFile(f, "w");
    await writeFile(fd, Buffer.from(rad.trim()));
    await closeFile(fd);
    return rad;
  }
}
