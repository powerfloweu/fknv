import { NextResponse } from "next/server";

const PASSWORD = "Slepp!";
const COOKIE_NAME = "fknv_auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body?.password ?? "");
    if (password === PASSWORD) {
      const response = NextResponse.json({ ok: true });
      response.cookies.set(COOKIE_NAME, PASSWORD, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 60, // 60 days
      });
      return response;
    }
    return NextResponse.json({ ok: false, error: "Hibás jelszó" }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: "Hibás kérés" }, { status: 400 });
  }
}
