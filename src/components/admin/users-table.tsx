"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import { AdminUser } from "@/hooks/admin/use-admin-users";
import { useUpdateUserRole } from "@/app/service/admin/update-users-role";
import { toast } from "sonner";

const ROLE_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  READER: { label: "Reader", variant: "secondary" },
  AUTHOR: { label: "Author", variant: "default" },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function UserRow({ user }: { user: AdminUser }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const targetRole = user.role === "READER" ? "AUTHOR" : "READER";
  const targetLabel = targetRole === "AUTHOR" ? "Author" : "Reader";

  const { mutate: updateRole, isPending } = useUpdateUserRole(user.id, {
    onSuccess: () => {
      toast.success(`Role berhasil diubah ke ${targetLabel}`);
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Gagal mengubah role user");
    },
  });

  return (
    <>
      <TableRow>
        <TableCell className="flex justify-start items-center">
          <div className=" flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar ?? ""} />
              <AvatarFallback className="text-xs">
                {user.name?.slice(0, 2).toUpperCase() ?? "US"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name ?? "—"}</span>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {user.email ?? "—"}
        </TableCell>
        <TableCell>
          <Badge variant={ROLE_MAP[user.role]?.variant ?? "outline"}>
            {ROLE_MAP[user.role]?.label ?? user.role}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {formatDate(user.createdAt)}
        </TableCell>
        <TableCell className="text-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            <Icon icon="solar:shield-user-linear" className="mr-1 h-4 w-4" />
            Ubah Role
          </Button>
        </TableCell>
      </TableRow>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role User</DialogTitle>
            <DialogDescription>
              Ubah role{" "}
              <span className="font-medium text-foreground">
                {user.name ?? user.email}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-foreground">
                {ROLE_MAP[user.role]?.label}
              </span>{" "}
              menjadi{" "}
              <span className="font-medium text-foreground">{targetLabel}</span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              onClick={() =>
                updateRole({ role: targetRole as "READER" | "AUTHOR" })
              }
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Ubah Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface UsersTableProps {
  data: AdminUser[];
  isLoading: boolean;
  isError: boolean;
}

export function UsersTable({ data, isLoading, isError }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {["User", "Email", "Role", "Bergabung", "Aksi"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border">
        <p className="text-sm text-destructive">Gagal memuat data user</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border">
        <Icon
          icon="solar:users-group-rounded-linear"
          className="h-8 w-8 text-muted-foreground"
        />
        <p className="text-sm text-muted-foreground">
          Tidak ada user ditemukan
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">User</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Role</TableHead>
            <TableHead className="text-center">Bergabung</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-center">
          {data.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
