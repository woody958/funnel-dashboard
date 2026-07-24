"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User, GripVertical } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { Task } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";

/* ── Draggable card ── */
function KanbanCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) {
  const { options } = useDashboard();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const st = options.status.find((o) => o.id === task.statusId);
  const asgn = options.assignees.find((o) => o.id === task.assigneeId);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="group rounded-lg border border-[#2A2D45] bg-[#0F1117] p-3 cursor-pointer hover:border-[#363A55] hover:shadow-lg"
      onClick={() => onClick(task)}
    >
      <div className="mb-2 flex items-start gap-1">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 shrink-0 cursor-grab text-slate-600 hover:text-slate-400 active:cursor-grabbing"
        >
          <GripVertical size={13} />
        </button>
        <span className="flex-1 text-xs font-medium leading-relaxed text-slate-200">
          {task.content}
        </span>
      </div>

      <div className="ml-4 space-y-1.5">
        {st && <Badge label={st.label} color={st.color} size="sm" />}

        {asgn && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <User size={10} />
            <span
              className="h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: asgn.color }}
            >
              {asgn.label[0]}
            </span>
            {asgn.label}
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar size={10} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Overlay card (while dragging) ── */
function OverlayCard({ task }: { task: Task }) {
  const { options } = useDashboard();
  const st = options.status.find((o) => o.id === task.statusId);
  const asgn = options.assignees.find((o) => o.id === task.assigneeId);

  return (
    <div className="rounded-lg border border-[#4F8EF7]/50 bg-[#0F1117] p-3 shadow-2xl opacity-95 w-52">
      <div className="mb-2 text-xs font-medium text-slate-200 leading-relaxed">
        {task.content}
      </div>
      <div className="space-y-1">
        {st && <Badge label={st.label} color={st.color} size="sm" />}
        {asgn && (
          <div className="text-[11px] text-slate-400">{asgn.label}</div>
        )}
      </div>
    </div>
  );
}

/* ── Column ── */
function KanbanColumn({
  statusId,
  label,
  color,
  tasks,
  onCardClick,
}: {
  statusId: string;
  label: string;
  color: string;
  tasks: Task[];
  onCardClick: (task: Task) => void;
}) {
  return (
    <div className="flex min-w-[220px] flex-1 flex-col rounded-xl border border-[#2A2D45] bg-[#1A1D2E]">
      {/* Column header */}
      <div
        className="flex items-center gap-2 rounded-t-xl border-b border-[#2A2D45] px-4 py-3"
        style={{ borderTopColor: color, borderTopWidth: 3 }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold text-white">{label}</span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${color}22`,
            color,
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards drop area */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
        id={statusId}
      >
        <div className="flex flex-col gap-2 p-3 flex-1 min-h-[120px]">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

/* ── Detail Modal ── */
function DetailModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
}) {
  const { options } = useDashboard();
  const [form, setForm] = useState<Partial<Task>>(task ?? {});

  useEffect(() => {
    if (task) setForm({ ...task });
  }, [task?.id]);

  if (!task) return null;

  const handleSave = () => {
    onSave(task.id, form);
    onClose();
  };

  return (
    <Modal open={!!task} onClose={onClose} title="업무 상세" size="lg">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="업무 내용" className="sm:col-span-2">
          <Input
            value={form.content ?? ""}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </FormField>

        <FormField label="중요도">
          <Select
            value={form.importanceId ?? ""}
            onChange={(e) => setForm({ ...form, importanceId: e.target.value })}
          >
            {options.importance.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="진행 상태">
          <Select
            value={form.statusId ?? ""}
            onChange={(e) => setForm({ ...form, statusId: e.target.value })}
          >
            {options.status.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="담당자">
          <Select
            value={form.assigneeId ?? ""}
            onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
          >
            {options.assignees.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="퍼널">
          <Select
            value={form.funnelId ?? ""}
            onChange={(e) => setForm({ ...form, funnelId: e.target.value })}
          >
            {options.funnels.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="시작일">
          <Input
            type="date"
            value={form.startDate ?? ""}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </FormField>

        <FormField label="마감일">
          <Input
            type="date"
            value={form.dueDate ?? ""}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </FormField>

        <FormField label="관련 코멘트" className="sm:col-span-2">
          <Textarea
            rows={3}
            value={form.comment ?? ""}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </FormField>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-[#2A2D45] pt-4">
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
        <Button onClick={handleSave}>변경사항 저장</Button>
      </div>
    </Modal>
  );
}

/* ── Main Board ── */
export default function KanbanBoard() {
  const { tasks, options, updateTask } = useDashboard();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  // Map statusId → column tasks
  const columns = options.status.map((st) => ({
    statusId: st.id,
    label: st.label,
    color: st.color,
    tasks: tasks.filter((t) => t.statusId === st.id),
  }));

  function findColumnByTaskId(taskId: string): string | null {
    for (const col of columns) {
      if (col.tasks.some((t) => t.id === taskId)) return col.statusId;
    }
    return null;
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeTaskId = String(active.id);
    const overId = String(over.id);

    const fromCol = findColumnByTaskId(activeTaskId);
    // over could be a column id or a task id
    const toCol =
      options.status.some((s) => s.id === overId)
        ? overId
        : findColumnByTaskId(overId);

    if (fromCol && toCol && fromCol !== toCol) {
      updateTask(activeTaskId, { statusId: toCol });
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {columns.map((col) => (
            <KanbanColumn
              key={col.statusId}
              {...col}
              onCardClick={(task) => setDetailTask(task)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <OverlayCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <DetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onSave={(id, updates) => {
          updateTask(id, updates);
          setDetailTask(null);
        }}
      />
    </div>
  );
}
