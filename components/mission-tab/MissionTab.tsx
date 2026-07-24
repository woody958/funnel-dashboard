"use client";

import { useState } from "react";
import { FileText, LayoutList, Trello, type LucideIcon } from "lucide-react";
import TaskReport from "./TaskReport";
import GanttChart from "./GanttChart";
import KanbanBoard from "./KanbanBoard";

type SubTab = "report" | "gantt" | "kanban";

const TABS: { id: SubTab; label: string; Icon: LucideIcon }[] = [
  { id: "report", label: "업무 리포트", Icon: FileText },
  { id: "gantt", label: "Gantt Chart", Icon: LayoutList },
  { id: "kanban", label: "Kanban Board", Icon: Trello },
];

export default function MissionTab() {
  const [active, setActive] = useState<SubTab>("report");

  return (
    <div>
      {/* Sub-tab nav */}
      <div className="mb-5 flex gap-1 rounded-xl border border-[#2A2D45] bg-[#1A1D2E] p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              active === id
                ? "bg-[#4F8EF7] text-white shadow"
                : "text-slate-400 hover:bg-[#252840] hover:text-white"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      <div>
        {active === "report" && <TaskReport />}
        {active === "gantt" && <GanttChart />}
        {active === "kanban" && <KanbanBoard />}
      </div>
    </div>
  );
}
