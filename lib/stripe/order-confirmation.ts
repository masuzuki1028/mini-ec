import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

type ConfirmedOrder = {
  id: string;
  status: string | null;
  stripe_session_id: string | null;
  total_amount_jpy: number | null;
};

export type ConfirmCheckoutSessionOrderResult = {
  session: Stripe.Checkout.Session;
  order: ConfirmedOrder | null;
  isPaid: boolean;
};

function createStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(stripeSecretKey);
}

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase admin client is not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function confirmCheckoutSessionOrder(
  session: Stripe.Checkout.Session,
): Promise<ConfirmCheckoutSessionOrderResult> {
  const isPaid = session.payment_status === "paid";

  if (!isPaid) {
    return {
      session,
      order: null,
      isPaid,
    };
  }

  const orderId =
    typeof session.metadata?.order_id === "string" && session.metadata.order_id
      ? session.metadata.order_id
      : null;
  const supabase = createSupabaseAdminClient();
  const updatePayload = {
    status: "paid",
    stripe_session_id: session.id,
    updated_at: new Date().toISOString(),
  };

  const request = supabase
    .from("orders")
    .update(updatePayload)
    .select("id, status, stripe_session_id, total_amount_jpy");

  const { data, error } = await (orderId
    ? request.eq("id", orderId)
    : request.eq("stripe_session_id", session.id)
  ).maybeSingle();

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return {
    session,
    order: data,
    isPaid,
  };
}

export async function linkOrderToCheckoutSession(orderId: string, sessionId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      stripe_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("id, status, stripe_session_id, total_amount_jpy")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to link order to Stripe session: ${error.message}`);
  }

  return data;
}

export async function retrieveAndConfirmCheckoutSessionOrder(
  sessionId: string,
): Promise<ConfirmCheckoutSessionOrderResult> {
  const stripe = createStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return confirmCheckoutSessionOrder(session);
}
