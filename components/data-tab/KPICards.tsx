"use client";

import { useState, useEffect } from "react";
import {
  Users, TrendingUp, DollarSign, BarChart2, Target, Star,
  TrendingDown, Pencil, Plus, Trash2, type LucideIcon,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { KPICard } from "@/lib/types";
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

function KPICardItem({ card }: { card: KPICard }) {
  const Icon: LucideIcon = iconMap[card.icon] ?? BarChart2;
  const isPositive = card.change > 0;
  const isNegative = card.change < 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 leading-snug">{card.title}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: card.bgColor }}>
          <Icon size={15} style={{ color: card.color }} />
        </div>
      </div>
      <div className="mb-1 text-xl font-bold text-slate-900">{card.value}</div>
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp size={11} className="text-emerald-500" />
        ) : isNegative ? (
          <TrendingDown size={11} className="text-red-400" />
        ) : null}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-500" : isNegative ? "text-red-400" : "text-slate-400"}`}>
          {Math.abs(card.change)}%
        </span>
        <span className="text-xs text-slate-400">{card.changeLabel}</span>
      </div>
    </div>
  );
}

function GroupEditModal({
  open,
  onClose,
  groupId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
}) {
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

  function updateCard(index: number, field: keyof KPICard, val: string | number) {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: val } : c))
    );
  }

  function setCardColor(index: number, preset: { color: string; bg: string }) {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, color: preset.color, bgColor: preset.bg } : c))
    );
  }

  function addCard() {
    const preset = COLOR_PRESETS[cards.length % COLOR_PRESETS.length];
    setCards((prev) => [
      ...prev,
      {
        id: generateId(),
        title: "",
        value: "",
        change: 0,
        changeLabel: "",
        icon: "BarChart2",
        color: preset.color,
        bgColor: preset.bg,
      },
    ]);
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
      {/* Group label */}
      <div className="mb-5">
        <label className="mb-1 block text-xs font-semibold text-slate-600">퍼널 분류명</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          placeholder="예: 무료 강의 퍼널"
        />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">KPI 지수 목록</span>
        <span className="text-[10px] text-slate-400">총 {cards.length}개</span>
      </div>

      <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
        {cards.map((card, i) => (
          <div key={card.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">KPI #{i + 1}</span>
              <button
                onClick={() => removeCard(i)}
                className="text-slate-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 지수명 */}
              <div className="col-span-2">
                <label className="mb-0.5 block text-[10px] text-slate-500">지수명</label>
                <input
                  value={card.title}
                  onChange={(e) => updateCard(i, "title", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="예: 총 무료 강의 신청자"
                />
              </div>

              {/* 현재 값 */}
              <div>
                <label className="mb-0.5 block text-[10px] text-slate-500">현재 값</label>
                <input
                  value={card.value}
                  onChange={(e) => updateCard(i, "value", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="예: 324명"
                />
              </div>

              {/* 변화율 */}
              <div>
                <label className="mb-0.5 block text-[10px] text-slate-500">변화율 (%)</label>
                <input
                  type="number"
                  value={card.change}
                  onChange={(e) => updateCard(i, "change", Number(e.target.value))}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* 변화 레이블 */}
              <div>
                <label className="mb-0.5 block text-[10px] text-slate-500">변화 레이블</label>
                <input
                  value={card.changeLabel}
                  onChange={(e) => updateCard(i, "changeLabel", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="예: 전기 대비"
                />
              </div>

              {/* 아이콘 */}
              <div>
                <label className="mb-0.5 block text-[10px] text-slate-500">아이콘</label>
                <select
                  value={card.icon}
                  onChange={(e) => updateCard(i, "icon", e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* 색상 */}
              <div className="col-span-2">
                <label className="mb-1.5 block text-[10px] text-slate-500">색상</label>
                <div className="flex gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => setCardColor(i, preset)}
                      className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: preset.color,
                        borderColor: card.color === preset.color ? "#1e293b" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addCard}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600"
      >
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
            {/* Group header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Funnel flow indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.dot }} />
                  <span className={`text-xs font-semibold ${style.text}`}>{group.label}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge}`}>
                  {group.cards.length}개 지수
                </span>
              </div>
              <button
                onClick={() => setEditGroupId(group.id)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <Pencil size={10} />
                편집
              </button>
            </div>

            {/* Connector line between groups */}
            {gi < kpiGroups.length - 1 && (
              <div className="hidden" />
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {group.cards.map((card) => (
                <KPICardItem key={card.id} card={card} />
              ))}
            </div>

            {/* Divider between groups */}
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
        <GroupEditModal
          open={!!editGroupId}
          onClose={() => setEditGroupId(null)}
          groupId={editGroupId}
        />
      )}
    </div>
  );
}
