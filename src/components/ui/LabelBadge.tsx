import { Label } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LabelBadgeProps {
  label: Label;
  size?: "sm" | "md";
  className?: string;
}

export function LabelBadge({ label, size = "sm", className }: LabelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
      }}
    >
      {label.name}
    </span>
  );
}
