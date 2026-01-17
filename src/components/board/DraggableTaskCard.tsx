import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Label } from "@/lib/types";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { TaskTypeIcon } from "@/components/ui/TaskTypeBadge";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { CalendarIcon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

interface DraggableTaskCardProps {
  task: Task;
  project: any;
  onClick: () => void;
}

export function DraggableTaskCard({ task, project, onClick }: DraggableTaskCardProps) {
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

  const cardStyle = {
    ...style,
    borderLeftColor: task.type === "BUG" ? "#ef4444" : task.type === "EPIC" ? "#8b5cf6" : "transparent",
  };

  return (
    <Card
      ref={setNodeRef}
      style={cardStyle}
      onClick={onClick}
      className={cn(
        "p-3 cursor-pointer hover:shadow-card-hover transition-all group border-l-4",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
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
}
