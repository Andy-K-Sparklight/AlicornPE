import { AES, enc } from "crypto-js";
import { CODE_32_SPECIAL } from "../commons/Constants";
import { getMachineUniqueID } from "./Unique";

let MACHINE_ID_32: string;

export async function initEncrypt(): Promise<void> {
  MACHINE_ID_32 = (await getMachineUniqueID()).slice(0, 32);
}

export function getUniqueID32(): string {
  return MACHINE_ID_32 || CODE_32_SPECIAL;
}

export function decryptByMachine(data: string): string {
  if (data === "") {
    return "";
  }
  try {
    return AES.decrypt(data, MACHINE_ID_32).toString(enc.Utf8);
  } catch {
    return "";
  }
}

function encryptByMachine(data: string): string {
  if (data === "") {
    return ""; // NULL safe
  }
  return AES.encrypt(data, MACHINE_ID_32).toString();
}

export function encrypt2(src: string): string {
  if (src === "") {
    return "";
  }
  return encryptByMachine(src); // I'm sorry, but PE cannot support modern encrypt
}

export function decrypt2(src: string): string {
  if (src === "") {
    return "";
  }
  return decryptByMachine(src);
}
