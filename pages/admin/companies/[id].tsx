'use client';

import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReviewCard from '@/components/reviews/ReviewCard';
import VerificationReview from '@/components/admin/VerificationReview';
import StarRating from '@/components/reviews/StarRating';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Building2,
  Star,
  ShieldCheck,
  Award,
  AlertTriangle,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CompanyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const { data, isLoading, error } = useSWR(
    id ? `/api/admin/companies/${id}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading company..." />
      </AdminLayout>
    );
  }

  if (error || !data?.data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900">Company not found</h2>
          <Button variant="secondary" onClick={() => router.push('/admin/companies')} className="mt-4">
            Back to Companies
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const company = data.data;

  const handleToggleSuspend = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/companies/${id}/suspend`, { method: 'POST' });
      toast.success(company.isActive ? 'Company suspended' : 'Company reactivated');
      mutate(`/api/admin/companies/${id}`);
    } catch {
      toast.error('Failed to update company status');
    }
    setActionLoading(false);
  };

  const handleVerification = async (status: 'APPROVED' | 'REJECTED', notes?: string) => {
    try {
      await fetch(`/api/admin/companies/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      toast.success(`Verification ${status.toLowerCase()}`);
      mutate(`/api/admin/companies/${id}`);
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const handleToggleFeatured = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !company.isFeatured }),
      });
      toast.success(company.isFeatured ? 'Removed from featured' : 'Marked as featured');
      mutate(`/api/admin/companies/${id}`);
    } catch {
      toast.error('Failed to update featured status');
    }
    setActionLoading(false);
  };

  const tabs = [
    { key: 'info', label: 'Company Info' },
    { key: 'reviews', label: `Reviews (${company._count?.reviews || 0})` },
    { key: 'verification', label: 'Verification' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/companies')}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <StatusBadge status={company.verificationStatus} />
              <Badge variant={company.isActive ? 'success' : 'danger'} dot>
                {company.isActive ? 'Active' : 'Suspended'}
              </Badge>
              {company.isFeatured && (
                <Badge variant="warning"><Award className="w-3 h-3 mr-1" /> Featured</Badge>
              )}
            </div>
            <p className="text-gray-500 mt-1">{company.industry || 'No industry'}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={company.isFeatured ? 'secondary' : 'primary'}
              onClick={handleToggleFeatured}
              loading={actionLoading}
              icon={<Award className="h-4 w-4" />}
            >
              {company.isFeatured ? 'Unfeature' : 'Feature'}
            </Button>
            <Button
              variant={company.isActive ? 'danger' : 'primary'}
              onClick={handleToggleSuspend}
              loading={actionLoading}
              icon={company.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            >
              {company.isActive ? 'Suspend' : 'Reactivate'}
            </Button>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Profile */}
            <Card>
              <div className="text-center">
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden mx-auto">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400">{company.name[0]}</span>
                  )}
                </div>
                <div className="mt-4 space-y-2 text-left">
                  {company.description && (
                    <p className="text-sm text-gray-600">{company.description}</p>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {company.address}
                    </div>
                  )}
                  {company.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {company.city}
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                        {company.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Joined {timeAgo(company.createdAt)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats & Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="text-center">
                  <Star className="w-5 h-5 text-amber-500 mx-auto" />
                  <p className="text-2xl font-bold text-gray-900 mt-1">{company.averageRating?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                </Card>
                <Card className="text-center">
                  <StarRating value={5} readonly size="sm" />
                  <p className="text-2xl font-bold text-gray-900 mt-1">{company._count?.reviews || 0}</p>
                  <p className="text-xs text-gray-500">Reviews</p>
                </Card>
                <Card className="text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto" />
                  <p className="text-2xl font-bold text-gray-900 mt-1">{company._count?.invitations || 0}</p>
                  <p className="text-xs text-gray-500">Invitations</p>
                </Card>
                <Card className="text-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mx-auto" />
                  <p className="text-2xl font-bold text-gray-900 mt-1">{company._count?.flags || 0}</p>
                  <p className="text-xs text-gray-500">Flags</p>
                </Card>
              </div>

              {/* Owner info */}
              {company.owner && (
                <Card>
                  <CardTitle>Company Owner</CardTitle>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                      {company.owner.fullName?.[0] || company.owner.phoneNumber?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{company.owner.fullName || 'No name'}</p>
                      <p className="text-sm text-gray-500">{company.owner.email || company.owner.phoneNumber}</p>
                      <button
                        onClick={() => router.push(`/admin/users/${company.owner.id}`)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 mt-1"
                      >
                        View user profile →
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {company.reviews && company.reviews.length > 0 ? (
              company.reviews.map((review: any) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onView={(reviewId) => router.push(`/admin/reviews/${reviewId}`)}
                />
              ))
            ) : (
              <Card>
                <p className="text-center text-gray-400 py-8">No reviews yet</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'verification' && (
          <VerificationReview
            companyId={company.id}
            companyName={company.name}
            verificationStatus={company.verificationStatus}
            documents={company.verificationDocuments}
            onResolve={handleVerification}
          />
        )}
      </div>
    </AdminLayout>
  );
}
