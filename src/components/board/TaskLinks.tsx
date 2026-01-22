import { useState, useMemo } from "react";
import { Task, TaskLink, TaskLinkType, TASK_LINK_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TaskTypeIcon } from "@/components/ui/TaskTypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link2, Plus, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface TaskLinksProps {
  currentTask: Task;
  allTasks: Task[];
  taskLinks: TaskLink[];
  onAddLink: (targetTaskId: string, linkType: TaskLinkType) => void;
  onRemoveLink: (linkId: string) => void;
}

export function TaskLinks({
  currentTask,
  allTasks,
  taskLinks,
  onAddLink,
  onRemoveLink,
}: TaskLinksProps) {
  const navigate = useNavigate();
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedLinkType, setSelectedLinkType] = useState<TaskLinkType>("RELATES_TO");
  const [searchOpen, setSearchOpen] = useState(false);

  // Get linked task info
  const linkedTasksInfo = useMemo(() => {
    return taskLinks.map(link => {
      const linkedTaskId = link.sourceTaskId === currentTask.id ? link.targetTaskId : link.sourceTaskId;
      const linkedTask = allTasks.find(t => t.id === linkedTaskId);
      const displayLinkType = link.sourceTaskId === currentTask.id ? link.linkType : getReverseLinkType(link.linkType);
      return {
        link,
        linkedTask,
        displayLinkType,
      };
    }).filter(info => info.linkedTask);
  }, [taskLinks, currentTask.id, allTasks]);

  // Available tasks to link (exclude already linked and current task)
  const availableTasks = useMemo(() => {
    const linkedIds = new Set(currentTask.linkedTaskIds);
    linkedIds.add(currentTask.id);
    return allTasks.filter(t => !linkedIds.has(t.id));
  }, [allTasks, currentTask]);

  const selectedTask = availableTasks.find(t => t.id === selectedTaskId);

  const handleAddLink = () => {
    if (selectedTaskId && selectedLinkType) {
      onAddLink(selectedTaskId, selectedLinkType);
      setSelectedTaskId("");
      setSelectedLinkType("RELATES_TO");
      setIsAddingLink(false);
    }
  };

  const navigateToTask = (task: Task) => {
    navigate(`/projects/${task.projectId}?task=${task.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Linked Issues
        </h4>
        {!isAddingLink && (
          <Button variant="ghost" size="sm" onClick={() => setIsAddingLink(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Link issue
          </Button>
        )}
      </div>

      {/* Add link form */}
      {isAddingLink && (
        <div className="p-3 border rounded-lg space-y-3 bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">This issue</span>
            <Select value={selectedLinkType} onValueChange={(v) => setSelectedLinkType(v as TaskLinkType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TASK_LINK_LABELS) as TaskLinkType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {TASK_LINK_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-start text-left font-normal"
              >
                {selectedTask ? (
                  <div className="flex items-center gap-2 truncate">
                    <TaskTypeIcon type={selectedTask.type} />
                    <span className="truncate">{selectedTask.title}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Search for an issue...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search issues..." />
                <CommandList>
                  <CommandEmpty>No issues found.</CommandEmpty>
                  <CommandGroup>
                    {availableTasks.map((task) => (
                      <CommandItem
                        key={task.id}
                        value={`${task.id} ${task.title}`}
                        onSelect={() => {
                          setSelectedTaskId(task.id);
                          setSearchOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <TaskTypeIcon type={task.type} />
                          <span className="flex-1 truncate">{task.title}</span>
                          <StatusBadge status={task.status} />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddLink} disabled={!selectedTaskId}>
              Link
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setIsAddingLink(false);
              setSelectedTaskId("");
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Linked tasks list */}
      {linkedTasksInfo.length === 0 && !isAddingLink ? (
        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
          <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No linked issues</p>
          <Button variant="link" size="sm" onClick={() => setIsAddingLink(true)}>
            Link an issue
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {linkedTasksInfo.map(({ link, linkedTask, displayLinkType }) => (
            <div
              key={link.id}
              className="flex items-center gap-2 p-2 border rounded-lg group hover:bg-accent/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground shrink-0 w-24">
                {TASK_LINK_LABELS[displayLinkType]}
              </span>
              <TaskTypeIcon type={linkedTask!.type} />
              <span 
                className="flex-1 text-sm truncate cursor-pointer hover:underline"
                onClick={() => navigateToTask(linkedTask!)}
              >
                {linkedTask!.title}
              </span>
              <StatusBadge status={linkedTask!.status} />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigateToTask(linkedTask!)}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveLink(link.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getReverseLinkType(linkType: TaskLinkType): TaskLinkType {
  switch (linkType) {
    case "BLOCKS":
      return "BLOCKED_BY";
    case "BLOCKED_BY":
      return "BLOCKS";
    case "DUPLICATES":
      return "DUPLICATED_BY";
    case "DUPLICATED_BY":
      return "DUPLICATES";
    default:
      return linkType;
  }
}
