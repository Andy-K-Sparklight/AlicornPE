import { isFileExist } from "../../../impl/ClicornAPI";
import { pathJoin } from "../../../impl/Path";
import { basicHash } from "../../commons/BasicHash";
import { copyFileRW } from "../../commons/FileUtil";
import { getString } from "../../config/ConfigSupport";

export async function saveModFileAsCache(
  origin: string,
  mainId: string,
  artifactId: string
): Promise<void> {
  try {
    const cache = getString("pff.cache-root", "");
    if (cache.trim().length === 0) {
      return;
    }
    const target = pathJoin(
      cache,
      basicHash(mainId) + "-" + basicHash(artifactId)
    );
    await copyFileRW(origin, target);
  } catch {}
}

export async function getCachedMod(
  mainId: string,
  artifactId: string
): Promise<string | false> {
  const cache = getString("pff.cache-root", "");
  if (cache.trim().length === 0) {
    return false;
  }
  const p = pathJoin(cache, basicHash(mainId) + "-" + basicHash(artifactId));
  return (await isFileExist(p)) ? p : false;
}
