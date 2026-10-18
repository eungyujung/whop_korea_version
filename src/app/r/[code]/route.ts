import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/server/auth";
import { findLinkTarget, recordClick } from "@/server/tracking/clicks";
import { randomCode } from "@/server/tracking/codes";

const VISITOR_COOKIE = "rw_vid";
const CLICK_PARAM = "rw_click_id";

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function withClickId(targetUrl: string, clickId: string | null): string {
  const url = new URL(targetUrl);
  if (clickId) url.searchParams.set(CLICK_PARAM, clickId);
  return url.toString();
}

// 추적 링크: 클릭 기록 → 원래 URL로 302 리다이렉트
export async function GET(request: NextRequest, ctx: RouteContext<"/r/[code]">) {
  const { code } = await ctx.params;
  const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existingVisitor ?? `v_${randomCode(22)}`;

  let location: string;
  try {
    const result = await recordClick({
      code,
      visitorId,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent") ?? "",
      referrer: request.headers.get("referer") ?? "",
      viewerUserId: verifySession(request.cookies.get(SESSION_COOKIE)?.value),
    });
    if (!result) return new NextResponse("존재하지 않는 링크입니다.", { status: 404 });
    location = withClickId(result.targetUrl, result.clickId);
  } catch (error) {
    // 기록에 실패해도 방문자는 목적지로 보낸다
    console.error("[tracking] 클릭 기록 실패", error);
    const link = await findLinkTarget(code).catch(() => null);
    if (!link) return new NextResponse("일시적인 오류입니다.", { status: 500 });
    location = link.participation.campaign.targetUrl;
  }

  const response = NextResponse.redirect(location, 302);
  response.headers.set("Cache-Control", "no-store");
  if (!existingVisitor) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/r",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
