import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";

// ── POST: 피드백 AI 분석 (ADHD 학습 전문가) ──────────────────────────────────
export async function POST() {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY 없음" }, { status: 500 });
    }
    if (!SPREADSHEET_ID) {
      return NextResponse.json({ error: "SPREADSHEET_ID 없음" }, { status: 500 });
    }

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["피드백", "로드맵"]);

    // 최근 피드백 읽기 (최대 30일)
    const feedbackRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "피드백!A1:H200",
    });
    const feedbackRows = (feedbackRes.data.values ?? []).slice(1).slice(-30);

    if (feedbackRows.length === 0) {
      return NextResponse.json({ error: "피드백 데이터가 없습니다" }, { status: 400 });
    }

    // 현재 로드맵 읽기
    const roadmapRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "로드맵!A1:I1000",
    });
    const roadmapRows = (roadmapRes.data.values ?? []).slice(1);

    const feedbackText = feedbackRows.map((r) =>
      `[${r[0]}] 컨디션:${r[1]}/5 | 완료:${r[2]} | 어려웠던것:${r[3]} | 배운점:${r[4]} | 내일다짐:${r[5]}`
    ).join("\n");

    const roadmapText = roadmapRows
      .slice(0, 50)
      .map((r) => `${r[1]} ${r[4]} (${r[5]}, ${r[6]}분)`)
      .join("\n");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: `당신은 ADHD를 가진 성인 학습자를 전문으로 돕는 학습 코치입니다.
ADHD 특성을 깊이 이해하며, 다음 원칙으로 피드백합니다:
- 완료한 것을 먼저 크게 인정하고 칭찬
- 패턴 분석 시 판단하지 않고 관찰 언어 사용
- 조언은 3가지 이하로, 매우 구체적으로
- "~해보세요" 대신 "오늘 당장 ~하면 됩니다" 형식
- 완벽주의 압박 제거, 60% 완성도도 성공으로 인정`,
      messages: [{
        role: "user",
        content: `아래 학습 피드백을 분석해서 ADHD 학습 전문가 관점으로 피드백해주세요.

=== 최근 피드백 기록 ===
${feedbackText}

=== 현재 로드맵 ===
${roadmapText}

다음 JSON 형식으로만 응답:
{
  "praise": "완료한 것에 대한 진심 어린 칭찬 (2-3문장, 구체적 수치 언급)",
  "patterns": [
    {"type": "strength|challenge", "insight": "관찰한 패턴 1문장", "adhd_context": "ADHD 관점 설명"}
  ],
  "actions": [
    {"priority": 1, "action": "오늘 당장 할 수 있는 구체적 행동 (5분 이내 시작 가능)", "reason": "이유"}
  ],
  "planAdjustment": {
    "suggestion": "로드맵 조정 제안 (있다면)",
    "sessionChange": "세션 길이/구조 변경 제안"
  },
  "encouragement": "한 줄 응원 메시지"
}`,
      }],
    });

    const textBlocks = response.content.filter((b) => b.type === "text");
    const lastText = textBlocks[textBlocks.length - 1]?.text ?? "";
    const jsonMatch = lastText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("응답 파싱 실패");

    const analysis = JSON.parse(jsonMatch[0]);
    const analyzedAt = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

    // 분석 결과 저장
    await ensureSheets(sheets, SPREADSHEET_ID, ["피드백분석"]);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "피드백분석!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[analyzedAt, JSON.stringify(analysis)]],
      },
    });

    return NextResponse.json({ ok: true, analysis, analyzedAt });
  } catch (error) {
    console.error("Feedback analyze error:", error);
    return NextResponse.json({ error: "분석 실패" }, { status: 500 });
  }
}

// ── GET: 최근 분석 결과 불러오기 ─────────────────────────────────────────────
export async function GET() {
  try {
    if (!SPREADSHEET_ID) return NextResponse.json({ analysis: null });

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["피드백분석"]);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "피드백분석!A1:B100",
    });

    const rows = res.data.values ?? [];
    if (rows.length === 0) return NextResponse.json({ analysis: null });

    const last = rows[rows.length - 1];
    return NextResponse.json({
      analysis: JSON.parse(last[1] as string),
      analyzedAt: last[0],
    });
  } catch {
    return NextResponse.json({ analysis: null });
  }
}
