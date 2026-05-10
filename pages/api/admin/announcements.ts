import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/admin";
import { unauthorized, success, created, badRequest, notFound, serverError } from "@/lib/response";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  try {
    if (req.method === "GET") {
      const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
      });
      return success(res, announcements);
    }

    if (req.method === "POST") {
      const body = announcementSchema.safeParse(req.body);
      if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

      const announcement = await prisma.announcement.create({
        data: {
          title: body.data.title,
          content: body.data.content,
          type: body.data.type,
          targetAudience: body.data.targetAudience,
          isPublished: body.data.isPublished,
          publishedAt: body.data.isPublished ? new Date() : null,
          expiresAt: body.data.expiresAt ? new Date(body.data.expiresAt) : null,
        },
      });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "CREATE_ANNOUNCEMENT",
        entityType: "Announcement",
        entityId: announcement.id,
        details: { title: body.data.title, type: body.data.type },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return created(res, announcement, "Announcement created successfully");
    }

    if (req.method === "PUT") {
      const { id, ...data } = req.body;
      if (!id) return badRequest(res, "Announcement ID required");

      const body = announcementSchema.safeParse(data);
      if (!body.success) return badRequest(res, "Invalid data", body.error.errors[0]?.message);

      const existing = await prisma.announcement.findUnique({ where: { id } });
      if (!existing) return notFound(res, "Announcement not found");

      const shouldPublish = body.data.isPublished && !existing.isPublished;

      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          title: body.data.title,
          content: body.data.content,
          type: body.data.type,
          targetAudience: body.data.targetAudience,
          isPublished: body.data.isPublished,
          publishedAt: shouldPublish ? new Date() : existing.publishedAt,
          expiresAt: body.data.expiresAt ? new Date(body.data.expiresAt) : null,
        },
      });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "UPDATE_ANNOUNCEMENT",
        entityType: "Announcement",
        entityId: id,
        details: { title: body.data.title },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, announcement, "Announcement updated successfully");
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) return badRequest(res, "Announcement ID required");

      await prisma.announcement.delete({ where: { id } });

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "DELETE_ANNOUNCEMENT",
        entityType: "Announcement",
        entityId: id,
        details: {},
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, null, "Announcement deleted successfully");
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Announcements error:", error);
    return serverError(res, "Failed to process announcements");
  }
}
