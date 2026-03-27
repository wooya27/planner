import { NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID } from "@/lib/sheets";

export async function GET() {
  try {
    if (!SPREADSHEET_ID) {
      return NextResponse.json({ plan: null, visionText: "" });
    }

    const sheets = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:B2",
    });

    const rows = res.data.values ?? [];
    let plan = null;
    let visionText = "";

    for (const row of rows) {
      if (row[0] === "plan" && row[1]) {
        try { plan = JSON.parse(row[1]); } catch { /* ignore */ }
      }
      if (row[0] === "visionText") {
        visionText = row[1] ?? "";
      }
    }

    return NextResponse.json({ plan, visionText });
  } catch (error) {
    console.error("Load plan error:", error);
    // 환경변수 미설정 등의 경우 null 반환 (앱은 정상 작동)
    return NextResponse.json({ plan: null, visionText: "" });
  }
}
