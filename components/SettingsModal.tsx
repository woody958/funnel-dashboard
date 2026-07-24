"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { DashboardOptions, DropdownOption } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormField";

const CATEGORY_LABELS: Record<keyof DashboardOptions, string> = {
  importance: "중요도",
  status: "진행 상태",
  assignees: "담당자",
  funnels: "퍼널",
};

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6",
  "#EC4899", "#6B7280",
];

interface OptionRowProps {
  option: DropdownOption;
  onUpdate: (id: string, label: string, color: string) => void;
  onDelete: (id: string) => void;
}

function OptionRow({ option, onUpdate, onDelete }: OptionRowProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(option.label);
  const [color, setColor] = useState(option.color);

  function save() {
    if (label.trim()) {
      onUpdate(option.id, label.trim(), color);
    }
    setEditing(false);
  }

  function cancel() {
    setLabel(option.label);
    setColor(option.color);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#2A2D45] bg-[#0F1117] p-2.5">
      {editing ? (
        <>
          <div className="relative">
            <div
              className="h-6 w-6 rounded cursor-pointer border border-[#2A2D45] overflow-hidden"
              style={{ backgroundColor: color }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
          <input
            autoFocus
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none"
          />
          <div className="flex gap-1">
            <div className="flex flex-wrap gap-1 max-w-[120px]">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-4 w-4 rounded-full border-2"
                  style={{
                    backgroundColor: c,
                    borderColor: c === color ? "white" : "transparent",
                  }}
                />
              ))}
            </div>
            <button onClick={save} className="rounded p-1 text-[#10B981] hover:bg-[#10B981]/20">
              <Check size={13} />
            </button>
            <button onClick={cancel} className="rounded p-1 text-slate-500 hover:bg-[#252840]">
              <X size={13} />
            </button>
          </div>
        </>
      ) : (
        <>
          <span
            className="h-5 w-5 rounded-full shrink-0"
            style={{ backgroundColor: option.color }}
          />
          <span
            className="flex-1 cursor-pointer text-sm text-slate-200"
            onClick={() => setEditing(true)}
          >
            {option.label}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="rounded px-2 py-0.5 text-[11px] text-slate-500 hover:bg-[#252840] hover:text-slate-300"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(option.id)}
            className="rounded p-1 text-slate-600 hover:bg-[#EF4444]/20 hover:text-[#EF4444]"
          >
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  );
}

interface AddOptionFormProps {
  onAdd: (label: string, color: string) => void;
}

function AddOptionForm({ onAdd }: AddOptionFormProps) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[4]);

  function handleAdd() {
    if (!label.trim()) return;
    onAdd(label.trim(), color);
    setLabel("");
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="relative h-7 w-7 shrink-0">
        <div
          className="h-7 w-7 rounded-full cursor-pointer border-2 border-[#2A2D45]"
          style={{ backgroundColor: color }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
          />
        </div>
      </div>
      <input
        type="text"
        placeholder="새 항목 이름"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="flex-1 rounded-lg border border-[#2A2D45] bg-[#0F1117] px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:border-[#4F8EF7] outline-none"
      />
      <Button size="sm" onClick={handleAdd} disabled={!label.trim()}>
        <Plus size={12} /> 추가
      </Button>
    </div>
  );
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { options, addOption, updateOption, deleteOption } = useDashboard();
  const [activeCategory, setActiveCategory] =
    useState<keyof DashboardOptions>("importance");

  const categories = Object.keys(CATEGORY_LABELS) as (keyof DashboardOptions)[];

  return (
    <Modal open={open} onClose={onClose} title="드롭다운 옵션 관리" size="lg">
      {/* Category tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-[#0F1117] p-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 rounded py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat
                ? "bg-[#4F8EF7] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Options list */}
      <div className="space-y-2">
        {options[activeCategory].length === 0 && (
          <div className="py-6 text-center text-sm text-slate-500">
            등록된 항목이 없습니다
          </div>
        )}
        {options[activeCategory].map((opt) => (
          <OptionRow
            key={opt.id}
            option={opt}
            onUpdate={(id, label, color) =>
              updateOption(activeCategory, id, label, color)
            }
            onDelete={(id) => deleteOption(activeCategory, id)}
          />
        ))}
      </div>

      {/* Add form */}
      <AddOptionForm
        onAdd={(label, color) => addOption(activeCategory, label, color)}
      />

      <div className="mt-5 flex justify-end border-t border-[#2A2D45] pt-4">
        <Button onClick={onClose}>완료</Button>
      </div>
    </Modal>
  );
}
