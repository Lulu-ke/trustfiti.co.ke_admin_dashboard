'use client';

import useSWR, { mutate } from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import SettingsForm from '@/components/admin/SettingsForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Settings, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { data, isLoading, error } = useSWR('/api/admin/settings', fetcher);

  const handleSave = async (settings: Record<string, string>) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Settings saved successfully');
        mutate('/api/admin/settings');
      } else {
        toast.error(result.message || 'Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading settings..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Failed to load settings</h2>
          <p className="text-gray-500 mt-1">Please try refreshing the page.</p>
        </div>
      </AdminLayout>
    );
  }

  const settingsData = data?.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure platform-wide settings and preferences</p>
        </div>

        <SettingsForm
          settings={settingsData?.settings || {}}
          groups={settingsData?.groups || []}
          onSave={handleSave}
        />
      </div>
    </AdminLayout>
  );
}
