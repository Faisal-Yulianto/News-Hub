import Image from "next/image";
import ResetPasswordForm from "../reset-password/reset-password-form";

export default function ResetPassword() {
  return (
    <div className="font-popins flex min-h-screen p-8 pb-20 gap-16 sm:p-20  relative">
      <Image
        src="/BgGedung.webp"
        alt="Gedung"
        className="relative object-cover object-center"
        fill
        priority
      />
      <div className="w-2xl bg-black/52  relative  m-auto rounded-xl text-2xl flex flex-col  items-center">
        <Image
          src="/newshub.png"
          alt="logo"
          width={200}
          height={50}
          className="mt-[-10px]"
        />
        <h1 className="text-white font-bold text-center text-2xl mt-[-55px]">
          Atur ulang kata sandi Anda
        </h1>
        <p className="text-white text-center text-[16px] w-2/3 mt-2 ">
          Masukkan kata sandi baru untuk akun Anda. Pastikan kata sandi mudah diingat namun sulit ditebak oleh orang lain.
        </p>
        <div className="mt-10 w-sm pb-3">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
