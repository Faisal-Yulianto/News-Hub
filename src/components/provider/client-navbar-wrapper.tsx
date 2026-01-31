"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header/Header";

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

type Props = {
  category: CategoryItem[];
  MoreCategory: MoreCategoryItem[];
};
export default function ClientNavbarWrapper({ category, MoreCategory }: Props) {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (hideNavbar) return null;

  return <Header category={category} MoreCategory={MoreCategory} />;
}
