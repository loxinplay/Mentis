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
      `${url}/rest/v1/pathfolio_items?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`,
      {
        headers: { apikey: anon, Authorization: `Bearer ${at}` },
      }
    );

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ ok: false, error: "DB error", details: txt }, { status: 500 });
    }

    const rows = await r.json();
    return NextResponse.json({ ok: true, items: rows || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const c = await cookies();
    const at = c.get("mentis_at")?.value;
    if (!at) return NextResponse.json({ ok: false, error: "Not authed" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const category = String(body?.category || "");
    const title = String(body?.title || "").trim();
    if (!category || !title) return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });

    const payload: any = {
      category,
      title,
      org: body?.org || null,
      issuer: body?.issuer || null,
      link: body?.link || null,
      dates: body?.dates || null,
      date: body?.date || null,
      hours: body?.hours || null,
      description: body?.description || body?.desc || null,
    };

    const url = process.env.SUPABASE_URL!;
    const anon = process.env.SUPABASE_ANON_KEY!;
    await supabaseUser(at); // validates token

    const r = await fetch(`${url}/rest/v1/pathfolio_items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${at}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify([payload]),
    });

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ ok: false, error: "DB error", details: txt }, { status: 500 });
    }

    const rows = await r.json();
    return NextResponse.json({ ok: true, item: rows?.[0] || null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const c = await cookies();
    const at = c.get("mentis_at")?.value;
    if (!at) return NextResponse.json({ ok: false, error: "Not authed" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const url = process.env.SUPABASE_URL!;
    const anon = process.env.SUPABASE_ANON_KEY!;
    await supabaseUser(at);

    const r = await fetch(`${url}/rest/v1/pathfolio_items?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { apikey: anon, Authorization: `Bearer ${at}` },
    });

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ ok: false, error: "DB error", details: txt }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
