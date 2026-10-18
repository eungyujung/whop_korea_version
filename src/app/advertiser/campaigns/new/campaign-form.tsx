"use client";

import { useActionState, useState } from "react";
import { createCampaignAction, type CreateCampaignState } from "./actions";

const inputClass = "w-full rounded-md border border-slate-300 px-3 py-2";

function toInt(value: string): number {
  const n = Number(value.replaceAll(",", ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function CampaignForm({ feeBps }: { feeBps: number }) {
  const [state, action, pending] = useActionState<CreateCampaignState, FormData>(createCampaignAction, {});
  const [budget, setBudget] = useState("");
  const [reward, setReward] = useState("");

  const pool = toInt(budget);
  const fee = Math.floor((pool * feeBps) / 10000);
  const perClick = toInt(reward);

  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-1">
        <span className="text-sm font-medium">캠페인 제목</span>
        <input name="title" required className={inputClass} placeholder="예: 우리 쇼핑몰 가을 세일 홍보" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">설명 / 홍보 가이드</span>
        <textarea name="description" rows={4} className={inputClass} placeholder="참여자에게 보여줄 홍보 포인트, 금지 사항 등" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">홍보할 URL</span>
        <input name="targetUrl" type="url" required className={inputClass} placeholder="https://example.com/sale" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium">리워드 풀 (원)</span>
          <input
            name="budgetTotal"
            inputMode="numeric"
            required
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={inputClass}
            placeholder="2000000"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">클릭당 보상 (원)</span>
          <input
            name="rewardPerClick"
            inputMode="numeric"
            required
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className={inputClass}
            placeholder="100"
          />
        </label>
      </div>

      <dl className="space-y-1 rounded-md bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">리워드 풀</dt>
          <dd>{pool.toLocaleString("ko-KR")}원</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">플랫폼 수수료 ({feeBps / 100}%, 별도)</dt>
          <dd>{fee.toLocaleString("ko-KR")}원</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
          <dt>총 결제 예정액 (테스트 — 실제 결제 없음)</dt>
          <dd>{(pool + fee).toLocaleString("ko-KR")}원</dd>
        </div>
        {perClick > 0 && pool > 0 && (
          <p className="pt-1 text-xs text-slate-500">
            최대 약 {Math.floor(pool / perClick).toLocaleString("ko-KR")}회 클릭까지 보상할 수 있습니다.
          </p>
        )}
      </dl>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "생성 중…" : "캠페인 생성"}
      </button>
    </form>
  );
}
