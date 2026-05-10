'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import CategoryManager from '@/components/admin/CategoryManager';

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500 mt-1">Create and manage industry categories for companies</p>
        </div>

        <CategoryManager />
      </div>
    </AdminLayout>
  );
}
