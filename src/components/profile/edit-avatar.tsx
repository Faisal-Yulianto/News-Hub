import { Icon } from "@iconify/react";
import { useUpdateProfile } from "@/app/service/edit-profile";

export default function EditAvatar() {
    const { mutate } = useUpdateProfile();
  return (
    <div className="absolute bottom-4 right-4.5 translate-x-1/2 z-20">
      <label className="w-15 h-15 rounded-full ring-4 dark:bg-black bg-white flex items-center justify-center cursor-pointer ">
        <Icon
          icon="mdi:camera-plus"
          width={20}
          height={20}
          className="dark:text-white"
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
                const formData = new FormData();
                formData.append("avatar", file);
                mutate(formData);
            }
          }}
        />
      </label>
    </div>
  );
}
