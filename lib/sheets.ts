import { google } from "googleapis";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Google Sheets 환경변수가 설정되지 않았습니다. GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY를 확인하세요.");
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";

// 없는 시트를 자동으로 생성
export async function ensureSheets(
  sheets: ReturnType<typeof getSheetsClient>,
  spreadsheetId: string,
  sheetNames: string[]
) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Set(
    (meta.data.sheets ?? []).map((s) => s.properties?.title ?? "")
  );

  const toCreate = sheetNames.filter((name) => !existing.has(name));
  if (toCreate.length === 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: toCreate.map((title) => ({
        addSheet: { properties: { title } },
      })),
    },
  });
}
