import { TaskPriority, PRIORITY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

interface PriorityBadgeProps {
  priority: TaskPriority;
  showIcon?: boolean;
  className?: string;
}

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "text-priority-low",
  MEDIUM: "text-priority-medium",
  HIGH: "text-priority-high",
  CRITICAL: "text-priority-critical",
};

const priorityBgStyles: Record<TaskPriority, string> = {
  LOW: "bg-priority-low/10 text-priority-low",
  MEDIUM: "bg-priority-medium/10 text-priority-medium",
  HIGH: "bg-priority-high/10 text-priority-high",
  CRITICAL: "bg-priority-critical/10 text-priority-critical",
};

export function PriorityBadge({ priority, showIcon = true, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
        priorityBgStyles[priority],
        className
      )}
    >
      {showIcon && <Flag className="h-3 w-3" />}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function PriorityIcon({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <Flag className={cn("h-4 w-4", priorityStyles[priority], className)} />
  );
}
