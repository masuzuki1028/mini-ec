import { expect, type FrameLocator, type Locator, type Page, test } from "@playwright/test";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const userEmail = `playwright-${testRunId}@example.com`;
const userPassword = "Playwright-Test-Password-123!";
const productName = `Playwright テスト用コーヒー豆 ${testRunId}`;
let testUserId = "";
let testProductId = "";

test.skip(
  !supabaseUrl || !supabaseServiceRoleKey,
  "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。",
);

type AuthUserResponse = {
  id: string;
};

type IdRow = {
  id: string;
};

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("apikey", supabaseServiceRoleKey);
  headers.set("Authorization", `Bearer ${supabaseServiceRoleKey}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  const responseText = await response.text();

  if (!responseText) {
    return null as T;
  }

  return JSON.parse(responseText) as T;
}

test.beforeAll(async () => {
  const userData = await supabaseRequest<AuthUserResponse>("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        display_name: "Playwright テストユーザー",
      },
    }),
  });

  testUserId = userData.id;

  await supabaseRequest<null>("/rest/v1/users?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: testUserId,
      role: "customer",
      display_name: "Playwright テストユーザー",
    }),
  });

  const productData = await supabaseRequest<IdRow[]>("/rest/v1/products?select=id", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: productName,
      description: "Playwright の購入導線テストで使う商品です。",
      price_jpy: 2400,
      weight_grams: 200,
      origin: "E2E Farm",
      roast_level: "中煎り",
      flavor_notes: "チョコレート、ナッツ、ブラウンシュガー",
      shop_comment: "テスト終了後に削除される商品です。",
      stock_quantity: 10,
      image_url: "https://picsum.photos/600/600?random=playwright-checkout",
      is_active: true,
    }),
  });

  if (!productData[0]) {
    throw new Error("テスト用商品の作成結果が空です。");
  }

  testProductId = productData[0].id;
});

test.afterAll(async () => {
  if (testUserId) {
    const orders = await supabaseRequest<IdRow[]>(
      `/rest/v1/orders?select=id&user_id=eq.${testUserId}`,
    );
    const orderIds = orders.map((order) => order.id);

    if (orderIds.length > 0) {
      await supabaseRequest<null>(
        `/rest/v1/order_items?order_id=in.(${orderIds.join(",")})`,
        {
          method: "DELETE",
        },
      );
    }

    await supabaseRequest<null>(`/rest/v1/orders?user_id=eq.${testUserId}`, {
      method: "DELETE",
    });
    await supabaseRequest<null>(`/rest/v1/users?id=eq.${testUserId}`, {
      method: "DELETE",
    });
    await supabaseRequest<null>(`/auth/v1/admin/users/${testUserId}`, {
      method: "DELETE",
    });
  }

  if (testProductId) {
    await supabaseRequest<null>(`/rest/v1/products?id=eq.${testProductId}`, {
      method: "DELETE",
    });
  }
});

async function fillFirstVisible(locator: Locator, value: string) {
  const visibleLocator = locator.filter({ visible: true }).first();

  if (await visibleLocator.isVisible({ timeout: 500 }).catch(() => false)) {
    await visibleLocator.fill(value);
    return true;
  }

  return false;
}

async function fillCheckoutField(
  page: Page,
  name: RegExp,
  value: string,
  options: { required?: boolean } = {},
) {
  const { required = true } = options;
  const deadline = Date.now() + 15000;

  while (Date.now() < deadline) {
    const containers: Array<Page | FrameLocator> = [page];
    const frameCount = await page.locator("iframe").count();

    for (let index = 0; index < frameCount; index += 1) {
      containers.push(page.locator("iframe").nth(index).contentFrame());
    }

    for (const container of containers) {
      const filledByLabel = await fillFirstVisible(container.getByLabel(name), value);

      if (filledByLabel) {
        return;
      }

      const filledByPlaceholder = await fillFirstVisible(
        container.getByPlaceholder(name),
        value,
      );

      if (filledByPlaceholder) {
        return;
      }
    }

    await page.waitForTimeout(500);
  }

  if (required) {
    throw new Error(`Stripe Checkout の入力欄が見つかりません: ${name}`);
  }
}

test("購入導線どおりに商品購入を完了できる", async ({ context, page }) => {
  await context.clearCookies();

  // ステップ1: トップページを開き、商品一覧への導線を進む。
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { name: /自家焙煎のコーヒー豆/ })).toBeVisible();
  await page.getByRole("link", { name: "商品を見る" }).click();

  // ステップ2: 商品一覧から購入する商品を選び、商品詳細を開く。
  await expect(page.getByRole("heading", { name: "今月のコーヒー豆" })).toBeVisible();
  await page.getByRole("link", { name: new RegExp(productName) }).click();
  await expect(page.getByRole("button", { name: "カートに追加" })).toBeVisible();

  // ステップ3: 商品をカートに追加し、カート画面で注文内容を確認する。
  await page.getByRole("button", { name: "カートに追加" }).click();
  await expect(page.getByRole("button", { name: "カートに追加しました" })).toBeVisible();
  await expect(page.getByRole("link", { name: /現在 1 個の商品/ })).toBeVisible();
  await page.getByRole("link", { name: /カートを見る/ }).click();
  await expect(page.getByRole("heading", { name: "カートに入っている商品" })).toBeVisible();
  await expect(page.getByRole("button", { name: "決済する" })).toBeVisible({
    timeout: 10000,
  });

  // ステップ4: ログイン画面で購入ユーザーとしてログインする。
  await page.goto("/login?redirect=/cart");
  await page.getByLabel("メールアドレス").fill(userEmail);
  await page.getByLabel("パスワード").fill(userPassword);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/cart$/);

  // ステップ5: 決済へ進み、Stripe Checkout でテストカードを入力する。
  await page.getByRole("button", { name: "決済する" }).click();
  await expect(page).toHaveURL(/checkout\.stripe\.com/);
  await fillCheckoutField(page, /メール|Email/i, userEmail, { required: false });
  await fillCheckoutField(
    page,
    /カード番号|Card number|Card information|1234 1234 1234 1234/i,
    "4242 4242 4242 4242",
  );
  await fillCheckoutField(page, /有効期限|Expiration|MM\s*\/\s*YY/i, "12 / 34");
  await fillCheckoutField(page, /セキュリティコード|CVC|CVV/i, "123");
  await fillCheckoutField(page, /カード所有者名|Name on card|Cardholder name/i, "Taro Yamada", {
    required: false,
  });
  await page.getByRole("button", { name: /支払う|Pay|購入|決済/i }).click();

  // ステップ6: 注文完了画面に戻り、完了メッセージが表示されることを確認する。
  await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 30000 });
  await expect(
    page.getByRole("heading", { name: "ご注文ありがとうございました" }),
  ).toBeVisible();

  // ステップ7: 注文履歴へ進み、支払い済みの注文が表示されることを確認する。
  await page.getByRole("link", { name: "注文履歴を見る" }).click();
  await expect(page.getByRole("heading", { name: "注文履歴" })).toBeVisible();
  await expect(page.getByText("支払い済み").first()).toBeVisible();
});
