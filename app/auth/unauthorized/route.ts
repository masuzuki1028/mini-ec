import { NextResponse } from "next/server";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("mini_ec_flash", "権限がありません", {
    path: "/",
    maxAge: 30,
    sameSite: "lax",
  });

  return response;
}
