"use client";

import { Users, TrendingUp, DollarSign, BarChart2, Target, Star, TrendingDown, type LucideIcon } from "lucide-react";
import { kpiCards } from "@/lib/mockData";

const iconMap: Record<string, LucideIcon> = { Users, TrendingUp, DollarSign, BarChart2, Target, Star };

export default function KPICards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpiCards.map((card) => {
        const Icon: LucideIcon = iconMap[card.icon] ?? BarChart2;
        const isPositive = card.change > 0;
        const isNegative = card.change < 0;
        const isGoodNegative = false;

        return (
          <div key={card.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{card.title}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: card.bgColor }}>
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
      })}
    </div>
  );
}
