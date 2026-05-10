import React, { useState } from "react";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/reviews/StarRating";
import { timeAgo } from "@/lib/utils";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface FlagDetail {
  id: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
  reporter: any;
  review: any;
}

interface FlagResolutionProps {
  flag: FlagDetail;
  onResolve: (flagId: string, data: { status: string; adminNote?: string; reviewAction: string }) => Promise<void>;
}

export default function FlagResolution({ flag, onResolve }: FlagResolutionProps) {
  const [adminNote, setAdminNote] = useState("");
  const [removeReview, setRemoveReview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResolve = async (status: "DISMISSED" | "ACTIONED") => {
    setLoading(true);
    try {
      await onResolve(flag.id, {
        status,
        adminNote: adminNote || undefined,
        reviewAction: status === "ACTIONED" && removeReview ? "REMOVE" : "NONE",
      });
      toast.success(`Flag ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to resolve flag");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Flag Details</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-500">Reason</p>
            <StatusBadge status={flag.reason} className="mt-1" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <StatusBadge status={flag.status} className="mt-1" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Reported</p>
            <p className="text-sm text-gray-900 mt-1">{timeAgo(flag.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Reporter</p>
            <div className="flex items-center gap-2 mt-1">
              <Avatar src={flag.reporter?.avatar} name={flag.reporter?.fullName} size="xs" />
              <span className="text-sm">{flag.reporter?.fullName || "User"}</span>
            </div>
          </div>
        </div>
        {flag.description && (
          <div className="mt-4">
            <p className="text-xs text-gray-500">Description</p>
            <p className="text-sm text-gray-700 mt-1">{flag.description}</p>
          </div>
        )}
      </Card>

      {flag.review && (
        <Card>
          <CardTitle>Flagged Review</CardTitle>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {flag.review.reviewer?.fullName?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-medium">{flag.review.reviewer?.fullName || "Anonymous"}</p>
                <StarRating value={flag.review.rating} readonly size="sm" />
              </div>
            </div>
            {flag.review.title && (
              <p className="text-sm font-semibold text-gray-900">{flag.review.title}</p>
            )}
            <p className="text-sm text-gray-700 leading-relaxed">{flag.review.content}</p>
            {flag.review.company && (
              <p className="text-xs text-gray-400">Company: {flag.review.company.name}</p>
            )}
          </div>
        </Card>
      )}

      {flag.status === "PENDING" && (
        <Card>
          <CardTitle>Resolution</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Note</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Add resolution notes..."
              />
            </div>

            {removeReview && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">The flagged review will be removed permanently.</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="removeReview"
                checked={removeReview}
                onChange={(e) => setRemoveReview(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="removeReview" className="text-sm text-gray-700">
                Also remove the flagged review
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                icon={<XCircle className="h-4 w-4" />}
                onClick={() => handleResolve("DISMISSED")}
                loading={loading}
              >
                Dismiss Flag
              </Button>
              <Button
                variant="danger"
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={() => handleResolve("ACTIONED")}
                loading={loading}
              >
                Action Flag
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
