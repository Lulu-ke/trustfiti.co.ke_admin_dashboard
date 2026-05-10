import React from "react";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  createdAt: string;
  admin?: {
    id: string;
    fullName: string | null;
    avatar: string | null;
  };
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

const actionColors: Record<string, "success" | "warning" | "danger" | "neutral" | "info" | "purple"> = {
  APPROVE_COMPANY: "success",
  REJECT_COMPANY: "danger",
  SUSPEND_COMPANY: "danger",
  UPDATE_REVIEW_STATUS: "info",
  RESOLVE_FLAG_DISMISSED: "neutral",
  RESOLVE_FLAG_ACTIONED: "warning",
  DEACTIVATE_USER: "danger",
  UPDATE_USER: "info",
  UPDATE_SETTINGS: "purple",
  CREATE_CATEGORY: "success",
  CREATE_ANNOUNCEMENT: "info",
  BULK_DEACTIVATE_USERS: "danger",
};

const actionLabels: Record<string, string> = {
  APPROVE_COMPANY: "Approved company",
  REJECT_COMPANY: "Rejected company",
  SUSPEND_COMPANY: "Suspended company",
  REACTIVATE_COMPANY: "Reactivated company",
  UPDATE_REVIEW_STATUS: "Changed review status",
  RESOLVE_FLAG_DISMISSED: "Dismissed flag",
  RESOLVE_FLAG_ACTIONED: "Actioned flag",
  DEACTIVATE_USER: "Deactivated user",
  UPDATE_USER: "Updated user",
  UPDATE_SETTINGS: "Updated settings",
  CREATE_CATEGORY: "Created category",
  CREATE_ANNOUNCEMENT: "Created announcement",
  BULK_DEACTIVATE_USERS: "Bulk deactivated users",
  BULK_ACTIVATE_USERS: "Bulk activated users",
  UPDATE_COMPANY: "Updated company",
};

export default function RecentActivity({ activities, className }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className || ""}`}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
            <Avatar
              src={activity.admin?.avatar}
              name={activity.admin?.fullName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-900">
                  {activity.admin?.fullName || "Admin"}
                </span>
                <Badge variant={actionColors[activity.action] || "neutral"}>
                  {actionLabels[activity.action] || activity.action}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{activity.entityType}: {activity.entityId}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(activity.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
