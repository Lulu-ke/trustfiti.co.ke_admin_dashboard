import type { NextApiRequest, NextApiResponse } from "next";
import { sendOtpSchema } from "@/lib/validations/auth";
import { sendOTP } from "@/lib/talksasa";
import { otpRateLimitCache } from "@/lib/cache";
import { enqueue } from "@/lib/jobQueue";
import prisma from "@/lib/prisma";
import { badRequest, success, serverError, forbidden } from "@/lib/response";

const ADMIN_PHONES = (process.env.ADMIN_PHONE_NUMBERS || "").split(",").map((p) => p.trim());
const OTP_EXPIRY_SECONDS = 300;
const MAX_OTP_PER_HOUR = 5;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return badRequest(res, "Method not allowed");
  }

  try {
    const body = sendOtpSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    const { phoneNumber } = body.data;

    if (!ADMIN_PHONES.includes(phoneNumber)) {
      return forbidden(res, "Access denied. This phone number is not authorized for admin access.");
    }

    const rateLimitKey = `otp:${phoneNumber}`;
    const currentCount = otpRateLimitCache.get(rateLimitKey) as number | undefined;
    if (currentCount !== undefined && currentCount >= MAX_OTP_PER_HOUR) {
      return badRequest(res, "Too many OTP requests. Please try again after an hour.");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    await prisma.otpVerification.create({
      data: {
        phoneNumber,
        code: otpCode,
        purpose: "LOGIN",
        expiresAt,
      },
    });

    const newCount = (currentCount || 0) + 1;
    otpRateLimitCache.set(rateLimitKey, { count: newCount });

    await enqueue("SEND_OTP", { phoneNumber, otpCode });
    sendOTP(phoneNumber, otpCode).catch((err) => {
      console.error("Direct OTP send failed:", err);
    });

    return success(res, { message: "OTP sent", expiresIn: OTP_EXPIRY_SECONDS }, "Admin OTP sent successfully");
  } catch (error) {
    console.error("Send admin OTP error:", error);
    return serverError(res, "Failed to send OTP");
  }
}
