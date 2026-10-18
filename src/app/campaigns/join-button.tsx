"use client";

import { useActionState } from "react";
import { joinCampaignAction, type JoinState } from "./actions";

export function JoinButton({ campaignId }: { campaignId: string }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinCampaignAction, {});
  return (
    <form action={action} className="space-y-1">
      <input type="hidden" name="campaignId" value={campaignId} />
      <button disabled={pending} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "발급 중…" : "참여하고 링크 받기"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
