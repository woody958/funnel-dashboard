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
import { generateId, toISODate } from "@/lib/utils";

interface DashboardContextValue {
  options: DashboardOptions;
  tasks: Task[];
  todos: TodoItem[];
  funnelDetails: FunnelDetailData[];
  kpiGroups: KPIGroup[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addOption: (
    category: keyof DashboardOptions,
    label: string,
    color: string
  ) => void;
  updateOption: (
    category: keyof DashboardOptions,
    id: string,
    label: string,
    color: string
  ) => void;
  deleteOption: (category: keyof DashboardOptions, id: string) => void;
  addTodo: (text: string, priority: TodoItem["priority"], relatedStage: string, funnelId?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateFunnelKPIs: (funnelId: string, kpis: FunnelKPIItem[]) => void;
  updateFunnelSummary: (funnelId: string, summary: string) => void;
  updateKPIGroupLabel: (groupId: string, label: string) => void;
  updateKPIGroupCards: (groupId: string, cards: KPICard[]) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const LS_TASKS = "fd_tasks_v3";
const LS_OPTIONS = "fd_options_v3";
const LS_TODOS = "fd_todos_v2";
const LS_FUNNEL_DETAILS = "fd_funnel_details_v2";
const LS_KPI_GROUPS = "fd_kpi_groups_v2";

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

  useEffect(() => {
    if (hydrated) save(LS_OPTIONS, options);
  }, [options, hydrated]);

  useEffect(() => {
    if (hydrated) save(LS_TASKS, tasks);
  }, [tasks, hydrated]);

  useEffect(() => {
    if (hydrated) save(LS_TODOS, todos);
  }, [todos, hydrated]);

  useEffect(() => {
    if (hydrated) save(LS_FUNNEL_DETAILS, funnelDetails);
  }, [funnelDetails, hydrated]);

  useEffect(() => {
    if (hydrated) save(LS_KPI_GROUPS, kpiGroups);
  }, [kpiGroups, hydrated]);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: toISODate(new Date()),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addOption = useCallback(
    (category: keyof DashboardOptions, label: string, color: string) => {
      const newOpt = { id: generateId(), label, color };
      setOptions((prev) => ({
        ...prev,
        [category]: [...prev[category], newOpt],
      }));
    },
    []
  );

  const updateOption = useCallback(
    (
      category: keyof DashboardOptions,
      id: string,
      label: string,
      color: string
    ) => {
      setOptions((prev) => ({
        ...prev,
        [category]: prev[category].map((o) =>
          o.id === id ? { ...o, label, color } : o
        ),
      }));
    },
    []
  );

  const deleteOption = useCallback(
    (category: keyof DashboardOptions, id: string) => {
      setOptions((prev) => ({
        ...prev,
        [category]: prev[category].filter((o) => o.id !== id),
      }));
    },
    []
  );

  const addTodo = useCallback(
    (text: string, priority: TodoItem["priority"], relatedStage: string, funnelId?: string) => {
      const newTodo: TodoItem = {
        id: generateId(),
        text,
        completed: false,
        priority,
        relatedStage,
        funnelId,
      };
      setTodos((prev) => [...prev, newTodo]);
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateFunnelKPIs = useCallback((funnelId: string, kpis: FunnelKPIItem[]) => {
    setFunnelDetails((prev) =>
      prev.map((fd) => fd.funnelId === funnelId ? { ...fd, kpis } : fd)
    );
  }, []);

  const updateFunnelSummary = useCallback((funnelId: string, summary: string) => {
    setFunnelDetails((prev) =>
      prev.map((fd) => fd.funnelId === funnelId ? { ...fd, summary } : fd)
    );
  }, []);

  const updateKPIGroupLabel = useCallback((groupId: string, label: string) => {
    setKpiGroups((prev) =>
      prev.map((g) => g.id === groupId ? { ...g, label } : g)
    );
  }, []);

  const updateKPIGroupCards = useCallback((groupId: string, cards: KPICard[]) => {
    setKpiGroups((prev) =>
      prev.map((g) => g.id === groupId ? { ...g, cards } : g)
    );
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
