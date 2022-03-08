import { netGet } from "../../impl/ClicornAPI";
import { getActualDataPath, saveDefaultData } from "../config/DataSupport";

/*
CLAIM FOR EXTERNAL RESOURCE

This modules (AJHelper.ts) uses Authlib Injector (authlib-injector.ald), which is yushijinhun's work.
Authlib Injector is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE 3.0 (aka. AGPL-3.0) and it's a free software (free as in freedom).
It's license is compatible with ours, since we use GPL-3.0.
For details, please see https://github.com/yushijinhun/authlib-injector/blob/develop/LICENSE

A copy of authlib-injector.ald will be saved to the root dir of alicorn data.
*/

const AJ_FILE_BASE = "authlib-injector.ald";

export async function prepareAJ(): Promise<void> {
  await saveDefaultData(AJ_FILE_BASE);
}

export function whereAJ(): string {
  return getActualDataPath(AJ_FILE_BASE);
}

export async function prefetchData(authServer: string): Promise<string> {
  try {
    const res = await netGet(authServer, "{}", 0);
    if (res.status < 200 || res.status >= 300) {
      return "";
    }
    return res.body.toString("base64");
  } catch {
    return "";
  }
}
