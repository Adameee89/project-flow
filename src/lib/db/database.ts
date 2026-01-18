import { User, Project, Task, AuditLogEntry, Label, AuditAction } from "../types";
import { seedUsers, seedProjects, seedTasks, seedAuditLogs } from "./seed";

const STORAGE_KEY = "agile-hive-db";

interface StoredData {
  users: User[];
  projects: Project[];
  tasks: Task[];
  auditLogs: AuditLogEntry[];
}

class InMemoryDatabase {
  users: User[] = [];
  projects: Project[] = [];
  tasks: Task[] = [];
  auditLogs: AuditLogEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        // Restore dates from JSON strings
        this.users = data.users || [];
        this.projects = (data.projects || []).map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
        this.tasks = (data.tasks || []).map(t => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
        }));
        this.auditLogs = (data.auditLogs || []).map(log => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        return;
      }
    } catch (e) {
      console.error("Failed to load from storage:", e);
    }
    // Fall back to seed data if nothing stored or error
    this.resetToSeed();
  }

  private saveToStorage() {
    try {
      const data: StoredData = {
        users: this.users,
        projects: this.projects,
        tasks: this.tasks,
        auditLogs: this.auditLogs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to storage:", e);
    }
  }

  resetToSeed() {
    this.users = seedUsers();
    this.projects = seedProjects(this.users);
    this.tasks = seedTasks(this.projects, this.users);
    this.auditLogs = seedAuditLogs();
    this.saveToStorage();
  }

  reset() {
    this.resetToSeed();
  }

  // ==================== USER METHODS ====================
  
  getUsers(): User[] {
    return [...this.users];
  }

  getActiveUsers(): User[] {
    return this.users.filter(u => u.isActive);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Omit<User, "id" | "isActive">): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isActive: true,
    };
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates };
    this.saveToStorage();
    return this.users[index];
  }

  deactivateUser(id: string): User | undefined {
    return this.updateUser(id, { isActive: false });
  }

  reactivateUser(id: string): User | undefined {
    return this.updateUser(id, { isActive: true });
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === "ADMIN" && u.isActive).length;
  }

  // ==================== PROJECT METHODS ====================

  getProjects(): Project[] {
    return [...this.projects];
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  getProjectsByUserId(userId: string): Project[] {
    return this.projects.filter(p => p.memberIds.includes(userId));
  }

  createProject(project: Omit<Project, "id" | "createdAt">): Project {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
    };
    this.projects.push(newProject);
    this.saveToStorage();
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.projects[index] = { ...this.projects[index], ...updates };
    this.saveToStorage();
    return this.projects[index];
  }

  deleteProject(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    this.tasks = this.tasks.filter(t => t.projectId !== id);
    this.saveToStorage();
    return true;
  }

  addUserToProject(userId: string, projectId: string): Project | undefined {
    const project = this.getProjectById(projectId);
    if (!project) return undefined;
    if (project.memberIds.includes(userId)) return project;
    project.memberIds.push(userId);
    this.saveToStorage();
    return project;
  }

  removeUserFromProject(userId: string, projectId: string): Project | undefined {
    const project = this.getProjectById(projectId);
    if (!project) return undefined;
    project.memberIds = project.memberIds.filter(id => id !== userId);
    this.saveToStorage();
    return project;
  }

  // ==================== TASK METHODS ====================

  getTasks(): Task[] {
    return [...this.tasks];
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  getTasksByProjectId(projectId: string): Task[] {
    return this.tasks.filter(t => t.projectId === projectId);
  }

  getTasksByUserId(userId: string): Task[] {
    return this.tasks.filter(t => t.assigneeId === userId);
  }

  getSubtasks(parentTaskId: string): Task[] {
    return this.tasks.filter(t => t.parentTaskId === parentTaskId);
  }

  getMaxOrderForStatus(projectId: string, status: string): number {
    const tasksInStatus = this.tasks.filter(
      t => t.projectId === projectId && t.status === status
    );
    if (tasksInStatus.length === 0) return 0;
    return Math.max(...tasksInStatus.map(t => t.order || 0));
  }

  createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtaskIds" | "order">): Task {
    const order = this.getMaxOrderForStatus(task.projectId, task.status) + 1;
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtaskIds: [],
      order,
    };
    this.tasks.push(newTask);
    
    if (task.parentTaskId) {
      const parent = this.tasks.find(t => t.id === task.parentTaskId);
      if (parent) {
        parent.subtaskIds.push(newTask.id);
      }
    }
    
    this.saveToStorage();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.tasks[index] = { 
      ...this.tasks[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    this.saveToStorage();
    return this.tasks[index];
  }

  reorderTask(taskId: string, newStatus: string, newOrder: number): Task | undefined {
    const task = this.getTaskById(taskId);
    if (!task) return undefined;

    // Get tasks in the target status column
    const tasksInColumn = this.tasks
      .filter(t => t.projectId === task.projectId && t.status === newStatus && t.id !== taskId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Insert at new position and reorder
    tasksInColumn.splice(newOrder, 0, task);
    tasksInColumn.forEach((t, index) => {
      t.order = index;
    });

    // Update the moved task (this also saves to storage)
    return this.updateTask(taskId, { status: newStatus as Task['status'], order: newOrder });
  }

  deleteTask(id: string): boolean {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return false;
    
    // Remove from parent's subtaskIds
    if (task.parentTaskId) {
      const parent = this.tasks.find(t => t.id === task.parentTaskId);
      if (parent) {
        parent.subtaskIds = parent.subtaskIds.filter(sid => sid !== id);
      }
    }
    
    // Delete subtasks
    task.subtaskIds.forEach(subtaskId => {
      this.deleteTask(subtaskId);
    });
    
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
    this.saveToStorage();
    return true;
  }

  unassignUserTasks(userId: string, projectId?: string): number {
    let count = 0;
    this.tasks.forEach(task => {
      if (task.assigneeId === userId) {
        if (!projectId || task.projectId === projectId) {
          task.assigneeId = null;
          task.updatedAt = new Date();
          count++;
        }
      }
    });
    if (count > 0) this.saveToStorage();
    return count;
  }

  // ==================== AUDIT METHODS ====================

  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    this.auditLogs.push(newEntry);
    this.saveToStorage();
    return newEntry;
  }
}

export const db = new InMemoryDatabase();
