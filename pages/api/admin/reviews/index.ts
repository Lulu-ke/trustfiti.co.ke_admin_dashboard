import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "GET") return unauthorized(res, "Method not allowed");

  try {
    const {
      status,
      rating,
      companyId,
      reviewerId,
      hasFlags,
      search,
      dateFrom,
      dateTo,
      page = "1",
      limit = "20",
    } = req.query;
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const skip = (p - 1) * l;

    const where: any = {};
    if (status) where.status = status;
    if (rating) where.rating = parseInt(rating as string);
    if (companyId) where.companyId = companyId;
    if (reviewerId) where.reviewerId = reviewerId;
    if (hasFlags === "true") where.flags = { some: {} };
    if (search) where.content = { contains: search as string, mode: "insensitive" };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: { select: { id: true, fullName: true, avatar: true, phoneNumber: true } },
          company: { select: { id: true, name: true, slug: true, logo: true } },
          _count: { select: { flags: true, replies: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return success(res, reviews, undefined, {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    });
  } catch (error) {
    console.error("Reviews error:", error);
    return serverError(res, "Failed to load reviews");
  }
}
