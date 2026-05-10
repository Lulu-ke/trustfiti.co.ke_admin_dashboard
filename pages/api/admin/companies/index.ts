import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "GET") return unauthorized(res, "Method not allowed");

  try {
    const { verificationStatus, isActive, industry, search, page = "1", limit = "20" } = req.query;
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const skip = (p - 1) * l;

    const where: any = {};
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;
    if (industry) where.industry = industry;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { city: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { id: true, fullName: true, phoneNumber: true } },
          _count: { select: { reviews: true, invitations: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return success(res, companies, undefined, {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    });
  } catch (error) {
    console.error("Companies error:", error);
    return serverError(res, "Failed to load companies");
  }
}
