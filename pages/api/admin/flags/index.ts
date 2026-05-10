import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "GET") return unauthorized(res, "Method not allowed");

  try {
    const { status, reason, dateFrom, dateTo, page = "1", limit = "20" } = req.query;
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const skip = (p - 1) * l;

    const where: any = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [flags, total] = await Promise.all([
      prisma.reviewFlag.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, fullName: true, avatar: true, phoneNumber: true } },
          review: {
            include: {
              company: { select: { id: true, name: true, logo: true } },
              reviewer: { select: { id: true, fullName: true } },
            },
          },
        },
      }),
      prisma.reviewFlag.count({ where }),
    ]);

    return success(res, flags, undefined, {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    });
  } catch (error) {
    console.error("Flags error:", error);
    return serverError(res, "Failed to load flags");
  }
}
