import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { verifyCompanySchema } from "@/lib/validations/admin";
import { unauthorized, success, badRequest, notFound, serverError } from "@/lib/response";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "PATCH") return unauthorized(res, "Method not allowed");

  const { id } = req.query;
  if (!id || typeof id !== "string") return badRequest(res, "Company ID required");

  try {
    const body = verifyCompanySchema.safeParse(req.body);
    if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

    const company = await prisma.company.findUnique({
      where: { id },
      include: { owner: { select: { id: true, fullName: true } } },
    });
    if (!company) return notFound(res, "Company not found");

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        verificationStatus: body.data.status,
        isVerified: body.data.status === "APPROVED",
      },
    });

    if (company.ownerId) {
      await prisma.notification.create({
        data: {
          userId: company.ownerId,
          type: "COMPANY_VERIFIED",
          title: body.data.status === "APPROVED" ? "Company Verified" : "Verification Rejected",
          message:
            body.data.status === "APPROVED"
              ? `Your company "${company.name}" has been verified successfully.`
              : `Your company "${company.name}" verification was rejected. ${body.data.notes || "Please resubmit with corrected documents."}`,
          metadata: {
            companyId: id,
            status: body.data.status,
            notes: body.data.notes,
          },
        },
      });
    }

    const adminId = (req as any).session?.user?.id || "";
    await createAuditLog({
      adminId,
      action: body.data.status === "APPROVED" ? "APPROVE_COMPANY" : "REJECT_COMPANY",
      entityType: "Company",
      entityId: id,
      details: { companyName: company.name, status: body.data.status, notes: body.data.notes },
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return success(res, updatedCompany, `Company verification ${body.data.status.toLowerCase()}`);
  } catch (error) {
    console.error("Company verify error:", error);
    return serverError(res, "Failed to verify company");
  }
}
