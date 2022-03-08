import { ensureDir } from "../../impl/ClicornAPI";
import { pathNormalize } from "../../impl/Path";
import { getBasePath } from "../config/PathSolve";
import { registerContainer, unregisterContainer } from "./ContainerUtil";
import { MinecraftContainer } from "./MinecraftContainer";
import { markASC } from "./SharedFiles";

// Create a container at specified dir
export async function createNewContainer(
  rootDir: string,
  name: string,
  isASC = false
): Promise<void> {
  if (pathNormalize(rootDir) === pathNormalize(getBasePath())) {
    throw new Error("Invalid target! Cannot operate cwd.");
  }
  const d = pathNormalize(rootDir);
  try {
    await ensureDir(d);
  } catch (e) {
    throw new Error("Cannot create container. Caused by: " + e);
  }
  if (isASC) {
    try {
      await markASC(d);
    } catch {}
  }
  registerContainer(new MinecraftContainer(d, name));
}

// Unlink a container, don't delete
export function unlinkContainer(name: string): void {
  unregisterContainer(name);
}
