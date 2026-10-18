import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hmac } from "./crypto";
import { prisma } from "./db";

// MVP용 개발 로그인: 닉네임만으로 로그인하고, 서명된 쿠키에 userId를 저장한다.
// 소셜 로그인(Auth.js)으로 바꿀 때는 이 파일의 함수 시그니처만 유지하면 된다.

export const SESSION_COOKIE = "pp_session";

export type CurrentUser = { id: string; name: string };

function signSession(userId: string): string {
  return `${userId}.${hmac(userId)}`;
}

// 쿠키 값 → userId (서명이 틀리면 null)
export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = token.slice(0, dot);
  const expected = Buffer.from(hmac(userId));
  const actual = Buffer.from(token.slice(dot + 1));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return userId;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function signInWithName(name: string): Promise<void> {
  const user = await prisma.user.upsert({ where: { name }, create: { name }, update: {} });
  (await cookies()).set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
