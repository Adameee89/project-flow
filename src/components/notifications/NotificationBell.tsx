import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import { db } from "@/lib/db/database";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, UserPlus, CheckCircle, AtSign, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/lib/types";

const notificationIcons: Record<NotificationType, React.ElementType> = {
  MENTION: AtSign,
  COMMENT_ON_ASSIGNED_TASK: MessageCircle,
  TASK_ASSIGNED: UserPlus,
  STATUS_CHANGED: CheckCircle,
};

const notificationColors: Record<NotificationType, string> = {
  MENTION: "text-blue-500",
  COMMENT_ON_ASSIGNED_TASK: "text-primary",
  TASK_ASSIGNED: "text-purple-500",
  STATUS_CHANGED: "text-green-500",
};

export function NotificationBell() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const { 
    getNotificationsForUser, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead,
    clearNotifications 
  } = useNotificationStore();

  if (!user) return null;

  const notifications = getNotificationsForUser(user.id);
  const unreadCount = getUnreadCount(user.id);
  const allUsers = db.getUsers();

  const handleNotificationClick = (notificationId: string, projectId: string, taskId: string) => {
    markAsRead(notificationId);
    setOpen(false);
    navigate(`/projects/${projectId}?task=${taskId}`);
  };

  const handleMarkAllRead = () => {
    markAllAsRead(user.id);
  };

  const handleClearAll = () => {
    clearNotifications(user.id);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-destructive hover:text-destructive"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.slice(0, 20).map((notification) => {
              const actor = allUsers.find((u) => u.id === notification.actorId);
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer",
                    !notification.read && "bg-accent/50"
                  )}
                  onClick={() => handleNotificationClick(
                    notification.id, 
                    notification.projectId, 
                    notification.taskId
                  )}
                >
                  <div className="relative">
                    <UserAvatar user={actor} size="sm" />
                    <div className={cn(
                      "absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background flex items-center justify-center",
                      colorClass
                    )}>
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm leading-tight">
                      <span className="font-medium">{notification.actorName}</span>{" "}
                      <span className="text-muted-foreground">{notification.message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}