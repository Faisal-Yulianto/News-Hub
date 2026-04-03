import AdminArticlesPage from "@/components/admin/news-management";
import { Suspense } from "react";

export default function AdminNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      }
    >
      <AdminArticlesPage />
    </Suspense>
  );
}
