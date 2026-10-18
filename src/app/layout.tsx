import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth";
import { logout } from "./login/actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromoPool (가칭)",
  description: "홍보하고 리워드 풀에서 보상받는 플랫폼",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">
          테스트 버전입니다. 실제 금전 거래는 없으며 모든 금액은 DB 숫자입니다.
        </div>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm">
            <Link href="/" className="font-bold text-base">
              PromoPool
            </Link>
            <Link href="/campaigns" className="text-slate-600 hover:text-slate-900">
              캠페인 찾기
            </Link>
            <Link href="/me" className="text-slate-600 hover:text-slate-900">
              참여자 대시보드
            </Link>
            <Link href="/advertiser" className="text-slate-600 hover:text-slate-900">
              광고주
            </Link>
            <div className="ml-auto flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-slate-600">{user.name}님</span>
                  <form action={logout}>
                    <button className="text-slate-500 hover:text-slate-900">로그아웃</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="rounded-md bg-slate-900 px-3 py-1.5 text-white">
                  로그인
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
