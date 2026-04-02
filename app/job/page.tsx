"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import type { JobResearchData } from "@/types/plan";

interface CustomLink {
  id: number;
  name: string;
  url: string;
}

const JOB_SITES = [
  { name: "원티드", url: "https://www.wanted.co.kr/search?query=%EB%8D%B0%EC%9D%B4%ED%84%B0&years=0", badge: "채용", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", tip: "데이터 신입·보상금 공고 위주로 확인" },
  { name: "리멤버", url: "https://career.rememberapp.co.kr", badge: "커피챗", badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", tip: "프로필 작성 → 인사담당자 커피챗 제안" },
  { name: "캐치", url: "https://www.catch.co.kr", badge: "연봉정보", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30", tip: "현직자 리뷰·연봉 정보 비교" },
  { name: "프로그래머스 SQL", url: "https://school.programmers.co.kr/learn/challenges?tab=sql_practice_kit", badge: "학습", badgeColor: "bg-green-500/20 text-green-300 border-green-500/30", tip: "SQL 고득점 Kit 풀기" },
  { name: "SolveSQL", url: "https://solvesql.com", badge: "학습", badgeColor: "bg-green-500/20 text-green-300 border-green-500/30", tip: "실무형 SQL 문제 풀이" },
  { name: "프로그래머스", url: "https://school.programmers.co.kr/learn/challenges?order=recent", badge: "코딩테스트", badgeColor: "bg-green-500/20 text-green-300 border-green-500/30", tip: "최신 코딩테스트 문제 도전" },
  { name: "잇다", url: "https://itda.io", badge: "멘토링", badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", tip: "현직자 멘토링·커피챗" },
  { name: "코멘토", url: "https://comento.kr", badge: "직무부트캠프", badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", tip: "직무 부트캠프·현직자 멘토링" },
  { name: "자소설닷컴", url: "https://jasoseol.com", badge: "자소서", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30", tip: "공채 일정·자기소개서 작성" },
  { name: "Toolify.ai", url: "https://www.toolify.ai", badge: "AI툴", badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30", tip: "AI 도구 탐색·비교" },
  { name: "알리오", url: "https://www.alio.go.kr", badge: "공공기관", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30", tip: "공공기관 채용·경영정보 공시" },
  { name: "사람인", url: "https://www.saramin.co.kr", badge: "채용", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", tip: "대규모 채용 공고 검색" },
  { name: "잡코리아", url: "https://www.jobkorea.co.kr", badge: "채용", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", tip: "채용 공고·연봉 정보" },
];

function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return "";
  }
}

export default function JobPage() {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [jobResearch, setJobResearch] = useState<JobResearchData | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchStatus, setResearchStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    const saved = localStorage.getItem("jobCustomLinks");
    if (saved) setCustomLinks(JSON.parse(saved));
    // 저장된 취업 분석 불러오기
    fetch("/api/job-research").then(r => r.json()).then(d => {
      if (d.data) setJobResearch(d.data);
    }).catch(() => {});
  }, []);

  const handleJobResearch = async () => {
    setResearchLoading(true);
    setResearchStatus("loading");
    try {
      const res = await fetch("/api/job-research", { method: "POST" });
      const data = await res.json();
      if (data.ok && data.data) {
        setJobResearch(data.data);
        setResearchStatus("done");
      } else {
        setResearchStatus("error");
      }
    } catch {
      setResearchStatus("error");
    } finally {
      setResearchLoading(false);
      setTimeout(() => setResearchStatus("idle"), 4000);
    }
  };

  const saveLinks = (links: CustomLink[]) => {
    localStorage.setItem("jobCustomLinks", JSON.stringify(links));
    setCustomLinks(links);
  };

  const addLink = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    let fixedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(fixedUrl)) fixedUrl = "https://" + fixedUrl;
    saveLinks([...customLinks, { id: Date.now(), name: newName.trim(), url: fixedUrl }]);
    setNewName("");
    setNewUrl("");
  };

  const deleteLink = (id: number) => {
    saveLinks(customLinks.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto p-4 space-y-5">
        {/* Header */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">🚀 취업 올인원 대시보드</h1>
            <p className="text-sm text-gray-500 mt-0.5">취업 사이트 모음 + 나만의 바로가기</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors border border-gray-700"
          >
            ← 스터디 플래너로
          </Link>
        </div>

        {/* Preset Job Sites */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>💼</span> 취업 사이트
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
            {JOB_SITES.map((site) => (
              <a
                key={site.url}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                {/* Favicon */}
                <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFaviconUrl(site.url)}
                    alt=""
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-xs hidden group-hover:hidden">🌐</span>
                </div>
                <span className="text-xs font-semibold text-gray-200 text-center leading-tight line-clamp-2">
                  {site.name}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full border ${site.badgeColor} font-medium`}>
                  {site.badge}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-relaxed shadow-xl">
                  {site.tip}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Custom Link Manager */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🔗</span> 나만의 바로가기
          </h2>

          {/* Add form */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="사이트 이름"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 flex-1"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 flex-1"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <button
              onClick={addLink}
              disabled={!newName.trim() || !newUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-bold px-4 rounded-lg transition-colors"
            >
              + 추가
            </button>
          </div>

          {/* Link grid */}
          {customLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              <div className="text-2xl mb-2">🔗</div>
              <p>자주 쓰는 사이트를 추가해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {customLinks.map((link) => (
                <div key={link.id} className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 w-full"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getFaviconUrl(link.url)}
                        alt=""
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-200 text-center line-clamp-2 leading-tight">
                      {link.name}
                    </span>
                  </a>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI 취업 분석 */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span>🤖</span> AI 채용 분석
              </h2>
              {jobResearch && (
                <p className="text-xs text-gray-600 mt-0.5">마지막 업데이트: {jobResearch.updatedAt}</p>
              )}
            </div>
            <button
              onClick={handleJobResearch}
              disabled={researchLoading}
              className="text-xs font-semibold bg-indigo-700 border border-indigo-600 text-indigo-50 hover:bg-indigo-600 px-3 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {researchLoading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {researchLoading ? "분석 중..." :
               researchStatus === "done" ? "✓ 업데이트 완료" :
               researchStatus === "error" ? "⚠ 오류" :
               jobResearch ? "🔄 재분석" : "🔍 채용 분석 시작"}
            </button>
          </div>

          {!jobResearch ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              <div className="text-2xl mb-2">🔍</div>
              <p>원티드·사람인·잡코리아에서 데이터엔지니어/AI개발 채용 요건을 분석하고<br />기존 로드맵 기반으로 보완 플랜을 자동 생성합니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 요약 */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                <p className="text-xs text-indigo-200 leading-relaxed">{jobResearch.summary}</p>
              </div>

              {/* 부족한 점 */}
              {jobResearch.gaps?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-amber-400 mb-2">⚠ 현재 로드맵에서 보완 필요</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {jobResearch.gaps.map((gap, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg">{gap}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 기술 스택 */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-2">🛠 요구 기술 스택</h3>
                <div className="flex flex-wrap gap-1.5">
                  {jobResearch.techStacks.map((t, i) => (
                    <span key={i} className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                      t.alreadyInRoadmap
                        ? "bg-green-500/10 border-green-500/30 text-green-300"
                        : t.frequency === "매우높음"
                          ? "bg-red-500/10 border-red-500/30 text-red-300"
                          : "bg-gray-700/50 border-gray-600 text-gray-300"
                    }`} title={t.description}>
                      {t.alreadyInRoadmap ? "✓ " : ""}{t.name}
                      <span className="text-gray-500 ml-1">({t.category})</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1.5">✓ 초록 = 로드맵에 있음 · 빨강 = 매우 자주 요구됨</p>
              </div>

              {/* 포트폴리오 */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-2">📁 추천 포트폴리오</h3>
                <div className="space-y-2">
                  {jobResearch.portfolioProjects.map((p, i) => (
                    <div key={i} className={`p-2.5 rounded-lg border text-xs ${
                      p.alreadyInRoadmap
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-gray-800/50 border-gray-700"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{p.alreadyInRoadmap ? "✓ " : ""}{p.title}</span>
                        <div className="flex gap-1">
                          <span className="text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">{p.difficulty}</span>
                          <span className="text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">{p.estimatedWeeks}주</span>
                        </div>
                      </div>
                      <p className="text-gray-400 mb-1">{p.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.skills.map((s, j) => (
                          <span key={j} className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">💡 취업 준비 팁</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { emoji: "📝", title: "자기소개서", desc: "STAR 기법으로 구체적 경험 작성. 수치화 필수!" },
              { emoji: "💻", title: "코딩테스트", desc: "프로그래머스 Lv.2 이상 + SQL 고득점 Kit 완성" },
              { emoji: "☕", title: "네트워킹", desc: "리멘버·잇다·코멘토로 현직자 커피챗 주 1회" },
            ].map((tip) => (
              <div key={tip.title} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{tip.emoji}</span>
                  <span className="text-sm font-semibold text-white">{tip.title}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
