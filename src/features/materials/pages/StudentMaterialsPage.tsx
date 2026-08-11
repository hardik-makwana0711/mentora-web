import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { materialsService, type MaterialType } from '@/services/materials.service';
import { MaterialCard } from '@/features/materials/components/MaterialCard';
import { MaterialTabs } from '@/features/materials/components/MaterialTabs';

type TabValue = 'all' | MaterialType;

export default function StudentMaterialsPage() {
  const tr = useStrings();
  const [tab, setTab] = useState<TabValue>('all');

  const filters = tab === 'all' ? {} : { type: tab };

  const materialsQ = useQuery({
    queryKey: qk.studentMaterials(tab),
    queryFn: () => materialsService.getStudentMaterials(filters),
  });

  const materials = materialsQ.data ?? [];

  return (
    <div>
      <PageHeader title={tr.materialsStudentTitle} description={tr.materialsStudentDescription} />

      <MaterialTabs
        value={tab}
        onChange={setTab}
        labels={{
          all: tr.materialTabAll,
          assignment: tr.materialTabAssignments,
          course_resource: tr.materialTabResources,
        }}
      />

      {materialsQ.isPending ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : materialsQ.isError ? (
        <ErrorState title={tr.materialsLoadError} onRetry={() => void materialsQ.refetch()} />
      ) : materials.length === 0 ? (
        <EmptyState title={tr.materialsEmptyTitle} description={tr.materialsEmptyStudentDescription} />
      ) : (
        <div className="space-y-3">
          {materials.map((m) => (
            <MaterialCard key={m.id} material={m} role="student" />
          ))}
        </div>
      )}
    </div>
  );
}
