"use client";

import { funnelStages } from "@/lib/mockData";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export default function FunnelChart() {
  const max = funnelStages[0].count;

  return (
    <div className="rounded-xl border border-[#2A2D45] bg-[#1E2235] p-5">
      <h3 className="mb-5 text-sm font-semibold text-white">
        퍼널 단계별 현황
      </h3>

      <div className="space-y-2">
        {funnelStages.map((stage, i) => {
          const prev = i > 0 ? funnelStages[i - 1].count : stage.count;
          const convRate = i === 0 ? 100 : ((stage.count / prev) * 100).toFixed(1);
          const dropRate = i === 0 ? 0 : (100 - Number(convRate)).toFixed(1);
          const barWidth = (stage.count / max) * 100;

          return (
            <div key={stage.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-slate-300">{stage.name}</span>
                <div className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-xs text-[#EF4444]">
                      -{dropRate}%
                    </span>
                  )}
                  <span
                    className="text-xs font-semibold"
                    style={{ color: stage.color }}
                  >
                    {fmt(stage.count)}명
                  </span>
                  {i > 0 && (
                    <span className="text-xs text-slate-400">
                      ({convRate}% 전환)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-7 w-full rounded bg-[#0F1117]">
                <div
                  className="flex h-full items-center rounded px-2 transition-all duration-700"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: `${stage.color}33`,
                    borderLeft: `3px solid ${stage.color}`,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: stage.color }}>
                    {fmt(stage.count)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#2A2D45] pt-4">
        <div className="text-center">
          <div className="text-xs text-slate-400">전체 전환율</div>
          <div className="mt-1 text-lg font-bold text-[#10B981]">3.2%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">최대 이탈 구간</div>
          <div className="mt-1 text-sm font-semibold text-[#EF4444]">유입→가입</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-400">월 구매 고객</div>
          <div className="mt-1 text-lg font-bold text-[#4F8EF7]">4,110명</div>
        </div>
      </div>
    </div>
  );
}
