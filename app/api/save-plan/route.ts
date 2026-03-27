import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { plan, visionText } = await req.json();

    if (!SPREADSHEET_ID) {
      return NextResponse.json({ error: "GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다" }, { status: 500 });
    }

    const sheets = getSheetsClient();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:B2",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["plan",       JSON.stringify(plan)],
          ["visionText", visionText ?? ""],
        ],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save plan error:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }
}
