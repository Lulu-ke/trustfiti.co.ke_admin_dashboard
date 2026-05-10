'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import CompanyTable from '@/components/admin/CompanyTable';

export default function CompaniesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-500 mt-1">View and manage all registered companies</p>
        </div>

        <CompanyTable />
      </div>
    </AdminLayout>
  );
}
