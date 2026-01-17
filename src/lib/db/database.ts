import { User, Project, Task, AuditLogEntry, Label } from "../types";
import { seedUsers, seedProjects, seedTasks, seedAuditLogs } from "./seed";

class InMemoryDatabase {
  users: User[] = [];
  projects: Project[] = [];
  tasks: Task[] = [];
  auditLogs: AuditLogEntry[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.users = seedUsers();
    this.projects = seedProjects(this.users);
    this.tasks = seedTasks(this.projects, this.users);
    this.auditLogs = seedAuditLogs();
  }

  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

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
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.projects[index] = { ...this.projects[index], ...updates };
    return this.projects[index];
  }

  deleteProject(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    this.tasks = this.tasks.filter(t => t.projectId !== id);
    return true;
  }

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

  createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtaskIds">): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      subtaskIds: [],
    };
    this.tasks.push(newTask);
    
    if (task.parentTaskId) {
      const parent = this.tasks.find(t => t.id === task.parentTaskId);
      if (parent) {
        parent.subtaskIds.push(newTask.id);
      }
    }
    
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
    return this.tasks[index];
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
    return true;
  }

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
    return newEntry;
  }
}

export const db = new InMemoryDatabase();
