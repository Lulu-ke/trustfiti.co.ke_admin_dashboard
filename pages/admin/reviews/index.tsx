'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import ReviewTable from '@/components/admin/ReviewTable';

export default function ReviewsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-500 mt-1">Moderate and manage all platform reviews</p>
        </div>

        <ReviewTable />
      </div>
    </AdminLayout>
  );
}
