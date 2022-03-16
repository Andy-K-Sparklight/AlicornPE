import {
  closeFile,
  isFileExist,
  openFile,
  readFile,
  writeFile,
} from "../../../impl/ClicornAPI";
import { basicHash } from "../../commons/BasicHash";
import { MinecraftContainer } from "../../container/MinecraftContainer";
import { ModArtifact, ModMeta } from "./ModDefine";

export type LockfileModMeta = ModMeta & {
  selectedArtifact: ModArtifact;
  insallDate: number;
};
export type Lockfile2 = Record<string, LockfileModMeta>;

export async function loadLockfile(
  container: MinecraftContainer
): Promise<Lockfile2> {
  try {
    const lockPath = container.getPff2LockFile();
    if (await isFileExist(lockPath)) {
      const fd = await openFile(lockPath, "r");
      const f = await readFile(fd);
      await closeFile(fd);
      try {
        const l = JSON.parse(f.toString());
        await fixLockfile(l, container);
        return l;
      } catch {
        const fd = await openFile(lockPath, "w");
        await writeFile(fd, Buffer.from("{}"));
        await closeFile(fd);
        return {};
      }
    } else {
      const fd = await openFile(lockPath, "w");
      await writeFile(fd, Buffer.from("{}"));
      await closeFile(fd);
      return {};
    }
  } catch {
    return {};
  }
}

async function fixLockfile(
  lockfile: Lockfile2,
  container: MinecraftContainer
): Promise<void> {
  transformCursePlusPlus(lockfile);
  await Promise.allSettled(
    Object.keys(lockfile).map(async (name) => {
      if (
        !(await isFileExist(
          container.getModJar(lockfile[name].selectedArtifact.fileName)
        ))
      ) {
        delete lockfile[name];
      }
    })
  );
}

export async function saveLockfile(
  lockfile: Lockfile2,
  container: MinecraftContainer
): Promise<void> {
  try {
    const fd = await openFile(container.getPff2LockFile(), "w");
    await writeFile(fd, Buffer.from(JSON.stringify(lockfile, null, 2)));
    await closeFile(fd);
  } catch {}
}

export function addToLockfile(
  lockfile: Lockfile2,
  meta: ModMeta,
  artifact: ModArtifact
): void {
  const hsh = basicHash(meta.id) + "#" + basicHash(artifact.id);
  lockfile[hsh] = {
    ...meta,
    selectedArtifact: artifact,
    insallDate: new Date().getTime(),
  };
}

// PlaceHolder
function transformCursePlusPlus(_lockfile: Lockfile2): void {
  return;
}
