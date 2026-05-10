'use client';

import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import FlagResolution from '@/components/admin/FlagResolution';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FlagDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading, error } = useSWR(
    id ? `/api/admin/flags/${id}` : null,
    fetcher
  );

  const handleResolve = async (
    flagId: string,
    resolveData: { status: string; adminNote?: string; reviewAction: string }
  ) => {
    try {
      const res = await fetch(`/api/admin/flags/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolveData),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Flag ${resolveData.status.toLowerCase()}`);
        mutate(`/api/admin/flags/${id}`);
      } else {
        toast.error(result.message || 'Failed to resolve flag');
      }
    } catch {
      toast.error('Failed to resolve flag');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading flag..." />
      </AdminLayout>
    );
  }

  if (error || !data?.data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900">Flag not found</h2>
          <Button variant="secondary" onClick={() => router.push('/admin/flags')} className="mt-4">
            Back to Flags
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const flag = data.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/flags')}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flag Resolution</h1>
            <p className="text-gray-500 mt-1">Review and resolve this reported content</p>
          </div>
        </div>

        <FlagResolution flag={flag} onResolve={handleResolve} />
      </div>
    </AdminLayout>
  );
}
