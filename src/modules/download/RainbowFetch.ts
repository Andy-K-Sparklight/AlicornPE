import { appendFile, closeFile, netGet } from "../../impl/ClicornAPI";
import { getNumber } from "../config/ConfigSupport";
import { MirrorChain } from "./Mirror";

export function getTimeoutController(
  timeout: number
): [controller: AbortController, canceller: () => void] {
  const ac = new AbortController();
  let t: NodeJS.Timeout | null = null;
  if (timeout > 0) {
    t = setTimeout(() => {
      ac.abort();
    }, timeout);
  }
  return [
    ac,
    () => {
      if (t) {
        clearTimeout(t);
      }
    },
  ];
}

async function isWebFileExist(u: string): Promise<string> {
  const mrc = new MirrorChain(u);
  while (mrc.mirror() !== u) {
    try {
      const r = await netGet(
        mrc.mirror(),
        "{}",
        getNumber("download.concurrent.timeout", 5000)
      );
      const s = r.status < 200 || r.status >= 300;
      if (s) {
        return u;
      }
      mrc.markBad();
    } catch {
      // If only timeout then just continue, but not mark bad
      mrc.next();
    }
  }
  const r = await netGet(
    u,
    "{}",
    getNumber("download.concurrent.timeout", 5000)
  );
  if (r.status < 200 || r.status >= 300) {
    return u;
  }
  throw "File not exist: " + u;
}

// Practice is the only criterion for testing truth!
export function getFileWriter(fd: number): WritableStream {
  return new WritableStream({
    write(chk) {
      const buf = Buffer.from(chk);
      return appendFile(fd, buf);
    },
    close() {
      return closeFile(fd);
    },
  });
}
