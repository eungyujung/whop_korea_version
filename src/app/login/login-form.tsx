"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block space-y-1">
        <span className="text-sm font-medium">닉네임</span>
        <input
          name="name"
          required
          autoFocus
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="예: 광고주A, 참여자B"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "로그인 중…" : "로그인 / 가입"}
      </button>
    </form>
  );
}
