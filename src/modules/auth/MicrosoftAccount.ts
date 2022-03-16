import { cLocalStorage } from "../../impl/BrowserFix";
import { netGet, netPost, openExternal } from "../../impl/ClicornAPI";
import { isNull, safeGet } from "../commons/Null";
import { decrypt2, encrypt2 } from "../security/Encrypt";
import { Account } from "./Account";
import { AccountType } from "./AccountUtil";

// The auth progress for MS accounts:
// User -> Code (Browser)
// Code -> MS Token
// MS Token -> Xbox Token & Xbox uhs
// Xbox Token -> XSTS Token
// Xbox uhs & XSTS Token -> MC Token (AuthData 2)
// MC Token -> MC uuid & MC Username (Auth Data 3 & AuthData 1)
// Rainboom!

const XBL_URL = "https://user.auth.xboxlive.com/user/authenticate";
const XSTS_URL = "https://xsts.auth.xboxlive.com/xsts/authorize";
const MS_TOKEN_URL = "https://login.live.com/oauth20_token.srf";
const MJ_LOGIN_XBOX =
  "https://api.minecraftservices.com/authentication/login_with_xbox";
const MJ_PROFILE_API = "https://api.minecraftservices.com/minecraft/profile";

export const MS_LAST_USED_USERNAME_KEY = "MS.LastUsedUserName";
export const MS_LAST_USED_ACTOKEN_KEY = "MS.LastUsedACToken"; // Encrypt
export const MS_LAST_USED_UUID_KEY = "MS.LastUsedUUID";
export const MS_LAST_USED_XUID_KEY = "MS.LastUsedXUID";
export const MS_LAST_USED_REFRESH_KEY = "MS.LastUsedRefresh"; // Encrypt
export const ACCOUNT_LAST_REFRESHED_KEY = "MS.AccountRefreshDate";
export const ACCOUNT_EXPIRES_KEY = "MS.Expires";

export class MicrosoftAccount extends Account {
  buildAccessData(): Promise<[string, string, string, string]> {
    return Promise.resolve([
      this.lastUsedUsername,
      this.lastUsedAccessToken,
      this.lastUsedUUID,
      this.lastUsedXuid,
    ]);
  }

  constructor(accountName: string) {
    super(accountName, AccountType.MICROSOFT);
    this.lastUsedUsername =
      cLocalStorage.getItem(MS_LAST_USED_USERNAME_KEY) || "";
    this.lastUsedUUID = cLocalStorage.getItem(MS_LAST_USED_UUID_KEY) || "";
    this.lastUsedAccessToken = decrypt2(
      cLocalStorage.getItem(MS_LAST_USED_ACTOKEN_KEY) || ""
    );
    this.lastUsedXuid = cLocalStorage.getItem(MS_LAST_USED_XUID_KEY) || "";
    this.refreshToken = decrypt2(
      cLocalStorage.getItem(MS_LAST_USED_REFRESH_KEY) || ""
    );
  }

  async flushToken(): Promise<boolean> {
    try {
      if (isNull(this.refreshToken)) {
        return false;
      }
      console.log("Refresh Token -> New Token");
      const r1 = await refreshToken(this.refreshToken);
      if (!r1.success) {
        return false;
      }
      this.refreshToken = r1.refreshToken || this.refreshToken;
      const m1 = r1.accessToken;
      console.log("Token -> XBL");
      const r2 = await getXBLToken(String(m1));
      if (!r2.success) {
        return false;
      }
      const m2 = r2.token;
      const u = r2.uhs;
      console.log("XBL -> XSTS");
      const r3 = await getXSTSToken(String(m2));
      if (!r3.success) {
        return false;
      }
      const m3 = r3.token;
      console.log("XSTS -> Mojang");
      const [r4, xuid] = await getMojangTokenAndXuid(String(u), String(m3));
      if (isNull(r4) || isNull(xuid)) {
        return false;
      }
      this.lastUsedAccessToken = r4;
      this.lastUsedXuid = xuid;
      const r5 = await getUUIDAndUserName(r4);
      if (!r5.success) {
        return false;
      }
      this.lastUsedUsername = String(r5.name);
      this.lastUsedUUID = String(r5.uuid);
      console.log("Flush OK!");
      cLocalStorage.setItem(
        ACCOUNT_LAST_REFRESHED_KEY,
        new Date().toISOString()
      );
      saveUUID(this.lastUsedUUID);
      saveXuid(this.lastUsedXuid);
      saveUserName(this.lastUsedUsername);
      saveRefreshToken(this.refreshToken);
      saveAccessToken(this.lastUsedAccessToken);
      return true;
    } catch {
      return false;
    }
  }

  async isAccessTokenValid(): Promise<boolean> {
    try {
      if (isNull(this.lastUsedAccessToken)) {
        return false;
      }
      return (await getUUIDAndUserName(this.lastUsedAccessToken)).success;
    } catch {
      return false;
    }
  }

  async performAuth(password: string, quiet = false): Promise<boolean> {
    try {
      console.log("Getting code...");
      const code = await browserGetCode(quiet);
      console.log("CODE: " + code);
      if (code.trim().length === 0) {
        return false;
      }
      console.log("Code -> Token");
      const r = await getTokenByCode(code);
      console.log("SUCC: " + r.success);
      if (!r.success) {
        return false;
      }
      this.refreshToken = String(r.refreshToken);
      if (!(await this.flushToken())) {
        return await this.flushToken();
      }
      saveUUID(this.lastUsedUUID);
      saveXuid(this.lastUsedXuid);
      saveUserName(this.lastUsedUsername);
      saveRefreshToken(this.refreshToken);
      saveAccessToken(this.lastUsedAccessToken);
      return true;
    } catch {
      return false;
    }
  }

  serialize(): string {
    return JSON.stringify({
      lastUsedUUID: this.lastUsedUUID,
      lastUsedAccessToken: this.lastUsedAccessToken,
      accountName: this.accountName,
      lastUsedUsername: this.lastUsedUsername,
      refreshToken: this.refreshToken,
      lastUsedXuid: this.lastUsedXuid,
    });
  }

  refreshToken = "";
}

function saveRefreshToken(v: string): void {
  cLocalStorage.setItem(MS_LAST_USED_REFRESH_KEY, encrypt2(v));
}

function saveUUID(v: string): void {
  cLocalStorage.setItem(MS_LAST_USED_UUID_KEY, v);
}

function saveXuid(v: string): void {
  cLocalStorage.setItem(MS_LAST_USED_XUID_KEY, v);
}

function saveUserName(v: string): void {
  cLocalStorage.setItem(MS_LAST_USED_USERNAME_KEY, v);
}

function saveAccessToken(v: string): void {
  cLocalStorage.setItem(MS_LAST_USED_ACTOKEN_KEY, encrypt2(v));
}

// User -> Code
// Only in remote!
async function browserGetCode(quiet = false): Promise<string> {
  console.log("External opening login window...");
  await openExternal(
    "https://login.live.com/oauth20_authorize.srf?client_id=00000000402b5328&response_type=code&scope=service%3A%3Auser.auth.xboxlive.com%3A%3AMBI_SSL&redirect_uri=https%3A%2F%2Flogin.live.com%2Foauth20_desktop.srf"
  );
  window.dispatchEvent(new CustomEvent("OpenAskUrlDialog"));
  const s = await new Promise<string>((res) => {
    const onCancel = () => {
      res("");
      window.removeEventListener("UrlAsked", onGot);
      window.removeEventListener("UrlAskCancelled", onCancel);
    };
    const onGot = (e: Event) => {
      res((e as CustomEvent).detail);
      window.removeEventListener("UrlAsked", onGot);
      window.removeEventListener("UrlAskCancelled", onCancel);
    };
    window.addEventListener("UrlAsked", onGot);
    window.addEventListener("UrlAskCancelled", onCancel);
  });
  const c = s.split("code=")[1];
  if (!c) {
    return "";
  }
  const r = c.split("&")[0];
  return decodeURIComponent(r || "");
}

interface AcquireTokenCallback {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
}

// Code -> MS Token
async function getTokenByCode(code: string): Promise<AcquireTokenCallback> {
  return await tokenRequest(code);
}

// Refresh
async function refreshToken(
  refreshToken: string
): Promise<AcquireTokenCallback> {
  return await tokenRequest(refreshToken, true);
}

async function tokenRequest(
  credit: string,
  isRefresh = false
): Promise<AcquireTokenCallback> {
  const grantType = isRefresh ? "refresh_token" : "authorization_code";
  const grantTag = isRefresh ? "refresh_token" : "code";
  try {
    const res = await netPost(
      MS_TOKEN_URL,
      JSON.stringify({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      `client_id=00000000402b5328&${grantTag}=${credit}&grant_type=${grantType}&redirect_uri=https%3A%2F%2Flogin.live.com%2Foauth20_desktop.srf&scope=service%3A%3Auser.auth.xboxlive.com%3A%3AMBI_SSL`,
      0
    );
    if (res.status < 200 || res.status >= 300) {
      return {
        success: false,
      };
    }
    const ret = JSON.parse(res.body.toString());
    if (!isNull(safeGet(ret, ["error"]))) {
      return {
        success: false,
      };
    }
    const accessToken = String(safeGet(ret, ["access_token"], ""));
    const refreshToken = String(safeGet(ret, ["refresh_token"], ""));
    // @ts-ignore
    const expires = parseInt(safeGet(ret, ["expires_in"], null));
    if (!isNaN(expires)) {
      cLocalStorage.setItem(
        ACCOUNT_EXPIRES_KEY,
        (expires - 3600).toString() // SAFE
      );
    }

    if (isNull(accessToken) || isNull(refreshToken)) {
      return { success: false };
    }
    return {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch {
    return {
      success: false,
    };
  }
}

interface AcquireXBLXSTSTokenCallback {
  success: boolean;
  token?: string;
  uhs?: string;
}

// MS Token -> Xbox Token
async function getXBLToken(
  msToken: string
): Promise<AcquireXBLXSTSTokenCallback> {
  try {
    const res = await netPost(
      XBL_URL,
      JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      JSON.stringify({
        Properties: {
          AuthMethod: "RPS",
          SiteName: "user.auth.xboxlive.com",
          RpsTicket: msToken,
        },
        RelyingParty: "http://auth.xboxlive.com",
        TokenType: "JWT",
      }),
      0
    );
    if (res.status < 200 || res.status >= 300) {
      return { success: false };
    }
    const response = JSON.parse(res.body.toString());
    const token = safeGet(response, ["Token"]);
    const uhs = safeGet(response, ["DisplayClaims", "xui", 0, "uhs"]);
    if (isNull(token) || isNull(uhs)) {
      return { success: false };
    }
    return {
      success: true,
      token: String(token),
      uhs: String(uhs),
    };
  } catch {
    return { success: false };
  }
}

// Xbox Token -> XSTS Token
async function getXSTSToken(
  xblToken: string
): Promise<AcquireXBLXSTSTokenCallback> {
  try {
    const res = await netPost(
      XSTS_URL,
      JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      JSON.stringify({
        Properties: {
          SandboxId: "RETAIL",
          UserTokens: [xblToken],
        },
        RelyingParty: "rp://api.minecraftservices.com/",
        TokenType: "JWT",
      }),
      0
    );
    if (res.status < 200 || res.status >= 300) {
      return { success: false };
    }
    const response = JSON.parse(res.body.toString());
    const token = safeGet(response, ["Token"]);
    if (isNull(token)) {
      return { success: false };
    }
    return {
      success: true,
      token: String(token),
      uhs: undefined,
    };
  } catch {
    return { success: false };
  }
}

// Xbox uhs & XSTS Token -> MC Token
async function getMojangTokenAndXuid(
  uhs: string,
  xstsToken: string
): Promise<[string, string]> {
  try {
    const res = await netPost(
      MJ_LOGIN_XBOX,
      JSON.stringify({
        "Content-Type": "application/json",
      }),
      JSON.stringify({
        identityToken: `XBL3.0 x=${uhs};${xstsToken}`,
      }),
      0
    );
    if (res.status < 200 || res.status >= 300) {
      return ["", ""];
    }
    const response = JSON.parse(res.body.toString());
    return [
      String(safeGet(response, ["access_token"], "")),
      // String(safeGet(response, ["username"], "")), TODO: find out how to get xuid
      // Currently we don't know its usage, leave to 0
      "0",
    ];
  } catch {
    return ["", ""];
  }
}

interface MinecraftUserProfileCallback {
  success: boolean;
  name?: string;
  uuid?: string;
}

// MC Token -> MC uuid & MC Username
async function getUUIDAndUserName(
  acToken: string
): Promise<MinecraftUserProfileCallback> {
  try {
    const res = await netGet(
      MJ_PROFILE_API,
      JSON.stringify({
        "Content-Type": "application/json",
        Authorization: `Bearer ${acToken}`,
      }),
      0
    );
    if (res.status < 200 || res.status >= 300) {
      return { success: false };
    }
    const response = JSON.parse(res.body.toString());
    const uuid = safeGet(response, ["id"]);
    const name = safeGet(response, ["name"]);
    if (isNull(uuid) || isNull(name)) {
      return { success: false };
    }
    return {
      success: true,
      uuid: String(uuid),
      name: String(name),
    };
  } catch {
    return { success: false };
  }
}
