import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Notification, NotificationType } from "@/lib/types";

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
  getNotificationsForUser: (userId: string) => Notification[];
  clearNotifications: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
        }));
      },

      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n
          ),
        }));
      },

      getUnreadCount: (userId) => {
        return get().notifications.filter((n) => n.userId === userId && !n.read).length;
      },

      getNotificationsForUser: (userId) => {
        return get()
          .notifications
          .filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      clearNotifications: (userId) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.userId !== userId),
        }));
      },
    }),
    {
      name: "notifications-storage",
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        // Convert date strings back to Date objects
        if (state?.notifications) {
          state.notifications = state.notifications.map((n) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }));
        }
      },
    }
  )
);

// Helper function to create notifications
export function createMentionNotification(
  mentionedUserId: string,
  taskId: string,
  taskTitle: string,
  projectId: string,
  actorId: string,
  actorName: string
) {
  const store = useNotificationStore.getState();
  // Don't notify yourself
  if (mentionedUserId === actorId) return;
  
  store.addNotification({
    userId: mentionedUserId,
    type: "MENTION",
    taskId,
    taskTitle,
    projectId,
    actorId,
    actorName,
    message: `mentioned you in a comment on "${taskTitle}"`,
  });
}

export function createCommentNotification(
  assigneeId: string,
  taskId: string,
  taskTitle: string,
  projectId: string,
  actorId: string,
  actorName: string
) {
  const store = useNotificationStore.getState();
  // Don't notify yourself
  if (assigneeId === actorId) return;
  
  store.addNotification({
    userId: assigneeId,
    type: "COMMENT_ON_ASSIGNED_TASK",
    taskId,
    taskTitle,
    projectId,
    actorId,
    actorName,
    message: `commented on your task "${taskTitle}"`,
  });
}

export function createAssignmentNotification(
  assigneeId: string,
  taskId: string,
  taskTitle: string,
  projectId: string,
  actorId: string,
  actorName: string
) {
  const store = useNotificationStore.getState();
  if (assigneeId === actorId) return;
  
  store.addNotification({
    userId: assigneeId,
    type: "TASK_ASSIGNED",
    taskId,
    taskTitle,
    projectId,
    actorId,
    actorName,
    message: `assigned you to "${taskTitle}"`,
  });
}