import SearchNews from "@/components/news/search-news";
import { getAllCategory } from "../action/category-action";
import Footer from "@/components/reusable/footer";

type PageProps = {
  searchParams: {
    page?: string;
    sort?: string;
    timeRange?: string;
    limit?: string;
    category?: string;
    q?: string;
  };
};

export type DropdownOption = {
  value: string;
  label: string;
  icon?: string;
};


export default async function SearchPage({ searchParams }: PageProps) {
  const categoryFilter = await getAllCategory();
   const categoryOptions: DropdownOption[] = [
    ...categoryFilter.map((c) => ({
      value: c.slug ?? "",      
      label: c.name,     
      icon: c.icon ?? "mdi:tag",
    })),
  ];

  const page = Number(searchParams.page ?? 1);
  const sort = searchParams.sort ?? "newest";
  const category = searchParams.category ?? "";
  const query = searchParams.q ?? "";
  const timeRange = searchParams.timeRange ?? "all";

  return (
    <>
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
      <div className="w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
        <SearchNews
          page={page}
          sort={sort}
          timeRange={timeRange}
          query={query}
          category={category}
          categoryOptions={categoryOptions}
        />
      </div>
    </main>
    <Footer/>
    </>
  );
}
