"use client";

import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { bottlenecks } from "@/lib/mockData";

const impactConfig = {
  high: { label: "높음", color: "#EF4444", Icon: AlertTriangle },
  medium: { label: "중간", color: "#F59E0B", Icon: AlertCircle },
  low: { label: "낮음", color: "#10B981", Icon: Info },
};

export default function BottleneckAnalysis() {
  return (
    <div className="rounded-xl border border-[#2A2D45] bg-[#1E2235] p-5">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={15} className="text-[#F59E0B]" />
        <h3 className="text-sm font-semibold text-white">퍼널 병목 현상 분석</h3>
      </div>

      <div className="space-y-3">
        {bottlenecks.map((bn) => {
          const { label, color, Icon } = impactConfig[bn.impact];
          return (
            <div
              key={bn.id}
              className="rounded-lg border border-[#2A2D45] bg-[#0F1117] p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {bn.stage}
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${color}22`,
                        color,
                        border: `1px solid ${color}44`,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <div
                    className="mt-0.5 text-xs font-semibold"
                    style={{ color }}
                  >
                    {bn.metric}
                  </div>
                </div>
                <Icon size={14} style={{ color }} className="mt-0.5 shrink-0" />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {bn.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
