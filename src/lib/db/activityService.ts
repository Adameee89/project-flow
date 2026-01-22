import { TaskActivity, TaskActivityType, Task, User } from "@/lib/types";

const STORAGE_KEY = "task-activities";

// Activity storage (separate from main db for performance)
class ActivityService {
  private activities: TaskActivity[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.activities = JSON.parse(stored).map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        }));
      }
    } catch (e) {
      console.error("Failed to load activities:", e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.activities));
    } catch (e) {
      console.error("Failed to save activities:", e);
    }
  }

  addActivity(
    taskId: string,
    userId: string,
    type: TaskActivityType,
    options?: {
      field?: string;
      oldValue?: string;
      newValue?: string;
      metadata?: Record<string, unknown>;
    }
  ): TaskActivity {
    const activity: TaskActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      userId,
      type,
      field: options?.field,
      oldValue: options?.oldValue,
      newValue: options?.newValue,
      metadata: options?.metadata,
      createdAt: new Date(),
    };

    this.activities.push(activity);
    this.saveToStorage();
    return activity;
  }

  getActivitiesForTask(taskId: string): TaskActivity[] {
    return this.activities
      .filter((a) => a.taskId === taskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Track task field changes
  trackChange(
    taskId: string,
    userId: string,
    field: string,
    oldValue: string | null | undefined,
    newValue: string | null | undefined,
    users?: User[]
  ) {
    const typeMap: Record<string, TaskActivityType> = {
      status: "STATUS_CHANGED",
      assigneeId: "ASSIGNEE_CHANGED",
      priority: "PRIORITY_CHANGED",
      description: "DESCRIPTION_CHANGED",
      title: "TITLE_CHANGED",
      dueDate: "DUE_DATE_CHANGED",
      labels: "LABELS_CHANGED",
    };

    const type = typeMap[field];
    if (!type) return;

    // Format values for display
    let formattedOld = oldValue || "None";
    let formattedNew = newValue || "None";

    // Special handling for assignee - show user name
    if (field === "assigneeId" && users) {
      const oldUser = users.find((u) => u.id === oldValue);
      const newUser = users.find((u) => u.id === newValue);
      formattedOld = oldUser?.name || "Unassigned";
      formattedNew = newUser?.name || "Unassigned";
    }

    this.addActivity(taskId, userId, type, {
      field,
      oldValue: formattedOld,
      newValue: formattedNew,
    });
  }

  trackCommentAdded(taskId: string, userId: string, commentId: string) {
    this.addActivity(taskId, userId, "COMMENT_ADDED", {
      metadata: { commentId },
    });
  }

  trackCommentUpdated(taskId: string, userId: string, commentId: string) {
    this.addActivity(taskId, userId, "COMMENT_UPDATED", {
      metadata: { commentId },
    });
  }

  trackCommentDeleted(taskId: string, userId: string) {
    this.addActivity(taskId, userId, "COMMENT_DELETED");
  }

  trackLinkAdded(taskId: string, userId: string, linkedTaskTitle: string, linkType: string) {
    this.addActivity(taskId, userId, "LINK_ADDED", {
      metadata: { linkedTaskTitle, linkType },
    });
  }

  trackLinkRemoved(taskId: string, userId: string, linkedTaskTitle: string) {
    this.addActivity(taskId, userId, "LINK_REMOVED", {
      metadata: { linkedTaskTitle },
    });
  }

  trackTaskCreated(taskId: string, userId: string) {
    this.addActivity(taskId, userId, "CREATED");
  }
}

export const activityService = new ActivityService();