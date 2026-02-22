import { extractDomain } from "@/lib/extract-domain";
import { NewsDetail } from "./detail-hero-section";

interface contentSectionProps {
  data : NewsDetail;
}

export default function Content({data}:contentSectionProps) {

  if (!data?.content) return null;

  const source = data.source ? extractDomain(data.source) : "";

  const contentWithSource = source
    ? data.content.replace(
        /<p[^>]*>(\s*[^<].*?)<\/p>/i,
        `<p><span class="font-medium">${source}</span> – $1</p>`
      )
    : data.content;

  return (
    <article className=" p-10 rounded-md shadow-md">
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: `${contentWithSource}` }}
      />
    </article>
  );
}
