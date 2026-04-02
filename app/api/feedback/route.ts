import { NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";

// ── GET: 피드백 목록 불러오기 ─────────────────────────────────────────────────
export async function GET() {
  try {
    if (!SPREADSHEET_ID) return NextResponse.json({ items: [] });

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["피드백"]);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "피드백!A1:H200",
    });

    const rows = (res.data.values ?? []).slice(1);
    const items = rows.map((r) => ({
      date:       r[0] ?? "",
      condition:  Number(r[1] ?? 3),
      completed:  r[2] ?? "",
      difficult:  r[3] ?? "",
      learned:    r[4] ?? "",
      tomorrow:   r[5] ?? "",
      memo:       r[6] ?? "",
      analyzed:   r[7] === "true",
    }));
    return NextResponse.json({ items: items.reverse() }); // 최신순
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// ── POST: 피드백 저장 ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      date: string;
      condition: number;
      completed: string;
      difficult: string;
      learned: string;
      tomorrow: string;
      memo: string;
    };

    if (!SPREADSHEET_ID) return NextResponse.json({ ok: true });

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["피드백"]);

    // 헤더 확인
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "피드백!A1:H1",
    });
    if (!headerRes.data.values?.[0]) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "피드백!A1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["날짜","컨디션","완료한것","어려웠던것","배운점","내일다짐","메모","AI분석완료"]],
        },
      });
    }

    // 같은 날짜 기존 행 찾기
    const allRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "피드백!A1:H200",
    });
    const allRows = allRes.data.values ?? [];
    const existingIdx = allRows.findIndex((r, i) => i > 0 && r[0] === body.date);

    const newRow = [
      body.date, body.condition, body.completed,
      body.difficult, body.learned, body.tomorrow, body.memo, "false",
    ];

    if (existingIdx > 0) {
      // 기존 행 업데이트
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `피드백!A${existingIdx + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: [newRow] },
      });
    } else {
      // 새 행 추가
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "피드백!A1",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [newRow] },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Feedback save error:", error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
