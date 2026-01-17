import { User, Role, TaskStatus, STATUS_ORDER } from "../types";
import { db } from "../db/database";

export interface Permission {
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canAssignTask: boolean;
  canChangePriority: boolean;
  canChangeStatus: boolean;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canManageUsers: boolean;
  canViewAuditLog: boolean;
}

export function getPermissions(role: Role): Permission {
  const isAdmin = role === "ADMIN";
  
  return {
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: isAdmin,
    canAssignTask: true,
    canChangePriority: true,
    canChangeStatus: true,
    canCreateProject: isAdmin,
    canDeleteProject: isAdmin,
    canManageUsers: isAdmin,
    canViewAuditLog: isAdmin,
  };
}

export function canUserChangeStatus(
  user: User,
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean {
  // Admins can move freely
  if (user.role === "ADMIN") return true;
  
  // Users must follow the order
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);
  
  // Can only move forward by 1 step or backward by 1 step
  return Math.abs(newIndex - currentIndex) === 1;
}

export function isUserProjectMember(userId: string, projectId: string): boolean {
  const project = db.getProjectById(projectId);
  if (!project) return false;
  return project.memberIds.includes(userId);
}

export function getProjectMembers(projectId: string): User[] {
  const project = db.getProjectById(projectId);
  if (!project) return [];
  
  return db.getUsers().filter(u => project.memberIds.includes(u.id));
}
