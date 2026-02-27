import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("mentis_at", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  res.cookies.set("mentis_rt", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return res;
}
