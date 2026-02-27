import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

export async function GET() {
  try {
    const candidates = [
      path.join(process.cwd(), "public", "universities.csv"),
      path.join(process.cwd(), "data", "universities.csv"),
      path.join(process.cwd(), "universities.csv"),
    ];

    let csvPath = "";
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      return NextResponse.json(
        {
          error: "CSV not found",
          hint: "Добавь файл public/universities.csv (или data/universities.csv) и задеплой вместе с репозиторием.",
        },
        { status: 500 }
      );
    }

    const csv = fs.readFileSync(csvPath, "utf-8");
    const rows = parseCsv(csv);

    // Normalize minimal fields used by UI
    const out = rows.map((r: any, idx: number) => ({
      id: Number(r.id || r.ID || idx + 1),
      name: r.name || r.Name || r.University || r.university || "",
      city: r.city || r.City || "",
      country_rank: Number(r.country_rank || r.rank || r.CountryRank || 0),
      has_dormitory: String(r.has_dormitory || r.dormitory || r.HasDormitory || "").toLowerCase() === "true",
      ml_cs_strength: Number(r.ml_cs_strength || r.it_strength || r.MLCSStrength || 0),
      tour_url: r.tour_url || r.TourURL || null,
      website: r.website || r.Website || "",
      ...r,
    }));

    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json(
      { error: "CSV parse/read error", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}
