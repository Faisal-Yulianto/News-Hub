"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  slug: string;
}

export default function ShareButton({ title, slug }: ShareButtonProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
  }, []);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/news/${slug}`
      : "";

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: title,
        url,
      });
    } catch (err) {
      console.error("Share cancelled", err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link berhasil disalin");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const shareToWhatsApp = () => {
    const encoded = encodeURIComponent(url);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      "_blank",
    );
  };

  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="flex items-center gap-x-2">
        <Icon icon="mage:share" width={22}/>
        Bagikan :
      </div>
      {canShare && (
        <button
          onClick={handleNativeShare}
          className="p-1 rounded bg-black text-white dark:bg-white dark:text-black"
        >
          <Icon icon="mdi:share-variant" width={22} />
        </button>
      )}

      <button
        onClick={handleCopy}
        className="p-1 rounded bg-gray-200 dark:bg-gray-800"
      >
        <Icon icon="mdi:content-copy" width={22} />
      </button>

      <button
        onClick={shareToWhatsApp}
        className="p-1 rounded bg-green-500 text-white"
      >
        <Icon icon="mdi:whatsapp" width={22} />
      </button>

      <button
        onClick={shareToTwitter}
        className="p-1 rounded bg-blue-500 text-white"
      >
        <Icon icon="mdi:twitter" width={22} />
      </button>
    </div>
  );
}
