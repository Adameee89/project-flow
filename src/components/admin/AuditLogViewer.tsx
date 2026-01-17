import { useQuery } from "@tanstack/react-query";
import { auditAPI } from "@/lib/api";
import { db } from "@/lib/db/database";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  UserCog,
  FolderKanban,
  ClipboardList,
  ArrowRight,
  Shield,
  UserPlus,
  UserMinus,
  Trash2,
  RotateCcw,
  GripVertical,
} from "lucide-react";

const actionIcons: Record<string, typeof FileText> = {
  CREATE_PROJECT: FolderKanban,
  DELETE_PROJECT: Trash2,
  UPDATE_PROJECT: FolderKanban,
  CREATE_TASK: ClipboardList,
  UPDATE_TASK: ClipboardList,
  DELETE_TASK: Trash2,
  CHANGE_STATUS: ArrowRight,
  DRAG_DROP_TASK: GripVertical,
  ROLE_CHANGE: Shield,
  ADD_USER_TO_PROJECT: UserPlus,
  REMOVE_USER_FROM_PROJECT: UserMinus,
  CREATE_USER: UserPlus,
  DEACTIVATE_USER: UserMinus,
  REACTIVATE_USER: RotateCcw,
};

const actionColors: Record<string, string> = {
  CREATE_PROJECT: "bg-green-500/10 text-green-600",
  DELETE_PROJECT: "bg-red-500/10 text-red-600",
  CREATE_TASK: "bg-blue-500/10 text-blue-600",
  DELETE_TASK: "bg-red-500/10 text-red-600",
  ROLE_CHANGE: "bg-purple-500/10 text-purple-600",
  DEACTIVATE_USER: "bg-orange-500/10 text-orange-600",
  REACTIVATE_USER: "bg-green-500/10 text-green-600",
  CREATE_USER: "bg-green-500/10 text-green-600",
  DRAG_DROP_TASK: "bg-cyan-500/10 text-cyan-600",
};

export function AuditLogViewer() {
  const { user } = useAuthStore();
  const allUsers = db.getUsers();

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditAPI.getAll(user!.id),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const formatAction = (action: string) => {
    return action.toLowerCase().replace(/_/g, " ");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Audit Log</CardTitle>
        </div>
        <CardDescription>
          Complete history of all system actions. Updates in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : auditLogs?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No actions logged yet</p>
            <p className="text-sm text-muted-foreground">Actions will appear here as they occur</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {auditLogs?.map((log) => {
                const actor = allUsers.find((u) => u.id === log.userId);
                const Icon = actionIcons[log.action] || FileText;
                const colorClass = actionColors[log.action] || "bg-muted text-muted-foreground";

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-md ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <UserAvatar user={actor} size="sm" />
                        <span className="font-medium">{actor?.name || "Unknown"}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatAction(log.action)}
                        </Badge>
                      </div>
                      {log.description && (
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                        <span className="font-mono">{log.entity.toLowerCase()}: {log.entityId.slice(0, 12)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
