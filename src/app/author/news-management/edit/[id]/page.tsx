"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
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
import { TiptapEditor } from "@/components/author/tiptap-editor";
import { ThumbnailUpload } from "@/components/author/upload-thumbnail";
import { ContentImageUpload } from "@/components/author/content-image";
import {
  createNewsSchema,
  CreateNewsFormValues,
  ContentImageValue,
} from "@/lib/validation/add-news-validation";
import { useCategories } from "@/hooks/author/use-fetch-category";
import { useUpdateNews } from "@/app/service/author/update-news";
import { useNewsManagementDetail } from "@/hooks/author/use-detail-news";
import { useUploadThumbnail } from "@/app/service/author/create-thumbnail";
import { useUploadContentImages } from "@/app/service/author/create-content-images";

export default function EditDraftPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: news,
    isLoading: newsLoading,
    isError,
  } = useNewsManagementDetail(id);
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const [thumbnail, setThumbnail] = useState<{
    url: string;
    hash: string;
  } | null>(null);
  const [contentImages, setContentImages] = useState<ContentImageValue[]>([]);
  const [submitStatus, setSubmitStatus] = useState<
    "DRAFT" | "PENDING_REVIEW" | null
  >(null);
  const [initialized, setInitialized] = useState(false);

  const uploadThumbnail = useUploadThumbnail();
  const uploadContentImages = useUploadContentImages();

  const updateNews = useUpdateNews(id, () => {
    router.push("/author/news-management");
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateNewsFormValues>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: {
      isBreaking: false,
      contentImages: [],
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (news && !initialized) {
      reset({
        title: news.title,
        excerpt: news.excerpt,
        content: news.content,
        categoryId: news.category.id,
        thumbnailUrl: news.thumbnailUrl,
        thumbnailHash: news.thumbnailHash,
        source: news.source,
        isBreaking: news.isBreaking,
        metaTitle: news.metaTitle ?? "",
        metaDescription: news.metaDescription ?? "",
        contentImages: news.contentImages.map((img) => ({
          url: img.url,
          hash: img.imageHash ?? "",
          caption: img.caption ?? "",
        })),
        status: "DRAFT",
      });
      setThumbnail({ url: news.thumbnailUrl, hash: news.thumbnailHash });
      setContentImages(
        news.contentImages.map((img) => ({
          url: img.url,
          hash: img.imageHash ?? "",
          caption: img.caption ?? "",
        })),
      );
      setInitialized(true);
    }
  }, [news, initialized, reset]);

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
    updateNews.mutate({ ...data, status: submitStatus ?? "DRAFT" });
  };

  const isSubmitting = updateNews.isPending;
  const canSubmit = !!thumbnail && !isSubmitting;
  const isLoading = newsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !news) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Icon
          icon="solar:danger-triangle-linear"
          className="h-10 w-10 text-destructive"
        />
        <p className="text-sm text-destructive">Berita tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  if (news.status !== "DRAFT") {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Icon
          icon="solar:lock-linear"
          className="h-10 w-10 text-muted-foreground"
        />
        <p className="text-sm text-muted-foreground">
          Hanya berita berstatus Draft yang dapat diedit
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/author/news-management")}
        >
          Kembali ke Manajemen Berita
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/author/news-management")}
          className="-ml-2"
        >
          <Icon icon="solar:arrow-left-linear" className="mr-1 h-4 w-4" />
          Kembali
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Draft</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lanjutkan menulis dan submit artikel untuk direview.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {!thumbnail && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload thumbnail sebelum menyimpan atau mengirim artikel.
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="title">
            Judul <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Judul berita"
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
            Kategori <span className="text-destructive">*</span>
          </Label>
          <Select
            onValueChange={(val) => setValue("categoryId", val)}
            defaultValue={news.category.id}
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
          <Label>Gambar Konten</Label>
          <p className="text-xs text-muted-foreground">
            Maksimal 3 gambar ilustrasi yang ditampilkan di atas konten artikel.
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
              <p className="text-xs text-destructive">
                {errors.excerpt.message}
              </p>
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
            placeholder="Tulis konten berita di sini..."
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
              Tandai sebagai breaking news
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
              Opsional — membantu mesin pencari memahami artikel kamu.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              placeholder="SEO title"
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
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              placeholder="SEO description"
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
              ? "Mengirim..."
              : "Kirim untuk Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
