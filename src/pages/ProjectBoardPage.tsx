import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { projectsAPI, tasksAPI } from "@/lib/api";
import { db } from "@/lib/db/database";
import { Task, TaskStatus, TaskPriority, TaskType, STATUS_ORDER, STATUS_LABELS, PRIORITY_LABELS, TASK_TYPE_LABELS, STORY_POINTS, Label } from "@/lib/types";
import { AppLayout } from "@/components/layout/AppLayout";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { TaskTypeBadge, TaskTypeIcon } from "@/components/ui/TaskTypeBadge";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label as FormLabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, Trash2, GripVertical, CalendarIcon, Hash, Tag, User, Clock, AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

function TaskCard({ task, project, onClick }: { task: Task; project: any; onClick: () => void }) {
  const users = db.getUsers();
  const assignee = users.find((u) => u.id === task.assigneeId);
  const projectLabels = project?.labels || [];
  const taskLabels = projectLabels.filter((l: Label) => task.labels.includes(l.id));
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE";
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <Card
      onClick={onClick}
      className="p-3 cursor-pointer hover:shadow-card-hover transition-all group border-l-4"
      style={{ borderLeftColor: task.type === "BUG" ? "#ef4444" : task.type === "EPIC" ? "#8b5cf6" : "transparent" }}
    >
      <div className="space-y-2">
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
}

function StatusColumn({ status, tasks, project, onTaskClick }: { status: TaskStatus; tasks: Task[]; project: any; onTaskClick: (task: Task) => void }) {
  const statusColors: Record<TaskStatus, string> = {
    TODO: "border-t-status-todo bg-status-todo-bg/50",
    IN_PROGRESS: "border-t-status-progress bg-status-progress-bg/50",
    REVIEW: "border-t-status-review bg-status-review-bg/50",
    DONE: "border-t-status-done bg-status-done-bg/50",
  };

  const storyPointsTotal = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return (
    <div className={cn("rounded-lg p-3 min-w-[300px] border-t-4 flex flex-col", statusColors[status])}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{STATUS_LABELS[status]}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        {storyPointsTotal > 0 && (
          <span className="text-xs text-muted-foreground">{storyPointsTotal} pts</span>
        )}
      </div>
      <div className="space-y-2 flex-1 min-h-[200px] overflow-y-auto scrollbar-thin">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} project={project} onClick={() => onTaskClick(task)} />
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
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TaskPriority,
    type: "TASK" as TaskType,
    assigneeId: "",
    dueDate: null as Date | null,
    storyPoints: null as number | null,
    labels: [] as string[],
  });

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
  const projectLabels = project?.labels || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => tasksAPI.create(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", type: "TASK", assigneeId: "", dueDate: null, storyPoints: null, labels: [] });
      toast({ title: "Task created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      tasksAPI.update(taskId, user!.id, updates),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setSelectedTask(updatedTask);
      toast({ title: "Task updated" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksAPI.changeStatus(taskId, user!.id, status),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setSelectedTask(updatedTask);
    },
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

  const filteredTasks = tasks?.filter((task) => {
    if (filterType !== "all" && task.type !== filterType) return false;
    if (filterAssignee !== "all" && task.assigneeId !== filterAssignee) return false;
    return true;
  });

  const isLoading = projectLoading || tasksLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6"><Skeleton className="h-96 w-full" /></div>
      </AppLayout>
    );
  }

  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = filteredTasks?.filter((t) => t.status === status) || [];
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const toggleLabel = (labelId: string) => {
    setNewTask((prev) => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter((id) => id !== labelId)
        : [...prev.labels, labelId],
    }));
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-4 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/projects"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-xl font-bold">{project?.name}</h1>
              <p className="text-sm text-muted-foreground">{project?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(["BUG", "FEATURE", "STORY", "TASK", "EPIC"] as TaskType[]).map((t) => (
                  <SelectItem key={t} value={t}>{TASK_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Assignee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Create Issue</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Issue</DialogTitle>
                  <DialogDescription>Create a new issue for {project?.name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormLabel>Issue Type</FormLabel>
                      <Select value={newTask.type} onValueChange={(v) => setNewTask((p) => ({ ...p, type: v as TaskType }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["BUG", "FEATURE", "STORY", "TASK", "EPIC"] as TaskType[]).map((t) => (
                            <SelectItem key={t} value={t}>
                              <div className="flex items-center gap-2">
                                <TaskTypeIcon type={t} />
                                {TASK_TYPE_LABELS[t]}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FormLabel>Priority</FormLabel>
                      <Select value={newTask.priority} onValueChange={(v) => setNewTask((p) => ({ ...p, priority: v as TaskPriority }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map((p) => (
                            <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Title</FormLabel>
                    <Input placeholder="What needs to be done?" value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Description</FormLabel>
                    <Textarea placeholder="Add a description..." className="min-h-[100px]" value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormLabel>Assignee</FormLabel>
                      <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask((p) => ({ ...p, assigneeId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                        <SelectContent>
                          {members.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="flex items-center gap-2">
                                <UserAvatar user={m} size="sm" />
                                {m.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Story Points</FormLabel>
                      <Select value={newTask.storyPoints?.toString() || ""} onValueChange={(v) => setNewTask((p) => ({ ...p, storyPoints: v ? parseInt(v) : null }))}>
                        <SelectTrigger><SelectValue placeholder="Estimate" /></SelectTrigger>
                        <SelectContent>
                          {STORY_POINTS.map((sp) => (
                            <SelectItem key={sp} value={sp.toString()}>{sp} points</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={newTask.dueDate || undefined} onSelect={(date) => setNewTask((p) => ({ ...p, dueDate: date || null }))} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Labels</FormLabel>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                      {projectLabels.map((label: Label) => (
                        <label key={label.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={newTask.labels.includes(label.id)} onCheckedChange={() => toggleLabel(label.id)} />
                          <LabelBadge label={label} />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={() => createMutation.mutate({ ...newTask, projectId: projectId!, assigneeId: newTask.assigneeId || null, reporterId: user!.id })} disabled={!newTask.title.trim()}>
                    Create Issue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {STATUS_ORDER.map((status) => (
            <StatusColumn key={status} status={status} tasks={tasksByStatus[status]} project={project} onTaskClick={setSelectedTask} />
          ))}
        </div>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedTask && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <TaskTypeBadge type={selectedTask.type} />
                    <span className="text-xs text-muted-foreground font-mono">{selectedTask.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="details" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel className="text-muted-foreground text-xs uppercase">Status</FormLabel>
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
                          <FormLabel className="text-muted-foreground text-xs uppercase">Assignee</FormLabel>
                          <Select value={selectedTask.assigneeId || ""} onValueChange={(v) => updateMutation.mutate({ taskId: selectedTask.id, updates: { assigneeId: v || null } })}>
                            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                            <SelectContent>
                              {members.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  <div className="flex items-center gap-2"><UserAvatar user={m} size="sm" />{m.name}</div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <FormLabel className="text-muted-foreground text-xs uppercase">Reporter</FormLabel>
                          <div className="flex items-center gap-2 p-2">
                            <UserAvatar user={members.find(m => m.id === selectedTask.reporterId)} size="sm" />
                            <span className="text-sm">{members.find(m => m.id === selectedTask.reporterId)?.name || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel className="text-muted-foreground text-xs uppercase">Priority</FormLabel>
                          <Select value={selectedTask.priority} onValueChange={(v) => updateMutation.mutate({ taskId: selectedTask.id, updates: { priority: v as TaskPriority } })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map((p) => (
                                <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <FormLabel className="text-muted-foreground text-xs uppercase">Story Points</FormLabel>
                          <Select value={selectedTask.storyPoints?.toString() || ""} onValueChange={(v) => updateMutation.mutate({ taskId: selectedTask.id, updates: { storyPoints: v ? parseInt(v) : null } })}>
                            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent>
                              {STORY_POINTS.map((sp) => (
                                <SelectItem key={sp} value={sp.toString()}>{sp} points</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <FormLabel className="text-muted-foreground text-xs uppercase">Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), "PPP") : "No due date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={selectedTask.dueDate ? new Date(selectedTask.dueDate) : undefined} onSelect={(date) => updateMutation.mutate({ taskId: selectedTask.id, updates: { dueDate: date || null } })} />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel className="text-muted-foreground text-xs uppercase">Description</FormLabel>
                      <div className="p-3 rounded-md border min-h-[100px] text-sm">
                        {selectedTask.description || <span className="text-muted-foreground">No description provided</span>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel className="text-muted-foreground text-xs uppercase">Labels</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {projectLabels.filter((l: Label) => selectedTask.labels.includes(l.id)).map((label: Label) => (
                          <LabelBadge key={label.id} label={label} size="md" />
                        ))}
                        {selectedTask.labels.length === 0 && <span className="text-sm text-muted-foreground">No labels</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        Created {format(new Date(selectedTask.createdAt), "PPP")} · Updated {format(new Date(selectedTask.updatedAt), "PPP")}
                      </div>
                      <PermissionGuard permission="canDeleteTask">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this issue?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(selectedTask.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </PermissionGuard>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-4">
                    <p className="text-muted-foreground text-center py-8">Activity history coming soon...</p>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
