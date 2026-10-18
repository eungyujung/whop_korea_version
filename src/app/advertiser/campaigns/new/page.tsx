import { requireUser } from "@/server/auth";
import { getIntSetting } from "@/server/settings";
import { CampaignForm } from "./campaign-form";

export default async function NewCampaignPage() {
  await requireUser();
  const feeBps = await getIntSetting("platform_fee_bps");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">웹사이트 홍보 캠페인 만들기</h1>
        <p className="mt-1 text-sm text-slate-600">
          참여자 전용 링크로 들어온 클릭마다 리워드 풀에서 보상이 나갑니다. 같은 사람의 중복 클릭은 제외됩니다.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <CampaignForm feeBps={feeBps} />
      </div>
    </div>
  );
}
