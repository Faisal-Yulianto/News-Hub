"use client";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema,ForgotPasswordInput } from "@/lib/validation/auth-Validation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });
  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email : data.email}),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan tak terduga.");
      }
      toast.success(result.message);
      reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan tak terduga.");
      }
    }
  }
  return (
    <form className="flex flex-col gap-6 pb-10" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative">
        <span>
          <Image
            src="/email-black-icon.svg"
            alt="email"
            width={30}
            height={30}
            className="absolute inset-y-2.5 left-3"
          />
        </span>
        <input
          type="email"
          placeholder="Masukkan email anda"
          className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full "
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 text-center">{errors.email.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-full bg-white/90 text-[16px] h-12 text-black font-bold w-full text-center hover:bg-black hover:text-white transition duration-300"
      >
         Reset
        {isSubmitting ? <Spinner  className="inline-block ml-2"/> : null}
      </button>
       <div className="flex w-full text-center items-center gap-2 justify-center">
        <p className="text-white text-sm font-bold">Kembali ke halaman</p>
        <Link
          href="/login"
          className="text-white text-sm mr-2 hover:underline text-center font-bold"
        >
          Login
        </Link>
      </div>
    </form>
  );
}
