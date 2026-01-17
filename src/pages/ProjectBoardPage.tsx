import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { useAuthStore } from "@/stores/authStore";
import { projectsAPI, tasksAPI } from "@/lib/api";
import { db } from "@/lib/db/database";
import { Task, TaskStatus, TaskPriority, STATUS_ORDER, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types";
import { AppLayout } from "@/components/layout/AppLayout";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const users = db.getUsers();
  const assignee = users.find((u) => u.id === task.assigneeId);

  return (
    <div
      onClick={onClick}
      className="bg-card border rounded-lg p-3 shadow-card hover:shadow-card-hover cursor-pointer transition-all group"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 mt-0.5 cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm mb-2 line-clamp-2">{task.title}</p>
          <div className="flex items-center justify-between gap-2">
            <PriorityBadge priority={task.priority} showIcon={false} />
            <UserAvatar user={assignee} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusColumn({ status, tasks, onTaskClick }: { status: TaskStatus; tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const statusColors: Record<TaskStatus, string> = {
    TODO: "border-t-status-todo",
    IN_PROGRESS: "border-t-status-progress",
    REVIEW: "border-t-status-review",
    DONE: "border-t-status-done",
  };

  return (
    <div className={cn("bg-muted/50 rounded-lg p-3 min-w-[280px] border-t-4", statusColors[status])}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </div>
    </div>
  );
}

export default function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM" as TaskPriority, assigneeId: "" });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsAPI.getById(projectId!, user!.id),
    enabled: !!projectId && !!user,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => tasksAPI.getByProject(projectId!, user!.id),
    enabled: !!projectId && !!user,
  });

  const members = project ? db.getUsers().filter((u) => project.memberIds.includes(u.id)) : [];

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; priority: TaskPriority; assigneeId: string | null; projectId: string }) =>
      tasksAPI.create(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", assigneeId: "" });
      toast({ title: "Task created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      tasksAPI.update(taskId, user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast({ title: "Task updated" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksAPI.changeStatus(taskId, user!.id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
    onError: (error) => toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => tasksAPI.delete(taskId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setSelectedTask(null);
      toast({ title: "Task deleted" });
    },
    onError: (error) => toast({ title: "Error", description: error instanceof Error ? error.message : "Failed", variant: "destructive" }),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks?.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      statusMutation.mutate({ taskId, status: newStatus });
    }
  };

  const isLoading = projectLoading || tasksLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6"><Skeleton className="h-96 w-full" /></div>
      </AppLayout>
    );
  }

  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks?.filter((t) => t.status === status) || [];
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <AppLayout>
      <div className="p-6 space-y-4 max-w-full">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/projects"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-xl font-bold">{project?.name}</h1>
              <p className="text-sm text-muted-foreground">{project?.description}</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(v) => setNewTask((p) => ({ ...p, priority: v as TaskPriority }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map((p) => (
                          <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask((p) => ({ ...p, assigneeId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => createMutation.mutate({ ...newTask, projectId: projectId!, assigneeId: newTask.assigneeId || null })} disabled={!newTask.title.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <StatusColumn key={status} status={status} tasks={tasksByStatus[status]} onTaskClick={setSelectedTask} />
          ))}
        </div>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{selectedTask?.title}</DialogTitle></DialogHeader>
            {selectedTask && (
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">{selectedTask.description || "No description"}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={selectedTask.status} onValueChange={(v) => statusMutation.mutate({ taskId: selectedTask.id, status: v as TaskStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_ORDER.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={selectedTask.priority} onValueChange={(v) => updateMutation.mutate({ taskId: selectedTask.id, updates: { priority: v as TaskPriority } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map((p) => (
                          <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Assignee</Label>
                    <Select value={selectedTask.assigneeId || ""} onValueChange={(v) => updateMutation.mutate({ taskId: selectedTask.id, updates: { assigneeId: v || null } })}>
                      <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}><div className="flex items-center gap-2"><UserAvatar user={m} size="sm" />{m.name}</div></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <PermissionGuard permission="canDeleteTask">
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4" />Delete Task</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete task?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(selectedTask.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </PermissionGuard>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
