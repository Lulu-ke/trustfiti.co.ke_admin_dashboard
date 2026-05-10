import React, { useState } from "react";
import { useRouter } from "next/router";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { timeAgo, cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FlagTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(statusFilter && { status: statusFilter }),
    ...(reasonFilter && { reason: reasonFilter }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  });

  const { data, error } = useSWR(`/api/admin/flags?${params}`, fetcher);

  const columns = [
    {
      key: "reporter",
      label: "Reporter",
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {value?.fullName?.[0] || "?"}
          </div>
          <span className="text-sm">{value?.fullName || "User"}</span>
        </div>
      ),
    },
    {
      key: "review",
      label: "Review",
      render: (value: any) => (
        <div>
          <p className="text-sm text-gray-700 truncate max-w-[200px]">{value?.content || "—"}</p>
          <p className="text-xs text-gray-400">{value?.company?.name}</p>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: "status",
      label: "Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (v: string) => <span className="text-xs text-gray-500">{timeAgo(v)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (v: any, row: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/flags/${row.id}`); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "REVIEWED", label: "Reviewed" },
            { value: "DISMISSED", label: "Dismissed" },
            { value: "ACTIONED", label: "Actioned" },
          ]}
          placeholder="All Status"
          className="w-40"
        />
        <Select
          value={reasonFilter}
          onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
          options={[
            { value: "SPAM", label: "Spam" },
            { value: "INAPPROPRIATE", label: "Inappropriate" },
            { value: "FAKE", label: "Fake" },
            { value: "OFF_TOPIC", label: "Off Topic" },
            { value: "OTHER", label: "Other" },
          ]}
          placeholder="All Reasons"
          className="w-40"
        />
        <DateRangePicker
          startDate={dateFrom}
          endDate={dateTo}
          onStartChange={(d) => { setDateFrom(d); setPage(1); }}
          onEndChange={(d) => { setDateTo(d); setPage(1); }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={!data && !error}
        emptyMessage="No flags found"
        onRowClick={(row) => router.push(`/admin/flags/${row.id}`)}
      />

      {data?.pagination && (
        <Pagination page={page} totalPages={data.pagination.totalPages} total={data.pagination.total} onPageChange={setPage} />
      )}
    </div>
  );
}
