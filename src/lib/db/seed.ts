import { User, Project, Task, AuditLogEntry, TaskStatus, TaskPriority } from "../types";

const AVATAR_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// Seed 20 users: 2 admins, 18 users
export function seedUsers(): User[] {
  const users: User[] = [];
  
  // Admins
  users.push({
    id: "admin-1",
    name: "Sarah Chen",
    email: "admin1@pm.com",
    role: "ADMIN",
    avatarColor: getAvatarColor(0),
  });
  
  users.push({
    id: "admin-2",
    name: "Marcus Johnson",
    email: "admin2@pm.com",
    role: "ADMIN",
    avatarColor: getAvatarColor(1),
  });
  
  // Regular users
  const userNames = [
    "Alex Rivera", "Jordan Kim", "Casey Morgan", "Taylor Swift", 
    "Morgan Lee", "Jamie Parker", "Riley Cooper", "Avery Brooks",
    "Quinn Sanders", "Drew Mitchell", "Blake Turner", "Cameron Ellis",
    "Sage Williams", "Rowan Davis", "Finley Clark", "Hayden Gray",
    "Charlie Stone", "Dakota Reed"
  ];
  
  userNames.forEach((name, index) => {
    users.push({
      id: `user-${index + 1}`,
      name,
      email: `user${index + 1}@pm.com`,
      role: "USER",
      avatarColor: getAvatarColor(index + 2),
    });
  });
  
  return users;
}

export function seedProjects(users: User[]): Project[] {
  const adminIds = users.filter(u => u.role === "ADMIN").map(u => u.id);
  const userIds = users.filter(u => u.role === "USER").map(u => u.id);
  
  return [
    {
      id: "project-1",
      name: "Website Redesign",
      description: "Complete overhaul of the company website with new branding",
      memberIds: [...adminIds, ...userIds.slice(0, 8)],
      createdAt: new Date("2024-01-15"),
      createdBy: "admin-1",
    },
    {
      id: "project-2",
      name: "Mobile App v2.0",
      description: "Major update to the mobile application with new features",
      memberIds: [...adminIds, ...userIds.slice(4, 12)],
      createdAt: new Date("2024-02-01"),
      createdBy: "admin-1",
    },
    {
      id: "project-3",
      name: "API Integration",
      description: "Third-party API integrations for payment and analytics",
      memberIds: [...adminIds, ...userIds.slice(8, 16)],
      createdAt: new Date("2024-02-10"),
      createdBy: "admin-2",
    },
    {
      id: "project-4",
      name: "Infrastructure Upgrade",
      description: "Cloud migration and infrastructure modernization",
      memberIds: [...adminIds, ...userIds.slice(12, 18)],
      createdAt: new Date("2024-03-01"),
      createdBy: "admin-2",
    },
  ];
}

export function seedTasks(projects: Project[], users: User[]): Task[] {
  const tasks: Task[] = [];
  
  const taskTemplates: { title: string; description: string; status: TaskStatus; priority: TaskPriority }[] = [
    { title: "Design homepage mockups", description: "Create Figma mockups for the new homepage design", status: "DONE", priority: "HIGH" },
    { title: "Implement navigation component", description: "Build responsive navigation with mobile menu", status: "DONE", priority: "HIGH" },
    { title: "Set up authentication", description: "Implement JWT-based authentication system", status: "IN_PROGRESS", priority: "CRITICAL" },
    { title: "Create user dashboard", description: "Build the main dashboard view with widgets", status: "IN_PROGRESS", priority: "HIGH" },
    { title: "API endpoint documentation", description: "Document all REST API endpoints", status: "REVIEW", priority: "MEDIUM" },
    { title: "Unit tests for core modules", description: "Write comprehensive unit tests", status: "TODO", priority: "MEDIUM" },
    { title: "Performance optimization", description: "Optimize bundle size and load times", status: "TODO", priority: "LOW" },
    { title: "Accessibility audit", description: "Conduct WCAG 2.1 accessibility review", status: "TODO", priority: "MEDIUM" },
    { title: "Database schema migration", description: "Migrate to new normalized schema", status: "IN_PROGRESS", priority: "CRITICAL" },
    { title: "Error handling improvements", description: "Implement global error boundary", status: "REVIEW", priority: "HIGH" },
  ];
  
  projects.forEach((project, projectIndex) => {
    const projectMembers = users.filter(u => project.memberIds.includes(u.id));
    
    taskTemplates.forEach((template, taskIndex) => {
      const assignee = projectMembers[taskIndex % projectMembers.length];
      const creator = projectMembers[0];
      
      tasks.push({
        id: `task-${projectIndex + 1}-${taskIndex + 1}`,
        title: template.title,
        description: template.description,
        status: template.status,
        priority: template.priority,
        assigneeId: assignee?.id || null,
        projectId: project.id,
        createdBy: creator.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });
    });
  });
  
  return tasks;
}

export function seedAuditLogs(): AuditLogEntry[] {
  return [];
}
