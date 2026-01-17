import { db } from "../db/database";
import { User, Project, Task, AuditLogEntry, TaskStatus, TaskPriority, TaskType, Role, AuditAction } from "../types";
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
    if (!user.isActive) throw new APIError("Account has been deactivated", 401);
    if (password.length < 1) throw new APIError("Password is required", 401);
    return user;
  },
};

export const usersAPI = {
  async getAll(): Promise<User[]> {
    await delay();
    return db.getUsers();
  },
  
  async getActive(): Promise<User[]> {
    await delay();
    return db.getActiveUsers();
  },
  
  async getById(id: string): Promise<User> {
    await delay();
    const user = db.getUserById(id);
    if (!user) throw new APIError("User not found", 404);
    return user;
  },
  
  async create(adminId: string, data: { name: string; email: string; role: Role }): Promise<User> {
    await delay();
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== "ADMIN") throw new APIError("Only admins can create users", 403);
    
    const existing = db.getUserByEmail(data.email);
    if (existing) throw new APIError("User with this email already exists", 400);
    
    const avatarColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
    const user = db.createUser({
      ...data,
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    });
    
    db.addAuditLog({
      userId: adminId,
      action: "CREATE_USER",
      entity: "USER",
      entityId: user.id,
      before: null,
      after: { name: user.name, email: user.email, role: user.role },
      description: `Created user ${user.name} (${user.email}) with role ${user.role}`,
    });
    
    return user;
  },
  
  async changeRole(adminId: string, targetUserId: string, newRole: Role): Promise<User> {
    await delay();
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== "ADMIN") throw new APIError("Only admins can change roles", 403);
    
    const targetUser = db.getUserById(targetUserId);
    if (!targetUser) throw new APIError("User not found", 404);
    
    // Cannot change own role
    if (adminId === targetUserId) {
      throw new APIError("Cannot change your own role", 400);
    }
    
    // Must have at least one admin
    if (targetUser.role === "ADMIN" && newRole === "USER") {
      const adminCount = db.getAdminCount();
      if (adminCount <= 1) {
        throw new APIError("Cannot demote: at least one admin must exist", 400);
      }
    }
    
    const oldRole = targetUser.role;
    const updated = db.updateUser(targetUserId, { role: newRole });
    if (!updated) throw new APIError("Failed to update user", 500);
    
    db.addAuditLog({
      userId: adminId,
      action: "ROLE_CHANGE",
      entity: "USER",
      entityId: targetUserId,
      before: { role: oldRole },
      after: { role: newRole },
      description: `Changed ${targetUser.name}'s role from ${oldRole} to ${newRole}`,
    });
    
    return updated;
  },
  
  async deactivate(adminId: string, targetUserId: string, reassignTo?: string): Promise<User> {
    await delay();
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== "ADMIN") throw new APIError("Only admins can deactivate users", 403);
    
    const targetUser = db.getUserById(targetUserId);
    if (!targetUser) throw new APIError("User not found", 404);
    
    if (adminId === targetUserId) {
      throw new APIError("Cannot deactivate yourself", 400);
    }
    
    // If target is admin, ensure at least one admin remains
    if (targetUser.role === "ADMIN" && db.getAdminCount() <= 1) {
      throw new APIError("Cannot deactivate: at least one admin must exist", 400);
    }
    
    // Remove from all projects
    const projects = db.getProjects();
    projects.forEach(project => {
      if (project.memberIds.includes(targetUserId)) {
        db.removeUserFromProject(targetUserId, project.id);
      }
    });
    
    // Unassign or reassign tasks
    if (reassignTo) {
      const tasks = db.getTasks();
      tasks.forEach(task => {
        if (task.assigneeId === targetUserId) {
          db.updateTask(task.id, { assigneeId: reassignTo });
        }
      });
    } else {
      db.unassignUserTasks(targetUserId);
    }
    
    const updated = db.deactivateUser(targetUserId);
    if (!updated) throw new APIError("Failed to deactivate user", 500);
    
    db.addAuditLog({
      userId: adminId,
      action: "DEACTIVATE_USER",
      entity: "USER",
      entityId: targetUserId,
      before: { isActive: true },
      after: { isActive: false },
      description: `Deactivated user ${targetUser.name} (${targetUser.email})`,
    });
    
    return updated;
  },
  
  async reactivate(adminId: string, targetUserId: string): Promise<User> {
    await delay();
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== "ADMIN") throw new APIError("Only admins can reactivate users", 403);
    
    const targetUser = db.getUserById(targetUserId);
    if (!targetUser) throw new APIError("User not found", 404);
    
    const updated = db.reactivateUser(targetUserId);
    if (!updated) throw new APIError("Failed to reactivate user", 500);
    
    db.addAuditLog({
      userId: adminId,
      action: "REACTIVATE_USER",
      entity: "USER",
      entityId: targetUserId,
      before: { isActive: false },
      after: { isActive: true },
      description: `Reactivated user ${targetUser.name} (${targetUser.email})`,
    });
    
    return updated;
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
  
  async addMember(adminId: string, projectId: string, userId: string): Promise<Project> {
    await delay();
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== "ADMIN") throw new APIError("Only admins can add members", 403);
    
    const project = db.getProjectById(projectId);
    if (!project) throw new APIError("Project not found", 404);
    
    const userToAdd = db.getUserById(userId);
    if (!userToAdd) throw new APIError("User not found", 404);
    if (!userToAdd.isActive) throw new APIError("Cannot add deactivated user", 400);
    
    const updated = db.addUserToProject(userId, projectId);
    if (!updated) throw new APIError("Failed to add member", 500);
    
    db.addAuditLog({
      userId: adminId,
      action: "ADD_USER_TO_PROJECT",
      entity: "PROJECT",
      entityId: projectId,
      before: null,
      after: { userId, userName: userToAdd.name },
      description: `Added ${userToAdd.name} to ${project.name}`,
    });
    
    return updated;
  },
  
  async removeMember(adminId: string, projectId: string, userId: string, reassignTo?: string): Promise<Project> {
    await delay();
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== "ADMIN") throw new APIError("Only admins can remove members", 403);
    
    const project = db.getProjectById(projectId);
    if (!project) throw new APIError("Project not found", 404);
    
    const userToRemove = db.getUserById(userId);
    if (!userToRemove) throw new APIError("User not found", 404);
    
    // Handle task reassignment
    if (reassignTo) {
      const tasks = db.getTasksByProjectId(projectId);
      tasks.forEach(task => {
        if (task.assigneeId === userId) {
          db.updateTask(task.id, { assigneeId: reassignTo });
        }
      });
    } else {
      db.unassignUserTasks(userId, projectId);
    }
    
    const updated = db.removeUserFromProject(userId, projectId);
    if (!updated) throw new APIError("Failed to remove member", 500);
    
    db.addAuditLog({
      userId: adminId,
      action: "REMOVE_USER_FROM_PROJECT",
      entity: "PROJECT",
      entityId: projectId,
      before: { userId, userName: userToRemove.name },
      after: null,
      description: `Removed ${userToRemove.name} from ${project.name}`,
    });
    
    return updated;
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
  
  async moveTask(taskId: string, userId: string, newStatus: TaskStatus, newOrder: number): Promise<Task> {
    await delay();
    const user = db.getUserById(userId);
    if (!user) throw new APIError("User not found", 404);
    const task = db.getTaskById(taskId);
    if (!task) throw new APIError("Task not found", 404);
    if (user.role !== "ADMIN" && !isUserProjectMember(userId, task.projectId)) {
      throw new APIError("Access denied", 403);
    }
    
    // Validate status transition for non-admins
    if (task.status !== newStatus && !canUserChangeStatus(user, task.status, newStatus)) {
      throw new APIError("Users can only move tasks one step at a time", 400);
    }
    
    const before = { status: task.status, order: task.order };
    const updatedTask = db.reorderTask(taskId, newStatus, newOrder);
    if (!updatedTask) throw new APIError("Failed to move task", 500);
    
    db.addAuditLog({
      userId,
      action: "DRAG_DROP_TASK",
      entity: "TASK",
      entityId: taskId,
      before,
      after: { status: newStatus, order: newOrder },
      description: `Moved "${task.title}" from ${before.status} to ${newStatus}`,
    });
    
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
