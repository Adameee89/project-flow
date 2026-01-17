import { db } from "../db/database";
import { User, Project, Task, AuditLogEntry, TaskStatus, TaskPriority, TaskType } from "../types";
import { getPermissions, canUserChangeStatus, isUserProjectMember, getProjectMembers } from "./permissions";

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

export class APIError extends Error {
  constructor(message: string, public code: number = 400) {
    super(message);
    this.name = "APIError";
  }
}

export const authAPI = {
  async login(email: string, password: string): Promise<User> {
    await delay();
    const user = db.getUserByEmail(email);
    if (!user) throw new APIError("Invalid email or password", 401);
    if (password.length < 1) throw new APIError("Password is required", 401);
    return user;
  },
};

export const usersAPI = {
  async getAll(): Promise<User[]> {
    await delay();
    return db.getUsers();
  },
  async getById(id: string): Promise<User> {
    await delay();
    const user = db.getUserById(id);
    if (!user) throw new APIError("User not found", 404);
    return user;
  },
};

export const projectsAPI = {
  async getAll(userId: string): Promise<Project[]> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    if (user.role === "ADMIN") return db.getProjects();
    return db.getProjectsByUserId(userId);
  },
  async getById(id: string, userId: string): Promise<Project> {
    await delay();
    const project = db.getProjectById(id);
    if (!project) throw new APIError("Project not found", 404);
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    if (user.role !== "ADMIN" && !project.memberIds.includes(userId)) {
      throw new APIError("Access denied", 403);
    }
    return project;
  },
  async create(userId: string, data: { name: string; description: string; memberIds: string[] }): Promise<Project> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    const permissions = getPermissions(user.role);
    if (!permissions.canCreateProject) throw new APIError("Only admins can create projects", 403);
    const project = db.createProject({ ...data, createdBy: userId, labels: [] });
    db.addAuditLog({ userId, action: "CREATE_PROJECT", entity: "PROJECT", entityId: project.id, before: null, after: { name: project.name } });
    return project;
  },
  async delete(projectId: string, userId: string): Promise<void> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    const permissions = getPermissions(user.role);
    if (!permissions.canDeleteProject) throw new APIError("Only admins can delete projects", 403);
    const project = db.getProjectById(projectId);
    if (!project) throw new APIError("Project not found", 404);
    db.addAuditLog({ userId, action: "DELETE_PROJECT", entity: "PROJECT", entityId: projectId, before: { name: project.name }, after: null });
    db.deleteProject(projectId);
  },
  getMembers(projectId: string): User[] {
    return getProjectMembers(projectId);
  },
};

export const tasksAPI = {
  async getByProject(projectId: string, userId: string): Promise<Task[]> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    if (user.role !== "ADMIN" && !isUserProjectMember(userId, projectId)) {
      throw new APIError("Access denied", 403);
    }
    return db.getTasksByProjectId(projectId);
  },
  async getById(taskId: string, userId: string): Promise<Task> {
    await delay();
    const task = db.getTaskById(taskId);
    if (!task) throw new APIError("Task not found", 404);
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    if (user.role !== "ADMIN" && !isUserProjectMember(userId, task.projectId)) {
      throw new APIError("Access denied", 403);
    }
    return task;
  },
  async create(userId: string, data: {
    title: string;
    description: string;
    projectId: string;
    priority?: TaskPriority;
    type?: TaskType;
    assigneeId?: string | null;
    reporterId?: string;
    dueDate?: Date | null;
    storyPoints?: number | null;
    labels?: string[];
  }): Promise<Task> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    if (!isUserProjectMember(userId, data.projectId) && user.role !== "ADMIN") {
      throw new APIError("You must be a project member to create tasks", 403);
    }
    if (data.assigneeId && !isUserProjectMember(data.assigneeId, data.projectId)) {
      throw new APIError("Assignee must be a project member", 400);
    }
    const task = db.createTask({
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      status: "TODO",
      priority: data.priority || "MEDIUM",
      type: data.type || "TASK",
      assigneeId: data.assigneeId || null,
      reporterId: data.reporterId || userId,
      createdBy: userId,
      dueDate: data.dueDate || null,
      storyPoints: data.storyPoints || null,
      labels: data.labels || [],
      parentTaskId: null,
    });
    db.addAuditLog({ userId, action: "CREATE_TASK", entity: "TASK", entityId: task.id, before: null, after: { title: task.title, type: task.type } });
    return task;
  },
  async update(taskId: string, userId: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "assigneeId" | "dueDate" | "storyPoints" | "labels" | "type">>): Promise<Task> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    const task = db.getTaskById(taskId);
    if (!task) throw new APIError("Task not found", 404);
    if (user.role !== "ADMIN" && !isUserProjectMember(userId, task.projectId)) {
      throw new APIError("Access denied", 403);
    }
    if (updates.assigneeId !== undefined && updates.assigneeId !== null) {
      if (!isUserProjectMember(updates.assigneeId, task.projectId)) {
        throw new APIError("Assignee must be a project member", 400);
      }
    }
    const before = { ...task };
    const updatedTask = db.updateTask(taskId, updates);
    if (!updatedTask) throw new APIError("Failed to update task", 500);
    db.addAuditLog({ userId, action: "UPDATE_TASK", entity: "TASK", entityId: taskId, before: { title: before.title }, after: { title: updatedTask.title } });
    return updatedTask;
  },
  async changeStatus(taskId: string, userId: string, newStatus: TaskStatus): Promise<Task> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    const task = db.getTaskById(taskId);
    if (!task) throw new APIError("Task not found", 404);
    if (user.role !== "ADMIN" && !isUserProjectMember(userId, task.projectId)) {
      throw new APIError("Access denied", 403);
    }
    if (!canUserChangeStatus(user, task.status, newStatus)) {
      throw new APIError("Users can only move tasks one step at a time", 400);
    }
    const before = task.status;
    const updatedTask = db.updateTask(taskId, { status: newStatus });
    if (!updatedTask) throw new APIError("Failed to update task", 500);
    db.addAuditLog({ userId, action: "CHANGE_STATUS", entity: "TASK", entityId: taskId, before: { status: before }, after: { status: newStatus } });
    return updatedTask;
  },
  async delete(taskId: string, userId: string): Promise<void> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    const permissions = getPermissions(user.role);
    if (!permissions.canDeleteTask) throw new APIError("Only admins can delete tasks", 403);
    const task = db.getTaskById(taskId);
    if (!task) throw new APIError("Task not found", 404);
    db.addAuditLog({ userId, action: "DELETE_TASK", entity: "TASK", entityId: taskId, before: { title: task.title }, after: null });
    db.deleteTask(taskId);
  },
};

export const auditAPI = {
  async getAll(userId: string): Promise<AuditLogEntry[]> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    const permissions = getPermissions(user.role);
    if (!permissions.canViewAuditLog) throw new APIError("Only admins can view audit logs", 403);
    return db.getAuditLogs();
  },
};

export { getPermissions, canUserChangeStatus, isUserProjectMember, getProjectMembers };
