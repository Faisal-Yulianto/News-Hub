import { useQuery } from "@tanstack/react-query";

export interface UserProfile {
  name: string;
  avatar: string;
  email: string;
}

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      const json = await res.json();

      if (!res.ok) {
        throw { message: json.message, status: res.status };
      }

      return json.user;
    },
  });
}