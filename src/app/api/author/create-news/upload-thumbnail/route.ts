import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import {  handleApiEror, errorResponse } from "@/lib/api-helper";
import { requireAuth } from "@/lib/auth-helper";
import {
  checkRateLimit,
  getRateLimitHeaders,
  getIdentifier,
  authorUploadThumbnailLimiter,
} from "@/lib/rate-limit";
import { hashBuffer } from "@/lib/hash";
import prisma from "@/lib/prisma";

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; 
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      authorUploadThumbnailLimiter,
      identifier
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const formData = await req.formData();
    const file = formData.get("thumbnail") as File | null;

    if (!file) {
      return errorResponse("Thumbnail file is required", 400, "VALIDATION_ERROR");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      return errorResponse(
        "File size exceeds 5MB limit",
        400,
        "VALIDATION_ERROR"
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = hashBuffer(buffer);

    const existing = await prisma.news.findFirst({
      where: { thumbnailHash: hash },
      select: { thumbnailUrl: true },
    });

    if (existing) {
      return NextResponse.json({
        url: existing.thumbnailUrl,
        fromCache: true,
      });
    }

    const uploadResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "news/thumbnails",
              resource_type: "image",
              transformation: [
                { width: 1200, height: 630, crop: "fill" },
                { quality: "auto", fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error || !result?.secure_url) {
                return reject(error ?? new Error("Invalid Cloudinary response"));
              }
              resolve(result as CloudinaryUploadResult);
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      url: uploadResult.secure_url,
      hash,
      fromCache: false,
    });
  } catch (error) {
    return handleApiEror(error);
  }
}