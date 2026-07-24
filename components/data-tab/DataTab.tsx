"use client";

import KPICards from "./KPICards";
import FunnelChart from "./FunnelChart";
import BottleneckAnalysis from "./BottleneckAnalysis";
import TodoList from "./TodoList";

export default function DataTab() {
  return (
    <div className="space-y-5">
      {/* Top: KPI summary cards */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          종합 KPI 요약
        </h2>
        <KPICards />
      </section>

      {/* Middle: Funnel chart */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          퍼널별 상세 현황
        </h2>
        <FunnelChart />
      </section>

      {/* Bottom: Bottleneck + Todo */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          병목 분석 & 개선 액션
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BottleneckAnalysis />
          <TodoList />
        </div>
      </section>
    </div>
  );
}
