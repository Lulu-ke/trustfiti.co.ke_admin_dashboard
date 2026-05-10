'use client';

import { useRouter } from 'next/router';
import useSWR from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReviewCard from '@/components/reviews/ReviewCard';
import { ArrowLeft, Mail, Phone, Calendar, Shield, Building2, Star } from 'lucide-react';
import { timeAgo, formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, error, mutate } = useSWR(
    id ? `/api/admin/users/${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading user..." />
      </AdminLayout>
    );
  }

  if (error || !data?.data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900">User not found</h2>
          <Button variant="secondary" onClick={() => router.push('/admin/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const user = data.data;

  const handleToggleActive = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      mutate();
    } catch {
      toast.error('Failed to update user status');
    }
    setActionLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-500 mt-1">Manage user account and view activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <div className="flex flex-col items-center text-center">
              <Avatar src={user.avatar} name={user.fullName} size="xl" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">{user.fullName || 'No name'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">@{user.phoneNumber || '—'}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={user.role} />
                <Badge variant={user.isActive ? 'success' : 'danger'} dot>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex gap-2 mt-4 w-full">
                <Button
                  variant={user.isActive ? 'danger' : 'primary'}
                  onClick={handleToggleActive}
                  loading={actionLoading}
                  className="flex-1"
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardTitle>User Information</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Mail className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Phone className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{user.phoneNumber || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Shield className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm font-medium text-gray-900">{timeAgo(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reviews</p>
                  <p className="text-lg font-bold text-gray-900">{user._count?.reviews || 0}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Companies</p>
                  <p className="text-lg font-bold text-gray-900">{user._count?.companies || 0}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Flags</p>
                  <p className="text-lg font-bold text-gray-900">{user._count?.flags || 0}</p>
                </div>
              </Card>
            </div>

            {/* Reviews */}
            <Card>
              <CardTitle>Recent Reviews</CardTitle>
              {user.reviews && user.reviews.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {user.reviews.slice(0, 5).map((review: any) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      showCompany
                      onView={(reviewId) => router.push(`/admin/reviews/${reviewId}`)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-4">No reviews yet</p>
              )}
            </Card>

            {/* Companies */}
            {user.companies && user.companies.length > 0 && (
              <Card>
                <CardTitle>Owned Companies</CardTitle>
                <div className="mt-4 space-y-2">
                  {user.companies.map((company: any) => (
                    <button
                      key={company.id}
                      onClick={() => router.push(`/admin/companies/${company.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {company.logo ? (
                          <img src={company.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-gray-400">{company.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.industry || 'No industry'}</p>
                      </div>
                      <StatusBadge status={company.verificationStatus} />
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
