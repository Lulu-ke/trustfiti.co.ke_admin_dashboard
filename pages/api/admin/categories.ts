import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/admin";
import { unauthorized, success, created, badRequest, notFound, serverError } from "@/lib/response";
import { generateSlug, getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  try {
    if (req.method === "GET") {
      const categories = await prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { companies: true } } },
      });
      return success(res, categories);
    }

    if (req.method === "POST") {
      const body = categorySchema.safeParse(req.body);
      if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

      const existing = await prisma.category.findUnique({ where: { name: body.data.name } });
      if (existing) return badRequest(res, "Category with this name already exists");

      const category = await prisma.category.create({
        data: {
          name: body.data.name,
          slug: generateSlug(body.data.name),
          description: body.data.description,
          icon: body.data.icon,
          sortOrder: body.data.sortOrder,
        },
      });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "CREATE_CATEGORY",
        entityType: "Category",
        entityId: category.id,
        details: { name: body.data.name },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return created(res, category, "Category created successfully");
    }

    if (req.method === "PUT") {
      const { id, ...data } = req.body;
      if (!id) return badRequest(res, "Category ID required");

      const body = categorySchema.safeParse(data);
      if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) return notFound(res, "Category not found");

      const category = await prisma.category.update({
        where: { id },
        data: {
          name: body.data.name,
          slug: generateSlug(body.data.name),
          description: body.data.description,
          icon: body.data.icon,
          sortOrder: body.data.sortOrder,
        },
      });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "UPDATE_CATEGORY",
        entityType: "Category",
        entityId: id,
        details: { name: body.data.name },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, category, "Category updated successfully");
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) return badRequest(res, "Category ID required");

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) return notFound(res, "Category not found");

      await prisma.category.delete({ where: { id } });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "DELETE_CATEGORY",
        entityType: "Category",
        entityId: id,
        details: { name: existing.name },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, null, "Category deleted successfully");
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Categories error:", error);
    return serverError(res, "Failed to process categories");
  }
}
