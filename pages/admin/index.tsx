'use client';

import useSWR from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import StatsGrid from '@/components/admin/StatsGrid';
import RecentActivity from '@/components/admin/RecentActivity';
import GrowthChart from '@/components/admin/GrowthChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Users,
  Building2,
  Star,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useSWR('/api/admin/dashboard', fetcher);

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Failed to load dashboard</h2>
          <p className="text-gray-500 mt-1">Please try refreshing the page.</p>
        </div>
      </AdminLayout>
    );
  }

  const dashboard = data?.data;

  const stats = [
    {
      label: 'Total Users',
      value: dashboard?.totalUsers || 0,
      icon: <Users className="w-5 h-5" />,
      change: dashboard?.userGrowth,
      changeLabel: 'vs last month',
      color: 'emerald' as const,
    },
    {
      label: 'Total Companies',
      value: dashboard?.totalCompanies || 0,
      icon: <Building2 className="w-5 h-5" />,
      change: dashboard?.companyGrowth,
      changeLabel: 'vs last month',
      color: 'blue' as const,
    },
    {
      label: 'Total Reviews',
      value: dashboard?.totalReviews || 0,
      icon: <Star className="w-5 h-5" />,
      change: dashboard?.reviewGrowth,
      changeLabel: 'vs last month',
      color: 'amber' as const,
    },
    {
      label: 'Avg Rating',
      value: dashboard?.averageRating?.toFixed(1) || '0.0',
      icon: <TrendingUp className="w-5 h-5" />,
      change: dashboard?.ratingChange,
      changeLabel: 'vs last month',
      color: 'purple' as const,
    },
    {
      label: 'Pending Verifications',
      value: dashboard?.pendingVerifications || 0,
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'red' as const,
    },
    {
      label: 'Open Flags',
      value: dashboard?.openFlags || 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'red' as const,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of platform activity and metrics</p>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GrowthChart
            title="New Users (30 days)"
            data={dashboard?.userGrowthData || []}
            color="#10B981"
          />
          <GrowthChart
            title="New Reviews (30 days)"
            data={dashboard?.reviewGrowthData || []}
            color="#F59E0B"
          />
        </div>

        <RecentActivity activities={dashboard?.recentActivity || []} />
      </div>
    </AdminLayout>
  );
}
