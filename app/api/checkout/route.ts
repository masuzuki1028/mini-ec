import { NextResponse } from "next/server";
import Stripe from "stripe";
import { linkOrderToCheckoutSession } from "@/lib/stripe/order-confirmation";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
};

function isCheckoutItem(value: unknown): value is CheckoutItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CheckoutItem>;

  return (
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.price === "number" &&
    Number.isInteger(item.price) &&
    item.price > 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 500 },
    );
  }

  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const items = (body as { items?: unknown }).items;

  if (!Array.isArray(items) || items.length === 0 || !items.every(isCheckoutItem)) {
    return NextResponse.json(
      { error: "items must be a non-empty array of valid checkout items." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const now = new Date().toISOString();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total_amount_jpy: totalAmount,
      stripe_session_id: null,
      ordered_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "jpy",
        unit_amount: item.price,
        product_data: {
          name: item.name,
        },
      },
    })),
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: {
      order_id: order.id,
    },
    payment_intent_data: {
      metadata: {
        order_id: order.id,
      },
    },
  });

  try {
    await linkOrderToCheckoutSession(order.id, session.id);
  } catch {
    return NextResponse.json(
      { error: "Failed to update order with Stripe session." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url, orderId: order.id });
}
