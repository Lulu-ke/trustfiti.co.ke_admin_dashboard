import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";
import { analyticsCache } from "@/lib/cache";

function getPeriodDate(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y": return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default: return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "GET") return unauthorized(res, "Method not allowed");

  try {
    const { period = "30d" } = req.query;
    const periodDate = getPeriodDate(period as string);
    const dateFilter = periodDate ? { gte: periodDate } : undefined;

    const cacheKey = `analytics:${period}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return success(res, cached);

    const [
      userByRole,
      userActiveStats,
      userGrowth,
      companyByVerification,
      companyByIndustry,
      topRatedCompanies,
      companyGrowth,
      reviewByRating,
      reviewByStatus,
      reviewTrend,
      flagStats,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { createdAt: dateFilter } }),
      ]),
      prisma.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM User
        ${periodDate ? `WHERE createdAt >= ${periodDate}` : ""}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
      prisma.company.groupBy({
        by: ["verificationStatus"],
        _count: { verificationStatus: true },
      }),
      prisma.company.groupBy({
        by: ["industry"],
        _count: { industry: true },
        where: { industry: { not: null } },
        orderBy: { _count: { industry: "desc" } },
        take: 10,
      }),
      prisma.company.findMany({
        where: { totalReviews: { gt: 0 } },
        orderBy: { averageRating: "desc" },
        take: 10,
        select: { id: true, name: true, averageRating: true, totalReviews: true },
      }),
      prisma.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM Company
        ${periodDate ? `WHERE createdAt >= ${periodDate}` : ""}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
      prisma.review.groupBy({
        by: ["rating"],
        where: { status: "PUBLISHED" },
        _count: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM Review
        ${periodDate ? `WHERE createdAt >= ${periodDate}` : ""}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
      Promise.all([
        prisma.reviewFlag.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        prisma.reviewFlag.groupBy({
          by: ["reason"],
          _count: { reason: true },
        }),
      ]),
    ]);

    const data = {
      overview: {
        totalUsers: userByRole.reduce((s, g) => s + g._count.role, 0),
        totalCompanies: companyByVerification.reduce((s, g) => s + g._count.verificationStatus, 0),
        totalReviews: reviewByStatus.reduce((s, g) => s + g._count.status, 0),
        avgRating: reviewByRating.length > 0
          ? Math.round(reviewByRating.reduce((s, g) => s + g.rating * g._count.rating, 0) / reviewByRating.reduce((s, g) => s + g._count.rating, 0) * 10) / 10
          : 0,
      },
      userStats: {
        byRole: userByRole.map(g => ({ role: g.role, count: g._count.role })),
        active: userActiveStats[0],
        inactive: userActiveStats[1],
        newInPeriod: userActiveStats[2],
        growth: userGrowth,
      },
      companyStats: {
        byVerificationStatus: companyByVerification.map(g => ({ status: g.verificationStatus, count: g._count.verificationStatus })),
        byIndustry: companyByIndustry.map(g => ({ industry: g.industry, count: g._count.industry })),
        topRated: topRatedCompanies,
        growth: companyGrowth,
      },
      reviewStats: {
        byRating: reviewByRating.map(g => ({ rating: g.rating, count: g._count.rating })),
        byStatus: reviewByStatus.map(g => ({ status: g.status, count: g._count.status })),
        trend: reviewTrend,
      },
      flagStats: {
        byStatus: flagStats[0].map(g => ({ status: g.status, count: g._count.status })),
        byReason: flagStats[1].map(g => ({ reason: g.reason, count: g._count.reason })),
      },
    };

    analyticsCache.set(cacheKey, data as any);
    return success(res, data);
  } catch (error) {
    console.error("Analytics error:", error);
    return serverError(res, "Failed to load analytics");
  }
}
