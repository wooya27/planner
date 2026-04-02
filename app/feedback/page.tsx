"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FeedbackItem {
  date: string;
  condition: number;
  completed: string;
  difficult: string;
  learned: string;
  tomorrow: string;
  memo: string;
}

interface Analysis {
  praise: string;
  patterns: Array<{ type: "strength" | "challenge"; insight: string; adhd_context: string }>;
  actions: Array<{ priority: number; action: string; reason: string }>;
  planAdjustment: { suggestion: string; sessionChange: string };
  encouragement: string;
}

const CONDITIONS = [
  { value: 1, emoji: "😴", label: "매우 피곤" },
  { value: 2, emoji: "😔", label: "힘들었음" },
  { value: 3, emoji: "😐", label: "보통" },
  { value: 4, emoji: "🙂", label: "좋았음" },
  { value: 5, emoji: "🔥", label: "최고!" },
];

export default function FeedbackPage() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

  const [form, setForm] = useState({
    condition: 3,
    completed: "",
    difficult: "",
    learned: "",
    tomorrow: "",
    memo: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    // 피드백 기록 불러오기
    fetch("/api/feedback").then(r => r.json()).then(d => {
      if (d.items) setHistory(d.items);
      // 오늘 피드백이 있으면 폼에 채우기
      const todayItem = d.items?.find((i: FeedbackItem) => i.date === today);
      if (todayItem) {
        setForm({
          condition: todayItem.condition,
          completed: todayItem.completed,
          difficult: todayItem.difficult,
          learned: todayItem.learned,
          tomorrow: todayItem.tomorrow,
          memo: todayItem.memo,
        });
        setSaved(true);
      }
    }).catch(() => {});

    // 최근 분석 불러오기
    fetch("/api/feedback/analyze").then(r => r.json()).then(d => {
      if (d.analysis) { setAnalysis(d.analysis); setAnalyzedAt(d.analyzedAt); }
    }).catch(() => {});
  }, [today]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, ...form }),
      });
      setSaved(true);
      // 기록 갱신
      const res = await fetch("/api/feedback");
      const data = await res.json();
      if (data.items) setHistory(data.items);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/feedback/analyze", { method: "POST" });
      const data = await res.json();
      if (data.analysis) { setAnalysis(data.analysis); setAnalyzedAt(data.analyzedAt); }
    } catch { /* ignore */ }
    setAnalyzing(false);
  };

  const completionRate = history.length > 0
    ? Math.round(history.filter(i => i.completed.trim().length > 0).length / Math.min(history.length, 7) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">📝 일일 피드백</h1>
            <p className="text-xs text-gray-500 mt-0.5">{today} · 오늘 하루를 기록하세요</p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg border border-gray-700 transition-colors">
            ← 플래너
          </Link>
        </div>

        {/* 오늘 피드백 입력 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-300">오늘 컨디션</h2>
            {saved && <span className="text-xs text-green-400 font-semibold">✓ 저장됨</span>}
          </div>

          {/* 컨디션 */}
          <div className="flex gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => { setForm(f => ({ ...f, condition: c.value })); setSaved(false); }}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                  form.condition === c.value
                    ? "bg-blue-500/20 border-blue-500/50 scale-105"
                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                }`}
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-xs text-gray-400">{c.label}</span>
              </button>
            ))}
          </div>

          {/* 완료한 것 */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">✅ 오늘 완료한 것</label>
            <textarea
              value={form.completed}
              onChange={(e) => { setForm(f => ({ ...f, completed: e.target.value })); setSaved(false); }}
              placeholder="어떤 것을 했나요? 작은 것도 OK (예: SQL 쿼리 3문제 풀었어)"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition"
            />
          </div>

          {/* 어려웠던 것 */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">😤 어려웠거나 안 된 것</label>
            <textarea
              value={form.difficult}
              onChange={(e) => { setForm(f => ({ ...f, difficult: e.target.value })); setSaved(false); }}
              placeholder="집중이 안 됐나요? 이해가 안 됐나요? 솔직하게 (판단 없어요)"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition"
            />
          </div>

          {/* 배운 점 + 내일 다짐 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">💡 오늘 배운 점</label>
              <textarea
                value={form.learned}
                onChange={(e) => { setForm(f => ({ ...f, learned: e.target.value })); setSaved(false); }}
                placeholder="어떤 인사이트가 있었나요?"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">🎯 내일 딱 한 가지</label>
              <textarea
                value={form.tomorrow}
                onChange={(e) => { setForm(f => ({ ...f, tomorrow: e.target.value })); setSaved(false); }}
                placeholder="내일 꼭 하고 싶은 것 하나만"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />저장 중...</>
              : saved ? "✓ 저장 완료 (수정하려면 다시 저장)" : "💾 오늘 피드백 저장"}
          </button>
        </div>

        {/* AI 분석 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-300">🤖 ADHD 학습 코치 분석</h2>
              {analyzedAt && <p className="text-xs text-gray-600 mt-0.5">마지막 분석: {analyzedAt}</p>}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || history.length === 0}
              className="text-xs font-semibold bg-purple-700 border border-purple-600 text-purple-50 hover:bg-purple-600 px-3 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {analyzing && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {analyzing ? "분석 중..." : "✨ AI 피드백 받기"}
            </button>
          </div>

          {!analysis ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              <div className="text-3xl mb-2">🧠</div>
              <p>피드백을 {history.length === 0 ? "먼저 입력하고 " : ""}저장한 후<br />AI 피드백을 받아보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 칭찬 */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-xs font-bold text-green-400 mb-1">🌟 잘하고 있어요</p>
                <p className="text-sm text-green-100 leading-relaxed">{analysis.praise}</p>
              </div>

              {/* 패턴 분석 */}
              {analysis.patterns?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400">📊 패턴 분석</p>
                  {analysis.patterns.map((p, i) => (
                    <div key={i} className={`p-3 rounded-lg border text-xs ${
                      p.type === "strength"
                        ? "bg-blue-500/10 border-blue-500/20"
                        : "bg-amber-500/10 border-amber-500/20"
                    }`}>
                      <p className={`font-semibold mb-1 ${p.type === "strength" ? "text-blue-300" : "text-amber-300"}`}>
                        {p.type === "strength" ? "💪 " : "🔍 "}{p.insight}
                      </p>
                      <p className="text-gray-400 leading-relaxed">{p.adhd_context}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 액션 아이템 */}
              {analysis.actions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400">⚡ 지금 당장 할 수 있는 것</p>
                  {analysis.actions.map((a, i) => (
                    <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-black text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded mt-0.5">{a.priority}</span>
                        <div>
                          <p className="text-sm font-semibold text-white leading-snug">{a.action}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{a.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 플랜 조정 */}
              {analysis.planAdjustment?.suggestion && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <p className="text-xs font-bold text-purple-400 mb-1">📅 플랜 조정 제안</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{analysis.planAdjustment.suggestion}</p>
                  {analysis.planAdjustment.sessionChange && (
                    <p className="text-xs text-gray-400 mt-1">{analysis.planAdjustment.sessionChange}</p>
                  )}
                </div>
              )}

              {/* 응원 */}
              <div className="text-center py-2">
                <p className="text-sm font-bold text-gray-300">{analysis.encouragement}</p>
              </div>
            </div>
          )}
        </div>

        {/* 최근 7일 통계 */}
        {history.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">📈 최근 기록</h2>
              <span className="text-xs text-gray-600">7일 완료율 <span className="text-blue-400 font-bold">{completionRate}%</span></span>
            </div>
            <div className="space-y-2">
              {history.slice(0, 7).map((item) => (
                <div key={item.date} className="flex items-start gap-3 p-2.5 bg-gray-800/50 border border-gray-800 rounded-lg">
                  <div className="flex-shrink-0 text-center">
                    <p className="text-xs text-gray-500">{item.date.slice(5)}</p>
                    <p className="text-lg">{CONDITIONS.find(c => c.value === item.condition)?.emoji ?? "😐"}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.completed && (
                      <p className="text-xs text-green-300 leading-relaxed truncate">✅ {item.completed}</p>
                    )}
                    {item.difficult && (
                      <p className="text-xs text-amber-300/70 leading-relaxed truncate">😤 {item.difficult}</p>
                    )}
                    {item.tomorrow && (
                      <p className="text-xs text-blue-300/70 leading-relaxed truncate">🎯 {item.tomorrow}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
