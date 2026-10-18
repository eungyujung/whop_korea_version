"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import { joinCampaign, JoinError } from "@/server/participations";

export type JoinState = { error?: string };

export async function joinCampaignAction(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const user = await requireUser();
  try {
    await joinCampaign(user.id, String(formData.get("campaignId") ?? ""));
  } catch (e) {
    if (e instanceof JoinError) return { error: e.message };
    throw e;
  }
  revalidatePath("/campaigns");
  return {};
}
