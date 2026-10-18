import "server-only";
import { createHmac } from "node:crypto";

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET 환경변수가 없습니다 (.env 확인)");
  return value;
}

// 세션 서명, IP·UA 해시에 쓰는 HMAC-SHA256
export function hmac(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
