import Image from "next/image";
import DropdownProfileMenu from "@/components/reusable/Dropdown-profile-menu";
import Navbar from "./Navbar";
import Link from "next/link";

type CategoryItem = {
  id: string | number;
  name: string;
  icon: string | null;
};

type MoreCategoryItem = {
  id: string | number;
  name: string;
  icon: string | null;
};

type HeaderProps = {
  category: CategoryItem[];
  MoreCategory: MoreCategoryItem[];
};

export default function Header({ category, MoreCategory }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full  z-60">
      <div className="flex items-center justify-between h-[90px]  lg:h-[120px] w-full px-10 bg-gradient-to-r from-gray-900 to-white dark:bg-[linear-gradient(90deg,#000000_0%,#434343_100%)] text-white">
        <Link href={"/"}>
          <Image
            src={"/newshub.png"}
            alt="Logo"
            width={300}
            height={100}
            className="object-contain lg:ml-[-50px] ml-[-65px] "
            priority
          />
        </Link>
        <DropdownProfileMenu/>
      </div>
      <div className="h-0.5 bg-[#222222] dark:bg-amber-50" />
      <div className="h-10 md:h-15 dark:bg-[#222222] bg-gradient-to-r from-gray-300 to-gray-900/90 border-b-3 dark:border-black dark:bg-none">
        <Navbar category={category} MoreCategory={MoreCategory} />
      </div>
    </header>
  );
}
