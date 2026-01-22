import { useState, useRef } from "react";
import { Task, TaskStatus, TaskPriority, TaskType, STATUS_ORDER, STATUS_LABELS, PRIORITY_LABELS, TASK_TYPE_LABELS, STORY_POINTS, Label, Attachment, User, Project, TaskLink, TaskLinkType } from "@/lib/types";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { TaskTypeBadge } from "@/components/ui/TaskTypeBadge";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { TaskComments } from "@/components/board/TaskComments";
import { TaskLinks } from "@/components/board/TaskLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as FormLabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, CalendarIcon, Paperclip, X, FileText, Image, Pencil, Check, Download, MessageCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskEditFormProps {
  task: Task;
  project: Project | undefined;
  members: User[];
  projectLabels: Label[];
  allTasks: Task[];
  taskLinks: TaskLink[];
  currentUserId: string;
  onUpdate: (updates: Partial<Task>) => void;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddLink: (targetTaskId: string, linkType: TaskLinkType) => void;
  onRemoveLink: (linkId: string) => void;
  formatFileSize: (bytes: number) => string;
}

export function TaskEditForm({
  task,
  project,
  members,
  projectLabels,
  allTasks,
  taskLinks,
  currentUserId,
  onUpdate,
  onStatusChange,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddLink,
  onRemoveLink,
  formatFileSize,
}: TaskEditFormProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (editDesc !== task.description) {
      onUpdate({ description: editDesc });
    }
    setIsEditingDesc(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments: Attachment[] = [...(task.attachments || [])];
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
    
    onUpdate({ attachments: newAttachments });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (attachmentId: string) => {
    const attachment = task.attachments?.find((a) => a.id === attachmentId);
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
    }
    onUpdate({
      attachments: (task.attachments || []).filter((a) => a.id !== attachmentId),
    });
  };

  const toggleLabel = (labelId: string) => {
    const currentLabels = task.labels || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];
    onUpdate({ labels: newLabels });
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <Select value={task.type} onValueChange={(v) => onUpdate({ type: v as TaskType })}>
            <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent">
              <TaskTypeBadge type={task.type} />
            </SelectTrigger>
            <SelectContent>
              {(["BUG", "FEATURE", "STORY", "TASK", "EPIC"] as TaskType[]).map((t) => (
                <SelectItem key={t} value={t}>{TASK_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground font-mono">{task.id.slice(-8).toUpperCase()}</span>
        </div>
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-xl font-semibold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
            />
            <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <DialogTitle 
            className="text-xl cursor-pointer hover:bg-accent rounded px-1 -mx-1 group flex items-center gap-2"
            onClick={() => {
              setEditTitle(task.title);
              setIsEditingTitle(true);
            }}
          >
            {task.title}
            <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </DialogTitle>
        )}
      </DialogHeader>
      
      <Tabs defaultValue="details" className="mt-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            Comments {(task.comments?.length || 0) > 0 && `(${task.comments?.length})`}
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            Links {(taskLinks?.length || 0) > 0 && `(${taskLinks?.length})`}
          </TabsTrigger>
          <TabsTrigger value="attachments">
            Attachments {(task.attachments?.length || 0) > 0 && `(${task.attachments?.length})`}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel className="text-muted-foreground text-xs uppercase">Status</FormLabel>
                <Select value={task.status} onValueChange={(v) => onStatusChange(v as TaskStatus)}>
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
                <Select value={task.assigneeId || "unassigned"} onValueChange={(v) => onUpdate({ assigneeId: v === "unassigned" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
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
                  <UserAvatar user={members.find(m => m.id === task.reporterId)} size="sm" />
                  <span className="text-sm">{members.find(m => m.id === task.reporterId)?.name || "Unknown"}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel className="text-muted-foreground text-xs uppercase">Priority</FormLabel>
                <Select value={task.priority} onValueChange={(v) => onUpdate({ priority: v as TaskPriority })}>
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
                <Select value={task.storyPoints?.toString() || "none"} onValueChange={(v) => onUpdate({ storyPoints: v === "none" ? null : parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
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
                      {task.dueDate ? format(new Date(task.dueDate), "PPP") : "No due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single" 
                      selected={task.dueDate ? new Date(task.dueDate) : undefined} 
                      onSelect={(date) => onUpdate({ dueDate: date || null })} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel className="text-muted-foreground text-xs uppercase">Description</FormLabel>
              {!isEditingDesc && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditDesc(task.description);
                  setIsEditingDesc(true);
                }}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            {isEditingDesc ? (
              <div className="space-y-2">
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="min-h-[120px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveDesc}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div 
                className="p-3 rounded-md border min-h-[100px] text-sm cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => {
                  setEditDesc(task.description);
                  setIsEditingDesc(true);
                }}
              >
                {task.description || <span className="text-muted-foreground">Click to add description...</span>}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <FormLabel className="text-muted-foreground text-xs uppercase">Labels</FormLabel>
            <div className="flex flex-wrap gap-2">
              {projectLabels.map((label: Label) => (
                <div
                  key={label.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    task.labels.includes(label.id) ? "ring-2 ring-offset-2 ring-primary rounded" : "opacity-60 hover:opacity-100"
                  )}
                  onClick={() => toggleLabel(label.id)}
                >
                  <LabelBadge label={label} size="md" />
                </div>
              ))}
              {projectLabels.length === 0 && <span className="text-sm text-muted-foreground">No labels available</span>}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Created {format(new Date(task.createdAt), "PPP")} · Updated {format(new Date(task.updatedAt), "PPP")}
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
                    <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </PermissionGuard>
          </div>
        </TabsContent>
        
        <TabsContent value="attachments" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {(task.attachments?.length || 0)} attachment{(task.attachments?.length || 0) !== 1 ? "s" : ""}
            </p>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="mr-2 h-4 w-4" />
                Add Files
              </Button>
            </div>
          </div>
          
          {(task.attachments?.length || 0) === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No attachments yet</p>
              <Button variant="link" onClick={() => fileInputRef.current?.click()}>
                Add files to this issue
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {task.attachments?.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 border rounded-lg group hover:bg-accent/50 transition-colors"
                >
                  {attachment.type.startsWith("image/") ? (
                    <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)} · {format(new Date(attachment.uploadedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a href={attachment.url} download={attachment.name}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-4">
          <TaskComments
            comments={task.comments || []}
            currentUserId={currentUserId}
            users={members}
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
          />
        </TabsContent>

        {/* Links Tab */}
        <TabsContent value="links" className="mt-4">
          <TaskLinks
            currentTask={task}
            allTasks={allTasks}
            taskLinks={taskLinks}
            onAddLink={onAddLink}
            onRemoveLink={onRemoveLink}
          />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
          <p className="text-muted-foreground text-center py-8">Activity history coming soon...</p>
        </TabsContent>
      </Tabs>
    </>
  );
}