import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({ email: "", password: "" }));

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_URL / SUPABASE_ANON_KEY не настроены." },
      { status: 500 }
    );
  }

  const r = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    return NextResponse.json({ ok: false, error: data?.msg || data?.error_description || "Не удалось зарегистрироваться." }, { status: r.status });
  }

  // If email confirmations are ON, session may be null until confirmed.
  const access_token = data?.session?.access_token || "";
  const refresh_token = data?.session?.refresh_token || "";

  const res = NextResponse.json({ ok: true, needsEmailConfirm: !access_token });

  if (access_token) {
    res.cookies.set("mentis_at", access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
  }
  if (refresh_token) {
    res.cookies.set("mentis_rt", refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return res;
}
