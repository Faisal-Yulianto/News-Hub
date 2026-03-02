import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";
import {
  forgotRequestEmailLimiter,
  forgotRequestIpLimiter,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth-helper";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.toLowerCase().trim();
    const genericResponse = () =>
      NextResponse.json(
        { message: "Jika email terdaftar, link reset akan dikirim." },
        { status: 200 }
      );

    if (!email) {
      await new Promise((r) =>
        setTimeout(r, 200 + Math.random() * 200)
      );
      return genericResponse();
    }
    const ip = getClientIp(request);
    const ipLimit = await forgotRequestIpLimiter.limit(ip);

    if (!ipLimit.success) {
      const retryAfter = Math.ceil(
        (ipLimit.reset - Date.now()) / 1000
      );

      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(ipLimit),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }
    const emailLimit = await forgotRequestEmailLimiter.limit(email);

    if (!emailLimit.success) {
      const retryAfter = Math.ceil(
        (emailLimit.reset - Date.now()) / 1000
      );

      return NextResponse.json(
        {
          error: "Too many reset attempts for this email.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(emailLimit),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      const expires = new Date(Date.now() + 1000 * 60 * 60); 

      await prisma.$transaction([
        prisma.passwordReset.deleteMany({
          where: { userId: user.id },
        }),
        prisma.passwordReset.create({
          data: {
            token: hashedToken,
            userId: user.id,
            expires,
          },
        }),
      ]);

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`;

      await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: [email],
        subject: "Password Reset",
        html: `
          <p>Klik <a href="${resetUrl}">disini</a> untuk mereset password.</p>
          <p>Link ini akan expired dalam 1 jam.</p>
        `,
      });
    }
    await new Promise((r) =>
      setTimeout(r, 200 + Math.random() * 200)
    );

    return genericResponse();
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}