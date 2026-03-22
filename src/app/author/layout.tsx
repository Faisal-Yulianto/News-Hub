import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/header/sidebar";

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3">
          <SidebarTrigger />
        </div>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
