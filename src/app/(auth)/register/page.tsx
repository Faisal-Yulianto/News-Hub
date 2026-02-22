import Image from "next/image";
import RegisterForm from "../register/register-form";

export default function Login() {
  return (
    <div className="font-popins flex min-h-screen p-8 pb-20 gap-16 sm:p-20  relative">
      <Image
        src="/BgGedung.webp"
        alt="Gedung"
        className="relative object-cover object-center"
        fill
        priority
      />
      <div className="w-2xl bg-black/52  relative p-10 m-auto rounded-xl text-2xl flex flex-col  items-center">
        <h1 className="text-white font-bold text-center text-2xl">
          Ayo gabung di
        </h1>
        <Image
          src="/newshub.png"
          alt="logo"
          width={200}
          height={50}
          className="mt-[-50px]"
        />
        <p className="text-white text-center text-[16px] w-2/3 mt-[-40px] ">
          Dapatkan update berita tercepat dari seluruh dunia hanya di NewsHub
        </p>
        <div className="mt-10 w-sm pb-3">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
