import { downloadFile, ensureDir } from "../../impl/ClicornAPI";
import { pathDirname } from "../../impl/Path";
import { getBoolean } from "../config/ConfigSupport";
import {
  AbstractDownloader,
  DownloadMeta,
  DownloadStatus,
} from "./AbstractDownloader";
import { getConfigOptn } from "./DownloadWrapper";
import { getHash } from "./Validate";

export class Serial extends AbstractDownloader {
  private static instance = new Serial();

  static getInstance(): Serial {
    return Serial.instance;
  }

  downloadFile(
    meta: DownloadMeta,
    noTimeout?: boolean,
    fetchRequire = false
  ): Promise<DownloadStatus> {
    return new Promise<DownloadStatus>((resolve, reject) => {
      (async () => {
        try {
          // Ensure directory
          await ensureDir(pathDirname(meta.savePath));
          if (
            !(await downloadFile(
              meta.url,
              meta.savePath,
              noTimeout ? 0 : getConfigOptn("timeout", 3000)
            ))
          ) {
            return DownloadStatus.RETRY;
          }

          if (meta.sha1 === "" || getBoolean("download.skip-validate")) {
            return DownloadStatus.RESOLVED;
          }
          const h = await getHash(meta.savePath);
          if (meta.sha1 === h) {
            // No error is ok
            return DownloadStatus.RESOLVED;
          }

          // Mismatch
          return DownloadStatus.RETRY; // Hash mismatch, bad url!
        } catch (e) {
          console.log(e);
          // Oops, probably timeout
          return DownloadStatus.TIMEOUT;
        }
      })()
        .then((b) => {
          resolve(b);
        })
        .catch((e) => {
          console.log(e);
          reject(e);
        });
    });
  }
}
