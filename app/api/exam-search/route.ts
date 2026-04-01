import { NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";

// ── GET: 저장된 시험검색 목록 불러오기 ──────────────────────────────────────
export async function GET() {
  try {
    if (!SPREADSHEET_ID) return NextResponse.json({ items: [] });

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["시험검색"]);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "시험검색!A1:B100",
    });

    const rows = (res.data.values ?? []).slice(1); // 헤더 제거
    const items = rows.map((r) => ({ examId: r[0], round: r[1] }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// ── POST: 시험검색 목록 저장 ─────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    if (!SPREADSHEET_ID) return NextResponse.json({ ok: true });

    const { items } = await req.json() as { items: { examId: string; round: string }[] };

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["시험검색"]);

    const values = [
      ["examId", "round"],
      ...items.map((item) => [item.examId, item.round]),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "시험검색!A1",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save exam search error:", error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
