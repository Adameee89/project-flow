import { usePermissions } from "@/stores/authStore";
import { Permission } from "@/lib/api/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PermissionGuardProps {
  permission: keyof Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

export function PermissionGuard({
  permission,
  children,
  fallback,
  showTooltip = true,
  tooltipMessage = "You don't have permission for this action",
}: PermissionGuardProps) {
  const permissions = usePermissions();
  
  if (!permissions) return null;
  
  const hasPermission = permissions[permission];
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  if (fallback) {
    if (showTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-not-allowed">{fallback}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return <>{fallback}</>;
  }
  
  return null;
}
