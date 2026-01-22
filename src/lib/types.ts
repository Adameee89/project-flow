export type Role = "ADMIN" | "USER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskType = "BUG" | "FEATURE" | "STORY" | "TASK" | "EPIC" | "SUBTASK";

export type AuditAction = 
  | "CREATE_PROJECT" | "DELETE_PROJECT" | "UPDATE_PROJECT"
  | "CREATE_TASK" | "UPDATE_TASK" | "DELETE_TASK" | "CHANGE_STATUS" | "DRAG_DROP_TASK"
  | "ROLE_CHANGE" | "ADD_USER_TO_PROJECT" | "REMOVE_USER_FROM_PROJECT"
  | "CREATE_USER" | "DEACTIVATE_USER" | "REACTIVATE_USER";

export type NotificationType = "MENTION" | "COMMENT_ON_ASSIGNED_TASK" | "TASK_ASSIGNED" | "STATUS_CHANGED";

export interface Notification {
  id: string;
  userId: string; // User who receives this notification
  type: NotificationType;
  taskId: string;
  taskTitle: string;
  projectId: string;
  actorId: string; // User who triggered the notification
  actorName: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export type TaskActivityType = 
  | "CREATED" | "STATUS_CHANGED" | "ASSIGNEE_CHANGED" | "PRIORITY_CHANGED" 
  | "COMMENT_ADDED" | "COMMENT_UPDATED" | "COMMENT_DELETED"
  | "DESCRIPTION_CHANGED" | "TITLE_CHANGED" | "DUE_DATE_CHANGED"
  | "LINK_ADDED" | "LINK_REMOVED" | "LABELS_CHANGED";

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  type: TaskActivityType;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  mentions: string[]; // Array of mentioned user IDs
  createdAt: Date;
  updatedAt: Date;
}

export type TaskLinkType = "BLOCKS" | "BLOCKED_BY" | "RELATES_TO" | "DUPLICATES" | "DUPLICATED_BY";

export const TASK_LINK_LABELS: Record<TaskLinkType, string> = {
  BLOCKS: "blocks",
  BLOCKED_BY: "is blocked by",
  RELATES_TO: "relates to",
  DUPLICATES: "duplicates",
  DUPLICATED_BY: "is duplicated by",
};

export interface TaskLink {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  linkType: TaskLinkType;
  createdAt: Date;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export type ProjectTag = "DEVELOPMENT" | "MARKETING" | "DESIGN" | "RESEARCH" | "OPERATIONS" | "SUPPORT" | "INTERNAL" | "CLIENT";

export const PROJECT_TAG_LABELS: Record<ProjectTag, string> = {
  DEVELOPMENT: "Development",
  MARKETING: "Marketing",
  DESIGN: "Design",
  RESEARCH: "Research",
  OPERATIONS: "Operations",
  SUPPORT: "Support",
  INTERNAL: "Internal",
  CLIENT: "Client",
};

export const PROJECT_TAG_COLORS: Record<ProjectTag, string> = {
  DEVELOPMENT: "#3B82F6",
  MARKETING: "#F59E0B",
  DESIGN: "#8B5CF6",
  RESEARCH: "#10B981",
  OPERATIONS: "#6366F1",
  SUPPORT: "#EC4899",
  INTERNAL: "#64748B",
  CLIENT: "#06B6D4",
};

export interface Project {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  createdAt: Date;
  createdBy: string;
  labels: Label[];
  tags: ProjectTag[];
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
  order: number;
  attachments: Attachment[];
  comments: Comment[];
  linkedTaskIds: string[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  entity: "TASK" | "PROJECT" | "USER";
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: Date;
  description?: string;
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