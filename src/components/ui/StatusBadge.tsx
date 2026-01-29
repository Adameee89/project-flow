import { TaskStatus, STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-status-todo-bg text-status-todo",
  WAITING: "bg-status-waiting-bg text-status-waiting",
  IN_PROGRESS: "bg-status-progress-bg text-status-progress",
  REVIEW: "bg-status-review-bg text-status-review",
  DONE: "bg-status-done-bg text-status-done",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
