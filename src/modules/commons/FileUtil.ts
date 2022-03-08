import {
  closeFile,
  ensureDir,
  getFileSize,
  getModificationTime,
  isFileExist,
  openFile,
  readFile,
  writeFile,
} from "../../impl/ClicornAPI";
import { pathDirname } from "../../impl/Path";
export async function alterPath(...pt: string[]): Promise<string> {
  for (const p of pt) {
    if (await chkPermissions(p)) {
      return p;
    }
  }
  return "";
}

export function chkPermissions(_pt: string, _exec = false): Promise<boolean> {
  return Promise.resolve(true); // Not implemented
}

export async function isFileExistAndNonEmpty(pt: string): Promise<boolean> {
  try {
    const fd = await openFile(pt, "rb");
    const sz = await getFileSize(fd);
    return sz > 0;
  } catch {
    return false;
  }
}

export async function getModifiedDate(f: string): Promise<Date> {
  try {
    return new Date(await getModificationTime(f));
  } catch {
    return new Date();
  }
}

export async function copyFileRW(from: string, dPath: string): Promise<void> {
  try {
    if (!(await isFileExist(from))) {
      throw new Error("File Not Exist: " + from);
    }
    await ensureDir(pathDirname(dPath));
    const fd1 = await openFile(from, "rb");
    const fd2 = await openFile(dPath, "wb");
    const d1 = await readFile(fd1);
    await closeFile(fd1);
    await writeFile(fd2, d1);
    await closeFile(fd2);
  } catch (e) {
    console.log(e);
  }
}
