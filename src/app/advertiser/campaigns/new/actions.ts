"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/server/auth";
import { createCampaign } from "@/server/campaigns";

const amount = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => v.replaceAll(",", ""))
    .pipe(z.string().regex(/^\d+$/, `${label}은(는) 숫자로 입력하세요`))
    .transform((v) => BigInt(v))
    .refine((v) => v >= BigInt(min), `${label}은(는) ${min.toLocaleString()}원 이상이어야 합니다`)
    .refine((v) => v <= BigInt(max), `${label}은(는) ${max.toLocaleString()}원 이하여야 합니다`);

const schema = z
  .object({
    title: z.string().trim().min(2, "제목은 2자 이상이어야 합니다").max(80),
    description: z.string().trim().max(2000),
    targetUrl: z
      .url({ protocol: /^https?$/, error: "http:// 또는 https://로 시작하는 URL을 입력하세요" })
      .trim(),
    budgetTotal: amount("리워드 풀", 10_000, 100_000_000),
    rewardPerClick: amount("클릭당 보상", 1, 100_000),
  })
  .refine((v) => v.rewardPerClick <= v.budgetTotal, {
    message: "클릭당 보상은 리워드 풀보다 클 수 없습니다",
    path: ["rewardPerClick"],
  });

export type CreateCampaignState = { error?: string };

export async function createCampaignAction(
  _prev: CreateCampaignState,
  formData: FormData,
): Promise<CreateCampaignState> {
  const user = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await createCampaign(user.id, parsed.data);
  redirect("/advertiser");
}
