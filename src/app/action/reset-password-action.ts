"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import { ResetPasswordSchema } from "@/lib/validation/auth-Validation";
import {
  resetRequestEmailLimiter,
  resetRequestIpLimiter,
} from "@/lib/rate-limit";

export default async function resetPasswordAction(formData: FormData) {
  try {
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";
    const rawToken = formData.get("token")?.toString() || "";

    if (!rawToken) {
      return {
        ok: false,
        message: "Token tidak valid",
      };
    }

    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "anonymous";

    const ipLimit = await resetRequestIpLimiter.limit(ip);

    if (!ipLimit.success) {
      return {
        ok: false,
        message: "Terlalu banyak percobaan. Coba lagi dalam beberapa saat.",
      };
    }

    const parsedData = ResetPasswordSchema.parse({
      password,
      confirmPassword,
    });

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const reset = await prisma.passwordReset.findUnique({
      where: { token: hashedToken },
    });

    if (!reset || reset.expires < new Date()) {
      return {
        ok: false,
        message: "Token tidak valid atau telah kedaluwarsa",
      };
    }
    const emailLimit = await resetRequestEmailLimiter.limit(reset.userId);

    if (!emailLimit.success) {
      return {
        ok: false,
        message:
          "Terlalu banyak permintaan reset untuk akun ini. Coba lagi nanti.",
      };
    }
    const hashedPassword = await bcrypt.hash(parsedData.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.deleteMany({
        where: { userId: reset.userId },
      }),
    ]);

    return {
      ok: true,
      message: "Kata sandi berhasil diubah, silakan login",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}