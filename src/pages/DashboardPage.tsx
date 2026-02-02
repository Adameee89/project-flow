import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { projectsAPI, tasksAPI } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderKanban,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Task, TaskStatus } from "@/lib/types";
import { db } from "@/lib/db/database";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => projectsAPI.getAll(user!.id),
    enabled: !!user,
  });

  // Get all tasks from user's projects
  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["all-tasks", user?.id],
    queryFn: async () => {
      if (!projects) return [];
      const taskPromises = projects.map((p) => tasksAPI.getByProject(p.id, user!.id));
      const taskArrays = await Promise.all(taskPromises);
      return taskArrays.flat();
    },
    enabled: !!user && !!projects,
  });

  const myTasks = allTasks?.filter((t) => t.assigneeId === user?.id) || [];
  const users = db.getUsers();

  const tasksByStatus = allTasks?.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {} as Record<TaskStatus, number>
  ) || {};

  const recentTasks = [...(allTasks || [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const isLoading = projectsLoading || tasksLoading;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your projects today.
            </p>
          </div>
          <Link to="/projects">
            <Button>
              <FolderKanban className="mr-2 h-4 w-4" />
              View Projects
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{projects?.length || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Tasks
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{myTasks.length}</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-status-progress" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-status-progress">
                  {tasksByStatus["IN_PROGRESS"] || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-status-done" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-status-done">
                  {tasksByStatus["DONE"] || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks yet. Create your first task!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => {
                    const assignee = users.find((u) => u.id === task.assigneeId);
                    const project = projects?.find((p) => p.id === task.projectId);
                    
                    return (
                      <Link
                        key={task.id}
                        to={`/projects/${task.projectId}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar user={assignee} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {project?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={task.status} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    My Tasks
                  </CardTitle>
                  <CardDescription>Tasks assigned to you</CardDescription>
                </div>
                <Link to="/my-tasks">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : myTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks assigned to you yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {myTasks.slice(0, 5).map((task) => {
                    const project = projects?.find((p) => p.id === task.projectId);
                    
                    return (
                      <Link
                        key={task.id}
                        to={`/projects/${task.projectId}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {project?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={task.priority} showIcon={false} />
                          <StatusBadge status={task.status} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
