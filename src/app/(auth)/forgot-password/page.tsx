import Image from "next/image";
import ForgotPasswordForm from "../forgot-password/forgot-password-form";

export default function ForgotPassword() {
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
          Ups! Lupa kata sandi? 
        </h1>
        <p className="text-white text-center text-[16px] w-2/3 mt-2 ">
          Jangan khawatir! Masukkan alamat email Anda, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda
        </p>
        <div className="mt-10 w-sm pb-3">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
