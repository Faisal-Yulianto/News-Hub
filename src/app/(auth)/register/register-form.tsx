"use client";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RegisterInput, RegisterSchema } from "@/lib/validation/auth-Validation";
import registerAction from "@/app/action/register-action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
  });
  async function onSubmit(data: RegisterInput) {
    setloading(true);
    const formdata = new FormData();
    formdata.append("name", data.name);
    formdata.append("email", data.email);
    formdata.append("password", data.password);
    formdata.append("confirmPassword", data.confirmPassword);
    const res = await registerAction(formdata);
    if (!res.ok) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      reset();
      router.push("/login");
    }
    setloading(false);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative">
        <span>
          <Image
            src="/user.svg"
            alt="user"
            width={30}
            height={30}
            className="absolute inset-y-2.5 left-3"
          />
        </span>
        <input
          type="input"
          placeholder="Masukkan nama anda"
          className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full p-5"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1 text-center">
            {errors.name.message}
          </p>
        )}
      </div>
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
          placeholder="Masukkan e-mail anda"
          {...register("email")}
          className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full p-5"
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
          {...register("password")}
          className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full p-5"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1 text-center">
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="relative">
        <span>
          <Image
            src="/confirm.svg"
            alt="confirm"
            width={30}
            height={30}
            className="absolute inset-y-2.5 left-3"
          />
        </span>
        <input
          type="password"
          {...register("confirmPassword")}
          placeholder="Konfirmasi password anda"
          className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full p-5"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1 text-center">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="rounded-full bg-black/90 text-[16px] h-12 text-white font-bold w-full text-center hover:bg-white hover:text-black transition duration-300"
      >
        Register {loading && <Spinner className="inline-block ml-2" />}
      </button>
      <div className="flex w-full text-center items-center gap-2 justify-center">
        <p className="text-white text-sm font-bold">Sudah punya akun?</p>
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
