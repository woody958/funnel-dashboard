"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { TodoItem } from "@/lib/types";

const priorityConfig = {
  high: { label: "높음", color: "#EF4444" },
  medium: { label: "중간", color: "#F59E0B" },
  low: { label: "낮음", color: "#10B981" },
};

export default function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useDashboard();
  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState<TodoItem["priority"]>("medium");
  const [stage, setStage] = useState("");

  const handleAdd = () => {
    if (!inputText.trim()) return;
    addTodo(inputText.trim(), priority, stage.trim() || "일반");
    setInputText("");
    setStage("");
  };

  const completed = todos.filter((t) => t.completed).length;

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#2A2D45] bg-[#1E2235] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          병목 개선 To-Do
        </h3>
        <span className="rounded-full bg-[#4F8EF7]/20 px-2 py-0.5 text-xs text-[#4F8EF7]">
          {completed}/{todos.length} 완료
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full bg-[#0F1117]">
        <div
          className="h-full rounded-full bg-[#10B981] transition-all duration-500"
          style={{
            width: todos.length
              ? `${(completed / todos.length) * 100}%`
              : "0%",
          }}
        />
      </div>

      {/* Add form */}
      <div className="mb-4 space-y-2 rounded-lg border border-[#2A2D45] bg-[#0F1117] p-3">
        <input
          type="text"
          placeholder="새 개선 항목 추가..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
        />
        <div className="flex items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoItem["priority"])}
            className="rounded bg-[#1E2235] px-2 py-1 text-xs text-slate-300 border border-[#2A2D45] outline-none"
          >
            <option value="high">높음</option>
            <option value="medium">중간</option>
            <option value="low">낮음</option>
          </select>
          <input
            type="text"
            placeholder="관련 구간"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="flex-1 rounded bg-[#1E2235] px-2 py-1 text-xs text-slate-300 placeholder-slate-500 border border-[#2A2D45] outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!inputText.trim()}
            className="flex h-6 w-6 items-center justify-center rounded bg-[#4F8EF7] text-white hover:bg-[#3B7DE8] disabled:opacity-40"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Todo items */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {todos.map((todo) => {
          const { color } = priorityConfig[todo.priority];
          return (
            <div
              key={todo.id}
              className="group flex items-start gap-2.5 rounded-lg p-2 hover:bg-[#252840]"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="mt-0.5 shrink-0 text-slate-500 hover:text-[#10B981]"
              >
                {todo.completed ? (
                  <CheckCircle2 size={15} className="text-[#10B981]" />
                ) : (
                  <Circle size={15} />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs leading-relaxed ${
                    todo.completed
                      ? "line-through text-slate-500"
                      : "text-slate-200"
                  }`}
                >
                  {todo.text}
                </div>
                {todo.relatedStage && (
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-slate-500">
                      {todo.relatedStage}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="mt-0.5 shrink-0 text-slate-600 opacity-0 hover:text-[#EF4444] group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
