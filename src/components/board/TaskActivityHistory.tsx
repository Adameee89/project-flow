import { useMemo } from "react";
import { TaskActivity, TaskActivityType, User } from "@/lib/types";
import { activityService } from "@/lib/db/activityService";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format } from "date-fns";
import {
  MessageCircle,
  ArrowRight,
  UserPlus,
  AlertCircle,
  FileText,
  Calendar,
  Link2,
  Tag,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskActivityHistoryProps {
  taskId: string;
  users: User[];
}

const activityIcons: Record<TaskActivityType, React.ElementType> = {
  CREATED: Plus,
  STATUS_CHANGED: ArrowRight,
  ASSIGNEE_CHANGED: UserPlus,
  PRIORITY_CHANGED: AlertCircle,
  DESCRIPTION_CHANGED: FileText,
  TITLE_CHANGED: Pencil,
  DUE_DATE_CHANGED: Calendar,
  COMMENT_ADDED: MessageCircle,
  COMMENT_UPDATED: Pencil,
  COMMENT_DELETED: Trash2,
  LINK_ADDED: Link2,
  LINK_REMOVED: Link2,
  LABELS_CHANGED: Tag,
};

const activityColors: Record<TaskActivityType, string> = {
  CREATED: "bg-green-500/10 text-green-500",
  STATUS_CHANGED: "bg-blue-500/10 text-blue-500",
  ASSIGNEE_CHANGED: "bg-purple-500/10 text-purple-500",
  PRIORITY_CHANGED: "bg-orange-500/10 text-orange-500",
  DESCRIPTION_CHANGED: "bg-muted text-muted-foreground",
  TITLE_CHANGED: "bg-muted text-muted-foreground",
  DUE_DATE_CHANGED: "bg-yellow-500/10 text-yellow-500",
  COMMENT_ADDED: "bg-primary/10 text-primary",
  COMMENT_UPDATED: "bg-muted text-muted-foreground",
  COMMENT_DELETED: "bg-destructive/10 text-destructive",
  LINK_ADDED: "bg-cyan-500/10 text-cyan-500",
  LINK_REMOVED: "bg-muted text-muted-foreground",
  LABELS_CHANGED: "bg-pink-500/10 text-pink-500",
};

function formatActivityMessage(activity: TaskActivity): string {
  switch (activity.type) {
    case "CREATED":
      return "created this task";
    case "STATUS_CHANGED":
      return `changed status from ${activity.oldValue} to ${activity.newValue}`;
    case "ASSIGNEE_CHANGED":
      return `changed assignee from ${activity.oldValue} to ${activity.newValue}`;
    case "PRIORITY_CHANGED":
      return `changed priority from ${activity.oldValue} to ${activity.newValue}`;
    case "DESCRIPTION_CHANGED":
      return "updated the description";
    case "TITLE_CHANGED":
      return `changed title from "${activity.oldValue}" to "${activity.newValue}"`;
    case "DUE_DATE_CHANGED":
      return `changed due date from ${activity.oldValue} to ${activity.newValue}`;
    case "COMMENT_ADDED":
      return "added a comment";
    case "COMMENT_UPDATED":
      return "edited a comment";
    case "COMMENT_DELETED":
      return "deleted a comment";
    case "LINK_ADDED":
      return `linked this task to "${activity.metadata?.linkedTaskTitle}"`;
    case "LINK_REMOVED":
      return `removed link to "${activity.metadata?.linkedTaskTitle}"`;
    case "LABELS_CHANGED":
      return "updated labels";
    default:
      return "made a change";
  }
}

export function TaskActivityHistory({ taskId, users }: TaskActivityHistoryProps) {
  const activities = useMemo(() => {
    return activityService.getActivitiesForTask(taskId);
  }, [taskId]);

  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
        <p className="text-xs">Changes to this task will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const actor = getUserById(activity.userId);
            const Icon = activityIcons[activity.type] || FileText;
            const colorClass = activityColors[activity.type] || "bg-muted text-muted-foreground";

            return (
              <div key={activity.id} className="relative flex gap-4 pl-2">
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background",
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <UserAvatar user={actor} size="xs" />
                    <span className="font-medium text-sm">{actor?.name || "Unknown"}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatActivityMessage(activity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}