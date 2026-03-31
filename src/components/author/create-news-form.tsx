"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Send, Save } from "lucide-react";
import { TiptapEditor } from "./tiptap-editor";
import { ThumbnailUpload } from "./upload-thumbnail";
import { ContentImageUpload } from "./content-image";
import {
  createNewsSchema,
  CreateNewsFormValues,
  ContentImageValue,
} from "@/lib/validation/add-news-validation";
import { Category } from "@/app/service/author/create-category";
import { useUploadThumbnail } from "@/app/service/author/create-thumbnail";
import { useUploadContentImages } from "@/app/service/author/create-content-images";
import { useCreateNews } from "@/app/service/author/create-news";
import { useState } from "react";

interface CreateNewsFormProps {
  categories: Category[];
}

export function CreateNewsForm({ categories }: CreateNewsFormProps) {
  const router = useRouter();

  const [thumbnail, setThumbnail] = useState<{
    url: string;
    hash: string;
  } | null>(null);
  const [contentImages, setContentImages] = useState<ContentImageValue[]>([]);
  const [submitStatus, setSubmitStatus] = useState<
    "DRAFT" | "PENDING_REVIEW" | null
  >(null);

  const uploadThumbnail = useUploadThumbnail();
  const uploadContentImages = useUploadContentImages();
  const createNews = useCreateNews(() => {
    router.push("/author/news-management");
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateNewsFormValues>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: {
      isBreaking: false,
      contentImages: [],
      status: "DRAFT",
    },
  });
  const handleThumbnailUpload = async (file: File) => {
    const result = await uploadThumbnail.mutateAsync(file);
    setThumbnail({ url: result.url, hash: result.hash });
    setValue("thumbnailUrl", result.url);
    setValue("thumbnailHash", result.hash);
  };
  const handleThumbnailRemove = () => {
    setThumbnail(null);
    setValue("thumbnailUrl", "");
    setValue("thumbnailHash", "");
  };
  const handleContentImagesUpload = async (files: File[]) => {
    const result = await uploadContentImages.mutateAsync(files);
    const newImages: ContentImageValue[] = result.images.map((img) => ({
      url: img.url,
      hash: img.hash,
      caption: "",
    }));
    const updated = [...contentImages, ...newImages].slice(0, 3);
    setContentImages(updated);
    setValue("contentImages", updated);
  };
  const handleContentImagesChange = (images: ContentImageValue[]) => {
    setContentImages(images);
    setValue("contentImages", images);
  };
  const onSubmit = (data: CreateNewsFormValues) => {
    if (!thumbnail) return;
    createNews.mutate({ ...data, status: submitStatus ?? "DRAFT" });
  };

  const isSubmitting = createNews.isPending;
  const canSubmit = !!thumbnail && !isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {!thumbnail && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Harap unggah gambar thumbnail sebelum mengirimkan artikel berita Anda.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Judul <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Masukan judul berita"
          maxLength={200}
          {...register("title")}
        />
        <div className="flex justify-between">
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {watch("title")?.length ?? 0}/200
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          onValueChange={(val) => setValue("categoryId", val)}
          defaultValue=""
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-destructive">
            {errors.categoryId.message}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>
          Thumbnail <span className="text-destructive">*</span>
        </Label>
        <ThumbnailUpload
          value={thumbnail}
          onChange={handleThumbnailRemove}
          onUpload={handleThumbnailUpload}
          uploading={uploadThumbnail.isPending}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Gambar konten</Label>
        <p className="text-xs text-muted-foreground">
          Hingga 3 gambar ilustrasi ditampilkan di atas isi artikel.
        </p>
        <ContentImageUpload
          value={contentImages}
          onChange={handleContentImagesChange}
          onUpload={handleContentImagesUpload}
          uploading={uploadContentImages.isPending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="excerpt">
          Ringkasan <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="excerpt"
          placeholder="Ringkasan singkat artikel"
          maxLength={500}
          rows={3}
          {...register("excerpt")}
        />
        <div className="flex justify-between">
          {errors.excerpt ? (
            <p className="text-xs text-destructive">{errors.excerpt.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {watch("excerpt")?.length ?? 0}/500
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>
          Konten <span className="text-destructive">*</span>
        </Label>
        <TiptapEditor
          value={watch("content") ?? ""}
          onChange={(val) => setValue("content", val)}
          placeholder="Tulis konten berita Anda di sini...."
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="source">
          Sumber <span className="text-destructive">*</span>
        </Label>
        <Input
          id="source"
          placeholder="e.g. Kementerian Pendidikan RI"
          maxLength={200}
          {...register("source")}
        />
        {errors.source && (
          <p className="text-xs text-destructive">{errors.source.message}</p>
        )}
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium text-sm">Breaking News</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tandai berita sebagai breaking news
          </p>
        </div>
        <Switch
          checked={watch("isBreaking")}
          onCheckedChange={(val) => setValue("isBreaking", val)}
        />
      </div>

      <Separator />
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Pengaturan SEO</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Opsional — membantu mesin pencari memahami artikel Anda dengan lebih baik.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="metaTitle">Judul Meta</Label>
          <Input
            id="metaTitle"
            placeholder="Judul SEO (secara default menggunakan judul artikel)"
            maxLength={100}
            {...register("metaTitle")}
          />
          <div className="flex justify-between">
            {errors.metaTitle ? (
              <p className="text-xs text-destructive">
                {errors.metaTitle.message}
              </p>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {watch("metaTitle")?.length ?? 0}/100
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="metaDescription">Deskripsi Meta</Label>
          <Textarea
            id="metaDescription"
            placeholder="Deskripsi SEO (secara default berupa cuplikan)"
            maxLength={200}
            rows={2}
            {...register("metaDescription")}
          />
          <div className="flex justify-between">
            {errors.metaDescription ? (
              <p className="text-xs text-destructive">
                {errors.metaDescription.message}
              </p>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {watch("metaDescription")?.length ?? 0}/200
            </p>
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex gap-3 justify-end pb-8">
        <Button
          type="submit"
          variant="outline"
          disabled={!canSubmit}
          onClick={() => setSubmitStatus("DRAFT")}
        >
          <Save className="w-4 h-4 " />
          {isSubmitting && submitStatus === "DRAFT"
            ? "Menyimpan..."
            : "Simpan sebagai Draft"}
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          onClick={() => setSubmitStatus("PENDING_REVIEW")}
        >
          <Send className="w-4 h-4 " />
          {isSubmitting && submitStatus === "PENDING_REVIEW"
            ? "Kirim..."
            : "Kirim untuk Review"}
        </Button>
      </div>
    </form>
  );
}
