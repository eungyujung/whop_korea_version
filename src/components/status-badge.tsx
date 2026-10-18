import type { CampaignStatus } from "@/generated/prisma/enums";

const LABELS: Record<CampaignStatus, [string, string]> = {
  ACTIVE: ["진행 중", "bg-emerald-100 text-emerald-800"],
  PAUSED: ["일시정지", "bg-slate-100 text-slate-700"],
  EXHAUSTED: ["풀 소진", "bg-amber-100 text-amber-800"],
  ENDED: ["종료", "bg-slate-100 text-slate-500"],
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const [label, className] = LABELS[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}
