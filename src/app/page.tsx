import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4 py-8">
        <h1 className="text-3xl font-bold sm:text-4xl">홍보하고, 리워드 풀에서 보상받기</h1>
        <p className="max-w-2xl text-slate-600">
          광고주가 리워드 풀을 걸면, 참여자는 전용 링크로 홍보하고 유입된 클릭만큼 보상을 받습니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/campaigns" className="rounded-md bg-slate-900 px-4 py-2 text-white">
            캠페인 찾기
          </Link>
          <Link href="/advertiser/campaigns/new" className="rounded-md border border-slate-300 bg-white px-4 py-2">
            캠페인 만들기
          </Link>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["1. 캠페인 생성", "광고주가 홍보할 URL, 리워드 풀, 클릭당 보상을 정합니다."],
          ["2. 링크 홍보", "참여자는 캠페인에 참여해 전용 추적 링크를 받아 공유합니다."],
          ["3. 클릭당 보상", "중복이 아닌 클릭마다 풀에서 보상이 적립됩니다."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
