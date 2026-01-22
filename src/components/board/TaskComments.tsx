import { useState } from "react";
import { Comment, User } from "@/lib/types";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Send, Pencil, Trash2, X, Check, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCommentsProps {
  comments: Comment[];
  currentUserId: string;
  users: User[];
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export function TaskComments({
  comments,
  currentUserId,
  users,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      onUpdateComment(commentId, editContent.trim());
    }
    setEditingId(null);
    setEditContent("");
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      <div className="flex gap-3">
        <UserAvatar user={getUserById(currentUserId)} size="sm" />
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Press ⌘/Ctrl + Enter to submit
            </span>
            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet</p>
          <p className="text-xs">Be the first to comment on this task</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...comments].reverse().map((comment) => {
            const author = getUserById(comment.userId);
            const isOwner = comment.userId === currentUserId;
            const isEditing = editingId === comment.id;

            return (
              <div key={comment.id} className="flex gap-3 group">
                <UserAvatar user={author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{author?.name || "Unknown User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.updatedAt > comment.createdAt && (
                      <span className="text-xs text-muted-foreground">(edited)</span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(comment.id)}>
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                      {isOwner && (
                        <div className="absolute -right-2 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => handleEdit(comment)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => onDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
