import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { resolveFlagSchema } from "@/lib/validations/admin";
import { unauthorized, success, badRequest, notFound, serverError } from "@/lib/response";
import { enqueue } from "@/lib/jobQueue";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "PATCH") return unauthorized(res, "Method not allowed");

  const { id } = req.query;
  if (!id || typeof id !== "string") return badRequest(res, "Flag ID required");

  try {
    const body = resolveFlagSchema.safeParse(req.body);
    if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

    const flag = await prisma.reviewFlag.findUnique({
      where: { id },
      include: {
        review: {
          include: {
            reviewer: { select: { id: true, fullName: true } },
            company: { select: { id: true, name: true, ownerId: true } },
          },
        },
        reporter: { select: { id: true, fullName: true } },
      },
    });
    if (!flag) return notFound(res, "Flag not found");

    const updatedFlag = await prisma.reviewFlag.update({
      where: { id },
      data: {
        status: body.data.status,
      },
    });

    if (body.data.status === "ACTIONED" && body.data.reviewAction === "REMOVE") {
      await prisma.review.update({
        where: { id: flag.reviewId },
        data: { status: "REMOVED", isPublished: false },
      });

      await enqueue("RECALCULATE_COMPANY_RATING", { companyId: flag.review.companyId });

      if (flag.review.reviewerId) {
        await prisma.notification.create({
          data: {
            userId: flag.review.reviewerId,
            type: "REVIEW_REMOVED",
            title: "Review Removed",
            message: `Your review of "${flag.review.company.name}" has been removed after a flag was actioned.`,
            metadata: { reviewId: flag.reviewId, flagId: id, adminNote: body.data.adminNote },
          },
        });
      }
    }

    const adminId = (req as any).session?.user?.id || "";
    await createAuditLog({
      adminId,
      action: `RESOLVE_FLAG_${body.data.status}`,
      entityType: "ReviewFlag",
      entityId: id,
      details: {
        flagReason: flag.reason,
        resolution: body.data.status,
        reviewAction: body.data.reviewAction,
        adminNote: body.data.adminNote,
        reviewId: flag.reviewId,
        companyId: flag.review.companyId,
      },
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return success(res, updatedFlag, `Flag ${body.data.status.toLowerCase()} successfully`);
  } catch (error) {
    console.error("Flag resolve error:", error);
    return serverError(res, "Failed to resolve flag");
  }
}
