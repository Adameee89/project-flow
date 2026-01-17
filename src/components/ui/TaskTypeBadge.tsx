import { TaskType, TASK_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bug, Lightbulb, BookOpen, CheckSquare, Layers, GitBranch } from "lucide-react";

interface TaskTypeBadgeProps {
  type: TaskType;
  showLabel?: boolean;
  className?: string;
}

const typeConfig: Record<TaskType, { icon: React.ElementType; color: string; bgColor: string }> = {
  BUG: { icon: Bug, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
  FEATURE: { icon: Lightbulb, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
  STORY: { icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  TASK: { icon: CheckSquare, color: "text-slate-600 dark:text-slate-400", bgColor: "bg-slate-100 dark:bg-slate-800" },
  EPIC: { icon: Layers, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  SUBTASK: { icon: GitBranch, color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/30" },
};

export function TaskTypeBadge({ type, showLabel = true, className }: TaskTypeBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium",
        config.color,
        config.bgColor,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {showLabel && TASK_TYPE_LABELS[type]}
    </span>
  );
}

export function TaskTypeIcon({ type, className }: { type: TaskType; className?: string }) {
  const config = typeConfig[type];
  const Icon = config.icon;
  return <Icon className={cn("h-4 w-4", config.color, className)} />;
}
