import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsAPI } from "@/lib/api";
import { db } from "@/lib/db/database";
import { User, Project } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FolderKanban, UserPlus, UserMinus, Users, AlertTriangle } from "lucide-react";

export function ProjectUserManagement() {
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [memberToRemove, setMemberToRemove] = useState<{ project: Project; user: User } | null>(null);

  const projects = db.getProjects();
  const allUsers = db.getActiveUsers();

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      projectsAPI.addMember(currentUser!.id, selectedProject!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add member",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectsAPI.removeMember(currentUser!.id, projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Member Removed" });
      setMemberToRemove(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to remove member",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handleAddMembers = async () => {
    for (const userId of selectedUsers) {
      await addMemberMutation.mutateAsync(userId);
    }
    toast({ title: "Members Added", description: `Added ${selectedUsers.length} member(s) to ${selectedProject?.name}` });
    setIsAddMembersOpen(false);
    setSelectedUsers([]);
  };

  const projectMembers = selectedProject
    ? allUsers.filter(u => selectedProject.memberIds.includes(u.id))
    : [];
  
  const nonMembers = selectedProject
    ? allUsers.filter(u => !selectedProject.memberIds.includes(u.id))
    : [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <CardTitle>Project Members</CardTitle>
          </div>
          <CardDescription>
            Add or remove users from projects. Removed users lose access immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Project</label>
            <Select
              value={selectedProject?.id || ""}
              onValueChange={(id) => setSelectedProject(projects.find(p => p.id === id) || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4" />
                      {project.name}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {project.memberIds.length} members
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members ({projectMembers.length})
                </h4>
                <Dialog open={isAddMembersOpen} onOpenChange={setIsAddMembersOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={nonMembers.length === 0}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Members
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Members to {selectedProject.name}</DialogTitle>
                      <DialogDescription>
                        Select users to add to this project.
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[300px] py-4">
                      <div className="space-y-2">
                        {nonMembers.map((u) => (
                          <label
                            key={u.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedUsers.includes(u.id)}
                              onCheckedChange={(checked) => {
                                setSelectedUsers(
                                  checked
                                    ? [...selectedUsers, u.id]
                                    : selectedUsers.filter(id => id !== u.id)
                                );
                              }}
                            />
                            <UserAvatar user={u} size="sm" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            <Badge variant="secondary" className="ml-auto text-xs">{u.role}</Badge>
                          </label>
                        ))}
                        {nonMembers.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            All users are already members
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMembersOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMembers} disabled={selectedUsers.length === 0}>
                        Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? "s" : ""}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-2">
                {projectMembers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={u} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                        {u.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setMemberToRemove({ project: selectedProject, user: u })}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Remove from Project
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Remove <strong>{memberToRemove?.user.name}</strong> from{" "}
                <strong>{memberToRemove?.project.name}</strong>?
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>They will lose access to this project immediately</li>
                <li>Their assigned tasks will become unassigned</li>
                <li>They can be re-added later</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                memberToRemove &&
                removeMemberMutation.mutate({
                  projectId: memberToRemove.project.id,
                  userId: memberToRemove.user.id,
                })
              }
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
