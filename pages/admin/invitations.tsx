'use client';

import { useState } from 'react';
import useSWR from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchInput from '@/components/ui/SearchInput';
import Select from '@/components/ui/Select';
import { timeAgo, cn } from '@/lib/utils';
import { Eye, Link as LinkIcon, AlertTriangle, Users, Star } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InvitationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  });

  const { data, isLoading, error } = useSWR(
    `/api/admin/invitations?${params}`,
    fetcher
  );

  const columns = [
    {
      key: 'company',
      label: 'Company',
      render: (value: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {value?.logo ? (
              <img src={value.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-gray-400">{value?.name?.[0] || '?'}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{value?.name || '—'}</p>
            <p className="text-xs text-gray-500">{value?.industry || ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      render: (value: string) => (
        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
          {value}
        </code>
      ),
    },
    {
      key: 'totalUses',
      label: 'Usage',
      render: (value: number, row: any) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>{value || 0}</span>
          </div>
          <div className="text-xs text-gray-400">
            / {row.maxUses === 0 ? '∞' : row.maxUses}
          </div>
        </div>
      ),
    },
    {
      key: 'averageRating',
      label: 'Avg Rating',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm font-medium">{value?.toFixed(1) || '—'}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'danger'} dot>
          {v ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (v: string) => {
        if (!v) return <span className="text-gray-400 text-xs">Never</span>;
        const isExpired = new Date(v) < new Date();
        return (
          <span className={cn('text-xs', isExpired ? 'text-red-500' : 'text-gray-500')}>
            {new Date(v).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v: string) => <span className="text-xs text-gray-500">{timeAgo(v)}</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitation Links</h1>
          <p className="text-gray-500 mt-1">Monitor invitation links created by companies</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search by company name..."
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            placeholder="All Status"
            className="w-40"
          />
        </div>

        {error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">Failed to load invitations</h2>
            <p className="text-gray-500 mt-1">Please try refreshing the page.</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data || []}
              loading={isLoading}
              emptyMessage="No invitation links found"
            />
            {data?.pagination && (
              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
