import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";
import { StudyPlan } from "@/types/plan";

const SHEET_NAMES = ["비전", "오늘할일", "위클리플래너", "년간플래너", "플랜목록"];

export async function POST(req: NextRequest) {
  try {
    const { plans, visionText }: { plans?: StudyPlan[]; visionText?: string } = await req.json();

    if (!SPREADSHEET_ID) {
      return NextResponse.json({ error: "GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다" }, { status: 500 });
    }

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, SHEET_NAMES);

    // visionText만 저장하는 경우
    if (!plans) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "비전!J2",
        valueInputOption: "RAW",
        requestBody: { values: [[visionText ?? ""]] },
      });
      return NextResponse.json({ ok: true });
    }

    // 플랜목록 시트에 JSON 배열 저장
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "플랜목록!A1",
      valueInputOption: "RAW",
      requestBody: { values: [[JSON.stringify(plans)]] },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save plan error:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }
}
