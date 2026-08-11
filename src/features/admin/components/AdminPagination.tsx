import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import type { AdminPagination } from '@/types/admin';

export function AdminPagination({
  pagination,
  onPageChange,
}: {
  pagination: AdminPagination;
  onPageChange: (page: number) => void;
}) {
  const tr = useStrings();
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
      <span>
        {tr.adminPageOf.replace('{{page}}', String(pagination.page)).replace('{{total}}', String(totalPages))}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          {tr.adminPrevPage}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pagination.page >= totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          {tr.adminNextPage}
        </Button>
      </div>
    </div>
  );
}
