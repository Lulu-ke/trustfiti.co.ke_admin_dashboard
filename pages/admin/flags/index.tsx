'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import FlagTable from '@/components/admin/FlagTable';

export default function FlagsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flag Management</h1>
          <p className="text-gray-500 mt-1">Review and resolve reported content</p>
        </div>

        <FlagTable />
      </div>
    </AdminLayout>
  );
}
