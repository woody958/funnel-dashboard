export interface DropdownOption {
  id: string;
  label: string;
  color: string;
}

export interface DashboardOptions {
  importance: DropdownOption[];
  status: DropdownOption[];
  assignees: DropdownOption[];
  funnels: DropdownOption[];
}

export interface Task {
  id: string;
  content: string;
  importanceId: string;
  statusId: string;
  assigneeId: string;
  comment: string;
  startDate: string;
  dueDate: string;
  funnelId: string;
  createdAt: string;
}

export interface KPICard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface Bottleneck {
  id: string;
  stage: string;
  issue: string;
  impact: "high" | "medium" | "low";
  metric: string;
  description: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  relatedStage: string;
}

export type GanttGroupBy = "importance" | "assignee" | "funnel";
