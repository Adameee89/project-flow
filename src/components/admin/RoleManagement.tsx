import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { User, Role } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Shield, User as UserIcon, AlertTriangle } from "lucide-react";

interface RoleManagementProps {
  users: User[];
}

export function RoleManagement({ users }: RoleManagementProps) {
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingChange, setPendingChange] = useState<{ userId: string; newRole: Role; userName: string } | null>(null);

  const roleChangeMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      usersAPI.changeRole(currentUser!.id, userId, role),
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Role Updated",
        description: `${pendingChange?.userName}'s role has been changed to ${role}`,
      });
      setPendingChange(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to change role",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setPendingChange(null);
    },
  });

  const handleRoleSelect = (userId: string, newRole: Role, userName: string) => {
    setPendingChange({ userId, newRole, userName });
  };

  const confirmRoleChange = () => {
    if (pendingChange) {
      roleChangeMutation.mutate({ userId: pendingChange.userId, role: pendingChange.newRole });
    }
  };

  const activeUsers = users.filter(u => u.isActive);
  const adminCount = activeUsers.filter(u => u.role === "ADMIN").length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Role Management</CardTitle>
          </div>
          <CardDescription>
            Manage user roles. Admins have full system access, Users have limited permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeUsers.map((u) => {
              const isSelf = u.id === currentUser?.id;
              const isLastAdmin = u.role === "ADMIN" && adminCount <= 1;
              const canChange = !isSelf && !isLastAdmin;

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar user={u} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{u.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelf && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                    
                    {canChange ? (
                      <Select
                        value={u.role}
                        onValueChange={(value) => handleRoleSelect(u.id, value as Role, u.name)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="USER">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-3 w-3" />
                              User
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground cursor-not-allowed">
                            {u.role === "ADMIN" ? (
                              <Shield className="h-3 w-3" />
                            ) : (
                              <UserIcon className="h-3 w-3" />
                            )}
                            {u.role}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isSelf
                            ? "You cannot change your own role"
                            : "At least one admin must exist"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingChange} onOpenChange={() => setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change <strong>{pendingChange?.userName}</strong>'s role to{" "}
              <strong>{pendingChange?.newRole}</strong>.
              {pendingChange?.newRole === "ADMIN" && (
                <span className="block mt-2 text-warning">
                  Admins have full access to all system features including user management,
                  project deletion, and audit logs.
                </span>
              )}
              {pendingChange?.newRole === "USER" && (
                <span className="block mt-2">
                  This user will lose admin privileges immediately.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
