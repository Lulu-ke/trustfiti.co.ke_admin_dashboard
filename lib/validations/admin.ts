import { z } from "zod";

export const userUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["REVIEWER", "COMPANY_OWNER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export const companyUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  industry: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const verifyCompanySchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().max(1000).optional(),
});

export const resolveFlagSchema = z.object({
  status: z.enum(["DISMISSED", "ACTIONED"]),
  adminNote: z.string().max(1000).optional(),
  reviewAction: z.enum(["REMOVE", "NONE"]).default("NONE"),
});

export const settingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().default(0),
});

export const announcementSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(10).max(5000),
  type: z.enum(["INFO", "WARNING", "MAINTENANCE", "UPDATE"]).default("INFO"),
  targetAudience: z.enum(["ALL", "REVIEWERS", "COMPANIES"]).default("ALL"),
  isPublished: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
});
