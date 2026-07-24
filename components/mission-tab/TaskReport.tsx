"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { Task } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/FormField";
import { formatDate, generateId, toISODate } from "@/lib/utils";

const EMPTY_FORM: Omit<Task, "id" | "createdAt"> = {
  content: "",
  importanceId: "",
  statusId: "",
  assigneeId: "",
  comment: "",
  startDate: toISODate(new Date()),
  dueDate: toISODate(new Date(Date.now() + 7 * 86400000)),
  funnelId: "",
};

export default function TaskReport() {
  const { tasks, options, addTask, updateTask, deleteTask } = useDashboard();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFunnel, setFilterFunnel] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Task, "id" | "createdAt">>(EMPTY_FORM);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !search || t.content.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || t.statusId === filterStatus;
      const matchFunnel = !filterFunnel || t.funnelId === filterFunnel;
      return matchSearch && matchStatus && matchFunnel;
    });
  }, [tasks, search, filterStatus, filterFunnel]);

  function openAdd() {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      importanceId: options.importance[0]?.id ?? "",
      statusId: options.status[0]?.id ?? "",
      assigneeId: options.assignees[0]?.id ?? "",
      funnelId: options.funnels[0]?.id ?? "",
    });
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditId(task.id);
    setForm({
      content: task.content,
      importanceId: task.importanceId,
      statusId: task.statusId,
      assigneeId: task.assigneeId,
      comment: task.comment,
      startDate: task.startDate,
      dueDate: task.dueDate,
      funnelId: task.funnelId,
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.content.trim()) return;
    if (editId) {
      updateTask(editId, form);
    } else {
      addTask(form);
    }
    setModalOpen(false);
  }

  function getOpt(category: keyof typeof options, id: string) {
    return options[category].find((o) => o.id === id);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="업무 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2A2D45] bg-[#1E2235] py-2 pl-8 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-[#4F8EF7] outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-[#2A2D45] bg-[#1E2235] px-3 py-2 text-xs text-slate-300 outline-none"
        >
          <option value="">전체 상태</option>
          {options.status.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterFunnel}
          onChange={(e) => setFilterFunnel(e.target.value)}
          className="rounded-lg border border-[#2A2D45] bg-[#1E2235] px-3 py-2 text-xs text-slate-300 outline-none"
        >
          <option value="">전체 퍼널</option>
          {options.funnels.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
        <Button onClick={openAdd} size="sm">
          <Plus size={13} /> 업무 추가
        </Button>
      </div>

      {/* Task count */}
      <div className="mb-3 text-xs text-slate-500">
        총 {filtered.length}건 / {tasks.length}건
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#2A2D45]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2D45] bg-[#1A1D2E]">
              {["업무 내용", "중요도", "진행 상태", "담당자", "퍼널", "시작일", "마감일", "액션"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-400"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                  등록된 업무가 없습니다
                </td>
              </tr>
            )}
            {filtered.map((task) => {
              const imp = getOpt("importance", task.importanceId);
              const st = getOpt("status", task.statusId);
              const asgn = getOpt("assignees", task.assigneeId);
              const fn = getOpt("funnels", task.funnelId);
              return (
                <tr
                  key={task.id}
                  className="border-b border-[#2A2D45] bg-[#1E2235] hover:bg-[#252840] transition-colors"
                >
                  <td className="max-w-[240px] px-4 py-3">
                    <div className="truncate font-medium text-slate-200">{task.content}</div>
                    {task.comment && (
                      <div className="mt-0.5 truncate text-xs text-slate-500">{task.comment}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {imp && <Badge label={imp.label} color={imp.color} size="sm" />}
                  </td>
                  <td className="px-4 py-3">
                    {st && <Badge label={st.label} color={st.color} size="sm" />}
                  </td>
                  <td className="px-4 py-3">
                    {asgn && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: asgn.color }}
                        >
                          {asgn.label[0]}
                        </span>
                        <span className="text-xs text-slate-300">{asgn.label}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {fn && <Badge label={fn.label} color={fn.color} size="sm" />}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {formatDate(task.startDate)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(task)}
                        className="rounded p-1.5 text-slate-500 hover:bg-[#363A55] hover:text-[#4F8EF7]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-[#363A55] hover:text-[#EF4444]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "업무 수정" : "업무 추가"}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="업무 내용" className="sm:col-span-2">
            <Input
              placeholder="업무 내용을 입력하세요"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </FormField>

          <FormField label="중요도">
            <Select
              value={form.importanceId}
              onChange={(e) => setForm({ ...form, importanceId: e.target.value })}
            >
              <option value="">선택</option>
              {options.importance.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="진행 상태">
            <Select
              value={form.statusId}
              onChange={(e) => setForm({ ...form, statusId: e.target.value })}
            >
              <option value="">선택</option>
              {options.status.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="담당자">
            <Select
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            >
              <option value="">선택</option>
              {options.assignees.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="퍼널">
            <Select
              value={form.funnelId}
              onChange={(e) => setForm({ ...form, funnelId: e.target.value })}
            >
              <option value="">선택</option>
              {options.funnels.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="시작일">
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </FormField>

          <FormField label="마감일">
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </FormField>

          <FormField label="관련 코멘트" className="sm:col-span-2">
            <Textarea
              rows={3}
              placeholder="관련 코멘트를 입력하세요"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </FormField>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-[#2A2D45] pt-4">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!form.content.trim()}>
            {editId ? "수정 저장" : "업무 추가"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
