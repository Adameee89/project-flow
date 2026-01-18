import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: User | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  if (!user) {
    return (
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground",
          sizeClasses[size],
          className
        )}
      >
        ?
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.avatarUrl && (
        <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
      )}
      <AvatarFallback
        style={{ backgroundColor: user.avatarColor }}
        className="text-primary-foreground font-medium"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
