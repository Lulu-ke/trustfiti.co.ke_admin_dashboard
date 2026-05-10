import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { unauthorized, success, badRequest, notFound, serverError } from "@/lib/response";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "PATCH") return unauthorized(res, "Method not allowed");

  const { id } = req.query;
  if (!id || typeof id !== "string") return badRequest(res, "Company ID required");

  try {
    const { reason } = req.body;
    if (!reason) return badRequest(res, "Reason is required");

    const company = await prisma.company.findUnique({
      where: { id },
      include: { owner: { select: { id: true, fullName: true } } },
    });
    if (!company) return notFound(res, "Company not found");

    const isCurrentlyActive = company.isActive;
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { isActive: !isCurrentlyActive },
    });

    if (company.ownerId) {
      await prisma.notification.create({
        data: {
          userId: company.ownerId,
          type: "COMPANY_SUSPENDED",
          title: isCurrentlyActive ? "Company Suspended" : "Company Reactivated",
          message: isCurrentlyActive
            ? `Your company "${company.name}" has been suspended. Reason: ${reason}`
            : `Your company "${company.name}" has been reactivated.`,
          metadata: { companyId: id, reason, isActive: !isCurrentlyActive },
        },
      });
    }

    const adminId = (req as any).session?.user?.id || "";
    await createAuditLog({
      adminId,
      action: isCurrentlyActive ? "SUSPEND_COMPANY" : "REACTIVATE_COMPANY",
      entityType: "Company",
      entityId: id,
      details: { companyName: company.name, reason },
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return success(res, updatedCompany, `Company ${isCurrentlyActive ? "suspended" : "reactivated"} successfully`);
  } catch (error) {
    console.error("Company suspend error:", error);
    return serverError(res, "Failed to suspend/reactivate company");
  }
}
