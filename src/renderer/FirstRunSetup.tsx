import { getUserHome, netGet } from "../impl/ClicornAPI";
import { pathJoin } from "../impl/Path";
import { alterPath } from "../modules/commons/FileUtil";
import { getBoolean, set } from "../modules/config/ConfigSupport";
import { createNewContainer } from "../modules/container/ContainerWrapper";
import {
  getAllJava,
  getJavaInfoRaw,
  parseJavaInfo,
  parseJavaInfoRaw,
  setDefaultJavaHome,
} from "../modules/java/JavaInfo";
import { whereJava } from "../modules/java/WhereJava";
import { isInstBusy, startInst } from "./Instruction";
import { submitInfo } from "./Message";
import { tr } from "./Translator";
export function waitInstDone(): Promise<void> {
  return new Promise<void>((res) => {
    if (!isInstBusy()) {
      res();
      return;
    }
    const fun = () => {
      window.removeEventListener("InstructionEnd", fun);
      res();
    };
    window.addEventListener("InstructionEnd", fun);
  });
}

async function waitJavaSearch(): Promise<boolean> {
  const r = await whereJava(true, true);
  if (r.length > 0) {
    return true;
  }
  return false;
}

export async function completeFirstRun(): Promise<void> {
  if (!getBoolean("first-run?")) {
    return;
  }
  await configureDefaultDirs();
  await createNewContainer(
    getMCDefaultRootDir(),
    tr("FirstRun.Default") || "Minecraft"
  );
  await decideMirror();
  await setupFirstJavaCheckAndCheckToGo();
  set("first-run?", false);
}

function getMCDefaultRootDir(): string {
  return pathJoin(getUserHome(), ".minecraft");
}

async function setupFirstJavaCheckAndCheckToGo(): Promise<void> {
  submitInfo(tr("FirstRun.Preparing"));
  let s = false;
  void (async () => {
    s = await waitJavaSearch();
  })();
  await waitInstDone();
  startInst("JavaOK"); // Not really...

  // Delegate this task
  void whereJava(true)
    .then(async () => {
      let a = "";
      submitInfo(tr("FirstRun.ConfiguringJava"));
      await Promise.allSettled(
        getAllJava().map(async (j) => {
          const jf = parseJavaInfo(parseJavaInfoRaw(await getJavaInfoRaw(j)));
          if (jf.rootVersion >= 17) {
            a = j;
          }
        })
      );
      setDefaultJavaHome(a || getAllJava()[0] || "");
      submitInfo(tr("FirstRun.JavaConfigured"));
    })
    .catch(() => {});
  await waitInstDone();
}

async function configureDefaultDirs(): Promise<void> {
  const pff = await alterPath(pathJoin(getUserHome(), "alicorn", "pff-cache"));
  const cx = await alterPath(pathJoin(getUserHome(), "alicorn", "asc-cache"));
  if (pff.length > 0) {
    set("pff.cache-root", pff);
    localStorage.setItem("Edited.pff.cache-root", "1");
  }
  if (cx.length > 0) {
    set("cx.shared-root", cx);
    localStorage.setItem("Edited.cx.shared-root", "1");
  }
}

async function decideMirror(): Promise<void> {
  const URLS = {
    "alicorn-mcbbs-nonfree":
      "https://download.mcbbs.net/mc/game/version_manifest.json",
    "alicorn-bmclapi-nonfree":
      "https://bmclapi2.bangbang93.com/mc/game/version_manifest.json",
    none: "https://launchermeta.mojang.com/mc/game/version_manifest.json",
    alicorn: "https://al-versions-manifest.vercel.app/api/mojang",
  };
  let sl = "none";
  let rtt = 0;
  for (const [n, u] of Object.entries(URLS)) {
    try {
      const d0 = new Date();
      const r = await netGet(u, "{}", 3000);
      const d1 = new Date();
      if (r.status < 200 || r.status >= 300) {
        const dt = d1.getTime() - d0.getTime();
        if (dt < rtt) {
          sl = n;
          rtt = dt;
        }
      }
    } catch {}
  }
  set("download.mirror", sl);
}
