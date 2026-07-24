"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { GanttGroupBy } from "@/lib/types";

const DAY_W = 28;
const ROW_H = 36;
const LABEL_W = 200;
const DAYS_BEFORE = 30;
const DAYS_AFTER = 90;
const TOTAL_DAYS = DAYS_BEFORE + DAYS_AFTER;

function isoToDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const GROUP_OPTIONS: { value: GanttGroupBy; label: string }[] = [
  { value: "importance", label: "업무 중요도별" },
  { value: "assignee", label: "담당자별" },
  { value: "funnel", label: "퍼널별" },
];

export default function GanttChart() {
  const { tasks, options } = useDashboard();
  const [groupBy, setGroupBy] = useState<GanttGroupBy>("importance");
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const timelineStart = useMemo(() => addDays(today, -DAYS_BEFORE), [today]);
  const timelineEnd = useMemo(() => addDays(today, DAYS_AFTER), [today]);

  // Build month headers
  const monthHeaders = useMemo(() => {
    const headers: { label: string; days: number }[] = [];
    let cur = new Date(timelineStart);
    while (cur <= timelineEnd) {
      const year = cur.getFullYear();
      const month = cur.getMonth();
      let count = 0;
      while (cur <= timelineEnd && cur.getMonth() === month) {
        count++;
        cur = addDays(cur, 1);
      }
      headers.push({ label: `${year}년 ${MONTH_NAMES[month]}`, days: count });
    }
    return headers;
  }, [timelineStart, timelineEnd]);

  // Build day labels (for every 7th day)
  const dayLabels = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS + 1 }, (_, i) => {
      const d = addDays(timelineStart, i);
      return { date: d, day: d.getDate(), show: i % 7 === 0 };
    });
  }, [timelineStart]);

  const todayOffset = daysBetween(timelineStart, today);

  // Group tasks
  const groups = useMemo(() => {
    const categoryList =
      groupBy === "importance"
        ? options.importance
        : groupBy === "assignee"
        ? options.assignees
        : options.funnels;

    return categoryList.map((opt) => {
      const groupTasks = tasks.filter((t) => {
        if (groupBy === "importance") return t.importanceId === opt.id;
        if (groupBy === "assignee") return t.assigneeId === opt.id;
        return t.funnelId === opt.id;
      });
      return { opt, tasks: groupTasks };
    }).filter((g) => g.tasks.length > 0);
  }, [tasks, options, groupBy]);

  function getBarStyle(task: { startDate: string; dueDate: string }) {
    const start = isoToDate(task.startDate);
    const end = isoToDate(task.dueDate);
    const startOff = Math.max(0, daysBetween(timelineStart, start));
    const endOff = Math.min(TOTAL_DAYS, daysBetween(timelineStart, end) + 1);
    const width = Math.max(1, endOff - startOff) * DAY_W;
    const left = startOff * DAY_W;
    return { left, width };
  }

  const totalWidth = (TOTAL_DAYS + 1) * DAY_W;

  return (
    <div>
      {/* Group filter */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-slate-400">그룹핑 기준:</span>
        {GROUP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setGroupBy(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              groupBy === opt.value
                ? "bg-[#4F8EF7] text-white"
                : "border border-[#2A2D45] bg-[#1E2235] text-slate-400 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Gantt Container */}
      <div className="rounded-xl border border-[#2A2D45] overflow-hidden">
        {/* Sticky header area */}
        <div className="flex border-b border-[#2A2D45] bg-[#1A1D2E]">
          {/* Fixed label column header */}
          <div
            className="shrink-0 border-r border-[#2A2D45] px-3 py-2 text-xs font-semibold text-slate-400"
            style={{ width: LABEL_W }}
          >
            업무명
          </div>
          {/* Timeline header - scrollable mirror */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={scrollRef}
              className="overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <div style={{ width: totalWidth }}>
                {/* Month row */}
                <div className="flex border-b border-[#2A2D45]">
                  {monthHeaders.map((m, i) => (
                    <div
                      key={i}
                      className="border-r border-[#2A2D45] px-2 py-1.5 text-[11px] font-semibold text-slate-300"
                      style={{ width: m.days * DAY_W, minWidth: m.days * DAY_W }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
                {/* Day row */}
                <div className="flex">
                  {dayLabels.map((dl, i) => {
                    const isToday = dateKey(dl.date) === dateKey(today);
                    return (
                      <div
                        key={i}
                        className={`border-r border-[#2A2D45]/40 px-0.5 py-1 text-center text-[10px] ${
                          isToday
                            ? "bg-[#4F8EF7]/20 font-bold text-[#4F8EF7]"
                            : "text-slate-600"
                        }`}
                        style={{ width: DAY_W, minWidth: DAY_W }}
                      >
                        {dl.show ? dl.day : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[500px] overflow-y-auto">
          {groups.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-500">
              표시할 업무가 없습니다
            </div>
          )}
          {groups.map(({ opt, tasks: groupTasks }) => (
            <div key={opt.id}>
              {/* Group header */}
              <div
                className="flex items-center gap-2 border-b border-[#2A2D45] px-3 py-2"
                style={{ backgroundColor: `${opt.color}11` }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: opt.color }}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-slate-500">
                  ({groupTasks.length}건)
                </span>
              </div>

              {/* Task rows */}
              {groupTasks.map((task) => {
                const impOpt = options.importance.find(
                  (o) => o.id === task.importanceId
                );
                const { left, width } = getBarStyle(task);
                return (
                  <div
                    key={task.id}
                    className="flex items-center border-b border-[#2A2D45]/50 hover:bg-[#252840]/40"
                    style={{ height: ROW_H }}
                  >
                    {/* Task label */}
                    <div
                      className="shrink-0 border-r border-[#2A2D45] px-3"
                      style={{ width: LABEL_W }}
                    >
                      <div className="truncate text-xs text-slate-300">
                        {task.content}
                      </div>
                    </div>

                    {/* Bar area */}
                    <div className="relative flex-1 overflow-x-auto" style={{ height: ROW_H }}>
                      <div
                        className="relative"
                        style={{ width: totalWidth, height: ROW_H }}
                      >
                        {/* Today vertical line */}
                        <div
                          className="absolute top-0 bottom-0 w-px bg-[#4F8EF7]/60 z-10"
                          style={{ left: todayOffset * DAY_W }}
                        />
                        {/* Task bar */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 rounded flex items-center px-1.5 overflow-hidden"
                          style={{
                            left,
                            width: Math.max(width, DAY_W),
                            height: 22,
                            backgroundColor: `${impOpt?.color ?? "#4F8EF7"}33`,
                            border: `1px solid ${impOpt?.color ?? "#4F8EF7"}66`,
                          }}
                        >
                          <span
                            className="truncate text-[10px] font-medium"
                            style={{ color: impOpt?.color ?? "#4F8EF7" }}
                          >
                            {task.content}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Today legend */}
        <div className="flex items-center gap-2 border-t border-[#2A2D45] bg-[#1A1D2E] px-4 py-2">
          <div className="h-3 w-px bg-[#4F8EF7]" />
          <span className="text-[11px] text-slate-500">
            오늘 ({today.getFullYear()}.{String(today.getMonth() + 1).padStart(2, "0")}.{String(today.getDate()).padStart(2, "0")})
          </span>
        </div>
      </div>
    </div>
  );
}
