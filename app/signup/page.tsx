"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("確認メールを送りました");
    setPassword("");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-950 sm:px-8 sm:py-14">
      <section className="mx-auto w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
          SIGN UP
        </p>
        <h1 className="text-3xl font-bold tracking-tight">新規登録</h1>
        <p className="mt-4 leading-7 text-stone-600">
          メールアドレスとパスワードでアカウントを作成します。
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-800 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-700">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-amber-800 focus:bg-white"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-stone-950 px-6 py-4 text-base font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
          >
            {isSubmitting ? "送信中..." : "確認メールを送る"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="font-bold text-amber-900 hover:text-amber-700">
            ログイン
          </Link>
        </p>
      </section>
    </main>
  );
}
