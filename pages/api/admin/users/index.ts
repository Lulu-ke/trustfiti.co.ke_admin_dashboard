import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { unauthorized, success, badRequest, serverError } from "@/lib/response";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  try {
    if (req.method === "GET") {
      const { role, status, search, page = "1", limit = "20" } = req.query;
      const p = parseInt(page as string);
      const l = parseInt(limit as string);
      const skip = (p - 1) * l;

      const where: any = {};
      if (role) where.role = role;
      if (status === "active") where.isActive = true;
      if (status === "inactive") where.isActive = false;
      if (search) {
        where.OR = [
          { fullName: { contains: search as string, mode: "insensitive" } },
          { phoneNumber: { contains: search as string } },
          { email: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: l,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            avatar: true,
            role: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
            _count: { select: { reviews: true, flags: true, ownedCompany: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return success(res, users, undefined, {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l),
      });
    }

    if (req.method === "PATCH") {
      const { userIds, action } = req.body;
      if (!userIds || !Array.isArray(userIds) || !action) {
        return badRequest(res, "userIds array and action are required");
      }

      const session = await requireAdmin(req, res);
      const adminId = (req as any).session?.user?.id || "";

      if (action === "deactivate") {
        await prisma.user.updateMany({
          where: { id: { in: userIds }, role: { not: "ADMIN" } },
          data: { isActive: false },
        });
        await createAuditLog({
          adminId,
          action: "BULK_DEACTIVATE_USERS",
          entityType: "User",
          entityId: userIds.join(","),
          details: { userIds },
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } else if (action === "activate") {
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true },
        });
        await createAuditLog({
          adminId,
          action: "BULK_ACTIVATE_USERS",
          entityType: "User",
          entityId: userIds.join(","),
          details: { userIds },
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      }

      return success(res, null, `Users ${action}d successfully`);
    }

    return unauthorized(res, "Method not allowed");
  } catch (error) {
    console.error("Users error:", error);
    return serverError(res, "Failed to process users request");
  }
}
