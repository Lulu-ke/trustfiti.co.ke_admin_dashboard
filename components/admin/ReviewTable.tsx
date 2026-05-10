import React, { useState } from "react";
import { useRouter } from "next/router";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import StarRating from "@/components/reviews/StarRating";
import { useDebounce } from "@/hooks/useDebounce";
import { timeAgo, cn } from "@/lib/utils";
import { Eye, Flag } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReviewTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter && { status: statusFilter }),
    ...(ratingFilter && { rating: ratingFilter }),
  });

  const { data, error } = useSWR(`/api/admin/reviews?${params}`, fetcher);

  const columns = [
    {
      key: "reviewer",
      label: "Reviewer",
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {value?.fullName?.[0] || "?"}
          </div>
          <span className="text-sm font-medium">{value?.fullName || "Anonymous"}</span>
        </div>
      ),
    },
    {
      key: "company",
      label: "Company",
      render: (value: any) => (
        <span className="text-sm text-gray-700">{value?.name || "—"}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: number) => <StarRating value={value} readonly size="sm" />,
    },
    {
      key: "content",
      label: "Content",
      render: (value: string) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">{value}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: "_count",
      label: "Flags",
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <Flag className="h-3.5 w-3.5 text-gray-400" />
          <span className={cn("text-sm", value?.flags > 0 ? "text-red-600 font-medium" : "text-gray-400")}>
            {value?.flags || 0}
          </span>
        </div>
      ),
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
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/reviews/${row.id}`); }}
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
        <SearchInput value={search} onChange={setSearch} placeholder="Search reviews..." className="flex-1" />
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { value: "PUBLISHED", label: "Published" },
            { value: "HIDDEN", label: "Hidden" },
            { value: "FLAGGED", label: "Flagged" },
            { value: "REMOVED", label: "Removed" },
          ]}
          placeholder="All Status"
          className="w-40"
        />
        <Select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          options={[
            { value: "1", label: "1 Star" },
            { value: "2", label: "2 Stars" },
            { value: "3", label: "3 Stars" },
            { value: "4", label: "4 Stars" },
            { value: "5", label: "5 Stars" },
          ]}
          placeholder="All Ratings"
          className="w-36"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={!data && !error}
        emptyMessage="No reviews found"
        onRowClick={(row) => router.push(`/admin/reviews/${row.id}`)}
      />

      {data?.pagination && (
        <Pagination page={page} totalPages={data.pagination.totalPages} total={data.pagination.total} onPageChange={setPage} />
      )}
    </div>
  );
}
