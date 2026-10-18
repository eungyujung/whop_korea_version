import Link from "next/link";
import { requireUser } from "@/server/auth";
import { listAdvertiserCampaigns, remainingBudget } from "@/server/campaigns";
import { formatKRW } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

export default async function AdvertiserPage() {
  const user = await requireUser();
  const campaigns = await listAdvertiserCampaigns(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">내 캠페인 (광고주)</h1>
        <Link href="/advertiser/campaigns/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          + 새 캠페인
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          아직 만든 캠페인이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">캠페인</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">클릭당</th>
                <th className="px-4 py-3 text-right">참여자</th>
                <th className="px-4 py-3 text-right">유효 / 전체 클릭</th>
                <th className="px-4 py-3 text-right">사용 / 풀</th>
                <th className="px-4 py-3 text-right">남은 풀</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.title}</div>
                    <div className="max-w-[240px] truncate text-xs text-slate-500">{c.targetUrl}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">{formatKRW(c.rewardPerClick)}</td>
                  <td className="px-4 py-3 text-right">{c._count.participations}</td>
                  <td className="px-4 py-3 text-right">
                    {c.validClicks.toLocaleString()} / {c.totalClicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatKRW(c.budgetReserved + c.budgetSpent)} / {formatKRW(c.budgetTotal)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatKRW(remainingBudget(c))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
