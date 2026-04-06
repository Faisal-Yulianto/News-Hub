import Image from "next/image";
import LoginForm from "../login/login-form";

export default function Login() {
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
        <h1 className="text-white font-bold text-center text-2xl">
          Selamat datang di
        </h1>
        <Image src="/newshub2.png" alt="logo" width={150} height={50} />
        <p className="text-white text-center text-[16px] w-11/12 sm:w-2/3 mt-2">
          Login untuk mengakses berita terbaru,trending dan mendalam hanya di
          NewsHub
        </p>
        <div className="mt-6 sm:mt-10 w-full sm:w-sm pb-3">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
