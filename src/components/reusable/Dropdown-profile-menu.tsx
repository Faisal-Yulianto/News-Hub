import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Logout } from "../auth/authButton";
import { useSession } from "next-auth/react";
import ThemeToggle from "./dark-mode";
import { Icon } from "@iconify/react";

export default function DropdownProfileMenu() {
  const { data: session } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-border-none outline-none ring-0 focus:ring-0 focus:outline-none active:outline-none mr-[-20] lg:mr-0">
        <div className="bg-black dark:bg-white rounded-full w-[42px] h-[42px] flex items-center justify-center cursor-pointer ">
          <Image
            src={session?.user.avatar || "/newshub.png"}
            alt="User Profile"
            width={35}
            height={35}
            className="bg-black rounded-full"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="lg:w-60 w-55  bg-gray-200/95 dark:bg-[linear-gradient(90deg,#000000_0%,#434343_100%)] shadow-md shadow-black/50 dark:text-white px-2 py-3 mt-1 mr-[-15px] z-70 "
      >
        <Link href={"/profile"}>
          <DropdownMenuItem className="cursor-pointer flex justify-end items-center py-1 dark:focus:text-white  ">
            <p className="text-[18px] font-semibold px-3">Profile</p>
            <div className="dark:bg-white bg-black rounded-full w-[42px] h-[42px] flex items-center justify-center cursor-pointer">
              <div
                className="bg-white
              dark:bg-black rounded-full w-[35px] h-[35px] items-center flex justify-center"
              >
                <Icon
                  icon="iconamoon:profile-fill"
                  width={50}
                  height={50}
                  className="dark:text-white text-black"
                />
              </div>
            </div>
          </DropdownMenuItem>
        </Link>
        <div className="border-t border-gray-700 my-3" />
        {session ? (
          <DropdownMenuItem className="cursor-pointer flex justify-end items-center py-1">
            <Logout />
            <div className="dark:bg-white bg-black rounded-full w-[42px] h-[42px] flex items-center justify-center cursor-pointer">
              <div
                className="bg-white
              dark:bg-black rounded-full w-[35px] h-[35px] items-center flex justify-center"
              >
                <Icon
                  icon="solar:logout-3-bold"
                  width={96}
                  height={96}
                  className="dark:text-white text-black"
                />
              </div>
            </div>
          </DropdownMenuItem>
        ) : (
          <Link href={"/login"}>
            <DropdownMenuItem className="cursor-pointer flex justify-end items-center py-1">
              <p className="text-[18px] font-semibold px-3">Sign In</p>
              <div className="dark:bg-white bg-black rounded-full w-[40px] h-[40px] flex items-center justify-center cursor-pointer">
                <div className="bg-white
              dark:bg-black rounded-full w-[35px] h-[35px] items-center flex justify-center"
                >
                  <Icon
                    icon="solar:login-3-bold"
                    width="96"
                    height="96"
                    className="dark:text-white text-black"
                  />
                </div>
              </div>
            </DropdownMenuItem>
          </Link>
        )}
        <div className="border-t border-gray-700 my-3" />
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer flex justify-end items-center gap-2 focus:bg-transparent"
        >
          <ThemeToggle />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
