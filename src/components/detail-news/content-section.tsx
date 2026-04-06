import { extractDomain } from "@/lib/extract-domain";
import { NewsDetail } from "./detail-hero-section";

interface contentSectionProps {
  data: NewsDetail;
}

export default function Content({ data }: contentSectionProps) {
  if (!data?.content) return null;

  const source = data.source ? extractDomain(data.source) : "";

  const contentWithSource = source
    ? data.content.replace(
        /<p[^>]*>(\s*[^<].*?)<\/p>/i,
        `<p><span class="font-medium">${source}</span> – $1</p>`,
      )
    : data.content;

  return (
    <article
      className="
      py-4 sm:py-6 
      px-3 sm:px-6 md:px-8 
      rounded-md shadow-md 
      max-w-4xl mx-auto
    "
    >
      <div
        className="
          prose prose-neutral dark:prose-invert 
          max-w-none
          prose-sm sm:prose-base lg:prose-lg
          prose-headings:font-semibold
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-lg prose-img:shadow-md
          prose-p:leading-relaxed
          prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-white
        "
        dangerouslySetInnerHTML={{ __html: contentWithSource }}
      />
    </article>
  );
}
