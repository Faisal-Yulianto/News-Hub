import Image from "next/image";
import { Icon } from "@iconify/react";

export function AvatarUser() {
  return (
    <section className="bg-black/50 rounded-md p-5 w-[95%] mx-auto flex gap-x-10 items-start lg:flex-row sm:flex-col sm:items-center">
      <div className="relative w-[230px] h-[230px] flex-shrink-0 rounded-full overflow-hidden ring-5 ring-white lg:mx-5 sm:mx-auto md:m-3">
        <Image
          src="/BgGedung.webp"
          alt="User profile photo"
          fill
          sizes="230px"
          className="object-cover"
          priority
        />
      </div>
      <div className="w-[50%] sm:text-center lg:text-start">
        <div className="flex items-center mt-5 gap-x-2 sm:justify-center lg:justify-start
        ">
          <Icon icon="icon-park-solid:edit-name" width={25} height={25} />
          <h1 className="font-extrabold text-2xl">Nama</h1>
        </div>
        <h2 className="p-2 bg-white/40 my-2 w-full rounded-md text-gray-200">
          Faisal Yulianto
        </h2>
        <div className="flex items-center gap-x-2 sm:justify-center lg:justify-start">
          <Icon icon="ic:baseline-email" width={25} height={25} />
          <h1 className="font-extrabold text-2xl">E-Mail</h1>
        </div>
        <h2 className="p-2 bg-white/40 my-2 w-full rounded-md text-gray-200">
          FaisalYulianto26@gmail.com
        </h2>
      </div>
    </section>
  );
}
