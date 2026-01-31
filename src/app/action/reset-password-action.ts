"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ResetPasswordSchema } from "@/lib/validation/auth-Validation";

export default async function resetPasswordAction(FormData: FormData) {
  try {
    const password = FormData.get("password")?.toString() || "";
    const confirmPassword = FormData.get("confirmPassword")?.toString() || "";
    const token = FormData.get("token")?.toString() || "";
    const parsedData = ResetPasswordSchema.parse({
      password,
      confirmPassword,
    });
    const reset = await prisma.passwordReset.findFirst({
      where: { token },
    });
    if (!reset || reset.expires < new Date()) {
      return {
        ok: false,
        message: "Token tidak valid atau telah kedaluwarsa",
      };
    }
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);
    await prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    });
    await prisma.passwordReset.deleteMany({
      where: { userId: reset.userId },
    });
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
