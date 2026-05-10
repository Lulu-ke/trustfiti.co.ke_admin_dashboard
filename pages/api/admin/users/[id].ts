import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { userUpdateSchema } from "@/lib/validations/admin";
import { unauthorized, success, badRequest, notFound, serverError } from "@/lib/response";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") return badRequest(res, "User ID required");

  try {
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          reviews: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              company: { select: { id: true, name: true, slug: true, logo: true } },
            },
          },
          flags: { take: 10, orderBy: { createdAt: "desc" } },
          ownedCompany: {
            select: { id: true, name: true, slug: true, logo: true, verificationStatus: true },
          },
          _count: { select: { reviews: true, flags: true, reviewReplies: true, invitations: true } },
        },
      });

      if (!user) return notFound(res, "User not found");

      return success(res, user);
    }

    if (req.method === "PUT") {
      const body = userUpdateSchema.safeParse(req.body);
      if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) return notFound(res, "User not found");

      const updateData: any = {};
      if (body.data.fullName !== undefined) updateData.fullName = body.data.fullName;
      if (body.data.email !== undefined) updateData.email = body.data.email || null;
      if (body.data.role !== undefined) updateData.role = body.data.role;
      if (body.data.isActive !== undefined) updateData.isActive = body.data.isActive;

      const user = await prisma.user.update({ where: { id }, data: updateData });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "UPDATE_USER",
        entityType: "User",
        entityId: id,
        details: { changes: body.data, previous: { role: existing.role, isActive: existing.isActive } },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, user, "User updated successfully");
    }

    if (req.method === "DELETE") {
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) return notFound(res, "User not found");
      if (existing.role === "ADMIN") return badRequest(res, "Cannot deactivate admin users");

      await prisma.user.update({ where: { id }, data: { isActive: false } });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "DEACTIVATE_USER",
        entityType: "User",
        entityId: id,
        details: { userFullName: existing.fullName, userPhone: existing.phoneNumber },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, null, "User deactivated successfully");
    }

    return unauthorized(res, "Method not allowed");
  } catch (error) {
    console.error("User detail error:", error);
    return serverError(res, "Failed to process user request");
  }
}
