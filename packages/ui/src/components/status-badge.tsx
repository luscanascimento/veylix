import { AssetStatus } from "@veylix/types";
import { Badge } from "../primitives/badge.js";

export interface StatusBadgeProps {
  status: AssetStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case AssetStatus.AVAILABLE:
      return (
        <Badge variant="success" className={className}>
          Available
        </Badge>
      );
    case AssetStatus.IN_USE:
      return (
        <Badge variant="default" className={className}>
          In Use
        </Badge>
      );
    case AssetStatus.MAINTENANCE:
      return (
        <Badge variant="warning" className={className}>
          Maintenance
        </Badge>
      );
    case AssetStatus.RETIRED:
      return (
        <Badge variant="secondary" className={className}>
          Retired
        </Badge>
      );
    case AssetStatus.LOST:
      return (
        <Badge variant="destructive" className={className}>
          Lost
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}
