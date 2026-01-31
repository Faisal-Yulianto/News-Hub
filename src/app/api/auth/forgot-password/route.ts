import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000);
  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expires,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset",
      html: `<p>Klik <a href="${resetUrl}">disini</a> untuk mereset password. Link ini akan expired dalam 1 jam.</p>`,
    });
    return NextResponse.json({ message: "Password reset email berhasil terkirim" });
  } catch (error) {
    console.error("Gagal untuk mengirim e-mail :", error);
    return NextResponse.json(
      { error: "Gagal untuk mengirim e-mail" },
      { status: 500 }
    );
  }
}
