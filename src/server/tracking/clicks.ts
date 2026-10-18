import "server-only";
import { prisma } from "../db";
import { hmac } from "../crypto";
import { getIntSetting } from "../settings";
import { remainingBudget } from "../campaigns";
import { newClickId } from "./codes";

// 링크 미리보기 봇·크롤러·스크립트는 보상 대상에서 제외
const BOT_UA = /bot|crawl|spider|slurp|preview|scrap|facebookexternalhit|headless|curl|wget|python-requests|httpclient/i;

export type ClickInput = {
  code: string;
  visitorId: string; // rw_vid 쿠키 (없던 방문자는 이번에 새로 발급된 값)
  ip: string;
  userAgent: string;
  referrer: string;
  viewerUserId: string | null; // 로그인한 사람이 클릭한 경우
};

export type InvalidReason =
  | "bot"
  | "self_click"
  | "campaign_inactive"
  | "duplicate_visitor"
  | "duplicate_ip_ua"
  | "budget_exhausted";

export type ClickResult = { targetUrl: string; clickId: string | null; isValid: boolean; invalidReason: InvalidReason | null };

export async function findLinkTarget(code: string) {
  return prisma.trackingLink.findUnique({
    where: { code },
    select: {
      id: true,
      participation: { select: { id: true, userId: true, campaign: { select: { id: true, targetUrl: true } } } },
    },
  });
}

// 클릭을 기록하고, 유효하면 풀에서 클릭당 보상을 예약(pending)한다.
// 같은 캠페인에 대한 클릭은 캠페인 행 잠금으로 직렬화해 중복 판정과 풀 차감이 겹치지 않게 한다.
export async function recordClick(input: ClickInput): Promise<ClickResult | null> {
  const link = await findLinkTarget(input.code);
  if (!link) return null;

  const { participation } = link;
  const campaignId = participation.campaign.id;
  const ipHash = hmac(`ip:${input.ip}`);
  const uaHash = hmac(`ua:${input.userAgent}`);
  const windowHours = await getIntSetting("duplicate_click_window_hours");
  const clickId = newClickId();

  let invalidReason: InvalidReason | null = null;
  if (!input.userAgent || BOT_UA.test(input.userAgent)) invalidReason = "bot";
  else if (input.viewerUserId === participation.userId) invalidReason = "self_click";

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM campaigns WHERE id = ${campaignId} FOR UPDATE`;
    const campaign = await tx.campaign.findUniqueOrThrow({ where: { id: campaignId } });

    if (!invalidReason && campaign.status !== "ACTIVE") {
      invalidReason = campaign.status === "EXHAUSTED" ? "budget_exhausted" : "campaign_inactive";
    }

    if (!invalidReason) {
      const sameVisitor = await tx.click.findFirst({
        where: { linkId: link.id, visitorId: input.visitorId, isValid: true },
        select: { id: true },
      });
      if (sameVisitor) invalidReason = "duplicate_visitor";
    }

    if (!invalidReason) {
      const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
      const sameDevice = await tx.click.findFirst({
        where: { linkId: link.id, ipHash, uaHash, isValid: true, createdAt: { gte: since } },
        select: { id: true },
      });
      if (sameDevice) invalidReason = "duplicate_ip_ua";
    }

    const reward = campaign.rewardPerClick;
    const remaining = remainingBudget(campaign);
    if (!invalidReason && remaining < reward) {
      invalidReason = "budget_exhausted";
      await tx.campaign.update({ where: { id: campaignId }, data: { status: "EXHAUSTED" } });
    }

    const click = await tx.click.create({
      data: {
        clickId,
        linkId: link.id,
        campaignId,
        visitorId: input.visitorId,
        ipHash,
        uaHash,
        userAgent: input.userAgent.slice(0, 500),
        referrer: input.referrer.slice(0, 500),
        isValid: invalidReason === null,
        invalidReason,
      },
    });

    if (invalidReason) return;

    await tx.earning.create({
      data: {
        userId: participation.userId,
        participationId: participation.id,
        campaignId,
        sourceType: "CLICK",
        sourceId: click.id,
        amount: reward,
        confirmAfter: new Date(Date.now() + campaign.pendingDays * 24 * 60 * 60 * 1000),
      },
    });
    await tx.campaign.update({
      where: { id: campaignId },
      data: {
        budgetReserved: { increment: reward },
        // 이번 보상으로 다음 클릭 1회분도 안 남으면 소진 처리
        ...(remaining - reward < reward ? { status: "EXHAUSTED" as const } : {}),
      },
    });
  });

  return {
    targetUrl: participation.campaign.targetUrl,
    clickId,
    isValid: invalidReason === null,
    invalidReason,
  };
}
