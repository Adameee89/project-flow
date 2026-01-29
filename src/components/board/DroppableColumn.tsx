import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus, STATUS_LABELS } from "@/lib/types";
import { DraggableTaskCard } from "./DraggableTaskCard";
import { cn } from "@/lib/utils";

interface DroppableColumnProps {
  status: TaskStatus;
  tasks: Task[];
  project: any;
  onTaskClick: (task: Task) => void;
}

const statusColors: Record<TaskStatus, string> = {
  TODO: "border-t-status-todo bg-status-todo-bg/50",
  WAITING: "border-t-status-waiting bg-status-waiting-bg/50",
  IN_PROGRESS: "border-t-status-progress bg-status-progress-bg/50",
  REVIEW: "border-t-status-review bg-status-review-bg/50",
  DONE: "border-t-status-done bg-status-done-bg/50",
};

export function DroppableColumn({ status, tasks, project, onTaskClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const storyPointsTotal = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const taskIds = tasks.map(t => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg p-3 min-w-[280px] flex-1 border-t-4 flex flex-col transition-colors",
        statusColors[status],
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{STATUS_LABELS[status]}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {storyPointsTotal > 0 && (
          <span className="text-xs text-muted-foreground">{storyPointsTotal} pts</span>
        )}
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[200px] overflow-y-auto scrollbar-thin">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              project={project}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
