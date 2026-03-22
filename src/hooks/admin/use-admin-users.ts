import { useQuery } from "@tanstack/react-query";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseAdminUsersParams {
  role?: string;
  page?: number;
  search?: string;
}

export function useAdminUsers({
  role = "ALL",
  page = 1,
  search = "",
}: UseAdminUsersParams = {}) {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin-users", role, page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        role,
        page: page.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });
}