import React, { useState } from "react";
import { useRouter } from "next/router";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { timeAgo } from "@/lib/utils";
import { Eye, Edit2, UserX, UserCheck, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(roleFilter && { role: roleFilter }),
    ...(statusFilter && { status: statusFilter }),
  });

  const { data, error, mutate } = useSWR(`/api/admin/users?${params}`, fetcher);

  const handleToggleActive = async (user: any) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const confirmToggle = async () => {
    if (!selectedUser) return;
    try {
      await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      toast.success(`User ${selectedUser.isActive ? "deactivated" : "activated"} successfully`);
      mutate();
    } catch {
      toast.error("Failed to update user");
    }
    setShowConfirm(false);
    setSelectedUser(null);
  };

  const columns = [
    {
      key: "fullName",
      label: "User",
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={value} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{value || "—"}</p>
            <p className="text-xs text-gray-500">{row.phoneNumber}</p>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (v: string) => v || <span className="text-gray-400">—</span> },
    { key: "role", label: "Role", render: (v: string) => <StatusBadge status={v} /> },
    {
      key: "isActive",
      label: "Status",
      render: (v: boolean) => (
        <Badge variant={v ? "success" : "danger"} dot>
          {v ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (v: string) => <span className="text-gray-500 text-xs">{timeAgo(v)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (v: any, row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${row.id}`); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          {row.role !== "ADMIN" && (
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleActive(row); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={row.isActive ? "Deactivate" : "Activate"}
            >
              {row.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
          className="flex-1"
        />
        <Select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          options={[
            { value: "REVIEWER", label: "Reviewers" },
            { value: "COMPANY_OWNER", label: "Company Owners" },
            { value: "ADMIN", label: "Admins" },
          ]}
          placeholder="All Roles"
          className="w-44"
        />
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="All Status"
          className="w-40"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={!data && !error}
        emptyMessage="No users found"
        onRowClick={(row) => router.push(`/admin/users/${row.id}`)}
      />

      {data?.pagination && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setSelectedUser(null); }}
        onConfirm={confirmToggle}
        title={selectedUser?.isActive ? "Deactivate User" : "Activate User"}
        message={`Are you sure you want to ${selectedUser?.isActive ? "deactivate" : "activate"} ${selectedUser?.fullName || selectedUser?.phoneNumber}?`}
        confirmText={selectedUser?.isActive ? "Deactivate" : "Activate"}
        variant="danger"
      />
    </div>
  );
}
