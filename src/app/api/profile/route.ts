import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { UploadImageLimiter, getRateLimitHeaders } from "@/lib/rate-limit";
import { hashBuffer } from "@/lib/hash";
import { getCurrentUser } from "@/lib/auth-helper";
import { errorResponse } from "@/lib/api-helper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const avatar = formData.get("avatar") as File | null;

    if (!name && !avatar) {
      return NextResponse.json(
        { error: "Tidak ada data yang diubah" },
        { status: 400 },
      );
    }

    const updateData: { name?: string; avatar?: string; avatarHash?: string } =
      {};

    if (name) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Nama minimal 2 karakter" },
          { status: 400 },
        );
      }

      updateData.name = name.trim();
    }

    if (avatar) {
      const rateLimitResult = await UploadImageLimiter.limit(currentUser.id);

      if (!rateLimitResult.success) {
        const retryAfter = Math.ceil(
          (rateLimitResult.reset - Date.now()) / 1000,
        );

        return NextResponse.json(
          {
            error: `Too many avatar uploads. Try again in ${retryAfter} seconds.`,
          },
          {
            status: 429,
            headers: {
              ...getRateLimitHeaders(rateLimitResult),
              "Retry-After": retryAfter.toString(),
            },
          },
        );
      }

      if (!avatar.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "File harus berupa gambar" },
          { status: 400 },
        );
      }

      if (avatar.size > MAX_AVATAR_SIZE) {
        return NextResponse.json(
          { error: "Ukuran avatar maksimal 2MB" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await avatar.arrayBuffer());
      const hash = hashBuffer(buffer);

      const existingUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          avatarHash: true,
        },
      });

      if (existingUser?.avatarHash === hash) {
        return NextResponse.json({
          success: true,
          message: "Avatar tidak berubah",
        });
      }

      const uploadResult = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "avatars",
                public_id: currentUser.id,
                overwrite: true,
                resource_type: "image",
                transformation: [
                  { width: 512, height: 512, crop: "limit" },
                  { quality: "auto", fetch_format: "auto" },
                ],
              },
              (error, result) => {
                if (error || !result?.secure_url) {
                  return reject(
                    error ?? new Error("Invalid Cloudinary response"),
                  );
                }

                resolve(result as CloudinaryUploadResult);
              },
            )
            .end(buffer);
        },
      );

      updateData.avatar = uploadResult.secure_url;
      updateData.avatarHash = hash;
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        name: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      user,
    });
  } catch (error) {
    console.error("PATCH PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
