export type Status = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  activeCount?: number;
  doneCount?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  order: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  project?: { name: string; color: string };
}

export const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: string }> = {
  TODO: { label: "To Do", color: "#6366F1", icon: "○" },
  IN_PROGRESS: { label: "In Progress", color: "#F59E0B", icon: "◐" },
  DONE: { label: "Done", color: "#10B981", icon: "●" },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  HIGH: { label: "높음", color: "#EF4444", bg: "#FEF2F2" },
  MEDIUM: { label: "보통", color: "#F59E0B", bg: "#FFFBEB" },
  LOW: { label: "낮음", color: "#6B7685", bg: "#F3F4F6" },
};

export const COLUMNS: Status[] = ["TODO", "IN_PROGRESS", "DONE"];

export const PROJECT_COLORS = [
  "#6366F1", "#EC4899", "#F59E0B", "#10B981",
  "#3B82F6", "#8B5CF6", "#EF4444", "#14B8A6",
];
