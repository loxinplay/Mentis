import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const c = await cookies();
  const at = c.get("mentis_at")?.value;

  if (!at) return NextResponse.json({ authed: false });

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.json({ authed: false, error: "SUPABASE_URL / SUPABASE_ANON_KEY не настроены." }, { status: 500 });
  }

  const r = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${at}` },
  });

  if (!r.ok) return NextResponse.json({ authed: false });

  const user = await r.json().catch(() => null);
  return NextResponse.json({ authed: true, user: { email: user?.email || "" } });
}
