'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import AnnouncementManager from '@/components/admin/AnnouncementManager';

export default function AnnouncementsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Create and manage platform announcements</p>
        </div>

        <AnnouncementManager />
      </div>
    </AdminLayout>
  );
}
