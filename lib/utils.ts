import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FunnelKPIItem, Bottleneck } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function autoGenerateBottlenecks(kpis: FunnelKPIItem[]): Bottleneck[] {
  const underperforming = kpis.filter((k) => k.achievement < 100);
  if (underperforming.length === 0) return [];

  return underperforming
    .sort((a, b) => a.achievement - b.achievement)
    .map((kpi): Bottleneck => {
      const gap = 100 - kpi.achievement;
      const impact: "high" | "medium" | "low" =
        kpi.achievement < 75 ? "high" : kpi.achievement < 90 ? "medium" : "low";

      const actionDesc: Record<"high" | "medium" | "low", string> = {
        high: "즉각적인 개선 액션이 필요합니다.",
        medium: "지속적인 모니터링과 개선이 필요합니다.",
        low: "목표치에 근접하고 있으며 추가 최적화를 검토해 주세요.",
      };

      return {
        id: `bn-auto-${kpi.label.replace(/\s+/g, "-").toLowerCase()}`,
        stage: kpi.label,
        issue: `목표 대비 ${gap}%p 미달`,
        impact,
        metric: `${kpi.value} (목표: ${kpi.target}) · ${kpi.achievement}% 달성`,
        description: `현재 ${kpi.value} 수준으로 목표 ${kpi.target} 대비 ${kpi.achievement}% 달성 중입니다. ${actionDesc[impact]}`,
      };
    });
}
