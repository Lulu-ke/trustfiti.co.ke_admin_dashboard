import React from "react";
import Badge from "./Badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "neutral" | "info" | "purple"; label: string }> = {
  PUBLISHED: { variant: "success", label: "Published" },
  HIDDEN: { variant: "neutral", label: "Hidden" },
  FLAGGED: { variant: "warning", label: "Flagged" },
  REMOVED: { variant: "danger", label: "Removed" },
  PENDING: { variant: "warning", label: "Pending" },
  REVIEWED: { variant: "info", label: "Reviewed" },
  DISMISSED: { variant: "neutral", label: "Dismissed" },
  ACTIONED: { variant: "info", label: "Actioned" },
  APPROVED: { variant: "success", label: "Approved" },
  REJECTED: { variant: "danger", label: "Rejected" },
  NOT_SUBMITTED: { variant: "neutral", label: "Not Submitted" },
  UNDER_REVIEW: { variant: "info", label: "Under Review" },
  ACTIVE: { variant: "success", label: "Active" },
  INACTIVE: { variant: "neutral", label: "Inactive" },
  REVIEWER: { variant: "info", label: "Reviewer" },
  COMPANY_OWNER: { variant: "purple", label: "Company Owner" },
  ADMIN: { variant: "danger", label: "Admin" },
  INFO: { variant: "info", label: "Info" },
  WARNING: { variant: "warning", label: "Warning" },
  MAINTENANCE: { variant: "danger", label: "Maintenance" },
  UPDATE: { variant: "success", label: "Update" },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: "neutral" as const, label: status };
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
