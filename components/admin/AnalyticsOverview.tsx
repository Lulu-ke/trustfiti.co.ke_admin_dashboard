import React from "react";
import Card, { CardTitle, CardHeader } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils";

interface AnalyticsOverviewProps {
  data: {
    overview: {
      totalUsers: number;
      totalCompanies: number;
      totalReviews: number;
      avgRating: number;
    };
    userStats: {
      byRole: { role: string; count: number }[];
      newInPeriod: number;
    };
    companyStats: {
      byVerificationStatus: { status: string; count: number }[];
      topRated: { id: string; name: string; averageRating: number }[];
    };
    reviewStats: {
      byStatus: { status: string; count: number }[];
    };
  };
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const roleColors: Record<string, string> = {
    REVIEWER: "bg-blue-500",
    COMPANY_OWNER: "bg-purple-500",
    ADMIN: "bg-red-500",
  };

  const statusColors: Record<string, string> = {
    PUBLISHED: "bg-emerald-500",
    HIDDEN: "bg-gray-400",
    FLAGGED: "bg-amber-500",
    REMOVED: "bg-red-500",
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-500",
    REJECTED: "bg-red-500",
    NOT_SUBMITTED: "bg-gray-300",
    UNDER_REVIEW: "bg-blue-500",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardTitle className="mb-4">User Overview</CardTitle>
        <div className="space-y-3">
          {data.userStats.byRole.map((item) => (
            <div key={item.role} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${roleColors[item.role] || "bg-gray-400"}`} />
                <span className="text-sm text-gray-700">{item.role.replace("_", " ")}</span>
              </div>
              <span className="text-sm font-semibold">{formatNumber(item.count)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-sm">New in period</span>
              <span className="text-sm font-semibold">+{formatNumber(data.userStats.newInPeriod)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Company Verification</CardTitle>
        <div className="space-y-3">
          {data.companyStats.byVerificationStatus.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[item.status] || "bg-gray-400"}`} />
                <span className="text-sm text-gray-700">{item.status.replace("_", " ")}</span>
              </div>
              <span className="text-sm font-semibold">{formatNumber(item.count)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Review Status</CardTitle>
        <div className="space-y-3">
          {data.reviewStats.byStatus.map((item) => (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[item.status] || "bg-gray-400"}`} />
                <span className="text-sm text-gray-700">{item.status}</span>
              </div>
              <span className="text-sm font-semibold">{formatNumber(item.count)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Top Rated Companies</CardTitle>
        <div className="space-y-3">
          {data.companyStats.topRated.slice(0, 5).map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-medium">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700 truncate max-w-[160px]">{item.name}</span>
              </div>
              <span className="text-sm font-semibold">{item.averageRating.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
