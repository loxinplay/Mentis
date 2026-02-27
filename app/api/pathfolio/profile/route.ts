import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function supabaseUser(accessToken: string) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase env not set");
  const r = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error("Not authed");
  return await r.json();
}

export async function GET() {
  try {
    const c = await cookies();
    const at = c.get("mentis_at")?.value;
    if (!at) return NextResponse.json({ ok: false, error: "Not authed" }, { status: 401 });

    const url = process.env.SUPABASE_URL!;
    const anon = process.env.SUPABASE_ANON_KEY!;
    const user = await supabaseUser(at);
    const userId = user?.id;

    const r = await fetch(
      `${url}/rest/v1/pathfolio_profiles?user_id=eq.${encodeURIComponent(userId)}&select=*`,
      {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${at}`,
        },
      }
    );

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ ok: false, error: "DB error", details: txt }, { status: 500 });
    }

    const rows = await r.json();
    const row = rows?.[0] || null;

    return NextResponse.json({
      ok: true,
      profile: row || { user_id: userId, headline: "", summary: "" },
      user: { id: userId, email: user?.email || "" },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const c = await cookies();
    const at = c.get("mentis_at")?.value;
    if (!at) return NextResponse.json({ ok: false, error: "Not authed" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const headline = String(body?.headline || "");
    const summary = String(body?.summary || "");

    const url = process.env.SUPABASE_URL!;
    const anon = process.env.SUPABASE_ANON_KEY!;
    const user = await supabaseUser(at);
    const userId = user?.id;

    // Upsert
    const r = await fetch(`${url}/rest/v1/pathfolio_profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${at}`,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([{ user_id: userId, headline, summary }]),
    });

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ ok: false, error: "DB error", details: txt }, { status: 500 });
    }

    const rows = await r.json();
    return NextResponse.json({ ok: true, profile: rows?.[0] || null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
