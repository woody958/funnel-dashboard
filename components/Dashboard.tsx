"use client";

import { useState } from "react";
import { BarChart3, Target, Settings, Activity, Save, Check } from "lucide-react";
import DataTab from "@/components/data-tab/DataTab";
import MissionTab from "@/components/mission-tab/MissionTab";
import SettingsModal from "@/components/SettingsModal";
import { useDashboard } from "@/context/DashboardContext";

type MainTab = "data" | "mission";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<MainTab>("data");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const { tasks, saveAll } = useDashboard();

  const inProgress = tasks.filter((t) => t.statusId === "st-inprog").length;

  function handleManualSave() {
    saveAll();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Activity size={16} className="text-blue-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900">
                  퍼널 미션 대시보드
                </span>
                <div className="text-[10px] text-slate-400">
                  진행중 업무{" "}
                  <span className="font-semibold text-blue-500">{inProgress}건</span>
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                onClick={() => setActiveTab("data")}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "data"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BarChart3 size={14} />
                데이터 탭
              </button>
              <button
                onClick={() => setActiveTab("mission")}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "mission"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Target size={14} />
                미션 탭
              </button>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSave}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  savedToast
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-500"
                }`}
                title="현재 데이터 수동 저장"
              >
                {savedToast ? <Check size={13} /> : <Save size={13} />}
                {savedToast ? "저장됨" : "저장"}
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:text-blue-500"
                title="드롭다운 옵션 관리"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        {activeTab === "data" && <DataTab />}
        {activeTab === "mission" && <MissionTab />}
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
