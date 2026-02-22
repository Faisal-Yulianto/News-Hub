"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/lib/validation/auth-Validation";

export default async function registerAction(data: FormData) {
  try {
    const name = data.get("name")?.toString() || "";
    const email = data.get("email")?.toString() || "";
    const password = data.get("password")?.toString() || "";
    const confirmPassword = data.get("confirmPassword")?.toString() || "";

    const parsedData = RegisterSchema.parse({
      name,
      email,
      password,
      confirmPassword,
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.email },
    });

    if (existingUser) {
      return {
        ok: false,
        message: "Email sudah terdaftar",
      };
    }

    const hashedPassword = await bcrypt.hash(parsedData.password, 10);
    await prisma.user.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        password: hashedPassword,
        role: "READER"
      },
    });

    return {
      ok: true,
      message: "Registrasi berhasil, silakan login",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan pada server",
    };
  }
}
