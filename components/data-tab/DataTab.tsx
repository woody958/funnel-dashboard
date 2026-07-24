"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import KPICards from "./KPICards";
import FunnelDetail from "./FunnelDetail";
import { useDashboard } from "@/context/DashboardContext";

const FUNNEL_ICONS = ["📋", "📣", "💬", "🎓", "💰"];

export default function DataTab() {
  const { options, funnelDetails } = useDashboard();
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);

  const funnelOptions = options.funnels;

  const selectedOption = funnelOptions.find((f) => f.id === selectedFunnelId);
  const selectedDetail = funnelDetails.find((d) => d.funnelId === selectedFunnelId);

  return (
    <div className="space-y-6">
      {/* 1. 종합 KPI 요약 */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          종합 KPI 요약
        </h2>
        <KPICards />
      </section>

      {/* 2. 퍼널 단계 선택 */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          퍼널 단계별 상세 보기
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {funnelOptions.map((funnel, idx) => {
            const isSelected = selectedFunnelId === funnel.id;
            const detail = funnelDetails.find((d) => d.funnelId === funnel.id);
            const avgAchievement = detail
              ? Math.round(detail.kpis.reduce((s, k) => s + k.achievement, 0) / detail.kpis.length)
              : 0;
            const achieveColor =
              avgAchievement >= 100 ? "#10B981" : avgAchievement >= 80 ? funnel.color : avgAchievement >= 60 ? "#F59E0B" : "#EF4444";

            return (
              <button
                key={funnel.id}
                onClick={() =>
                  setSelectedFunnelId(isSelected ? null : funnel.id)
                }
                className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? "shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: funnel.color,
                        backgroundColor: `${funnel.color}08`,
                        borderWidth: 2,
                      }
                    : {}
                }
              >
                {/* Step number + icon */}
                <div className="mb-3 flex w-full items-center justify-between">
                  <span className="text-2xl">{FUNNEL_ICONS[idx]}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${achieveColor}18`, color: achieveColor }}
                  >
                    {avgAchievement}%
                  </span>
                </div>

                {/* Step label */}
                <div className="mb-1 text-[10px] font-medium text-slate-400">
                  STEP {idx + 1}
                </div>
                <div
                  className="text-sm font-semibold leading-snug"
                  style={{ color: isSelected ? funnel.color : "#1e293b" }}
                >
                  {funnel.label}
                </div>

                {/* Mini progress bar */}
                <div className="mt-3 h-1 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(avgAchievement, 100)}%`,
                      backgroundColor: achieveColor,
                    }}
                  />
                </div>

                {/* Expand indicator */}
                <ChevronRight
                  size={14}
                  className={`absolute bottom-3 right-3 transition-transform ${
                    isSelected ? "rotate-90" : ""
                  }`}
                  style={{ color: isSelected ? funnel.color : "#CBD5E1" }}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. 퍼널 상세 */}
      {selectedFunnelId && selectedDetail && selectedOption && (
        <section className="rounded-xl border-2 p-6 transition-all" style={{ borderColor: selectedOption.color, backgroundColor: `${selectedOption.color}05` }}>
          {/* Section header */}
          <div className="mb-5 flex items-center gap-3 border-b pb-4" style={{ borderColor: `${selectedOption.color}33` }}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: selectedOption.color }}
            >
              {FUNNEL_ICONS[funnelOptions.findIndex((f) => f.id === selectedFunnelId)]}
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400">
                STEP {funnelOptions.findIndex((f) => f.id === selectedFunnelId) + 1}
              </div>
              <h3 className="text-base font-bold" style={{ color: selectedOption.color }}>
                {selectedOption.label}
              </h3>
            </div>
          </div>

          <FunnelDetail detail={selectedDetail} funnelColor={selectedOption.color} />
        </section>
      )}
    </div>
  );
}
