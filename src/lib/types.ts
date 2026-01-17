export type Role = "ADMIN" | "USER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskType = "BUG" | "FEATURE" | "STORY" | "TASK" | "EPIC" | "SUBTASK";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  createdAt: Date;
  createdBy: string;
  labels: Label[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId: string | null;
  reporterId: string;
  projectId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  storyPoints: number | null;
  labels: string[];
  parentTaskId: string | null;
  subtaskIds: string[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: "TASK" | "PROJECT" | "USER";
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export const PRIORITY_ORDER: TaskPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  BUG: "Bug",
  FEATURE: "Feature",
  STORY: "Story",
  TASK: "Task",
  EPIC: "Epic",
  SUBTASK: "Subtask",
};

export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];

export const DEFAULT_LABELS: Label[] = [
  { id: "label-1", name: "Frontend", color: "#3B82F6" },
  { id: "label-2", name: "Backend", color: "#10B981" },
  { id: "label-3", name: "UI/UX", color: "#8B5CF6" },
  { id: "label-4", name: "Documentation", color: "#F59E0B" },
  { id: "label-5", name: "Testing", color: "#EF4444" },
  { id: "label-6", name: "Infrastructure", color: "#6366F1" },
  { id: "label-7", name: "Security", color: "#EC4899" },
  { id: "label-8", name: "Performance", color: "#14B8A6" },
];
