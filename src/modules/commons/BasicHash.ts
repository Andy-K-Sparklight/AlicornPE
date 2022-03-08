import { SHA1, SHA256 } from "crypto-js";
export function basicHash(
  obj: string | number | Record<string, unknown>
): string {
  return SHA1(obj.toString()).toString();
}
export function uniqueHash(
  obj: string | number | Record<string, unknown>
): string {
  return SHA256(obj.toString()).toString();
}
