import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

function normalizeRedirectPath(path: string | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;
  const redirectTo = normalizeRedirectPath(redirect);

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-950 sm:px-8 sm:py-14">
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
