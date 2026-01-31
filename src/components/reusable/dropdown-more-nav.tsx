import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

type MoreCategoryItem = {
  id: string | number;
  name: string;
  icon: string | null;

};

type NavbarProps = {
  MoreCategory: MoreCategoryItem[];
};

export default function DropdownNav({ MoreCategory }: NavbarProps) {
  const [dropdownopen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  return (
    <DropdownMenu open={dropdownopen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger className="border-border-none outline-none ring-0 focus:ring-0 focus:outline-none active:outline-none cursor-pointer">
        <div className="flex items-center px-3 py-2  text-md font-semibold dark:text-white text-white">
          <p>Lainnya</p>
          <Icon
            icon={"ic:baseline-expand-more"}
            className={`mt-2 transform duration-200 ${
              dropdownopen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white dark:bg-[#222] dark:text-white min-w-[150px] z-[9999] absolute ">
        <ScrollArea className="h-50">
        {MoreCategory.map((item) => (
          <DropdownMenuItem key={item.id} asChild>
            <Link
              href={`/category/${item.name}`}
              className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                pathname === `/category/${item.name}`
                  ? "bg-gray-900 text-white dark:bg-gray-400 dark:text-black"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <Icon icon={item.icon || "mdi:folder"} className="inline-block mr-2 dark:text-white"/>
              <p> {item.name}</p>
            </Link>
          </DropdownMenuItem>
        ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
