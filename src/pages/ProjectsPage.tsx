import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "@/stores/authStore";
import { projectsAPI, usersAPI } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FolderKanban, Users, ArrowRight, Trash2, Pencil, Tag } from "lucide-react";
import { User, Project, ProjectTag, PROJECT_TAG_LABELS, PROJECT_TAG_COLORS } from "@/lib/types";
import { db } from "@/lib/db/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ALL_PROJECT_TAGS: ProjectTag[] = ["DEVELOPMENT", "MARKETING", "DESIGN", "RESEARCH", "OPERATIONS", "SUPPORT", "INTERNAL", "CLIENT"];

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    memberIds: [] as string[],
    tags: [] as ProjectTag[],
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    tags: [] as ProjectTag[],
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => projectsAPI.getAll(user!.id),
    enabled: !!user,
  });

  const allUsers = db.getUsers();

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string; memberIds: string[]; tags: ProjectTag[] }) =>
      projectsAPI.create(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateOpen(false);
      setNewProject({ name: "", description: "", memberIds: [], tags: [] });
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: { name?: string; description?: string; tags?: ProjectTag[] } }) =>
      projectsAPI.update(projectId, user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditProject(null);
      toast({
        title: "Project updated",
        description: "Project has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => projectsAPI.delete(projectId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    const memberIds = [...new Set([user!.id, ...newProject.memberIds])];
    createMutation.mutate({ ...newProject, memberIds });
  };

  const handleUpdateProject = () => {
    if (!editProject || !editForm.name.trim()) return;
    updateMutation.mutate({
      projectId: editProject.id,
      updates: {
        name: editForm.name,
        description: editForm.description,
        tags: editForm.tags,
      },
    });
  };

  const openEditDialog = (project: Project) => {
    setEditProject(project);
    setEditForm({
      name: project.name,
      description: project.description,
      tags: project.tags || [],
    });
  };

  const toggleMember = (userId: string) => {
    setNewProject((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }));
  };

  const toggleNewTag = (tag: ProjectTag) => {
    setNewProject((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleEditTag = (tag: ProjectTag) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "All projects in the system" : "Projects you're a member of"}
            </p>
          </div>
          
          <PermissionGuard
            permission="canCreateProject"
            fallback={
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            }
            tooltipMessage="Only admins can create projects"
          >
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project and select team members.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Website Redesign"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the project"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_PROJECT_TAGS.map((tag) => (
                        <Badge
                          key={tag}
                          variant={newProject.tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          style={{
                            backgroundColor: newProject.tags.includes(tag) ? PROJECT_TAG_COLORS[tag] : "transparent",
                            borderColor: PROJECT_TAG_COLORS[tag],
                            color: newProject.tags.includes(tag) ? "white" : PROJECT_TAG_COLORS[tag],
                          }}
                          onClick={() => toggleNewTag(tag)}
                        >
                          {PROJECT_TAG_LABELS[tag]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {allUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 p-2 hover:bg-accent"
                        >
                          <Checkbox
                            id={u.id}
                            checked={u.id === user?.id || newProject.memberIds.includes(u.id)}
                            disabled={u.id === user?.id}
                            onCheckedChange={() => toggleMember(u.id)}
                          />
                          <UserAvatar user={u} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          {u.role === "ADMIN" && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              Admin
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProject.name.trim() || createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        {/* Edit Project Dialog */}
        <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project details and tags.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Project Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PROJECT_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={editForm.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor: editForm.tags.includes(tag) ? PROJECT_TAG_COLORS[tag] : "transparent",
                        borderColor: PROJECT_TAG_COLORS[tag],
                        color: editForm.tags.includes(tag) ? "white" : PROJECT_TAG_COLORS[tag],
                      }}
                      onClick={() => toggleEditTag(tag)}
                    >
                      {PROJECT_TAG_LABELS[tag]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditProject(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProject}
                disabled={!editForm.name.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                {isAdmin
                  ? "Create your first project to get started."
                  : "You haven't been added to any projects yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => {
              const members = allUsers.filter((u) => project.memberIds.includes(u.id));
              const taskCount = db.getTasksByProjectId(project.id).length;
              const projectTags = project.tags || [];
              
              return (
                <Card key={project.id} className="shadow-card hover:shadow-card-hover transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {project.description}
                        </CardDescription>
                        {projectTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {projectTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: PROJECT_TAG_COLORS[tag],
                                  color: PROJECT_TAG_COLORS[tag],
                                }}
                              >
                                {PROJECT_TAG_LABELS[tag]}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <PermissionGuard permission="canCreateProject">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(project)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="canDeleteProject">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{project.name}" and all its tasks.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(project.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{members.length} members</span>
                        <span className="text-border">•</span>
                        <span>{taskCount} tasks</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {members.slice(0, 5).map((member) => (
                            <UserAvatar
                              key={member.id}
                              user={member}
                              size="sm"
                              className="border-2 border-card"
                            />
                          ))}
                          {members.length > 5 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                              +{members.length - 5}
                            </div>
                          )}
                        </div>
                        
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="ghost" size="sm">
                            Open
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}