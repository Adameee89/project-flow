import { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
  onAddComment: (content: string, mentions: string[]) => void;
  onUpdateComment: (commentId: string, content: string, mentions: string[]) => void;
  onDeleteComment: (commentId: string) => void;
}

// Parse @mentions from text and return mentioned user IDs
function extractMentions(content: string, users: User[]): string[] {
  const mentionRegex = /@(\w+(?:\s\w+)?)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionName = match[1].toLowerCase();
    const user = users.find(u => 
      u.name.toLowerCase() === mentionName ||
      u.name.toLowerCase().startsWith(mentionName)
    );
    if (user && !mentions.includes(user.id)) {
      mentions.push(user.id);
    }
  }
  
  return mentions;
}

// Render comment content with highlighted @mentions
function renderContentWithMentions(content: string, users: User[], onUserClick?: (userId: string) => void) {
  const parts: React.ReactNode[] = [];
  const mentionRegex = /@(\w+(?:\s\w+)?)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    const mentionName = match[1].toLowerCase();
    const user = users.find(u => 
      u.name.toLowerCase() === mentionName ||
      u.name.toLowerCase().startsWith(mentionName)
    );

    if (user) {
      parts.push(
        <button
          key={match.index}
          className="text-primary hover:underline font-medium bg-primary/10 px-1 rounded cursor-pointer"
          onClick={() => onUserClick?.(user.id)}
        >
          @{user.name}
        </button>
      );
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
}

interface MentionSuggestionsProps {
  users: User[];
  filter: string;
  onSelect: (user: User) => void;
  visible: boolean;
  position: { top: number; left: number };
}

function MentionSuggestions({ users, filter, onSelect, visible, position }: MentionSuggestionsProps) {
  const filteredUsers = useMemo(() => 
    users.filter(u => 
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase())
    ).slice(0, 5),
    [users, filter]
  );

  if (!visible || filteredUsers.length === 0) return null;

  return (
    <div 
      className="absolute z-50 w-56 bg-popover border rounded-md shadow-lg p-1"
      style={{ top: position.top, left: position.left }}
    >
      {filteredUsers.map(user => (
        <button
          key={user.id}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm text-left"
          onClick={() => onSelect(user)}
        >
          <UserAvatar user={user} size="xs" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  users: User[];
  placeholder?: string;
  autoFocus?: boolean;
}

function CommentInput({ value, onChange, onSubmit, users, placeholder = "Add a comment...", autoFocus }: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(newValue);
    setCursorPosition(cursor);

    // Check if we're in the middle of typing a mention
    const textBeforeCursor = newValue.substring(0, cursor);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionFilter(mentionMatch[1]);
      setShowMentions(true);
      // Position the suggestions below the textarea
      setMentionPosition({ top: 80, left: 0 });
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user: User) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const newText = 
        textBeforeCursor.substring(0, mentionMatch.index) + 
        `@${user.name} ` + 
        textAfterCursor;
      onChange(newText);
    }
    
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === "Escape") {
      setShowMentions(false);
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="min-h-[80px] resize-none"
        autoFocus={autoFocus}
      />
      <MentionSuggestions
        users={users}
        filter={mentionFilter}
        onSelect={handleMentionSelect}
        visible={showMentions}
        position={mentionPosition}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Type @ to mention someone. Press ⌘/Ctrl + Enter to submit.
      </p>
    </div>
  );
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
      const mentions = extractMentions(newComment.trim(), users);
      onAddComment(newComment.trim(), mentions);
      setNewComment("");
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      const mentions = extractMentions(editContent.trim(), users);
      onUpdateComment(commentId, editContent.trim(), mentions);
    }
    setEditingId(null);
    setEditContent("");
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const handleUserClick = (userId: string) => {
    // Could navigate to user profile or show user info
    console.log("User clicked:", userId);
  };

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      <div className="flex gap-3">
        <UserAvatar user={getUserById(currentUserId)} size="sm" />
        <div className="flex-1 space-y-2">
          <CommentInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleSubmit}
            users={users}
          />
          <div className="flex justify-end">
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
                      <CommentInput
                        value={editContent}
                        onChange={setEditContent}
                        onSubmit={() => handleSaveEdit(comment.id)}
                        users={users}
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
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {renderContentWithMentions(comment.content, users, handleUserClick)}
                      </p>
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