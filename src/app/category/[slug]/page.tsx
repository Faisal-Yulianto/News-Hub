import CategoryNews from "@/components/news/category-news";
import Footer from "@/components/reusable/footer";

type PageProps = {
  params: { slug: string };
  searchParams: {
    page?: string;
    sort?: string;
    timeRange?: string;
    limit?: string;
  };
};

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const category = params.slug;
  const page = Number(searchParams.page ?? 1);
  const sort = searchParams.sort ?? "newest";
  const timeRange = searchParams.timeRange ?? "all";
  const limit = Number(searchParams.limit ?? 10);

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/all-news?category=${category}&page=${page}&limit=${limit}&sort=${sort}&timeRange=${timeRange}`,
    { next: { revalidate: 60 } }
  );

  const data = await res.json();

  return (
    <>
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
      <div className="w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
        <CategoryNews
          category={category}
          page={page}
          sort={sort}
          timeRange={timeRange}
          initialData={data}
        />
      </div>
    </main>
    <Footer/>
    </>
  );
}
