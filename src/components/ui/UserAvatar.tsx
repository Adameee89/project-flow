import { User } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium text-primary-foreground",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: user.avatarColor }}
    >
      {initials}
    </div>
  );
}
