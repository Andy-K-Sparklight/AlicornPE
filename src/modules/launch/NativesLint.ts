import {
  closeFile,
  ensureDir,
  isFileExist,
  openFile,
  readDirectory,
  readFile,
  remove,
  unZip,
  writeFile,
} from "../../impl/ClicornAPI";
import { pathBasename, pathDirname, pathJoin } from "../../impl/Path";
import { buildMap, parseMap } from "../commons/MapUtil";
import { MinecraftContainer } from "../container/MinecraftContainer";
import { updateRecord } from "../container/ValidateRecord";
import { existsAndValidateRaw } from "../download/DownloadWrapper";
import { getHash } from "../download/Validate";
import {
  ArtifactMeta,
  getCurrentOSNameAsMojang,
  LibraryMeta,
} from "../profile/Meta";

export const JAR_SUFFIX = ".jar";
const META_INF = "META-INF";
const GIT_SUFFIX = ".git";
const CHECKSUM_SUFFIX = ".sha1";
const NATIVES_LOCK_FILE = "natives.lock.ald";

// Extracts one native library and remove '.git' and '.sha1' files
// We should validate hash, but it's unnecessary
export async function checkExtractTrimNativeLocal(
  container: MinecraftContainer,
  nativeArtifact: ArtifactMeta
): Promise<void> {
  try {
    const srcFile = container.getLibraryPath(nativeArtifact.path);
    const dest = container.getLibraryPath(
      pathJoin(
        pathDirname(nativeArtifact.path),
        pathBasename(nativeArtifact.path, JAR_SUFFIX)
      )
    );
    await ensureDir(dest);
    if (await checkLockFile(dest)) {
      return;
    }
    try {
      await unZip(srcFile, dest);
    } catch {}
    const filesToTrim = await readDirectory(dest);
    for (const f of filesToTrim) {
      if (
        f === META_INF ||
        f.endsWith(GIT_SUFFIX) ||
        f.endsWith(CHECKSUM_SUFFIX)
      ) {
        await remove(pathJoin(dest, f));
      }
    }
    await saveLockFile(dest);
  } catch {
    return;
  }
}

// Get the native artifact of a library according to the 'osName'
// If the library is not a native library, this will return an empty one
export function getNativeArtifact(
  libraryMeta: LibraryMeta,
  osName?: string
): ArtifactMeta {
  osName = osName || getCurrentOSNameAsMojang();
  if (libraryMeta.isNative) {
    switch (osName) {
      case "windows":
        return (
          libraryMeta.classifiers.nativesWindows ||
          ArtifactMeta.emptyArtifactMeta()
        );
      case "osx":
        return (
          libraryMeta.classifiers.nativesMacOS ||
          ArtifactMeta.emptyArtifactMeta()
        );
      case "linux":
      default:
        return (
          libraryMeta.classifiers.nativesLinux ||
          ArtifactMeta.emptyArtifactMeta()
        );
    }
  } else {
    return ArtifactMeta.emptyArtifactMeta();
  }
}

// A lockfile which contains the '.dll's(or '.so's) filename and their hashes
// If this file exists, we shall check whether the required files exist
// If not, we shall re-extract '...-natives.jar' and regenerate lockfile
async function checkLockFile(dir: string): Promise<boolean> {
  const lPath = pathJoin(dir, NATIVES_LOCK_FILE);
  if (!(await isFileExist(lPath))) {
    return false;
  }
  const fd = await openFile(lPath, "r");
  const dt = await readFile(fd);
  await closeFile(fd);
  const fMap = parseMap(dt.toString());
  const pStack: Promise<boolean>[] = [];
  for (const [f, s] of fMap.entries()) {
    const cPath = pathJoin(dir, f);
    pStack.push(
      new Promise<boolean>((resolve) => {
        existsAndValidateRaw(cPath, String(s))
          .then((b) => {
            resolve(b);
          })
          .catch(() => {
            resolve(false);
          });
      })
    );
  }
  for (const x of await Promise.all(pStack)) {
    if (!x) {
      return false;
    }
  }
  return true;
}

async function saveLockFile(dir: string): Promise<void> {
  const lPath = pathJoin(dir, NATIVES_LOCK_FILE);
  if (await isFileExist(lPath)) {
    await remove(lPath);
  }
  const dirFiles = await readDirectory(dir);
  const fMap = new Map<string, string>();
  await Promise.all(
    dirFiles.map((f) => {
      return new Promise<void>((resolve) => {
        const pt = pathJoin(dir, f);
        void getHash(pt).then((s) => {
          updateRecord(pt);
          fMap.set(f, s);
          resolve();
        });
      });
    })
  );
  await ensureDir(pathDirname(lPath));
  const fd0 = await openFile(lPath, "w");
  await writeFile(fd0, Buffer.from(buildMap(fMap)));
  await closeFile(fd0);
}
