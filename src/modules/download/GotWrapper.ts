import { netGet } from "../../impl/ClicornAPI";
import { getNumber } from "../config/ConfigSupport";
import { applyMirror } from "./Mirror";

export async function xgot(
  url: string,
  noMirror = false,
  noTimeout = false
): Promise<unknown> {
  if (noMirror) {
    try {
      const res = await netGet(
        url,
        "{}",
        noTimeout ? 0 : getNumber("download.concurrent.timeout", 5000)
      );
      if (res.status < 200 || res.status >= 300) {
        throw "Failed to fetch! Code: " + res.status;
      }
      return await JSON.parse(res.body.toString());
    } catch (e) {
      console.log(e);
      return {};
    }
  }
  try {
    const res = await netGet(
      applyMirror(url),
      "{}",
      noTimeout ? 0 : getNumber("download.concurrent.timeout", 5000)
    );
    if (res.status < 200 || res.status >= 300) {
      throw "Failed to fetch! Code: " + res.status;
    }
    return JSON.parse(res.body.toString());
  } catch (e) {
    console.log(e);
    console.log("Relative url(origin): " + url);
    console.log("Relative url(mirror): " + applyMirror(url));
    return await xgot(url, true);
  }
}

export async function pgot(url: string, timeout: number): Promise<unknown> {
  const res = await netGet(url, "{}", timeout);
  if (res.status < 200 || res.status >= 300) {
    throw "Failed to fetch! Code: " + res.status;
  }
  return JSON.parse(res.body.toString());
}
