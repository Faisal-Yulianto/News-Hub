import { CardContent } from "../reusable/card-content";
import { timeAgo } from "@/lib/time-helper";

interface relatedItem {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  excerpt: string;
  publishedAt: string;
  views: string;
  author: { name: string };
}

interface relatedNewsProps{
  data : relatedItem[];
}

export default function RelatedNews({data}:relatedNewsProps) {
  return (
    <section className="flex flex-row lg:flex-col w-max lg:w-full py-2">
      {Array.isArray(data) &&
        data?.map((item) => (
          <div key={item.id} className="w-[380px] lg:w-full flex-shrink-0 p-1">
            <CardContent
              image={item.thumbnailUrl}
              title={item.title}
              desc={item.excerpt}
              time={timeAgo(item.publishedAt)}
              writer={item.author.name}
              url={`/news/${item.slug}`}
            />
          </div>
        ))}
    </section>
  );
}
