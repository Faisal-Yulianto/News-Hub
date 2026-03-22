"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";
import { UsersTable } from "@/components/admin/users-table";
import { UsersFilter } from "@/components/admin/users-filter";
import { UsersSearch } from "@/components/admin/users-search";
import { Button } from "@/components/ui/button";

export const ROLE_FILTERS = [
  { label: "Semua", value: "ALL" },
  { label: "Reader", value: "READER" },
  { label: "Author", value: "AUTHOR" },
];

export default function AdminUsersPage() {
  const [role, setRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminUsers({ role, search, page });

  const handleRoleChange = useCallback((value: string) => {
    setRole(value);
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icon
          icon="solar:users-group-rounded-bold"
          className="text-primary h-7 w-7"
        />
        <h1 className="text-2xl font-bold">Manajemen User</h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <UsersFilter active={role} onChange={handleRoleChange} />
        <UsersSearch onSearch={handleSearch} />
      </div>
      <UsersTable
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
      />
      {data && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Menampilkan{" "}
            <span className="text-foreground font-medium">
              {(page - 1) * data.pagination.limit + 1}–
              {Math.min(page * data.pagination.limit, data.pagination.total)}
            </span>{" "}
            dari{" "}
            <span className="text-foreground font-medium">
              {data.pagination.total}
            </span>{" "}
            user
          </p>
          {!isLoading && data && data.pagination.totalPages > 0 && (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan{" "}
                <span className="font-medium text-foreground">
                  {(page - 1) * data.pagination.limit + 1}–
                  {Math.min(
                    page * data.pagination.limit,
                    data.pagination.total,
                  )}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-foreground">
                  {data.pagination.total}
                </span>{" "}
                berita
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
                </Button>
                {Array.from({ length: data.pagination.totalPages }).map(
                  (_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === data.pagination.totalPages}
                >
                  <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
