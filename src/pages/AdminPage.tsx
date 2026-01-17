import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { auditAPI } from "@/lib/api";
import { db } from "@/lib/db/database";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, FileText, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminPage() {
  const { user } = useAuthStore();
  const allUsers = db.getUsers();
  const allProjects = db.getProjects();
  const allTasks = db.getTasks();

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditAPI.getAll(user!.id),
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">System overview and audit logs</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{allUsers.length}</div><p className="text-xs text-muted-foreground">{allUsers.filter(u => u.role === "ADMIN").length} admins</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Projects</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{allProjects.length}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Tasks</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{allTasks.length}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList><TabsTrigger value="users">Users</TabsTrigger><TabsTrigger value="audit">Audit Log</TabsTrigger></TabsList>
          
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader><CardTitle>All Users</CardTitle><CardDescription>20 seeded users in the system</CardDescription></CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {allUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <UserAvatar user={u} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${u.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Audit Log</CardTitle><CardDescription>All system actions are logged here</CardDescription></CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-48" /> : auditLogs?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No audit logs yet. Actions will appear here.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {auditLogs?.map((log) => {
                      const actor = allUsers.find((u) => u.id === log.userId);
                      return (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border text-sm">
                          <UserAvatar user={actor} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p><span className="font-medium">{actor?.name}</span> <span className="text-muted-foreground">{log.action.toLowerCase().replace(/_/g, " ")}</span></p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
