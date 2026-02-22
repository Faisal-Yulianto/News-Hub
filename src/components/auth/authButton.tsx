"use client";
import Image from "next/image";
import { useState } from "react";
import { signIn,signOut } from "next-auth/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export function AuthButton() {
  const [loading, setloading] = useState(false);
    return (
    <button
      type="submit"
      className="rounded-full bg-black/90 text-[16px] h-12 text-white font-bold w-full text-center hover:bg-white/90 hover:text-black transition duration-300 "
        onClick={() => {
            setloading(true);
            signIn("google", { callbackUrl: "/" })
            .catch(() => {
                toast.error("Gagal masuk dengan Google");
                setloading(false);
            });
        }}
    >
      <Image
        src="/google-icon.svg"
        alt="google"
        width={25}  
        height={25}
        className="inline mr-2"
      />    
        Masuk dengan Google {loading && <Spinner className="inline-block ml-2"/>}
    </button>
  );
}

export function Logout() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })}><p className="text-[18px] font-semibold px-3 cursor-pointer ">Sign Out</p></button>
  )
}