import {
  closeFile,
  getFileSize,
  getSHA1,
  openFile,
} from "../../impl/ClicornAPI";
import { getBoolean } from "../config/ConfigSupport";
export async function validate(
  file: string,
  expected: string,
  size = 0
): Promise<boolean> {
  if (getBoolean("download.skip-validate")) {
    return await sizeValidate(file, size);
  }
  const actual = await getHash(file);
  if (actual.trim().toLowerCase() === expected.trim().toLowerCase()) {
    return true;
  }
  return false;
}

export function getHash(f: string): Promise<string> {
  return getSHA1(f);
}

async function sizeValidate(f: string, size: number): Promise<boolean> {
  if (size <= 0) {
    return true;
  }
  try {
    const fd = await openFile(f, "rb");
    const s = await getFileSize(fd);
    await closeFile(fd);
    return s === size;
  } catch {
    return false;
  }
}
