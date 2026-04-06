import Image from "next/image";
import ResetPasswordForm from "../reset-password/reset-password-form";

export default function ResetPassword() {
  return (
    <div className="font-popins flex min-h-screen p-4 sm:p-8 md:p-12 lg:p-20 relative">
      <Image
        src="/BgGedung.webp"
        alt="Gedung"
        className="relative object-cover object-center"
        fill
        priority
      />
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-black/52 relative p-6 sm:p-10 m-auto rounded-xl text-2xl flex flex-col items-center">
        <Image
          src="/newshub2.png"
          alt="logo"
          width={150}
          height={50}
          className="mt-[-10px] w-auto h-auto"
        />
        <h1 className="text-white font-bold text-center text-xl sm:text-2xl mt-2">
          Atur ulang kata sandi Anda
        </h1>
        <p className="text-white text-center text-sm sm:text-[16px] w-11/12 sm:w-2/3 mt-2">
          Masukkan kata sandi baru untuk akun Anda. Pastikan kata sandi mudah
          diingat namun sulit ditebak oleh orang lain.
        </p>
        <div className="mt-6 sm:mt-10 w-full sm:w-sm pb-3">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}