"use client";

import { useState, useRef } from "react";
import { GoalInfo } from "@/types/plan";

interface VisionBoardProps {
  goalInfo?: GoalInfo | null;
  studyTips?: string[];
  onVisionTextChange?: (text: string) => void;
}

const difficultyConfig = {
  초급: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", emoji: "🌱" },
  중급: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", emoji: "🔥" },
  고급: { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    emoji: "⚡" },
};

export default function VisionBoard({ goalInfo, studyTips, onVisionTextChange }: VisionBoardProps) {
  const [visionText, setVisionText] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("visionText") ?? "" : ""
  );
  const [bgImage, setBgImage] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("visionImage") ?? null : null
  );
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveVisionText = (v: string) => {
    setVisionText(v);
    localStorage.setItem("visionText", v);
    onVisionTextChange?.(v);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBgImage(dataUrl);
      localStorage.setItem("visionImage", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setBgImage(null);
    localStorage.removeItem("visionImage");
  };

  const config = goalInfo ? difficultyConfig[goalInfo.difficulty] : null;

  const quotes = [
    "지금 이 순간이 기회다 💪",
    "작은 한 걸음이 큰 변화를 만든다 🚀",
    "집중! 지금 해야 할 일을 하자 ⚡",
    "포기하면 그때가 게임 오버 🎯",
    "오늘의 노력이 내일의 나를 만든다 ✨",
  ];
  const quote = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-800 flex-shrink-0" style={{ minHeight: 120 }}>

      {/* Background */}
      {bgImage ? (
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="vision" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/90" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 z-0">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 p-3 flex flex-col" style={{ minHeight: 120 }}>
        <div className="flex flex-col lg:flex-row gap-3 flex-1">

          {/* Left: Vision text */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">🎯 나의 비전</span>
              <button
                onClick={() => setEditing(!editing)}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2 py-0.5 rounded border border-gray-700 hover:border-gray-600"
              >
                {editing ? "✓ 저장" : "✏️ 편집"}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2 py-0.5 rounded border border-gray-700 hover:border-gray-600"
              >
                🖼 배경
              </button>
              {bgImage && (
                <button
                  onClick={removeImage}
                  className="text-xs text-red-600 hover:text-red-400 transition-colors px-2 py-0.5 rounded border border-red-900 hover:border-red-700"
                >
                  ✕ 제거
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Editable text */}
            {editing ? (
              <textarea
                value={visionText}
                onChange={(e) => saveVisionText(e.target.value)}
                placeholder={"나의 꿈과 목표를 적어보세요\n예) 2026년 정보처리기사 합격 후 개발자로 취업\n매일 2시간씩 꾸준히 공부해서 반드시 달성한다!"}
                className="flex-1 w-full bg-gray-800/70 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition resize-none"
                style={{ minHeight: 100 }}
                autoFocus
              />
            ) : (
              <div onClick={() => setEditing(true)} className="cursor-text group flex-1">
                {visionText ? (
                  <p className="text-sm font-semibold text-white leading-relaxed whitespace-pre-wrap">{visionText}</p>
                ) : (
                  <p className="text-gray-700 text-sm italic group-hover:text-gray-500 transition-colors">
                    ✏️ 클릭해서 나의 비전·목표를 입력하세요
                  </p>
                )}
              </div>
            )}

            {/* AI goal tags */}
            {goalInfo && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {goalInfo.subjects.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      {s}
                    </span>
                  ))}
                  {config && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                      {config.emoji} {goalInfo.difficulty}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Study tips */}
            {studyTips && studyTips.length > 0 && (
              <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
                {studyTips.slice(0, 3).map((tip, i) => (
                  <div key={i} className="flex-shrink-0 bg-gray-800/40 border border-gray-700/50 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      <span className="text-yellow-400 mr-1">💡</span>{tip}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {!goalInfo && (
          <p className="text-xs text-gray-600 mt-2">오른쪽 패널에서 목표를 입력하고 플랜을 생성하세요</p>
        )}
      </div>
    </div>
  );
}
