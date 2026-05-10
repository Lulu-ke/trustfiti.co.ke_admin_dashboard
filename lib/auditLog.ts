import prisma from "./prisma";

export async function createAuditLog(params: {
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.auditLog.create({ data: params });
}
