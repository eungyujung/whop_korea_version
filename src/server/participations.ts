import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";
import { newLinkCode } from "./tracking/codes";

export class JoinError extends Error {}

// 캠페인 참여 + 전용 추적 링크 발급. 이미 참여했다면 기존 링크를 돌려준다.
export async function joinCampaign(userId: string, campaignId: string): Promise<string> {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new JoinError("캠페인을 찾을 수 없습니다");
  if (campaign.advertiserId === userId) throw new JoinError("내가 만든 캠페인에는 참여할 수 없습니다");

  const existing = await prisma.participation.findUnique({
    where: { campaignId_userId: { campaignId, userId } },
    include: { link: true },
  });
  if (existing?.link) return existing.link.code;
  if (campaign.status !== "ACTIVE") throw new JoinError("진행 중인 캠페인이 아닙니다");

  // 코드 충돌(극히 드묾)이나 동시 참여 요청에 대비해 몇 번 재시도
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const participation = await prisma.participation.upsert({
        where: { campaignId_userId: { campaignId, userId } },
        create: { campaignId, userId, link: { create: { code: newLinkCode() } } },
        update: {},
        include: { link: true },
      });
      if (participation.link) return participation.link.code;
      const link = await prisma.trackingLink.create({
        data: { participationId: participation.id, code: newLinkCode() },
      });
      return link.code;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  throw new JoinError("링크 발급에 실패했습니다. 다시 시도해 주세요");
}
