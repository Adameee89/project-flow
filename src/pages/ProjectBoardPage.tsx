import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { useAuthStore } from "@/stores/authStore";
import { projectsAPI, tasksAPI } from "@/lib/api";
import { db } from "@/lib/db/database";
import { activityService } from "@/lib/db/activityService";
import { createMentionNotification, createCommentNotification, createAssignmentNotification } from "@/stores/notificationStore";
import { Task, TaskStatus, TaskPriority, TaskType, STATUS_ORDER, STATUS_LABELS, PRIORITY_LABELS, TASK_TYPE_LABELS, STORY_POINTS, Label, Attachment, PRIORITY_ORDER, TaskLinkType, TaskLink } from "@/lib/types";
import { AppLayout } from "@/components/layout/AppLayout";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { TaskTypeBadge, TaskTypeIcon } from "@/components/ui/TaskTypeBadge";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { DroppableColumn } from "@/components/board/DroppableColumn";
import { DraggableTaskCard } from "@/components/board/DraggableTaskCard";
import { TaskEditForm } from "@/components/board/TaskEditForm";
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
import { Plus, ArrowLeft, Trash2, CalendarIcon, Paperclip, X, FileText, Image } from "lucide-react";
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
      style={{ borderLeftColor: task.type === "BUG" ? "hsl(var(--type-bug))" : task.type === "EPIC" ? "hsl(var(--type-epic))" : task.type === "FEATURE" ? "hsl(var(--type-feature))" : task.type === "STORY" ? "hsl(var(--type-story))" : task.type === "SUBTASK" ? "hsl(var(--type-subtask))" : "hsl(var(--type-task))" }}
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
    WAITING: "border-t-status-waiting bg-status-waiting-bg/50",
    IN_PROGRESS: "border-t-status-progress bg-status-progress-bg/50",
    REVIEW: "border-t-status-review bg-status-review-bg/50",
    DONE: "border-t-status-done bg-status-done-bg/50",
  };

  const storyPointsTotal = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    return (
    <div className={cn("rounded-lg p-3 min-w-[280px] flex-1 border-t-4 flex flex-col", statusColors[status])}>
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

// Wrapper component to handle comments and links state
interface TaskEditFormWithDataProps {
  selectedTask: Task;
  project: any;
  members: any[];
  projectLabels: Label[];
  tasks: Task[];
  user: { id: string };
  onUpdate: (updates: Partial<Task>) => void;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
  formatFileSize: (bytes: number) => string;
  queryClient: any;
  projectId: string;
}

function TaskEditFormWithData({
  selectedTask,
  project,
  members,
  projectLabels,
  tasks,
  user,
  onUpdate,
  onStatusChange,
  onDelete,
  formatFileSize,
  queryClient,
  projectId,
}: TaskEditFormWithDataProps) {
  // Get task links for this task
  const taskLinks = useMemo(() => {
    return db.getTaskLinks(selectedTask.id);
  }, [selectedTask.id, selectedTask.linkedTaskIds]);

  // Comment handlers with mentions and notifications
  const handleAddComment = (content: string, mentions: string[]) => {
    const comment = db.addComment(selectedTask.id, user.id, content, mentions);
    if (comment) {
      const currentUser = db.getUserById(user.id);
      const task = db.getTaskById(selectedTask.id);
      
      // Track activity
      activityService.trackCommentAdded(selectedTask.id, user.id, comment.id);
      
      // Send notifications for mentions
      mentions.forEach(mentionedUserId => {
        createMentionNotification(
          mentionedUserId,
          selectedTask.id,
          selectedTask.title,
          selectedTask.projectId,
          user.id,
          currentUser?.name || "Someone"
        );
      });
      
      // Notify assignee if they're not the commenter and not mentioned
      if (task?.assigneeId && task.assigneeId !== user.id && !mentions.includes(task.assigneeId)) {
        createCommentNotification(
          task.assigneeId,
          selectedTask.id,
          selectedTask.title,
          selectedTask.projectId,
          user.id,
          currentUser?.name || "Someone"
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  };

  const handleUpdateComment = (commentId: string, content: string, mentions: string[]) => {
    db.updateComment(selectedTask.id, commentId, content, mentions);
    activityService.trackCommentUpdated(selectedTask.id, user.id, commentId);
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const handleDeleteComment = (commentId: string) => {
    db.deleteComment(selectedTask.id, commentId);
    activityService.trackCommentDeleted(selectedTask.id, user.id);
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  // Task link handlers
  const handleAddLink = (targetTaskId: string, linkType: TaskLinkType) => {
    const link = db.addTaskLink(selectedTask.id, targetTaskId, linkType, user.id);
    if (link) {
      const targetTask = db.getTaskById(targetTaskId);
      activityService.trackLinkAdded(selectedTask.id, user.id, targetTask?.title || "Unknown", linkType);
    }
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  const handleRemoveLink = (linkId: string) => {
    const links = db.getTaskLinks(selectedTask.id);
    const link = links.find(l => l.id === linkId);
    if (link) {
      const targetId = link.sourceTaskId === selectedTask.id ? link.targetTaskId : link.sourceTaskId;
      const targetTask = db.getTaskById(targetId);
      activityService.trackLinkRemoved(selectedTask.id, user.id, targetTask?.title || "Unknown");
    }
    db.removeTaskLink(linkId);
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  };

  // Get updated task from cache or use selected
  const currentTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;

  return (
    <TaskEditForm
      task={currentTask}
      project={project}
      members={members}
      projectLabels={projectLabels}
      allTasks={tasks}
      taskLinks={taskLinks}
      currentUserId={user.id}
      onUpdate={onUpdate}
      onStatusChange={onStatusChange}
      onDelete={onDelete}
      onAddComment={handleAddComment}
      onUpdateComment={handleUpdateComment}
      onDeleteComment={handleDeleteComment}
      onAddLink={handleAddLink}
      onRemoveLink={handleRemoveLink}
      formatFileSize={formatFileSize}
    />
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
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterLabel, setFilterLabel] = useState<string>("all");
  const [filterDue, setFilterDue] = useState<string>("all");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TaskPriority,
    type: "TASK" as TaskType,
    assigneeId: "",
    dueDate: null as Date | null,
    storyPoints: null as number | null,
    labels: [] as string[],
    attachments: [] as Attachment[],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      setNewTask({ title: "", description: "", priority: "MEDIUM", type: "TASK", assigneeId: "", dueDate: null, storyPoints: null, labels: [], attachments: [] });
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
    if (filterAssignee === "unassigned" && task.assigneeId !== null) return false;
    if (filterAssignee !== "all" && filterAssignee !== "unassigned" && task.assigneeId !== filterAssignee) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterLabel !== "all" && !task.labels.includes(filterLabel)) return false;
    if (filterDue === "overdue" && (!task.dueDate || !isPast(new Date(task.dueDate)) || task.status === "DONE")) return false;
    if (filterDue === "today" && (!task.dueDate || !isToday(new Date(task.dueDate)))) return false;
    if (filterDue === "upcoming" && (!task.dueDate || isPast(new Date(task.dueDate)))) return false;
    if (filterDue === "none" && task.dueDate) return false;
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments: Attachment[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        url,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
      });
    });
    
    setNewTask((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));
  };

  const removeAttachment = (attachmentId: string) => {
    const attachment = newTask.attachments.find((a) => a.id === attachmentId);
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
    }
    setNewTask((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attachmentId),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = filteredTasks?.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const task = filteredTasks?.find((t) => t.id === taskId);
    if (!task) return;

    // Check if dropped over a column (status)
    const newStatus = STATUS_ORDER.includes(over.id as TaskStatus) 
      ? (over.id as TaskStatus)
      : filteredTasks?.find((t) => t.id === over.id)?.status;
    
    if (newStatus && newStatus !== task.status) {
      statusMutation.mutate({ taskId, status: newStatus });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // For visual feedback during drag
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
              <SelectTrigger className="w-28"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(["BUG", "FEATURE", "STORY", "TASK", "EPIC"] as TaskType[]).map((t) => (
                  <SelectItem key={t} value={t}>{TASK_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {PRIORITY_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Assignee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
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
            
            <Select value={filterLabel} onValueChange={setFilterLabel}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Label" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labels</SelectItem>
                {projectLabels.map((label: Label) => (
                  <SelectItem key={label.id} value={label.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterDue} onValueChange={setFilterDue}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Due" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="none">No Due Date</SelectItem>
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
                  
                  <div className="space-y-2">
                    <FormLabel>Attachments</FormLabel>
                    <div className="border rounded-md p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="file-upload"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attach files
                        </Button>
                        <span className="text-xs text-muted-foreground">Images, documents, or any file</span>
                      </div>
                      
                      {newTask.attachments.length > 0 && (
                        <div className="space-y-2">
                          {newTask.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                              <div className="flex items-center gap-2 min-w-0">
                                {attachment.type.startsWith("image/") ? (
                                  <Image className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span className="text-sm truncate">{attachment.name}</span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">({formatFileSize(attachment.size)})</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin w-full">
            {STATUS_ORDER.map((status) => (
              <DroppableColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                project={project}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeTask && (
              <Card className="p-3 shadow-lg border-l-4 opacity-90 rotate-3" style={{ borderLeftColor: activeTask.type === "BUG" ? "hsl(var(--type-bug))" : activeTask.type === "EPIC" ? "hsl(var(--type-epic))" : activeTask.type === "FEATURE" ? "hsl(var(--type-feature))" : activeTask.type === "STORY" ? "hsl(var(--type-story))" : activeTask.type === "SUBTASK" ? "hsl(var(--type-subtask))" : "hsl(var(--type-task))" }}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TaskTypeIcon type={activeTask.type} />
                    <span className="text-xs text-muted-foreground font-mono">{activeTask.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <p className="font-medium text-sm">{activeTask.title}</p>
                </div>
              </Card>
            )}
          </DragOverlay>
        </DndContext>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedTask && (
              <TaskEditFormWithData
                selectedTask={selectedTask}
                project={project}
                members={members}
                projectLabels={projectLabels}
                tasks={tasks || []}
                user={user!}
                onUpdate={(updates) => updateMutation.mutate({ taskId: selectedTask.id, updates })}
                onStatusChange={(status) => statusMutation.mutate({ taskId: selectedTask.id, status })}
                onDelete={() => deleteMutation.mutate(selectedTask.id)}
                formatFileSize={formatFileSize}
                queryClient={queryClient}
                projectId={projectId!}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
