import type { NextApiRequest, NextApiResponse } from "next";
import { verifyOtpSchema } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import { badRequest, success, serverError } from "@/lib/response";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return badRequest(res, "Method not allowed");
  }

  try {
    const body = verifyOtpSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    const { phoneNumber, code } = body.data;

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phoneNumber,
        purpose: "LOGIN",
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return badRequest(res, "No valid OTP found. Please request a new one.");
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return badRequest(res, "Maximum verification attempts exceeded. Please request a new OTP.");
    }

    if (otpRecord.code !== code) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = otpRecord.maxAttempts - (otpRecord.attempts + 1);
      return badRequest(res, `Invalid OTP code. ${remaining} attempt(s) remaining.`);
    }

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date() },
    });

    let user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      user = await prisma.user.create({
        data: { phoneNumber, role: "ADMIN", isVerified: true, fullName: "Admin" },
      });
    } else if (!user.isVerified) {
      await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
      user.isVerified = true;
    }

    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    return success(res, {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
      token: sessionToken,
    }, "Admin OTP verified successfully");
  } catch (error) {
    console.error("Verify admin OTP error:", error);
    return serverError(res, "Failed to verify OTP");
  }
}
