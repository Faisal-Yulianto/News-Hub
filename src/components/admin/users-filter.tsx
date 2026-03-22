import { Button } from "@/components/ui/button";
import { ROLE_FILTERS } from "@/app/admin/users/page";

interface UsersFilterProps {
  active: string;
  onChange: (value: string) => void;
}

export function UsersFilter({ active, onChange }: UsersFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ROLE_FILTERS.map((filter) => (
        <Button
          key={filter.value}
          variant={active === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}