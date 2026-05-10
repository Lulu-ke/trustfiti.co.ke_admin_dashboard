'use client';

import { useState } from 'react';
import useSWR from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import AuditLogTable from '@/components/admin/AuditLogTable';
import Select from '@/components/ui/Select';
import SearchInput from '@/components/ui/SearchInput';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FileText, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: '25',
    ...(actionFilter && { action: actionFilter }),
    ...(entityFilter && { entityType: entityFilter }),
    ...(search && { search }),
  });

  const { data, isLoading, error, mutate } = useSWR(
    `/api/admin/audit-logs?${params}`,
    fetcher
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all administrative actions on the platform</p>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput
              value={search}
              onChange={(val) => { setSearch(val); setPage(1); }}
              placeholder="Search logs..."
              className="flex-1"
            />
            <Select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              placeholder="All Actions"
              options={[
                { value: 'APPROVE_COMPANY', label: 'Approve Company' },
                { value: 'REJECT_COMPANY', label: 'Reject Company' },
                { value: 'SUSPEND_COMPANY', label: 'Suspend Company' },
                { value: 'REACTIVATE_COMPANY', label: 'Reactivate Company' },
                { value: 'UPDATE_REVIEW_STATUS', label: 'Update Review' },
                { value: 'RESOLVE_FLAG_DISMISSED', label: 'Dismiss Flag' },
                { value: 'RESOLVE_FLAG_ACTIONED', label: 'Action Flag' },
                { value: 'DEACTIVATE_USER', label: 'Deactivate User' },
                { value: 'UPDATE_USER', label: 'Update User' },
                { value: 'UPDATE_SETTINGS', label: 'Update Settings' },
                { value: 'CREATE_CATEGORY', label: 'Create Category' },
                { value: 'CREATE_ANNOUNCEMENT', label: 'Create Announcement' },
              ]}
              className="w-52"
            />
            <Select
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
              placeholder="All Entities"
              options={[
                { value: 'USER', label: 'User' },
                { value: 'COMPANY', label: 'Company' },
                { value: 'REVIEW', label: 'Review' },
                { value: 'FLAG', label: 'Flag' },
                { value: 'SETTING', label: 'Setting' },
                { value: 'CATEGORY', label: 'Category' },
                { value: 'ANNOUNCEMENT', label: 'Announcement' },
              ]}
              className="w-40"
            />
          </div>
        </Card>

        {error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">Failed to load audit logs</h2>
            <p className="text-gray-500 mt-1">Please try refreshing the page.</p>
          </div>
        ) : (
          <AuditLogTable
            logs={data?.data || []}
            pagination={data?.pagination}
            onPageChange={setPage}
            loading={isLoading}
          />
        )}
      </div>
    </AdminLayout>
  );
}
