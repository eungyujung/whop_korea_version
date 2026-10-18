import "server-only";
import { prisma } from "./db";
import type { InvalidReason } from "./tracking/clicks";

export const INVALID_REASON_LABELS: Record<InvalidReason, string> = {
  bot: "봇/크롤러",
  self_click: "본인 클릭",
  campaign_inactive: "캠페인 중지",
  duplicate_visitor: "중복(같은 브라우저)",
  duplicate_ip_ua: "중복(같은 IP·기기)",
  budget_exhausted: "풀 소진",
};

// 참여자 대시보드: 링크별 클릭 수와 예상 보상
export async function getParticipantDashboard(userId: string) {
  const participations = await prisma.participation.findMany({
    where: { userId },
    orderBy: { joinedAt: "desc" },
    include: {
      campaign: { select: { id: true, title: true, status: true, rewardPerClick: true } },
      link: { select: { id: true, code: true } },
    },
  });
  const linkIds = participations.flatMap((p) => (p.link ? [p.link.id] : []));

  const [clickRows, earningRows] = await Promise.all([
    prisma.click.groupBy({
      by: ["linkId", "isValid", "invalidReason"],
      where: { linkId: { in: linkIds } },
      _count: { _all: true },
    }),
    prisma.earning.groupBy({
      by: ["participationId", "status"],
      where: { userId },
      _sum: { amount: true },
    }),
  ]);

  const zero = BigInt(0);
  const rows = participations.map((p) => {
    const clicks = clickRows.filter((r) => r.linkId === p.link?.id);
    const earnings = earningRows.filter((r) => r.participationId === p.id);
    const sumOf = (status: string) => earnings.find((r) => r.status === status)?._sum.amount ?? zero;
    const excluded = clicks
      .filter((r) => !r.isValid && r.invalidReason)
      .map((r) => ({ label: INVALID_REASON_LABELS[r.invalidReason as InvalidReason] ?? r.invalidReason, count: r._count._all }));

    return {
      participationId: p.id,
      campaign: p.campaign,
      linkCode: p.link?.code ?? null,
      totalClicks: clicks.reduce((s, r) => s + r._count._all, 0),
      validClicks: clicks.filter((r) => r.isValid).reduce((s, r) => s + r._count._all, 0),
      excluded,
      pendingAmount: sumOf("PENDING"),
      confirmedAmount: sumOf("CONFIRMED") + sumOf("PAID"),
    };
  });

  return {
    rows,
    totals: {
      validClicks: rows.reduce((s, r) => s + r.validClicks, 0),
      pendingAmount: rows.reduce((s, r) => s + r.pendingAmount, zero),
      confirmedAmount: rows.reduce((s, r) => s + r.confirmedAmount, zero),
    },
  };
}
