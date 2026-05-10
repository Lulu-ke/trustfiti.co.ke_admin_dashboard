import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { companyUpdateSchema } from "@/lib/validations/admin";
import { unauthorized, success, badRequest, notFound, serverError } from "@/lib/response";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") return badRequest(res, "Company ID required");

  try {
    if (req.method === "GET") {
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          owner: { select: { id: true, fullName: true, phoneNumber: true, email: true, avatar: true } },
          reviews: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              reviewer: { select: { id: true, fullName: true, avatar: true } },
            },
          },
          invitations: { take: 10, orderBy: { createdAt: "desc" } },
          categories: { include: { category: true } },
          _count: { select: { reviews: true, invitations: true } },
        },
      });

      if (!company) return notFound(res, "Company not found");
      return success(res, company);
    }

    if (req.method === "PUT") {
      const body = companyUpdateSchema.safeParse(req.body);
      if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

      const existing = await prisma.company.findUnique({ where: { id } });
      if (!existing) return notFound(res, "Company not found");

      const company = await prisma.company.update({
        where: { id },
        data: body.data,
      });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "UPDATE_COMPANY",
        entityType: "Company",
        entityId: id,
        details: { changes: body.data },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, company, "Company updated successfully");
    }

    return unauthorized(res, "Method not allowed");
  } catch (error) {
    console.error("Company detail error:", error);
    return serverError(res, "Failed to process company request");
  }
}
