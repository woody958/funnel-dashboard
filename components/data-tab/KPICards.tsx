"use client";

import { useState, useEffect } from "react";
import {
  Users, TrendingUp, DollarSign, BarChart2, Target, Star,
  TrendingDown, Pencil, Plus, Trash2, type LucideIcon,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { KPICard, MediaBreakdownItem } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormField";
import { generateId } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Users, TrendingUp, TrendingDown, DollarSign, BarChart2, Target, Star,
};

const ICON_OPTIONS = [
  { id: "Users", label: "👥 사용자" },
  { id: "TrendingUp", label: "📈 상승" },
  { id: "TrendingDown", label: "📉 하락" },
  { id: "DollarSign", label: "💰 매출" },
  { id: "BarChart2", label: "📊 차트" },
  { id: "Target", label: "🎯 목표" },
  { id: "Star", label: "⭐ 별점" },
];

const COLOR_PRESETS = [
  { color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { color: "#06B6D4", bg: "rgba(6,182,212,0.1)" },
  { color: "#EC4899", bg: "rgba(236,72,153,0.1)" },
  { color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  { color: "#6366F1", bg: "rgba(99,102,241,0.1)" },
];

function calcAchievement(value: string, target: string): number {
  const extractNum = (s: string) => {
    const match = s.replace(/,/g, "").match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };
  const v = extractNum(value);
  const t = extractNum(target);
  if (v !== null && t !== null && t !== 0) return Math.round((v / t) * 100);
  return 0;
}

function formatKRW(n: number): string {
  return "₩" + n.toLocaleString("ko-KR");
}

function AchievementBar({ value, color }: { value: number; color: string }) {
  const clamped = Math.min(value, 100);
  const barColor = value >= 100 ? "#10B981" : value >= 80 ? color : value >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${clamped}%`, backgroundColor: barColor }} />
    </div>
  );
}

// ─── CPA Card ───────────────────────────────────────────────────────────────
function CPAKPICard({ card }: { card: KPICard }) {
  const Icon: LucideIcon = iconMap[card.icon] ?? BarChart2;
  const { cpaData, mediaBreakdown } = card;
  const cpa = cpaData && cpaData.visitors > 0 ? Math.round(cpaData.marketingCost / cpaData.visitors) : null;
  const displayValue = cpa !== null ? `${formatKRW(cpa)}/명` : card.value;
  // CPA는 낮을수록 좋으므로 달성률 = target / value × 100 (역산)
  const achievement = (cpa !== null && card.target)
    ? calcAchievement(card.target, displayValue)
    : (card.achievement ?? 0);
  const achieveColor = achievement >= 100 ? "#10B981" : achievement >= 80 ? card.color : achievement >= 60 ? "#F59E0B" : "#EF4444";
  const cpaTargetNum = card.target ? parseFloat(card.target.replace(/,/g, "").match(/[\d.]+/)?.[0] ?? "0") : null;
  const cpaExcess = cpa !== null && cpaTargetNum !== null && cpa > cpaTargetNum ? cpa - cpaTargetNum : null;
  const isPositive = card.change > 0;
  const isNegative = card.change < 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 leading-snug">{card.title}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: card.bgColor }}>
          <Icon size={15} style={{ color: card.color }} />
        </div>
      </div>

      <div className="mb-0.5 text-xl font-bold text-slate-900">{displayValue}</div>
      {card.target && <div className="mb-2 text-[11px] text-slate-400">목표: {card.target}</div>}
      {card.target && (
        <div className="mb-2">
          <AchievementBar value={achievement} color={card.color} />
          {cpaExcess !== null ? (
            <div className="mt-1 text-[11px] font-semibold" style={{ color: achieveColor }}>
              개선 필요 · 목표 대비 {formatKRW(cpaExcess)}/명 초과
            </div>
          ) : (
            <div className="mt-1 text-[11px] font-semibold" style={{ color: achieveColor }}>
              {achievement}% 달성
            </div>
          )}
        </div>
      )}

      {/* Media breakdown */}
      {mediaBreakdown && mediaBreakdown.length > 0 && (
        <div className="mb-2 space-y-1 rounded-lg bg-slate-50 p-2">
          {mediaBreakdown.map((item) => {
            const mediaCPA = item.marketingCost && item.count > 0 ? Math.round(item.marketingCost / item.count) : null;
            return (
              <div key={item.media} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 w-16 shrink-0">{item.media}</span>
                {mediaCPA !== null && (
                  <span className="font-medium text-slate-700">{formatKRW(mediaCPA)}/명</span>
                )}
                <span className="text-slate-400">{item.count.toLocaleString()}명</span>
              </div>
            );
          })}
        </div>
      )}

      {cpaData && (
        <div className="mb-2 flex items-center gap-2 text-[10px] text-slate-400">
          <span>마케팅비 {formatKRW(cpaData.marketingCost)}</span>
          <span>·</span>
          <span>유입 {cpaData.visitors.toLocaleString()}명</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        {isPositive ? <TrendingUp size={11} className="text-emerald-500" /> : isNegative ? <TrendingDown size={11} className="text-red-400" /> : null}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : isNegative ? "text-red-400" : "text-slate-400"}`}>{Math.abs(card.change)}%</span>
        <span className="text-xs text-slate-400">{card.changeLabel}</span>
      </div>
    </div>
  );
}

// ─── A/B Test Card ───────────────────────────────────────────────────────────
function ABTestKPICard({ card }: { card: KPICard }) {
  const Icon: LucideIcon = iconMap[card.icon] ?? BarChart2;
  const ab = card.abTestData!;
  const isPositive = card.change > 0;
  const isNegative = card.change < 0;
  const achievement = card.achievement ?? 0;
  const achieveColor = achievement >= 100 ? "#10B981" : achievement >= 80 ? card.color : achievement >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 leading-snug">{card.title}</span>
          {ab.enabled && (
            <span className="rounded px-1 py-0.5 text-[9px] font-bold bg-violet-100 text-violet-600">A/B</span>
          )}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: card.bgColor }}>
          <Icon size={15} style={{ color: card.color }} />
        </div>
      </div>

      {ab.enabled ? (
        <>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-violet-50 p-2 text-center">
              <div className="mb-0.5 text-[10px] font-medium text-violet-500">{ab.variantA.label}</div>
              <div className="text-base font-bold text-slate-800">{ab.variantA.value}</div>
            </div>
            <div className="rounded-lg bg-indigo-50 p-2 text-center">
              <div className="mb-0.5 text-[10px] font-medium text-indigo-500">{ab.variantB.label}</div>
              <div className="text-base font-bold text-slate-800">{ab.variantB.value}</div>
            </div>
          </div>
          {card.target && (
            <div className="mb-2">
              <div className="mb-1 text-[11px] text-slate-400">목표: {card.target}</div>
              <AchievementBar value={achievement} color={card.color} />
              <div className="mt-1 text-[11px] font-semibold" style={{ color: achieveColor }}>{achievement}% 달성</div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-0.5 text-xl font-bold text-slate-900">{card.value}</div>
          {card.target && <div className="mb-2 text-[11px] text-slate-400">목표: {card.target}</div>}
          {card.target && (
            <div className="mb-2">
              <AchievementBar value={achievement} color={card.color} />
              <div className="mt-1 text-[11px] font-semibold" style={{ color: achieveColor }}>{achievement}% 달성</div>
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-1">
        {isPositive ? <TrendingUp size={11} className="text-emerald-500" /> : isNegative ? <TrendingDown size={11} className="text-red-400" /> : null}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : isNegative ? "text-red-400" : "text-slate-400"}`}>{Math.abs(card.change)}%</span>
        <span className="text-xs text-slate-400">{card.changeLabel}</span>
      </div>
    </div>
  );
}

// ─── Media Breakdown Card (count only) ──────────────────────────────────────
function MediaBreakdownKPICard({ card }: { card: KPICard }) {
  const Icon: LucideIcon = iconMap[card.icon] ?? BarChart2;
  const { mediaBreakdown } = card;
  const total = mediaBreakdown?.reduce((s, i) => s + i.count, 0) ?? 0;
  const isPositive = card.change > 0;
  const isNegative = card.change < 0;
  const achievement = card.achievement ?? 0;
  const achieveColor = achievement >= 100 ? "#10B981" : achievement >= 80 ? card.color : achievement >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 leading-snug">{card.title}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: card.bgColor }}>
          <Icon size={15} style={{ color: card.color }} />
        </div>
      </div>

      <div className="mb-0.5 text-xl font-bold text-slate-900">{card.value}</div>
      {card.target && <div className="mb-2 text-[11px] text-slate-400">목표: {card.target}</div>}
      {card.target && (
        <div className="mb-2">
          <AchievementBar value={achievement} color={card.color} />
          <div className="mt-1 text-[11px] font-semibold" style={{ color: achieveColor }}>{achievement}% 달성</div>
        </div>
      )}

      {mediaBreakdown && mediaBreakdown.length > 0 && (
        <div className="mb-2 space-y-1 rounded-lg bg-slate-50 p-2">
          {mediaBreakdown.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.media} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-16 shrink-0 text-slate-500">{item.media}</span>
                <div className="flex-1 h-1 rounded-full bg-slate-200">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: card.color }} />
                </div>
                <span className="w-8 text-right font-medium text-slate-700">{item.count}명</span>
                <span className="w-7 text-right text-slate-400">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-1">
        {isPositive ? <TrendingUp size={11} className="text-emerald-500" /> : isNegative ? <TrendingDown size={11} className="text-red-400" /> : null}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : isNegative ? "text-red-400" : "text-slate-400"}`}>{Math.abs(card.change)}%</span>
        <span className="text-xs text-slate-400">{card.changeLabel}</span>
      </div>
    </div>
  );
}

// ─── Standard Card ───────────────────────────────────────────────────────────
function StandardKPICard({ card }: { card: KPICard }) {
  const Icon: LucideIcon = iconMap[card.icon] ?? BarChart2;
  const isPositive = card.change > 0;
  const isNegative = card.change < 0;
  const hasTarget = !!card.target;
  const lowerIsBetter = card.lowerIsBetter ?? false;

  // lowerIsBetter 카드는 달성률을 역산 (target / value × 100)
  const achievement = lowerIsBetter && card.target
    ? calcAchievement(card.target, card.value)
    : (card.achievement ?? 0);
  const achieveColor = achievement >= 100 ? "#10B981" : achievement >= 80 ? card.color : achievement >= 60 ? "#F59E0B" : "#EF4444";

  // 목표 초과 여부 계산 (낮을수록 좋은 지표)
  let excessLabel: string | null = null;
  if (lowerIsBetter && card.target) {
    const extractNum = (s: string) => { const m = s.replace(/,/g, "").match(/[\d.]+/); return m ? parseFloat(m[0]) : null; };
    const vNum = extractNum(card.value);
    const tNum = extractNum(card.target);
    if (vNum !== null && tNum !== null && vNum > tNum) {
      const excess = vNum - tNum;
      const isCurrency = card.value.startsWith("₩") || (card.target?.startsWith("₩") ?? false);
      const isPct = card.value.includes("%");
      excessLabel = isCurrency ? `${formatKRW(excess)} 초과` : isPct ? `${excess}%p 초과` : `${excess} 초과`;
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 leading-snug">{card.title}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: card.bgColor }}>
          <Icon size={15} style={{ color: card.color }} />
        </div>
      </div>
      <div className="mb-0.5 text-xl font-bold text-slate-900">{card.value}</div>
      {hasTarget && <div className="mb-2 text-[11px] text-slate-400">목표: {card.target}</div>}
      {hasTarget && (
        <div className="mb-2">
          <AchievementBar value={achievement} color={card.color} />
          {excessLabel !== null ? (
            <div className="mt-1 text-[11px] font-semibold" style={{ color: achieveColor }}>
              개선 필요 · 목표 대비 {excessLabel}
            </div>
          ) : (
            <div className="mt-1 text-[11px] font-semibold" style={{ color: achieveColor }}>{achievement}% 달성</div>
          )}
        </div>
      )}
      <div className="flex items-center gap-1">
        {isPositive ? <TrendingUp size={11} className="text-emerald-500" /> : isNegative ? <TrendingDown size={11} className="text-red-400" /> : null}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : isNegative ? "text-red-400" : "text-slate-400"}`}>{Math.abs(card.change)}%</span>
        <span className="text-xs text-slate-400">{card.changeLabel}</span>
      </div>
    </div>
  );
}

function KPICardItem({ card }: { card: KPICard }) {
  if (card.cpaData) return <CPAKPICard card={card} />;
  if (card.abTestData) return <ABTestKPICard card={card} />;
  if (card.mediaBreakdown && card.mediaBreakdown.length > 0) return <MediaBreakdownKPICard card={card} />;
  return <StandardKPICard card={card} />;
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────
const inputCls = "w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";
const labelCls = "mb-0.5 block text-[10px] text-slate-500";

function CPAEditSection({ card, index, updateCard }: { card: KPICard; index: number; updateCard: (i: number, f: keyof KPICard, v: unknown) => void }) {
  const cpaData = card.cpaData ?? { marketingCost: 0, visitors: 0 };
  const cpa = cpaData.visitors > 0 ? Math.round(cpaData.marketingCost / cpaData.visitors) : 0;

  function updateCPA(field: "marketingCost" | "visitors", val: number) {
    const next = { ...cpaData, [field]: val };
    updateCard(index, "cpaData", next);
    const newCPA = next.visitors > 0 ? Math.round(next.marketingCost / next.visitors) : 0;
    const newCPAStr = `${formatKRW(newCPA)}/명`;
    updateCard(index, "value", newCPAStr);
    if (card.target) {
      // CPA 역산: target / value × 100
      updateCard(index, "achievement", calcAchievement(card.target, newCPAStr));
    }
  }

  function updateMedia(mi: number, field: keyof MediaBreakdownItem, val: string | number) {
    const mb = (card.mediaBreakdown ?? []).map((m, i) => i === mi ? { ...m, [field]: val } : m);
    const totalCost = mb.reduce((s, m) => s + (m.marketingCost ?? 0), 0);
    const totalCount = mb.reduce((s, m) => s + m.count, 0);
    updateCard(index, "mediaBreakdown", mb);
    updateCard(index, "cpaData", { marketingCost: totalCost, visitors: totalCount });
    const newCPA = totalCount > 0 ? Math.round(totalCost / totalCount) : 0;
    const newCPAStr = `${formatKRW(newCPA)}/명`;
    updateCard(index, "value", newCPAStr);
    // CPA 역산: target / value × 100
    if (card.target) updateCard(index, "achievement", calcAchievement(card.target, newCPAStr));
  }

  function addMedia() {
    updateCard(index, "mediaBreakdown", [...(card.mediaBreakdown ?? []), { media: "", marketingCost: 0, count: 0 }]);
  }

  function removeMedia(mi: number) {
    const mb = (card.mediaBreakdown ?? []).filter((_, i) => i !== mi);
    updateCard(index, "mediaBreakdown", mb);
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
      <div className="text-[10px] font-semibold text-blue-600">CPA 설정</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>총 마케팅 비용 (원)</label>
          <input type="number" value={cpaData.marketingCost} onChange={(e) => updateCPA("marketingCost", Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>유입 인원 수 (명)</label>
          <input type="number" value={cpaData.visitors} onChange={(e) => updateCPA("visitors", Number(e.target.value))} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>산출 CPA (자동계산)</label>
        <input readOnly value={cpa > 0 ? `${formatKRW(cpa)}/명` : "-"} className="w-full rounded border border-slate-100 bg-slate-100 px-2 py-1.5 text-xs text-slate-500 cursor-default outline-none" />
      </div>

      {/* Media breakdown */}
      <div className="pt-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-blue-600">매체별 분류</span>
          <button onClick={addMedia} className="text-[10px] text-blue-500 hover:text-blue-600">+ 추가</button>
        </div>
        {(card.mediaBreakdown ?? []).map((m, mi) => (
          <div key={mi} className="mb-1.5 grid grid-cols-[1fr_100px_80px_20px] gap-1 items-center">
            <input value={m.media} onChange={(e) => updateMedia(mi, "media", e.target.value)} placeholder="매체명" className={inputCls} />
            <input type="number" value={m.marketingCost ?? 0} onChange={(e) => updateMedia(mi, "marketingCost", Number(e.target.value))} placeholder="비용(원)" className={inputCls} />
            <input type="number" value={m.count} onChange={(e) => updateMedia(mi, "count", Number(e.target.value))} placeholder="인원" className={inputCls} />
            <button onClick={() => removeMedia(mi)} className="text-slate-300 hover:text-red-400"><Trash2 size={11} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ABTestEditSection({ card, index, updateCard }: { card: KPICard; index: number; updateCard: (i: number, f: keyof KPICard, v: unknown) => void }) {
  const ab = card.abTestData ?? { enabled: false, variantA: { label: "A안", value: "" }, variantB: { label: "B안", value: "" } };

  function updateAB(field: string, val: unknown) {
    updateCard(index, "abTestData", { ...ab, [field]: val });
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-violet-100 bg-violet-50/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-violet-600">A/B 테스트 설정</span>
        <button
          onClick={() => updateAB("enabled", !ab.enabled)}
          className={`relative h-4 w-8 rounded-full transition-colors ${ab.enabled ? "bg-violet-500" : "bg-slate-300"}`}
        >
          <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${ab.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
      {ab.enabled && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-violet-500">A안</div>
            <input value={ab.variantA.label} onChange={(e) => updateAB("variantA", { ...ab.variantA, label: e.target.value })} placeholder="A안 레이블" className={inputCls} />
            <input value={ab.variantA.value} onChange={(e) => updateAB("variantA", { ...ab.variantA, value: e.target.value })} placeholder="예: 72%" className={inputCls} />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-indigo-500">B안</div>
            <input value={ab.variantB.label} onChange={(e) => updateAB("variantB", { ...ab.variantB, label: e.target.value })} placeholder="B안 레이블" className={inputCls} />
            <input value={ab.variantB.value} onChange={(e) => updateAB("variantB", { ...ab.variantB, value: e.target.value })} placeholder="예: 64%" className={inputCls} />
          </div>
        </div>
      )}
    </div>
  );
}

function MediaOnlyEditSection({ card, index, updateCard }: { card: KPICard; index: number; updateCard: (i: number, f: keyof KPICard, v: unknown) => void }) {
  function updateMedia(mi: number, field: keyof MediaBreakdownItem, val: string | number) {
    const mb = (card.mediaBreakdown ?? []).map((m, i) => i === mi ? { ...m, [field]: val } : m);
    updateCard(index, "mediaBreakdown", mb);
  }

  function addMedia() {
    updateCard(index, "mediaBreakdown", [...(card.mediaBreakdown ?? []), { media: "", count: 0 }]);
  }

  function removeMedia(mi: number) {
    updateCard(index, "mediaBreakdown", (card.mediaBreakdown ?? []).filter((_, i) => i !== mi));
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-cyan-100 bg-cyan-50/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-cyan-600">매체별 신청 분류</span>
        <button onClick={addMedia} className="text-[10px] text-cyan-500 hover:text-cyan-600">+ 추가</button>
      </div>
      {(card.mediaBreakdown ?? []).map((m, mi) => (
        <div key={mi} className="grid grid-cols-[1fr_80px_20px] gap-1 items-center">
          <input value={m.media} onChange={(e) => updateMedia(mi, "media", e.target.value)} placeholder="매체명" className={inputCls} />
          <input type="number" value={m.count} onChange={(e) => updateMedia(mi, "count", Number(e.target.value))} placeholder="인원" className={inputCls} />
          <button onClick={() => removeMedia(mi)} className="text-slate-300 hover:text-red-400"><Trash2 size={11} /></button>
        </div>
      ))}
    </div>
  );
}

function GroupEditModal({ open, onClose, groupId }: { open: boolean; onClose: () => void; groupId: string }) {
  const { kpiGroups, updateKPIGroupLabel, updateKPIGroupCards } = useDashboard();
  const group = kpiGroups.find((g) => g.id === groupId);

  const [label, setLabel] = useState(group?.label ?? "");
  const [cards, setCards] = useState<KPICard[]>([]);

  useEffect(() => {
    if (open && group) {
      setLabel(group.label);
      setCards(group.cards.map((c) => ({ ...c })));
    }
  }, [open, groupId]);

  if (!open || !group) return null;

  function updateCard(index: number, field: keyof KPICard, val: unknown) {
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const updated = { ...c, [field]: val } as KPICard;
        // Recalculate achievement when value, target, or lowerIsBetter changes (non-CPA cards)
        if (!updated.cpaData && (field === "value" || field === "target" || field === "lowerIsBetter")) {
          if (updated.lowerIsBetter) {
            updated.achievement = calcAchievement(String(updated.target ?? ""), String(updated.value ?? ""));
          } else {
            updated.achievement = calcAchievement(String(updated.value ?? ""), String(updated.target ?? ""));
          }
        }
        return updated;
      })
    );
  }

  function setCardColor(index: number, preset: { color: string; bg: string }) {
    setCards((prev) => prev.map((c, i) => i === index ? { ...c, color: preset.color, bgColor: preset.bg } : c));
  }

  function addCard() {
    const preset = COLOR_PRESETS[cards.length % COLOR_PRESETS.length];
    setCards((prev) => [...prev, { id: generateId(), title: "", value: "", change: 0, changeLabel: "", icon: "BarChart2", color: preset.color, bgColor: preset.bg }]);
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    updateKPIGroupLabel(groupId, label);
    updateKPIGroupCards(groupId, cards);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="KPI 그룹 편집" size="xl">
      <div className="mb-5">
        <label className="mb-1 block text-xs font-semibold text-slate-600">퍼널 분류명</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" placeholder="예: 강의 유입 퍼널" />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">KPI 지수 목록</span>
        <span className="text-[10px] text-slate-400">총 {cards.length}개</span>
      </div>

      <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
        {cards.map((card, i) => (
          <div key={card.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">KPI #{i + 1}</span>
              <button onClick={() => removeCard(i)} className="text-slate-300 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className={labelCls}>지수명</label>
                <input value={card.title} onChange={(e) => updateCard(i, "title", e.target.value)} className={inputCls} placeholder="예: 광고 유입 CPA" />
              </div>

              {/* CPA cards: value auto-calculated; others: manual */}
              {!card.cpaData && (
                <div>
                  <label className={labelCls}>현재 값</label>
                  <input value={card.value} onChange={(e) => updateCard(i, "value", e.target.value)} className={inputCls} placeholder="예: 324명" />
                </div>
              )}
              {card.cpaData && (
                <div>
                  <label className={labelCls}>현재 CPA (자동산출)</label>
                  <input readOnly value={card.value} className="w-full rounded border border-slate-100 bg-slate-100 px-2 py-1.5 text-xs text-slate-500 cursor-default outline-none" />
                </div>
              )}

              <div>
                <label className={labelCls}>목표 값</label>
                <input value={card.target ?? ""} onChange={(e) => updateCard(i, "target", e.target.value)} className={inputCls} placeholder="예: ₩1,200/명" />
              </div>

              <div>
                <label className={labelCls}>달성률 (%) · 자동계산</label>
                <input type="number" readOnly value={card.achievement ?? 0} className="w-full rounded border border-slate-100 bg-slate-100 px-2 py-1.5 text-xs text-slate-500 cursor-default outline-none" />
              </div>

              <div>
                <label className={labelCls}>변화율 (%)</label>
                <input type="number" value={card.change} onChange={(e) => updateCard(i, "change", Number(e.target.value))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>변화 레이블</label>
                <input value={card.changeLabel} onChange={(e) => updateCard(i, "changeLabel", e.target.value)} className={inputCls} placeholder="예: 전기 대비" />
              </div>

              <div>
                <label className={labelCls}>아이콘</label>
                <select value={card.icon} onChange={(e) => updateCard(i, "icon", e.target.value)} className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400">
                  {ICON_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="mb-1.5 block text-[10px] text-slate-500">색상</label>
                <div className="flex gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button key={preset.color} onClick={() => setCardColor(i, preset)} className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: preset.color, borderColor: card.color === preset.color ? "#1e293b" : "transparent" }} />
                  ))}
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id={`lower-is-better-${i}`}
                  checked={card.lowerIsBetter ?? false}
                  onChange={(e) => updateCard(i, "lowerIsBetter", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-amber-500"
                />
                <label htmlFor={`lower-is-better-${i}`} className="text-[10px] text-slate-500 cursor-pointer select-none">
                  낮을수록 좋은 지표 (CPA, 이탈률, 전환 단가 등)
                </label>
              </div>
            </div>

            {/* Type-specific sections */}
            {card.cpaData !== undefined && <CPAEditSection card={card} index={i} updateCard={updateCard} />}
            {card.abTestData !== undefined && <ABTestEditSection card={card} index={i} updateCard={updateCard} />}
            {card.mediaBreakdown !== undefined && !card.cpaData && <MediaOnlyEditSection card={card} index={i} updateCard={updateCard} />}
          </div>
        ))}
      </div>

      <button onClick={addCard} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600">
        <Plus size={13} /> KPI 지수 추가
      </button>

      <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button variant="secondary" onClick={onClose}>취소</Button>
        <Button onClick={handleSave}>저장</Button>
      </div>
    </Modal>
  );
}

const GROUP_COLORS: Record<string, { dot: string; badge: string; text: string }> = {
  "group-inflow":  { dot: "#3B82F6", badge: "bg-blue-50 text-blue-600",   text: "text-blue-600" },
  "group-lecture": { dot: "#10B981", badge: "bg-emerald-50 text-emerald-600", text: "text-emerald-600" },
  "group-paid":    { dot: "#F59E0B", badge: "bg-amber-50 text-amber-600",  text: "text-amber-600" },
};

export default function KPICards() {
  const { kpiGroups } = useDashboard();
  const [editGroupId, setEditGroupId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {kpiGroups.map((group, gi) => {
        const style = GROUP_COLORS[group.id] ?? { dot: "#64748B", badge: "bg-slate-100 text-slate-600", text: "text-slate-600" };
        return (
          <div key={group.id}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.dot }} />
                  <span className={`text-xs font-semibold ${style.text}`}>{group.label}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge}`}>{group.cards.length}개 지수</span>
              </div>
              <button onClick={() => setEditGroupId(group.id)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <Pencil size={10} />
                편집
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {group.cards.map((card) => <KPICardItem key={card.id} card={card} />)}
            </div>

            {gi < kpiGroups.length - 1 && (
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 border-t border-dashed border-slate-200" />
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-400">
                  {gi === 0 ? "▼ 강의 진행" : "▼ 유료 전환"}
                </span>
                <div className="flex-1 border-t border-dashed border-slate-200" />
              </div>
            )}
          </div>
        );
      })}

      {editGroupId && (
        <GroupEditModal open={!!editGroupId} onClose={() => setEditGroupId(null)} groupId={editGroupId} />
      )}
    </div>
  );
}
