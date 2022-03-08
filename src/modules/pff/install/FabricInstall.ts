import {
  closeFile,
  ensureDir,
  isFileExist,
  openFile,
  readFile,
  spawnProc,
  writeFile,
} from "../../../impl/ClicornAPI";
import { waitProcessEnd } from "../../../impl/Process";
import { basicHash } from "../../commons/BasicHash";
import { MinecraftContainer } from "../../container/MinecraftContainer";
import { xgot } from "../../download/GotWrapper";
import { ensureLibraries } from "../../launch/Ensurance";
import { escapeArgs } from "../../launch/MinecraftBootstrap";
import { GameProfile } from "../../profile/GameProfile";
import { convertLibsByName } from "../../profile/LibrariesConvert";
import {
  FABRIC_VERSIONS_LOADER,
  generateFabricJarName,
} from "../get/FabricGet";

const JAR_ARG = "-jar";
const PROFILE_JSON_SUFFIX = "/profile/json";

export async function performFabricInstall(
  jExecutable: string,
  fbURL: string,
  fbv: string,
  mcv: string,
  container: MinecraftContainer
): Promise<boolean> {
  try {
    let failBit = true;
    try {
      await makeTempLP(container);
      // Fabric has less libraries, much faster than Forge!
      await ensureFabricLibrariesOL(mcv, fbv, container);
      await bootFabricInstaller(jExecutable, fbURL, fbv, mcv, container);
      await ensureDir(container.getModsRoot());
    } catch (e) {
      console.log(e);
      failBit = false;
    }
    return failBit;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function bootFabricInstaller(
  jExecutable: string,
  fbURL: string,
  fbv: string,
  mcv: string,
  container: MinecraftContainer
) {
  const fArg = [
    "client",
    "-dir",
    container.resolvePath(),
    "-mcversion",
    mcv,
    "-loader",
    fbv,
  ];
  const fbJar = container.getTempFileStorePath(
    generateFabricJarName(basicHash(fbURL).slice(0, 8))
  );

  try {
    const prc = await spawnProc(
      `"${jExecutable}" ${escapeArgs([JAR_ARG, fbJar].concat(fArg)).join(" ")}`
    );
    await waitProcessEnd(prc);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function ensureFabricLibrariesOL(
  mcv: string,
  fbv: string,
  container: MinecraftContainer
): Promise<void> {
  const url = FABRIC_VERSIONS_LOADER + `/${mcv}/${fbv}` + PROFILE_JSON_SUFFIX;
  try {
    const profJ = await xgot(url);
    const gp = new GameProfile(convertLibsByName(Object.assign({}, profJ)));
    await ensureLibraries(gp, container);
  } catch {
    return;
  }
}
const LAUNCHER_PROFILES = "launcher_profiles.json";
// Create an empty 'launcher_profile.json' for the silly installer
async function makeTempLP(container: MinecraftContainer): Promise<void> {
  try {
    const originLP = container.resolvePath(LAUNCHER_PROFILES);
    if (!(await isFileExist(originLP))) {
      const fd = await openFile(originLP, "r");
      await writeFile(fd, Buffer.from(JSON.stringify({ profiles: {} })));
      await closeFile(fd);
      return;
    }
    try {
      const fd = await openFile(originLP, "r+");
      const dt = await readFile(fd);
      const f = JSON.parse(dt.toString());

      if (typeof f.profiles !== "object") {
        // Bad LP!
        await writeFile(fd, Buffer.from(JSON.stringify({ profiles: {} })));
      }
      await closeFile(fd);
    } catch {}
  } catch {}
}
