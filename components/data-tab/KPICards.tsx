"use client";

import {
  Users,
  TrendingUp,
  DollarSign,
  BarChart2,
  UserPlus,
  ShoppingCart,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { kpiCards } from "@/lib/mockData";

const iconMap: Record<string, LucideIcon> = {
  Users,
  TrendingUp,
  DollarSign,
  BarChart2,
  UserPlus,
  ShoppingCart,
};

export default function KPICards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {kpiCards.map((card) => {
        const Icon: LucideIcon = iconMap[card.icon] ?? BarChart2;
        const isPositive = card.change > 0;
        const isNegative = card.change < 0;
        const isGoodNegative = card.id === "kpi-3"; // CAC: lower is better

        return (
          <div
            key={card.id}
            className="rounded-xl border border-[#2A2D45] bg-[#1E2235] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {card.title}
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon size={15} style={{ color: card.color }} />
              </div>
            </div>
            <div className="mb-1 text-xl font-bold text-white">{card.value}</div>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp
                  size={11}
                  className={isGoodNegative ? "text-[#EF4444]" : "text-[#10B981]"}
                />
              ) : isNegative ? (
                <TrendingDown
                  size={11}
                  className={isGoodNegative ? "text-[#10B981]" : "text-[#EF4444]"}
                />
              ) : null}
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    isGoodNegative
                      ? isNegative
                        ? "#10B981"
                        : "#EF4444"
                      : isPositive
                      ? "#10B981"
                      : "#EF4444",
                }}
              >
                {Math.abs(card.change)}%
              </span>
              <span className="text-xs text-slate-500">{card.changeLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
