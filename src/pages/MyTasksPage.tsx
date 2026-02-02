import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { projectsAPI, tasksAPI } from "@/lib/api";
import { db } from "@/lib/db/database";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyTasksPage() {
  const { user } = useAuthStore();

  const { data: projects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => projectsAPI.getAll(user!.id),
    enabled: !!user,
  });

  const { data: allTasks, isLoading } = useQuery({
    queryKey: ["all-tasks", user?.id],
    queryFn: async () => {
      if (!projects) return [];
      const taskArrays = await Promise.all(projects.map((p) => tasksAPI.getByProject(p.id, user!.id)));
      return taskArrays.flat();
    },
    enabled: !!user && !!projects,
  });

  const myTasks = allTasks?.filter((t) => t.assigneeId === user?.id) || [];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto overflow-x-hidden">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">All tasks assigned to you</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : myTasks.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12"><ClipboardList className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">No tasks assigned to you</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {myTasks.map((task) => {
              const project = projects?.find((p) => p.id === task.projectId);
              return (
                <Link key={task.id} to={`/projects/${task.projectId}`}>
                  <Card className="hover:shadow-card-hover transition-shadow">
                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{project?.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
