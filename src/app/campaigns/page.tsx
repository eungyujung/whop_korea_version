import Link from "next/link";
import { getCurrentUser } from "@/server/auth";
import { listActiveCampaigns, remainingBudget } from "@/server/campaigns";
import { trackingUrl } from "@/server/tracking/codes";
import { formatKRW } from "@/lib/money";
import { CopyLink } from "@/components/copy-link";
import { JoinButton } from "./join-button";

export default async function CampaignsPage() {
  const user = await getCurrentUser();
  const campaigns = await listActiveCampaigns(user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">진행 중인 캠페인</h1>
        <p className="mt-1 text-sm text-slate-600">참여하면 전용 추적 링크가 발급됩니다. 이 링크로 들어온 클릭마다 보상이 쌓입니다.</p>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          진행 중인 캠페인이 없습니다.{" "}
          <Link href="/advertiser/campaigns/new" className="underline">
            캠페인을 만들어 보세요.
          </Link>
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => {
            const remaining = remainingBudget(c);
            const isOwner = user?.id === c.advertiserId;
            return (
              <li key={c.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">웹사이트 홍보 · {c.advertiser.name}</div>
                  <h2 className="text-lg font-semibold">{c.title}</h2>
                  {c.description && <p className="whitespace-pre-line text-sm text-slate-600">{c.description}</p>}
                  <a href={c.targetUrl} target="_blank" rel="noreferrer" className="block truncate text-xs text-blue-600 underline">
                    {c.targetUrl}
                  </a>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded bg-slate-50 p-2">
                    <dt className="text-xs text-slate-500">클릭당 보상</dt>
                    <dd className="font-semibold">{formatKRW(c.rewardPerClick)}</dd>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <dt className="text-xs text-slate-500">남은 풀 / 전체</dt>
                    <dd className="font-semibold">
                      {formatKRW(remaining)} <span className="font-normal text-slate-500">/ {formatKRW(c.budgetTotal)}</span>
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto">
                  {!user ? (
                    <Link href="/login?next=/campaigns" className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
                      로그인하고 참여하기
                    </Link>
                  ) : isOwner ? (
                    <p className="text-sm text-slate-500">내가 만든 캠페인입니다.</p>
                  ) : c.myLinkCode ? (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-emerald-700">참여 중 · 내 추적 링크</p>
                      <CopyLink url={trackingUrl(c.myLinkCode)} />
                    </div>
                  ) : (
                    <JoinButton campaignId={c.id} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
