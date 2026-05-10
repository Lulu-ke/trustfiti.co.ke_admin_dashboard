import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method !== "GET") return unauthorized(res, "Method not allowed");

  try {
    const { companyId, status, page = "1", limit = "20" } = req.query;
    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const skip = (p - 1) * l;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status === "used") where.isUsed = true;
    if (status === "unused") where.isUsed = false;

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        skip,
        take: l,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { id: true, name: true, logo: true, slug: true } },
          usedBy: { select: { id: true, fullName: true, avatar: true } },
        },
      }),
      prisma.invitation.count({ where }),
    ]);

    return success(res, invitations, undefined, {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    });
  } catch (error) {
    console.error("Invitations error:", error);
    return serverError(res, "Failed to load invitations");
  }
}
