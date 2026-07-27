"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Task, DashboardOptions, TodoItem, FunnelDetailData, FunnelKPIItem, KPIGroup, KPICard } from "@/lib/types";
import { defaultOptions, mockTasks, initialTodos, funnelDetails as defaultFunnelDetails, defaultKPIGroups } from "@/lib/mockData";
import { generateId, toISODate, autoGenerateBottlenecks } from "@/lib/utils";

export interface ImportSummaryRow {
  groupLabel: string;
  kpiTitle: string;
  value: string;
  change: number;
  changeLabel: string;
}

export interface ImportFunnelRow {
  funnelLabel: string;
  kpiLabel: string;
  value: string;
  target: string;
  change: number;
  changeLabel: string;
}

export interface ImportData {
  kpiSummary?: ImportSummaryRow[];
  funnelKPIs?: ImportFunnelRow[];
}

interface DashboardContextValue {
  options: DashboardOptions;
  tasks: Task[];
  todos: TodoItem[];
  funnelDetails: FunnelDetailData[];
  kpiGroups: KPIGroup[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addOption: (category: keyof DashboardOptions, label: string, color: string) => void;
  updateOption: (category: keyof DashboardOptions, id: string, label: string, color: string) => void;
  deleteOption: (category: keyof DashboardOptions, id: string) => void;
  addTodo: (text: string, priority: TodoItem["priority"], relatedStage: string, funnelId?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateFunnelKPIs: (funnelId: string, kpis: FunnelKPIItem[]) => void;
  updateFunnelSummary: (funnelId: string, summary: string) => void;
  updateKPIGroupLabel: (groupId: string, label: string) => void;
  updateKPIGroupCards: (groupId: string, cards: KPICard[]) => void;
  importData: (data: ImportData) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const LS_TASKS = "fd_tasks_v3";
const LS_OPTIONS = "fd_options_v3";
const LS_TODOS = "fd_todos_v3";
const LS_FUNNEL_DETAILS = "fd_funnel_details_v3";
const LS_KPI_GROUPS = "fd_kpi_groups_v3";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function calcAchievement(value: string, target: string): number {
  const extractNum = (s: string) => {
    const match = s.replace(/,/g, "").match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };
  const v = extractNum(value);
  const t = extractNum(target);
  if (v !== null && t !== null && t !== 0) {
    return Math.round((v / t) * 100);
  }
  return 0;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<DashboardOptions>(defaultOptions);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [funnelDetails, setFunnelDetails] = useState<FunnelDetailData[]>(defaultFunnelDetails);
  const [kpiGroups, setKpiGroups] = useState<KPIGroup[]>(defaultKPIGroups);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOptions(load(LS_OPTIONS, defaultOptions));
    setTasks(load(LS_TASKS, mockTasks));
    setTodos(load(LS_TODOS, initialTodos));
    setFunnelDetails(load(LS_FUNNEL_DETAILS, defaultFunnelDetails));
    setKpiGroups(load(LS_KPI_GROUPS, defaultKPIGroups));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) save(LS_OPTIONS, options); }, [options, hydrated]);
  useEffect(() => { if (hydrated) save(LS_TASKS, tasks); }, [tasks, hydrated]);
  useEffect(() => { if (hydrated) save(LS_TODOS, todos); }, [todos, hydrated]);
  useEffect(() => { if (hydrated) save(LS_FUNNEL_DETAILS, funnelDetails); }, [funnelDetails, hydrated]);
  useEffect(() => { if (hydrated) save(LS_KPI_GROUPS, kpiGroups); }, [kpiGroups, hydrated]);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = { ...task, id: generateId(), createdAt: toISODate(new Date()) };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addOption = useCallback((category: keyof DashboardOptions, label: string, color: string) => {
    const newOpt = { id: generateId(), label, color };
    setOptions((prev) => ({ ...prev, [category]: [...prev[category], newOpt] }));
  }, []);

  const updateOption = useCallback((category: keyof DashboardOptions, id: string, label: string, color: string) => {
    setOptions((prev) => ({
      ...prev,
      [category]: prev[category].map((o) => (o.id === id ? { ...o, label, color } : o)),
    }));
  }, []);

  const deleteOption = useCallback((category: keyof DashboardOptions, id: string) => {
    setOptions((prev) => ({
      ...prev,
      [category]: prev[category].filter((o) => o.id !== id),
    }));
  }, []);

  const addTodo = useCallback((text: string, priority: TodoItem["priority"], relatedStage: string, funnelId?: string) => {
    const newTodo: TodoItem = { id: generateId(), text, completed: false, priority, relatedStage, funnelId };
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // KPI 연동: 퍼널 KPI 업데이트 → 종합 KPI 카드 동기화 + 병목 자동 재생성
  const updateFunnelKPIs = useCallback((funnelId: string, kpis: FunnelKPIItem[]) => {
    const autoBottlenecks = autoGenerateBottlenecks(kpis);

    setFunnelDetails((prev) =>
      prev.map((fd) =>
        fd.funnelId === funnelId ? { ...fd, kpis, bottlenecks: autoBottlenecks } : fd
      )
    );

    // 연동된 KPI 카드 값 동기화
    setKpiGroups((prev) =>
      prev.map((group) => ({
        ...group,
        cards: group.cards.map((card) => {
          if (card.linkedFunnelId !== funnelId || !card.linkedKPILabel) return card;
          const linked = kpis.find((k) => k.label === card.linkedKPILabel);
          if (!linked) return card;
          return { ...card, value: linked.value, change: linked.change, changeLabel: linked.changeLabel };
        }),
      }))
    );
  }, []);

  const updateFunnelSummary = useCallback((funnelId: string, summary: string) => {
    setFunnelDetails((prev) =>
      prev.map((fd) => (fd.funnelId === funnelId ? { ...fd, summary } : fd))
    );
  }, []);

  const updateKPIGroupLabel = useCallback((groupId: string, label: string) => {
    setKpiGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, label } : g))
    );
  }, []);

  // KPI 연동: 종합 KPI 카드 업데이트 → 퍼널 KPI 동기화 + 병목 자동 재생성
  const updateKPIGroupCards = useCallback((groupId: string, cards: KPICard[]) => {
    setKpiGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, cards } : g))
    );

    // 연동된 퍼널 KPI 값 동기화
    const linkedCards = cards.filter((c) => c.linkedFunnelId && c.linkedKPILabel);
    if (linkedCards.length === 0) return;

    setFunnelDetails((prev) =>
      prev.map((fd) => {
        const relatedCards = linkedCards.filter((c) => c.linkedFunnelId === fd.funnelId);
        if (relatedCards.length === 0) return fd;

        const updatedKPIs = fd.kpis.map((kpi) => {
          const matchedCard = relatedCards.find((c) => c.linkedKPILabel === kpi.label);
          if (!matchedCard) return kpi;
          const newKpi = {
            ...kpi,
            value: matchedCard.value,
            change: matchedCard.change,
            changeLabel: matchedCard.changeLabel,
          };
          newKpi.achievement = calcAchievement(matchedCard.value, kpi.target);
          return newKpi;
        });

        return {
          ...fd,
          kpis: updatedKPIs,
          bottlenecks: autoGenerateBottlenecks(updatedKPIs),
        };
      })
    );
  }, []);

  // CSV/Excel 파일 가져오기로 전체 KPI 일괄 업데이트
  const importData = useCallback((data: ImportData) => {
    if (data.kpiSummary && data.kpiSummary.length > 0) {
      setKpiGroups((prev) =>
        prev.map((group) => ({
          ...group,
          cards: group.cards.map((card) => {
            const match = data.kpiSummary!.find(
              (row) =>
                row.groupLabel === group.label && row.kpiTitle === card.title
            );
            if (!match) return card;
            return {
              ...card,
              value: match.value,
              change: match.change,
              changeLabel: match.changeLabel,
            };
          }),
        }))
      );
    }

    if (data.funnelKPIs && data.funnelKPIs.length > 0) {
      setFunnelDetails((prev) =>
        prev.map((fd) => {
          const funnelOption = defaultOptions.funnels.find((f) => f.id === fd.funnelId);
          const funnelLabel = funnelOption?.label ?? fd.funnelId;

          const matchingRows = data.funnelKPIs!.filter(
            (row) => row.funnelLabel === funnelLabel
          );
          if (matchingRows.length === 0) return fd;

          const updatedKPIs = fd.kpis.map((kpi) => {
            const row = matchingRows.find((r) => r.kpiLabel === kpi.label);
            if (!row) return kpi;
            const newKpi = {
              ...kpi,
              value: row.value,
              target: row.target || kpi.target,
              change: row.change,
              changeLabel: row.changeLabel,
            };
            newKpi.achievement = calcAchievement(newKpi.value, newKpi.target);
            return newKpi;
          });

          return {
            ...fd,
            kpis: updatedKPIs,
            bottlenecks: autoGenerateBottlenecks(updatedKPIs),
          };
        })
      );

      // 퍼널 KPI 변경 후 종합 KPI 카드도 동기화
      setKpiGroups((prevGroups) =>
        prevGroups.map((group) => ({
          ...group,
          cards: group.cards.map((card) => {
            if (!card.linkedFunnelId || !card.linkedKPILabel) return card;
            const row = data.funnelKPIs!.find((r) => {
              const funnelOpt = defaultOptions.funnels.find((f) => f.id === card.linkedFunnelId);
              return funnelOpt?.label === r.funnelLabel && r.kpiLabel === card.linkedKPILabel;
            });
            if (!row) return card;
            return {
              ...card,
              value: row.value,
              change: row.change,
              changeLabel: row.changeLabel,
            };
          }),
        }))
      );
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        options,
        tasks,
        todos,
        funnelDetails,
        kpiGroups,
        addTask,
        updateTask,
        deleteTask,
        addOption,
        updateOption,
        deleteOption,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateFunnelKPIs,
        updateFunnelSummary,
        updateKPIGroupLabel,
        updateKPIGroupCards,
        importData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
