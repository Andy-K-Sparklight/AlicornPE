import {
  closeFile,
  openFile,
  readDirectory,
  readFile,
} from "../../impl/ClicornAPI";
import { pathJoin } from "../../impl/Path";
import { GameProfile } from "../profile/GameProfile";
import { getAllContainers, getContainer, isMounted } from "./ContainerUtil";
import { MinecraftContainer } from "./MinecraftContainer";

export async function scanCoresIn(
  c: MinecraftContainer,
  unsafe = false
): Promise<string[]> {
  const cRoot = c.getVersionBase();
  try {
    const allV = await readDirectory(cRoot);
    const tArr: string[] = [];
    await Promise.all(
      allV.map((v) => {
        return new Promise<void>((resolve) => {
          if (unsafe) {
            tArr.push(v);
            resolve();
            return;
          }
          void isValidCore(pathJoin(cRoot, v)).then((i) => {
            if (i) {
              tArr.push(v);
            }
            resolve();
          });
        });
      })
    );
    return tArr;
  } catch {
    return [];
  }
}

async function isValidCore(profileRoot: string): Promise<boolean> {
  try {
    const fd = await openFile(profileRoot, "r");
    const dt = await readFile(fd);
    await closeFile(fd);
    new GameProfile(JSON.parse(dt.toString())); // This contains validate
    return true;
  } catch {
    return false;
  }
}

export async function scanCoresInAllMountedContainers(
  unsafe = false
): Promise<Map<MinecraftContainer, string[]>> {
  const rMap = new Map<MinecraftContainer, string[]>();
  for (const c of getAllContainers()) {
    try {
      if (!isMounted(c)) {
        continue;
      }
      const container = getContainer(c);
      rMap.set(container, await scanCoresIn(container, unsafe));
    } catch {}
  }
  return rMap;
}
