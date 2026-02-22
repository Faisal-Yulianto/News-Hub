"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import DropdownNav from "@/components/reusable/dropdown-more-nav";
import SearchLink from "./search-link";

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

type NavbarProps = {
  category: CategoryItem[];
  MoreCategory: MoreCategoryItem[];
};

export default function Navbar({ category, MoreCategory }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      document.documentElement.classList.add("overflow-hidden");
      document.body.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }, [open]);

  return (
    <div>
      <nav className="hidden md:flex items-center px-5 py-2 justify-between">
        <div className="lg:gap-x-10 md:gap-x-5 flex  w-[80%]">
          <Link
            href="/"
            className={`px-3 py-2 text-md font-semibold transition ${
              pathname === "/"
                ? "text-black border-b-3 border-black dark:border-white dark:text-white"
                : "text-white hover:text-gray-500 dark:hover:text-gray-400"
            }`}
          >
            Home
          </Link>
          {category.map((item) => {
            const active = pathname === `/category/${item.name}`;
            return (
              <Link
                key={item.id}
                href={`/category/${item.name}`}
                className={`px-3 py-2  text-md font-semibold transition ${
                  active
                    ? " text-black border-b-3 border-black dark:border-white dark:text-white"
                    : "text-white hover:text-gray-500 dark:hover:text-gray-400"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <DropdownNav MoreCategory={MoreCategory} />
        </div>
        <div>
          <SearchLink />
        </div>
      </nav>
      <div className="md:hidden relative">
        <button
          ref={buttonRef}
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((s) => !s)}
          className="inline-flex items-center justify-center p-2"
        >
          {open ? <X className="w-10" /> : <Menu className="w-10" />}
        </button>

        <div
          id="mobile-menu"
          ref={menuRef}
          className={`
    md:hidden
    absolute top-12 left-0 w-full 
    ${open ? "z-[9999] pointer-events-auto" : "z-[-9999] pointer-events-none"}
  `}
        >
          <div
            className={`
      transform transition-all origin-top-right
      ${open ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}
    `}
          >
            <div className="px-4 py-6 space-y-1 bg-white/90 dark:bg-black/90 shadow-md mt-[-10]">
              <div>
                <SearchLink />
              </div>
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                  pathname === "/"
                    ? "bg-gray-900 text-white dark:bg-gray-200 dark:text-black"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Home
              </Link>
              {category.map((item) => {
                const active = pathname === `/category/${item.name}`;
                return (
                  <Link
                    key={item.id}
                    href={`/category/${item.name}`}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                      active
                        ? "bg-gray-900 text-white dark:bg-gray-200 dark:text-black"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="bg-gray-900 rounded-md">
                <DropdownNav MoreCategory={MoreCategory} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
