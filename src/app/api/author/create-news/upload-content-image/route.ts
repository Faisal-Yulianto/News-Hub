import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { handleApiEror, errorResponse } from "@/lib/api-helper";
import { requireAuth } from "@/lib/auth-helper";
import {
  checkRateLimit,
  getRateLimitHeaders,
  getIdentifier,
  authorUploadContentImageLimiter,
} from "@/lib/rate-limit";
import { hashBuffer } from "@/lib/hash";
import prisma from "@/lib/prisma";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

const MAX_CONTENT_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_IMAGES = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadToCloudinary(
  buffer: Buffer,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "news/content-images",
          resource_type: "image",
          transformation: [
            { width: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            return reject(error ?? new Error("Invalid Cloudinary response"));
          }
          resolve(result as CloudinaryUploadResult);
        },
      )
      .end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      authorUploadContentImageLimiter,
      identifier,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) },
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return errorResponse(
        "At least one image is required",
        400,
        "VALIDATION_ERROR",
      );
    }

    if (files.length > MAX_IMAGES) {
      return errorResponse(
        `Maximum ${MAX_IMAGES} images allowed`,
        400,
        "VALIDATION_ERROR",
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return errorResponse(
          `Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed`,
          400,
          "VALIDATION_ERROR",
        );
      }
      if (file.size > MAX_CONTENT_IMAGE_SIZE) {
        return errorResponse(
          `File ${file.name} exceeds 3MB limit`,
          400,
          "VALIDATION_ERROR",
        );
      }
    }
    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const hash = hashBuffer(buffer);

        const existing = await prisma.contentImage.findFirst({
          where: { imageHash: hash },
          select: { url: true },
        });

        if (existing) {
          return {
            url: existing.url,
            hash,
            fromCache: true,
          };
        }

        const uploadResult = await uploadToCloudinary(buffer);

        return {
          url: uploadResult.secure_url,
          hash,
          fromCache: false,
        };
      }),
    );

    return NextResponse.json({ images: results });
  } catch (error) {
    return handleApiEror(error);
  }
}
