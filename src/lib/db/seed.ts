import { User, Project, Task, AuditLogEntry, TaskStatus, TaskPriority, TaskType, DEFAULT_LABELS } from "../types";

const AVATAR_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function seedUsers(): User[] {
  const users: User[] = [];
  
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
      labels: DEFAULT_LABELS.slice(0, 5),
    },
    {
      id: "project-2",
      name: "Mobile App v2.0",
      description: "Major update to the mobile application with new features",
      memberIds: [...adminIds, ...userIds.slice(4, 12)],
      createdAt: new Date("2024-02-01"),
      createdBy: "admin-1",
      labels: DEFAULT_LABELS.slice(1, 6),
    },
    {
      id: "project-3",
      name: "API Integration",
      description: "Third-party API integrations for payment and analytics",
      memberIds: [...adminIds, ...userIds.slice(8, 16)],
      createdAt: new Date("2024-02-10"),
      createdBy: "admin-2",
      labels: DEFAULT_LABELS.slice(2, 7),
    },
    {
      id: "project-4",
      name: "Infrastructure Upgrade",
      description: "Cloud migration and infrastructure modernization",
      memberIds: [...adminIds, ...userIds.slice(12, 18)],
      createdAt: new Date("2024-03-01"),
      createdBy: "admin-2",
      labels: DEFAULT_LABELS.slice(3, 8),
    },
  ];
}

export function seedTasks(projects: Project[], users: User[]): Task[] {
  const tasks: Task[] = [];
  
  const taskTemplates: { title: string; description: string; status: TaskStatus; priority: TaskPriority; type: TaskType; storyPoints: number | null }[] = [
    { title: "Design homepage mockups", description: "Create Figma mockups for the new homepage design with responsive layouts", status: "DONE", priority: "HIGH", type: "STORY", storyPoints: 8 },
    { title: "Implement navigation component", description: "Build responsive navigation with mobile menu and dropdown support", status: "DONE", priority: "HIGH", type: "FEATURE", storyPoints: 5 },
    { title: "Fix login button not clickable on mobile", description: "Users report the login button is unresponsive on iOS Safari", status: "IN_PROGRESS", priority: "CRITICAL", type: "BUG", storyPoints: 2 },
    { title: "Create user dashboard", description: "Build the main dashboard view with widgets and real-time updates", status: "IN_PROGRESS", priority: "HIGH", type: "EPIC", storyPoints: 21 },
    { title: "API endpoint documentation", description: "Document all REST API endpoints with examples and error codes", status: "REVIEW", priority: "MEDIUM", type: "TASK", storyPoints: 5 },
    { title: "Unit tests for auth module", description: "Write comprehensive unit tests for authentication flows", status: "TODO", priority: "MEDIUM", type: "TASK", storyPoints: 8 },
    { title: "Performance optimization", description: "Optimize bundle size, implement code splitting and lazy loading", status: "TODO", priority: "LOW", type: "FEATURE", storyPoints: 13 },
    { title: "Accessibility audit", description: "Conduct WCAG 2.1 AA accessibility review and fix issues", status: "TODO", priority: "MEDIUM", type: "TASK", storyPoints: 8 },
    { title: "Database connection timeout", description: "Production DB connections timing out under heavy load", status: "IN_PROGRESS", priority: "CRITICAL", type: "BUG", storyPoints: 3 },
    { title: "Error handling improvements", description: "Implement global error boundary with user-friendly messages", status: "REVIEW", priority: "HIGH", type: "FEATURE", storyPoints: 5 },
  ];
  
  projects.forEach((project, projectIndex) => {
    const projectMembers = users.filter(u => project.memberIds.includes(u.id));
    
    taskTemplates.forEach((template, taskIndex) => {
      const assignee = projectMembers[taskIndex % projectMembers.length];
      const reporter = projectMembers[(taskIndex + 1) % projectMembers.length];
      const creator = projectMembers[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 10);
      
      tasks.push({
        id: `task-${projectIndex + 1}-${taskIndex + 1}`,
        title: template.title,
        description: template.description,
        status: template.status,
        priority: template.priority,
        type: template.type,
        assigneeId: assignee?.id || null,
        reporterId: reporter?.id || creator.id,
        projectId: project.id,
        createdBy: creator.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        dueDate: Math.random() > 0.3 ? dueDate : null,
        storyPoints: template.storyPoints,
        labels: project.labels.slice(0, Math.floor(Math.random() * 3) + 1).map(l => l.id),
        parentTaskId: null,
        subtaskIds: [],
      });
    });
  });
  
  return tasks;
}

export function seedAuditLogs(): AuditLogEntry[] {
  return [];
}
