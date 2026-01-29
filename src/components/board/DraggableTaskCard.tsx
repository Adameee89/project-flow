import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Label } from "@/lib/types";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { TaskTypeIcon } from "@/components/ui/TaskTypeBadge";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

interface DraggableTaskCardProps {
  task: Task;
  project: any;
  onClick: () => void;
}

const DraggableTaskCardInner = ({ task, project, onClick }: DraggableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const users = db.getUsers();
  const assignee = users.find((u) => u.id === task.assigneeId);
  const projectLabels = project?.labels || [];
  const taskLabels = projectLabels.filter((l: Label) => task.labels.includes(l.id));
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE";
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const taskTypeColors: Record<string, string> = {
    BUG: "hsl(var(--type-bug))",
    EPIC: "hsl(var(--type-epic))",
    FEATURE: "hsl(var(--type-feature))",
    STORY: "hsl(var(--type-story))",
    TASK: "hsl(var(--type-task))",
    SUBTASK: "hsl(var(--type-subtask))",
  };

  const cardStyle = {
    ...style,
    borderLeftColor: taskTypeColors[task.type] || "transparent",
  };

  // Handle click only if not dragging
  const handleClick = (e: React.MouseEvent) => {
    // Don't open if we were dragging
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  // Handle pointer up to detect real clicks vs drags
  const handlePointerUp = (e: React.PointerEvent) => {
    // This is handled by the sortable, but we track for click detection
  };

  return (
    <Card
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        "p-3 cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-all group border-l-4 touch-none select-none",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary cursor-grabbing"
      )}
    >
      <div className="space-y-2 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <TaskTypeIcon type={task.type} />
            <span className="text-xs text-muted-foreground font-mono">{task.id.slice(-8).toUpperCase()}</span>
          </div>
          {task.storyPoints && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-medium">{task.storyPoints}</span>
          )}
        </div>
        
        <p className="font-medium text-sm line-clamp-2">{task.title}</p>
        
        {taskLabels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {taskLabels.slice(0, 2).map((label: Label) => (
              <LabelBadge key={label.id} label={label} />
            ))}
            {taskLabels.length > 2 && (
              <span className="text-xs text-muted-foreground">+{taskLabels.length - 2}</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} showIcon={false} />
            {task.dueDate && (
              <span className={cn(
                "text-xs flex items-center gap-1",
                isOverdue ? "text-destructive" : isDueToday ? "text-warning" : "text-muted-foreground"
              )}>
                <CalendarIcon className="h-3 w-3" />
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>
          <UserAvatar user={assignee} size="sm" />
        </div>
      </div>
    </Card>
  );
};

export const DraggableTaskCard = memo(DraggableTaskCardInner, (prev, next) => {
  return (
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.status === next.task.status &&
    prev.task.priority === next.task.priority &&
    prev.task.type === next.task.type &&
    prev.task.assigneeId === next.task.assigneeId &&
    prev.task.dueDate === next.task.dueDate &&
    prev.task.storyPoints === next.task.storyPoints &&
    JSON.stringify(prev.task.labels) === JSON.stringify(next.task.labels)
  );
});