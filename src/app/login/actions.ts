"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signInWithName, signOut } from "@/server/auth";

const loginSchema = z.object({
  name: z.string().trim().min(2, "닉네임은 2자 이상이어야 합니다").max(20, "닉네임은 20자 이하여야 합니다"),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    name: formData.get("name"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await signInWithName(parsed.data.name);
  // 외부 URL로의 이동은 막는다
  const next = parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//") ? parsed.data.next : "/campaigns";
  redirect(next);
}

export async function logout() {
  await signOut();
  redirect("/");
}
