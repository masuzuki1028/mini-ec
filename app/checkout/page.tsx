import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "決済 | MAME COFFEE",
  description: "注文内容とお届け先を確認します。",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-950 sm:px-8 sm:py-14">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-amber-800">
            CHECKOUT
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            注文内容の確認
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-stone-600">
            カートの内容とお届け先を確認して、注文を確定してください。
          </p>
        </div>

        <CheckoutForm />
      </section>
    </main>
  );
}
