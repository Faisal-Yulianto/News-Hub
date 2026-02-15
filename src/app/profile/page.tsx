import { AvatarUser } from "@/components/profile/avatar-user";
import { Icon } from "@iconify/react";

export default function Profile() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
      <div className="lg:w-[65%] md:w-[85%] sm:w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
        <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg mb-4"> 
          <div className="flex items-center gap-1">
            <Icon icon="mingcute:profile-line" width="30" height="30" />
            <h2>Profile</h2>
          </div>
        </div>
        <AvatarUser />
      </div>
    </main>
  );
}
