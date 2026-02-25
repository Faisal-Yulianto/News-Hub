"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import ChangeName from "@/components/profile/edit-name";
import EditAvatar from "./edit-avatar";
import { useUserProfile } from "@/hooks/use-user-profile";

type FieldProps = {
  icon: string;
  label: string;
  value: string;
};

function ProfileField({ icon, label, value }: FieldProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 justify-center lg:justify-start">
        <Icon icon={icon} width={25} height={25} />
        <h2 className="font-extrabold text-xl">{label}</h2>
      </div>
      <p className="mt-2 p-2 bg-gradient-to-r from-white to-gray-900 dark:bg-[linear-gradient(90deg,#000000_0%,#434343_100%)] rounded-md dar:text-black text-center lg:text-left">
        {value}
      </p>
    </div>
  );
}

export function AvatarUser() {
  const { data: user } = useUserProfile();
  return (
    <section className="bg-white/50 dark:bg-black/50 shadow-lg shadow-black rounded-md p-6 w-[95%] mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8">
      <div className="relative w-[230px] h-[230px] shrink-0">
        <div className="relative w-full h-full rounded-full overflow-hidden ring-5 dark:ring-white">
          <Image
            src={user?.avatar || "/newshub.png"}
            alt="User profile photo"
            fill
            sizes="230px"
            className="object-cover"
            priority
          />
        </div>
        <EditAvatar />
      </div>
      <div className="flex-1 space-y-6 text-center lg:text-left">
        <div className="flex items-center relative">
          <ProfileField
            icon="icon-park-solid:edit-name"
            label="Nama"
            value={user?.name || "Faisal Yulianto"}
          />
          <ChangeName />
        </div>
        <ProfileField
          icon="ic:baseline-email"
          label="E-Mail"
          value={user?.email || "faisalyulianto@gmail.com"}
        />
      </div>
    </section>
  );
}
