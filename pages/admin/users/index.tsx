'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import UserTable from '@/components/admin/UserTable';

export default function UsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">View and manage all platform users</p>
        </div>

        <UserTable />
      </div>
    </AdminLayout>
  );
}
