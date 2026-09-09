import { StatusBadge } from "../components/status-badge.js";
import { AssetStatus } from "@veylix/types";

export default {
  title: "Components/StatusBadge",
  component: StatusBadge,
};

export const AllStatuses = () => (
  <div className="flex gap-2">
    <StatusBadge status={AssetStatus.AVAILABLE} />
    <StatusBadge status={AssetStatus.IN_USE} />
    <StatusBadge status={AssetStatus.MAINTENANCE} />
    <StatusBadge status={AssetStatus.RETIRED} />
    <StatusBadge status={AssetStatus.LOST} />
  </div>
);
