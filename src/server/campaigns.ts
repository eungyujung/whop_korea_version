import "server-only";
import { prisma } from "./db";
import { getIntSetting } from "./settings";
import { calcFee } from "@/lib/money";

export type CreateCampaignInput = {
  title: string;
  description: string;
  targetUrl: string;
  budgetTotal: bigint;
  rewardPerClick: bigint;
};

export async function createCampaign(advertiserId: string, input: CreateCampaignInput) {
  // 수수료율은 생성 시점의 설정값을 캠페인에 복사해 고정한다 (PLAN 2-2)
  const platformFeeBps = await getIntSetting("platform_fee_bps");
  return prisma.campaign.create({
    data: {
      advertiserId,
      type: "WEB",
      title: input.title,
      description: input.description,
      targetUrl: input.targetUrl,
      budgetTotal: input.budgetTotal,
      rewardPerClick: input.rewardPerClick,
      platformFeeBps,
      feeAmount: calcFee(input.budgetTotal, platformFeeBps),
    },
  });
}

export function remainingBudget(c: { budgetTotal: bigint; budgetReserved: bigint; budgetSpent: bigint }) {
  return c.budgetTotal - c.budgetReserved - c.budgetSpent;
}

// 캠페인 목록 (참여자용). userId가 있으면 참여 여부와 추적 링크 코드도 함께
export async function listActiveCampaigns(userId?: string) {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      advertiser: { select: { name: true } },
      // 비로그인이면 빈 문자열로 조회해 항상 빈 배열이 되게 한다
      participations: { where: { userId: userId ?? "" }, select: { link: { select: { code: true } } } },
    },
  });
  return campaigns.map(({ participations, ...c }) => ({
    ...c,
    myLinkCode: participations[0]?.link?.code ?? null,
  }));
}

export async function listAdvertiserCampaigns(advertiserId: string) {
  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participations: true } } },
  });
  const clickCounts = await prisma.click.groupBy({
    by: ["campaignId", "isValid"],
    where: { campaignId: { in: campaigns.map((c) => c.id) } },
    _count: { _all: true },
  });
  return campaigns.map((c) => {
    const counts = clickCounts.filter((r) => r.campaignId === c.id);
    return {
      ...c,
      validClicks: counts.find((r) => r.isValid)?._count._all ?? 0,
      totalClicks: counts.reduce((sum, r) => sum + r._count._all, 0),
    };
  });
}
