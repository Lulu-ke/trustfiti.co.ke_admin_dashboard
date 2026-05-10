import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "GET") return unauthorized(res, "Method not allowed");

  try {
    const { action, entityType, adminId, dateFrom, dateTo, page = "1", limit = "50" } = req.query;
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const skip = (p - 1) * l;

    const where: any = {};
    if (action) where.action = { contains: action as string };
    if (entityType) where.entityType = entityType;
    if (adminId) where.adminId = adminId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { id: true, fullName: true, avatar: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return success(res, logs, undefined, {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    return serverError(res, "Failed to load audit logs");
  }
}
