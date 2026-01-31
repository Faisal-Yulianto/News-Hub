"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordInput, ResetPasswordSchema } from "@/lib/validation/auth-Validation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParams } from "next/navigation";
import resetPasswordAction from "@/app/action/reset-password-action";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onChange",
  });
  async function onSubmit(data: ResetPasswordInput) {
    const formdata = new FormData();
    formdata.append("password", data.password);
    formdata.append("confirmPassword", data.confirmPassword);
    formdata.append("token", token);
    const res = await resetPasswordAction(formdata);
    if (!res.ok) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      reset();
      router.push("/login");
    }
  }
  return (
    <form className="flex flex-col gap-4 pb-10" onSubmit={handleSubmit(onSubmit)}>
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
          type="Password"
          {...register("password")}
          placeholder="Masukkan kata sandi baru "
          className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full pr-5"
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
              alt="password"
              width={30}
              height={30}
              className="absolute inset-y-2.5 left-3"
            />
          </span>
          <input
            type="Password"
            {...register("confirmPassword")}
            placeholder="Konfirmasi kata sandi baru "
            className="pl-12 rounded-full border bg-white/40 text-[16px] h-12 text-white hover:text-black  w-full pr-5"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 text-center">
              {errors.confirmPassword.message}
            </p>
          )}
      </div>
      <button
        type="submit"
        className="rounded-full bg-white/90 text-[16px] h-12 text-black font-bold w-full text-center hover:bg-black hover:text-white transition duration-300"
      >
        Reset password
        {isSubmitting ? <Spinner className="inline-block ml-2"/> : null }
      </button>
    </form>
  );
}