import { chdir } from "../../impl/ClicornAPI";
import { EventEmitter } from "../../impl/EventEmitter";
import { whereAJ } from "../auth/AJHelper";
import { Pair } from "../commons/Collections";
import { isNull } from "../commons/Null";
import { MinecraftContainer } from "../container/MinecraftContainer";
import { GameProfile } from "../profile/GameProfile";
import { setDirtyProfile } from "../readyboom/PrepareProfile";
import {
  applyAJ,
  applyMemory,
  applyResolution,
  applyScheme,
  applyServer,
  generateGameArgs,
  generateVMArgs,
} from "./ArgsGenerator";
import { runMinecraft } from "./MinecraftBootstrap";

// Launch and return ID
export async function launchProfile(
  profile: GameProfile,
  container: MinecraftContainer,
  jExecutable: string,
  authData: [string, string, string, string],
  emitter: EventEmitter,
  policies: {
    useAj?: boolean;
    resolution?: Pair<number, number>;
    ajHost?: string;
    useServer?: boolean;
    server?: string;
    ajPrefetch?: string;
    javaVersion?: number;
    gc1?: string;
    gc2?: string;
    maxMem?: number;
    demo?: boolean;
    isolated?: boolean;
  }
): Promise<number> {
  const vmArgs = generateVMArgs(profile, container);
  const gameArgs = generateGameArgs(
    profile,
    container,
    authData,
    !!policies.demo,
    !!policies.isolated
  );
  const ajArgs = policies.useAj
    ? applyAJ(whereAJ(), policies.ajHost || "", policies.ajPrefetch || "")
    : [];
  const resolutions = !isNull(policies.resolution)
    ? applyResolution(
        policies.resolution?.getFirstValue(),
        policies.resolution?.getSecondValue()
      )
    : [];
  const serverArgs = policies.useServer
    ? applyServer(policies.server || "")
    : [];

  let memArgs: string[] = [];
  if (policies.javaVersion && policies.gc1 && policies.gc2) {
    memArgs = applyScheme(policies.gc1, policies.gc2, policies.javaVersion);
  }
  memArgs = memArgs.concat(applyMemory(policies.maxMem || 0));
  const totalArgs = ajArgs // Will be empty if not using
    .concat(memArgs)
    .concat(vmArgs)
    .concat(gameArgs)
    .concat(serverArgs)
    .concat(resolutions);

  const ir = policies.isolated
    ? container.getVersionRoot(profile.id)
    : container.rootDir;

  await chdir(ir);

  console.log(totalArgs);
  return await runMinecraft(totalArgs, jExecutable, container, ir, emitter);
}

const SAFE_LAUNCH_SET: Set<string> = new Set();

export function shouldSafeLaunch(container: string, id: string): boolean {
  return SAFE_LAUNCH_SET.has(container + "/" + id);
}

export function markSafeLaunch(
  container: string,
  id: string,
  add = true
): void {
  if (add) {
    SAFE_LAUNCH_SET.add(container + "/" + id);
    setDirtyProfile(container, id);
  } else {
    SAFE_LAUNCH_SET.delete(container + "/" + id);
  }
}
