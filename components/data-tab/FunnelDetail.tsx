"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, TrendingUp, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import type { FunnelDetailData } from "@/lib/types";
import { useDashboard } from "@/context/DashboardContext";

const impactConfig = {
  high: { label: "높음", color: "#EF4444", bg: "#FEF2F2", Icon: AlertTriangle },
  medium: { label: "중간", color: "#F59E0B", bg: "#FFFBEB", Icon: AlertCircle },
  low: { label: "낮음", color: "#10B981", bg: "#F0FDF4", Icon: Info },
};

const priorityConfig = {
  high: { label: "높음", color: "#EF4444" },
  medium: { label: "중간", color: "#F59E0B" },
  low: { label: "낮음", color: "#10B981" },
};

function AchievementBar({ value, color }: { value: number; color: string }) {
  const clamped = Math.min(value, 100);
  const barColor = value >= 100 ? "#10B981" : value >= 80 ? color : value >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${clamped}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

export default function FunnelDetail({ detail, funnelColor }: { detail: FunnelDetailData; funnelColor: string }) {
  const { todos: globalTodos, addTodo, toggleTodo, deleteTodo } = useDashboard();
  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  // Use todos from global context filtered by funnelId
  const todos = globalTodos.filter((t) => t.funnelId === detail.funnelId);

  const handleAdd = () => {
    if (!inputText.trim()) return;
    addTodo(inputText.trim(), priority, detail.funnelId, detail.funnelId);
    setInputText("");
  };

  const completed = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-5 animate-in">
      {/* Summary */}
      <p className="text-sm text-slate-500 leading-relaxed">{detail.summary}</p>

      {/* KPI cards */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">KPI 달성 현황</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {detail.kpis.map((kpi, i) => {
            const achieveColor = kpi.achievement >= 100 ? "#10B981" : kpi.achievement >= 80 ? funnelColor : kpi.achievement >= 60 ? "#F59E0B" : "#EF4444";
            return (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
                <div className="text-lg font-bold text-slate-900">{kpi.value}</div>
                <div className="text-[11px] text-slate-400 mb-1">목표: {kpi.target}</div>
                <AchievementBar value={kpi.achievement} color={funnelColor} />
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: achieveColor }}>
                    {kpi.achievement}%
                  </span>
                  {kpi.changeLabel && (
                    <span className={`text-[10px] ${kpi.change >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                      {kpi.change >= 0 ? "▲" : "▼"} {Math.abs(kpi.change)}{kpi.changeLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottleneck + Todo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bottleneck */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <h4 className="text-sm font-semibold text-slate-800">병목 현상 분석</h4>
          </div>
          <div className="space-y-3">
            {detail.bottlenecks.map((bn) => {
              const { label, color, bg, Icon } = impactConfig[bn.impact];
              return (
                <div key={bn.id} className="rounded-lg border p-3" style={{ borderColor: `${color}33`, backgroundColor: bg }}>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">{bn.stage}</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}>
                          {label}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs font-semibold" style={{ color }}>{bn.metric}</div>
                    </div>
                    <Icon size={14} style={{ color }} className="mt-0.5 shrink-0" />
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">{bn.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Todo */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">개선 To-Do</h4>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-500">
              {completed}/{todos.length} 완료
            </span>
          </div>

          {/* Progress */}
          <div className="mb-3 h-1.5 w-full rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: todos.length ? `${(completed / todos.length) * 100}%` : "0%" }} />
          </div>

          {/* Add form */}
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-2">
            <input type="text" placeholder="새 개선 항목..."
              value={inputText} onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none" />
            <div className="flex items-center gap-2">
              <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none">
                <option value="high">높음</option>
                <option value="medium">중간</option>
                <option value="low">낮음</option>
              </select>
              <button onClick={handleAdd} disabled={!inputText.trim()}
                className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40">
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 space-y-1 overflow-y-auto">
            {todos.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">등록된 항목이 없습니다</div>
            )}
            {todos.map((todo) => {
              const { color } = priorityConfig[todo.priority];
              return (
                <div key={todo.id} className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  <button onClick={() => toggleTodo(todo.id)} className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-500">
                    {todo.completed ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Circle size={15} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs leading-relaxed ${todo.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                      {todo.text}
                    </div>
                    {todo.relatedStage && (
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[10px] text-slate-400">{todo.relatedStage}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteTodo(todo.id)}
                    className="mt-0.5 shrink-0 text-slate-200 opacity-0 hover:text-red-400 group-hover:opacity-100">
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
