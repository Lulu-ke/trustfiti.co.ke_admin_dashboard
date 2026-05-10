import React from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import StarRating from "@/components/reviews/StarRating";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import { MessageSquare, Flag } from "lucide-react";

interface ReviewCardProps {
  review: any;
  showCompany?: boolean;
  onFlag?: (reviewId: string) => void;
  onView?: (reviewId: string) => void;
}

export default function ReviewCard({ review, showCompany = false, onFlag, onView }: ReviewCardProps) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar src={review.reviewer?.avatar} name={review.reviewer?.fullName} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.reviewer?.fullName || "Anonymous"}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={review.status} />
      </div>

      <div className="mb-2">
        <StarRating value={review.rating} readonly size="sm" />
        {review.title && <h4 className="text-base font-semibold text-gray-900 mt-2">{review.title}</h4>}
      </div>

      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.content}</p>

      {showCompany && review.company && (
        <Link href={`/admin/companies/${review.company.id}`} className="inline-flex items-center gap-1.5 mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          {review.company.name}
          {review.company.industry && <span className="text-gray-400 font-normal">· {review.company.industry}</span>}
        </Link>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {(review._count?.replies ?? review.replies?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="h-3.5 w-3.5" />
              {review._count?.replies ?? review.replies?.length}
            </span>
          )}
          {(review._count?.flags ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <Flag className="h-3.5 w-3.5" />
              {review._count?.flags}
            </span>
          )}
        </div>
        {onView && (
          <button onClick={() => onView(review.id)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View
          </button>
        )}
      </div>
    </article>
  );
}
