import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { createAuditLog } from "@/lib/auditLog";
import prisma from "@/lib/prisma";
import { unauthorized, success, serverError } from "@/lib/response";
import { getClientIp, getUserAgent } from "@/lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  try {
    if (req.method === "GET") {
      const settings = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
      const kv: Record<string, string> = {};
      settings.forEach((s) => { kv[s.key] = s.value; });
      return success(res, kv);
    }

    if (req.method === "PUT") {
      const { settings } = req.body;
      if (!settings || typeof settings !== "object") {
        return res.status(400).json({ success: false, message: "Settings object required" });
      }

      const updates = Object.entries(settings).map(([key, value]) =>
        prisma.platformSetting.upsert({
          where: { key },
          update: { value: value as string },
          create: { key, value: value as string },
        })
      );

      await Promise.all(updates);

      const adminId = (req as any).session?.user?.id || "";
      await createAuditLog({
        adminId,
        action: "UPDATE_SETTINGS",
        entityType: "PlatformSetting",
        entityId: "multiple",
        details: { changedKeys: Object.keys(settings) },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return success(res, null, "Settings updated successfully");
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Settings error:", error);
    return serverError(res, "Failed to process settings");
  }
}
