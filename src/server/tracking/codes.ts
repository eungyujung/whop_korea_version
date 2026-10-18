import "server-only";
import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// 추측하기 어려운 base62 랜덤 문자열
export function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function newLinkCode(): string {
  return randomCode(8);
}

export function newClickId(): string {
  return `c_${randomCode(22)}`;
}

export function trackingUrl(code: string): string {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/r/${code}`;
}
