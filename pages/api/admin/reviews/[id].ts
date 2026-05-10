import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { unauthorized, success, badRequest, notFound, serverError } from "@/lib/response";
import { enqueue } from "@/lib/jobQueue";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") return badRequest(res, "Review ID required");

  try {
    if (req.method === "GET") {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          reviewer: { select: { id: true, fullName: true, avatar: true, phoneNumber: true, role: true } },
          company: { select: { id: true, name: true, slug: true, logo: true, ownerId: true } },
          replies: {
            orderBy: { createdAt: "desc" },
            include: { author: { select: { id: true, fullName: true, avatar: true } } },
          },
          flags: {
            orderBy: { createdAt: "desc" },
            include: { reporter: { select: { id: true, fullName: true, avatar: true } } },
          },
        },
      });

      if (!review) return notFound(res, "Review not found");
      return success(res, review);
    }

    if (req.method === "PATCH") {
      const { status, reason } = req.body;
      if (!status || !["PUBLISHED", "HIDDEN", "FLAGGED", "REMOVED"].includes(status)) {
        return badRequest(res, "Valid status is required");
      }

      const existing = await prisma.review.findUnique({
        where: { id },
        include: { company: { select: { id: true, name: true } } },
      });
      if (!existing) return notFound(res, "Review not found");

      const updateData: any = {
        status,
        isPublished: status === "PUBLISHED",
        isFeatured: status === "PUBLISHED" ? existing.isFeatured : false,
      };

      const review = await prisma.review.update({ where: { id }, data: updateData });

      await enqueue("RECALCULATE_COMPANY_RATING", { companyId: existing.companyId });

      if (status === "REMOVED" && existing.reviewerId) {
        await prisma.notification.create({
          data: {
            userId: existing.reviewerId,
            type: "REVIEW_REMOVED",
            title: "Review Removed",
            message: `Your review of "${existing.company.name}" has been removed by an admin. ${reason || ""}`,
            metadata: { reviewId: id, reason },
          },
        });
      }

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "UPDATE_REVIEW_STATUS",
        entityType: "Review",
        entityId: id,
        details: { previousStatus: existing.status, newStatus: status, reason },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, review, `Review status updated to ${status}`);
    }

    return unauthorized(res, "Method not allowed");
  } catch (error) {
    console.error("Review detail error:", error);
    return serverError(res, "Failed to process review request");
  }
}
