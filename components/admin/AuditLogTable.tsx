import React from "react";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import { timeAgo, cn } from "@/lib/utils";

interface AuditLogTableProps {
  logs: any[];
  pagination?: any;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function AuditLogTable({ logs, pagination, onPageChange, loading }: AuditLogTableProps) {
  const actionColors: Record<string, "success" | "warning" | "danger" | "neutral" | "info" | "purple"> = {
    APPROVE_COMPANY: "success",
    REJECT_COMPANY: "danger",
    SUSPEND_COMPANY: "danger",
    REACTIVATE_COMPANY: "success",
    UPDATE_REVIEW_STATUS: "info",
    RESOLVE_FLAG_DISMISSED: "neutral",
    RESOLVE_FLAG_ACTIONED: "warning",
    DEACTIVATE_USER: "danger",
    UPDATE_USER: "info",
    UPDATE_SETTINGS: "purple",
    CREATE_CATEGORY: "success",
    UPDATE_CATEGORY: "info",
    DELETE_CATEGORY: "danger",
    CREATE_ANNOUNCEMENT: "info",
    UPDATE_ANNOUNCEMENT: "info",
    DELETE_ANNOUNCEMENT: "danger",
  };

  const columns = [
    {
      key: "admin",
      label: "Admin",
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={value?.avatar} name={value?.fullName} size="xs" />
          <span className="text-sm">{value?.fullName || "System"}</span>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (v: string) => (
        <Badge variant={actionColors[v] || "neutral"}>{v.replace(/_/g, " ")}</Badge>
      ),
    },
    {
      key: "entityType",
      label: "Entity",
      render: (v: string, row: any) => (
        <span className="text-sm text-gray-700">
          {v} <span className="text-gray-400">({row.entityId.substring(0, 8)}...)</span>
        </span>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (v: any) => {
        if (!v) return <span className="text-gray-400">—</span>;
        if (typeof v === "string") return <span className="text-xs text-gray-600 truncate max-w-[200px] block">{v}</span>;
        const str = JSON.stringify(v).substring(0, 50);
        return <span className="text-xs text-gray-600 truncate block max-w-[200px]">{str}</span>;
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (v: string) => <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(v)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No audit logs found"
      />
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
