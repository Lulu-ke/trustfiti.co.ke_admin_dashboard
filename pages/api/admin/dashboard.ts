import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getAdminFromSession } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";
import { getJobStats } from "@/lib/jobQueue";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return unauthorized(res, "Method not allowed");

  try {
    const isAdmin = await requireAdmin(req, res);
    if (!isAdmin) return;

    const [
      totalUsers,
      totalCompanies,
      totalReviews,
      pendingFlags,
      pendingVerifications,
      newUsersThisWeek,
      newReviewsThisWeek,
      avgRatingResult,
      recentActivity,
      jobStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.review.count({ where: { status: "PUBLISHED" } }),
      prisma.reviewFlag.count({ where: { status: "PENDING" } }),
      prisma.company.count({ where: { verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] } } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.review.count({
        where: {
          status: "PUBLISHED",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.review.aggregate({
        where: { status: "PUBLISHED" },
        _avg: { rating: true },
      }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { id: true, fullName: true, avatar: true } } },
      }),
      getJobStats(),
    ]);

    const avgPlatformRating = Math.round((avgRatingResult._avg.rating || 0) * 10) / 10;

    return success(res, {
      totalUsers,
      totalCompanies,
      totalReviews,
      pendingFlags,
      pendingVerifications,
      newUsersThisWeek,
      newReviewsThisWeek,
      avgPlatformRating,
      recentActivity,
      systemHealth: jobStats,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return serverError(res, "Failed to load dashboard");
  }
}
