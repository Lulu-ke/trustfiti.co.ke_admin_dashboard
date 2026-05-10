'use client';

import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/reviews/StarRating';
import {
  ArrowLeft,
  Clock,
  Flag,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReviewDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading, error } = useSWR(
    id ? `/api/admin/reviews/${id}` : null,
    fetcher
  );

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Review status updated');
        mutate(`/api/admin/reviews/${id}`);
        setNewStatus('');
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
    setActionLoading(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading review..." />
      </AdminLayout>
    );
  }

  if (error || !data?.data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900">Review not found</h2>
          <Button variant="secondary" onClick={() => router.push('/admin/reviews')} className="mt-4">
            Back to Reviews
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const review = data.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/reviews')}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Review Details</h1>
            <p className="text-gray-500 mt-1">View and moderate review content</p>
          </div>
          <StatusBadge status={review.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Review */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-4 mb-4">
                <Avatar src={review.reviewer?.avatar} name={review.reviewer?.fullName} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.reviewer?.fullName || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={review.rating} readonly size="sm" />
                    <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {review.title && (
                <h2 className="text-lg font-bold text-gray-900 mb-2">{review.title}</h2>
              )}

              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>

              {review.company && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => router.push(`/admin/companies/${review.company.id}`)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {review.company.name}
                  </button>
                  {review.company.industry && (
                    <span className="text-xs text-gray-400">· {review.company.industry}</span>
                  )}
                </div>
              )}
            </Card>

            {/* Replies */}
            <Card>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Replies ({review.replies?.length || 0})
                </div>
              </CardTitle>
              {review.replies && review.replies.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {review.replies.map((reply: any) => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {reply.company?.name || 'Company'}
                        </span>
                        <span className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-4">No replies yet</p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Actions */}
            <Card>
              <CardTitle>Status Control</CardTitle>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Change Status</label>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder="Select new status"
                    options={[
                      { value: 'PUBLISHED', label: 'Published' },
                      { value: 'HIDDEN', label: 'Hidden' },
                      { value: 'FLAGGED', label: 'Flagged' },
                      { value: 'REMOVED', label: 'Removed' },
                    ]}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleStatusChange}
                  loading={actionLoading}
                  disabled={!newStatus}
                  className="w-full"
                >
                  Update Status
                </Button>
              </div>
            </Card>

            {/* Flags */}
            <Card>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Flags ({review._count?.flags || 0})
                </div>
              </CardTitle>
              {review.flags && review.flags.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {review.flags.map((flag: any) => (
                    <div
                      key={flag.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/flags/${flag.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge status={flag.reason} />
                        <StatusBadge status={flag.status} />
                      </div>
                      {flag.description && (
                        <p className="text-sm text-gray-600 mt-2">{flag.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span>{flag.reporter?.fullName || 'User'}</span>
                        <span>·</span>
                        <span>{timeAgo(flag.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-4">No flags reported</p>
              )}
            </Card>

            {/* Review Meta */}
            <Card>
              <CardTitle>Review Meta</CardTitle>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Review ID</span>
                  <span className="text-gray-900 font-mono text-xs">{review.id.substring(0, 12)}...</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rating</span>
                  <StarRating value={review.rating} readonly size="sm" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900">{timeAgo(review.createdAt)}</span>
                </div>
                {review.updatedAt && review.updatedAt !== review.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Updated</span>
                    <span className="text-gray-900">{timeAgo(review.updatedAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Helpful votes</span>
                  <span className="text-gray-900">{review.helpfulCount || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
