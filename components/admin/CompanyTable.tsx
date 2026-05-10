import React, { useState } from "react";
import { useRouter } from "next/router";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import { useDebounce } from "@/hooks/useDebounce";
import { timeAgo } from "@/lib/utils";
import { Eye, CheckCircle, XCircle, Award } from "lucide-react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CompanyTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(verificationFilter && { verificationStatus: verificationFilter }),
    ...(statusFilter && { isActive: statusFilter }),
  });

  const { data, error } = useSWR(`/api/admin/companies?${params}`, fetcher);

  const columns = [
    {
      key: "name",
      label: "Company",
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {row.logo ? (
              <img src={row.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-gray-400">{value[0]}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            {row.industry && <p className="text-xs text-gray-500">{row.industry}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "city",
      label: "City",
      render: (v: string) => v || <span className="text-gray-400">—</span>,
    },
    {
      key: "averageRating",
      label: "Rating",
      render: (v: number) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{v.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({row.totalReviews || 0})</span>
        </div>
      ),
    },
    {
      key: "verificationStatus",
      label: "Verification",
      render: (v: string) => <StatusBadge status={v} />,
    },
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
      key: "isFeatured",
      label: "Featured",
      render: (v: boolean) => v ? <Award className="h-4 w-4 text-amber-500" /> : <span className="text-gray-300">—</span>,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v: string) => <span className="text-xs text-gray-500">{timeAgo(v)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (v: any, row: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/companies/${row.id}`); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search companies..."
          className="flex-1"
        />
        <Select
          value={verificationFilter}
          onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "UNDER_REVIEW", label: "Under Review" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          placeholder="All Verification"
          className="w-44"
        />
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
          placeholder="All Status"
          className="w-40"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={!data && !error}
        emptyMessage="No companies found"
        onRowClick={(row) => router.push(`/admin/companies/${row.id}`)}
      />

      {data?.pagination && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
