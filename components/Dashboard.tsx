"use client";

import { useState } from "react";
import { BarChart3, Target, Settings, Activity } from "lucide-react";
import DataTab from "@/components/data-tab/DataTab";
import MissionTab from "@/components/mission-tab/MissionTab";
import SettingsModal from "@/components/SettingsModal";
import { useDashboard } from "@/context/DashboardContext";

type MainTab = "data" | "mission";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<MainTab>("data");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { tasks } = useDashboard();

  const inProgress = tasks.filter(
    (t) => t.statusId === "st-inprog"
  ).length;

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#2A2D45] bg-[#0F1117]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F8EF7]/20">
                <Activity size={16} className="text-[#4F8EF7]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">
                  퍼널 미션 대시보드
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">
                    진행중 업무{" "}
                    <span className="font-semibold text-[#4F8EF7]">
                      {inProgress}건
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main tab switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-[#2A2D45] bg-[#1A1D2E] p-1">
              <button
                onClick={() => setActiveTab("data")}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "data"
                    ? "bg-[#4F8EF7] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart3 size={14} />
                데이터 탭
              </button>
              <button
                onClick={() => setActiveTab("mission")}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "mission"
                    ? "bg-[#4F8EF7] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Target size={14} />
                미션 탭
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2D45] bg-[#1E2235] text-slate-400 hover:border-[#4F8EF7] hover:text-[#4F8EF7]"
              title="드롭다운 옵션 관리"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        {activeTab === "data" && <DataTab />}
        {activeTab === "mission" && <MissionTab />}
      </main>

      {/* Settings modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
