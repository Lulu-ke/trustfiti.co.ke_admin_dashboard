import React, { useState } from "react";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface VerificationReviewProps {
  companyId: string;
  companyName: string;
  verificationStatus: string;
  documents: any;
  onResolve: (status: "APPROVED" | "REJECTED", notes?: string) => Promise<void>;
}

export default function VerificationReview({
  companyId,
  companyName,
  verificationStatus,
  documents,
  onResolve,
}: VerificationReviewProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (verificationStatus === "APPROVED" || verificationStatus === "REJECTED") {
    return (
      <Card className="bg-gray-50">
        <div className="flex items-center gap-3">
          <StatusBadge status={verificationStatus} />
          <span className="text-sm text-gray-500">
            Verification has been {verificationStatus.toLowerCase()}
          </span>
        </div>
      </Card>
    );
  }

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !notes.trim()) {
      toast.error("Please provide rejection notes");
      return;
    }
    setLoading(true);
    try {
      await onResolve(status, notes);
      toast.success(`Company ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update verification");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardTitle className="mb-4">Verification Review</CardTitle>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Company:</span>
          <span className="text-sm text-gray-900">{companyName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <StatusBadge status={verificationStatus} />
        </div>

        {documents && Object.keys(documents).length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(documents).map(([key, url]: [string, any]) => (
                <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                  {typeof url === "string" && url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img src={url} alt={key} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="p-3 bg-gray-50 text-sm text-gray-500 truncate">
                      {key}: {typeof url === "string" ? url : "Document"}
                    </div>
                  )}
                  <p className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border-t">{key}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Add notes about this verification..."
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="primary"
            icon={<CheckCircle className="h-4 w-4" />}
            onClick={() => handleAction("APPROVED")}
            loading={loading}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            icon={<XCircle className="h-4 w-4" />}
            onClick={() => handleAction("REJECTED")}
            loading={loading}
          >
            Reject
          </Button>
        </div>
      </div>
    </Card>
  );
}
