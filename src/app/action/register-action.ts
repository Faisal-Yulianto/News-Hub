"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { RegisterSchema } from "@/lib/validation/auth-Validation";
import { registerLimiter } from "@/lib/rate-limit";

export default async function registerAction(data: FormData) {
  try {
    const name = data.get("name")?.toString().trim() || "";
    const email = data.get("email")?.toString().toLowerCase().trim() || "";
    const password = data.get("password")?.toString() || "";
    const confirmPassword = data.get("confirmPassword")?.toString() || "";

    const parsedData = RegisterSchema.parse({
      name,
      email,
      password,
      confirmPassword,
    });

    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    const identifier = `${ip}:${email}`;
    const rate = await registerLimiter.limit(identifier);

    if (!rate.success) {
      return {
        ok: false,
        message: "Terlalu banyak percobaan registrasi. Coba lagi nanti.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.email },
    });

    if (existingUser) {
      await new Promise((res) => setTimeout(res, 500));

      return {
        ok: false,
        message: "Registrasi gagal",
      };
    }

    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    await prisma.user.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        password: hashedPassword,
        role: "READER",
      },
    });

    return {
      ok: true,
      message: "Registrasi berhasil, silakan login",
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
