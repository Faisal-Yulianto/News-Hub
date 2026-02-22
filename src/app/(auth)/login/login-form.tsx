"use client";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, LoginSchema } from "@/lib/validation/auth-Validation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { AuthButton } from "@/components/auth/authButton";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });
  async function onSubmit(data: LoginInput) {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: "/",
    });
    if (res?.error) {
      toast.error(res.error);
    }
    if (res?.ok) {
      toast.success("Login berhasil");
      reset();
      window.location.href = res.url || "/";
    }
  }
  return (
    <div>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
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
            <p className="text-red-500 text-sm mt-1 text-center">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="relative">
          <span>
            <Image
              src="/password-icon.svg"
              alt="password"
              width={30}
              height={30}
              className="absolute inset-y-2.5 left-3"
            />
          </span>
          <input
            type="password"
            placeholder="Masukkan password anda"
            className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full p-5"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 text-center">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Checkbox
              id="remember"
              className="mr-2 w-[20px] h-[20px]  bg-white/50 ml-2"
            />
            <label htmlFor="remember" className="text-white text-sm">
              Ingat saya
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-white text-sm mr-2 hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <button
          type="submit"
          className="rounded-full bg-white/90 text-[16px] h-12 text-black font-bold w-full text-center hover:bg-black hover:text-white transition duration-300"
        >
          Login
          {isSubmitting ? <Spinner className="inline-block ml-2" /> : null}
        </button>
        <div className="flex w-full text-center items-center">
          <div className="bg-white h-px w-1/2 mr-2 "></div>
          <h2 className="text-white text-[16px]">atau</h2>
          <div className="bg-white h-px w-1/2 ml-2 "></div>
        </div>
      </form>
      <div className="flex flex-col gap-4 mt-4">
        <AuthButton />
        <div className="flex w-full text-center items-center gap-2 justify-center">
        <p className="text-white text-sm font-bold">Belum punya akun?</p>
        <Link
          href="/register"
          className="text-white text-sm mr-2 hover:underline text-center font-bold"
        >
          Daftar di sini
        </Link>
      </div>
      </div>
    </div>
  );
}
