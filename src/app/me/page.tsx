import Link from "next/link";
import { requireUser } from "@/server/auth";
import { getParticipantDashboard } from "@/server/dashboard";
import { trackingUrl } from "@/server/tracking/codes";
import { formatKRW } from "@/lib/money";
import { CopyLink } from "@/components/copy-link";
import { StatusBadge } from "@/components/status-badge";

export default async function ParticipantDashboardPage() {
  const user = await requireUser();
  const { rows, totals } = await getParticipantDashboard(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">참여자 대시보드</h1>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <dt className="text-sm text-slate-500">예상 보상 (확정 대기)</dt>
          <dd className="mt-1 text-2xl font-bold">{formatKRW(totals.pendingAmount)}</dd>
          <p className="mt-1 text-xs text-slate-500">대기 기간이 지나면 확정됩니다 (확정 처리는 MVP 이후)</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <dt className="text-sm text-slate-500">확정 보상</dt>
          <dd className="mt-1 text-2xl font-bold">{formatKRW(totals.confirmedAmount)}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <dt className="text-sm text-slate-500">유효 클릭 합계</dt>
          <dd className="mt-1 text-2xl font-bold">{totals.validClicks.toLocaleString()}회</dd>
        </div>
      </dl>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          참여 중인 캠페인이 없습니다.{" "}
          <Link href="/campaigns" className="underline">
            캠페인 찾기
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">캠페인 / 내 링크</th>
                <th className="px-4 py-3 text-right">클릭당</th>
                <th className="px-4 py-3 text-right">전체 클릭</th>
                <th className="px-4 py-3 text-right">유효 클릭</th>
                <th className="px-4 py-3">제외된 클릭</th>
                <th className="px-4 py-3 text-right">예상 보상</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.participationId} className="align-top">
                  <td className="max-w-[320px] space-y-1.5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.campaign.title}</span>
                      <StatusBadge status={r.campaign.status} />
                    </div>
                    {r.linkCode && <CopyLink url={trackingUrl(r.linkCode)} />}
                  </td>
                  <td className="px-4 py-3 text-right">{formatKRW(r.campaign.rewardPerClick)}</td>
                  <td className="px-4 py-3 text-right">{r.totalClicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">{r.validClicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.excluded.length === 0 ? "-" : r.excluded.map((e) => `${e.label} ${e.count}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatKRW(r.pendingAmount + r.confirmedAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
