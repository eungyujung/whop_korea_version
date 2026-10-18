import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">개발용 로그인</h1>
        <p className="text-sm text-slate-600">
          닉네임만 입력하면 됩니다. 처음 쓰는 닉네임이면 새 계정이 만들어집니다. (소셜 로그인은 나중에 붙일 예정)
        </p>
      </div>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </div>
  );
}
