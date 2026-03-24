import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FolderOpen, ShieldAlert } from "lucide-react";
import { Category } from"@/app/service/author/create-category";

interface CategoryCardProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          {category.icon ? (
            <Icon icon={category.icon} className="w-6 h-6 text-foreground" />
          ) : (
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {category.newsCount} Berita
        </Badge>
      </div>
      <div>
        <h3 className="font-semibold text-base leading-tight">{category.name}</h3>
        {category.slug && (
          <p className="text-xs text-muted-foreground mt-0.5">/{category.slug}</p>
        )}
      </div>
      {category.isOwner ? (
        <div className="flex gap-2 mt-auto pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(category)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t">
          <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Dibuat oleh author lain</p>
        </div>
      )}
    </div>
  );
}