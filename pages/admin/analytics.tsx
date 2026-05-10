'use client';

import { useState } from 'react';
import useSWR from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
import GrowthChart from '@/components/admin/GrowthChart';
import StatsGrid from '@/components/admin/StatsGrid';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { BarChart3, Users, Building2, Star, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const periods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { data, isLoading, error } = useSWR(
    `/api/admin/analytics?period=${period}`,
    fetcher
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Failed to load analytics</h2>
          <p className="text-gray-500 mt-1">Please try refreshing the page.</p>
        </div>
      </AdminLayout>
    );
  }

  const analytics = data?.data;

  const kpiStats = [
    {
      label: 'Total Users',
      value: analytics?.overview?.totalUsers || 0,
      icon: <Users className="w-5 h-5" />,
      change: analytics?.userGrowth,
      changeLabel: 'vs previous period',
      color: 'emerald' as const,
    },
    {
      label: 'Total Companies',
      value: analytics?.overview?.totalCompanies || 0,
      icon: <Building2 className="w-5 h-5" />,
      change: analytics?.companyGrowth,
      changeLabel: 'vs previous period',
      color: 'blue' as const,
    },
    {
      label: 'Total Reviews',
      value: analytics?.overview?.totalReviews || 0,
      icon: <Star className="w-5 h-5" />,
      change: analytics?.reviewGrowth,
      changeLabel: 'vs previous period',
      color: 'amber' as const,
    },
    {
      label: 'Average Rating',
      value: analytics?.overview?.avgRating?.toFixed(1) || '0.0',
      icon: <BarChart3 className="w-5 h-5" />,
      change: analytics?.ratingChange,
      changeLabel: 'vs previous period',
      color: 'purple' as const,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Platform performance metrics and trends</p>
          </div>
          <div className="flex gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  period === p.value
                    ? 'bg-emerald-100 text-emerald-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <StatsGrid stats={kpiStats} />

        {analytics && (
          <AnalyticsOverview data={analytics} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GrowthChart
            title="User Growth"
            data={analytics?.growthData?.users || []}
            color="#10B981"
          />
          <GrowthChart
            title="Review Volume"
            data={analytics?.growthData?.reviews || []}
            color="#F59E0B"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
