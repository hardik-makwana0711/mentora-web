import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, ClipboardList, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useStrings } from '@/constants/strings';
import { profileService } from '@/services/profile.service';
import { materialsService, type MaterialType } from '@/services/materials.service';
import { MaterialCard } from '@/features/materials/components/MaterialCard';
import { MaterialTabs } from '@/features/materials/components/MaterialTabs';
import { StudentFilterSelect } from '@/features/lessons/components/StudentFilterSelect';
import { useAuthStore } from '@/app/store/authStore';
import { qk } from '@/constants/query-keys';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

type TabValue = 'all' | MaterialType;

export default function ParentMaterialsPage() {
  const tr = useStrings();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const [searchParams] = useSearchParams();
  const focusMaterialId = searchParams.get('materialId');
  const studentIdFromUrl = searchParams.get('studentId');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(studentIdFromUrl);
  const [tab, setTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');

  const profileQ = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : ['profile', 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(user?.id),
  });

  const linkedStudents = useMemo(
    () => profileQ.data?.parent_profile?.linked_students ?? [],
    [profileQ.data]
  );
  const effectiveStudentId = selectedStudentId ?? linkedStudents[0]?.id ?? null;
  const selectedStudent = linkedStudents.find((s) => s.id === effectiveStudentId);

  useEffect(() => {
    if (!studentIdFromUrl) return;
    if (linkedStudents.some((s) => s.id === studentIdFromUrl)) {
      setSelectedStudentId(studentIdFromUrl);
    }
  }, [studentIdFromUrl, linkedStudents]);

  // Fetch the full list once per student; tab + search filter client-side so counts stay accurate.
  const materialsQ = useQuery({
    queryKey: qk.parentMaterials(effectiveStudentId ?? 'none', 'all'),
    queryFn: () => materialsService.getParentMaterials(effectiveStudentId!),
    enabled: Boolean(effectiveStudentId),
  });

  const allMaterials = useMemo(() => materialsQ.data ?? [], [materialsQ.data]);

  const counts = useMemo(() => {
    const assignment = allMaterials.filter((m) => m.type === 'assignment').length;
    const resource = allMaterials.filter((m) => m.type === 'course_resource').length;
    const submitted = allMaterials.filter((m) => {
      if (m.type !== 'assignment') return false;
      const status = m.submissionStatus ?? m.submission?.status ?? 'not_submitted';
      return status !== 'not_submitted';
    }).length;
    return {
      all: allMaterials.length,
      assignment,
      course_resource: resource,
      submitted,
      notSubmitted: assignment - submitted,
    };
  }, [allMaterials]);

  const filtered = useMemo(() => {
    let rows = allMaterials;
    if (tab !== 'all') rows = rows.filter((m) => m.type === tab);
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((m) => m.title.toLowerCase().includes(q));
    return rows;
  }, [allMaterials, tab, search]);

  useEffect(() => {
    if (!focusMaterialId || linkedStudents.length === 0) return;

    const inCurrentList = materialsQ.data?.some((m) => m.id === focusMaterialId);
    if (inCurrentList && effectiveStudentId) {
      navigate(`${roleBase}/materials/${effectiveStudentId}/${focusMaterialId}`, { replace: true });
      return;
    }

    let cancelled = false;
    const resolveMaterial = async () => {
      for (const student of linkedStudents) {
        try {
          const list = await materialsService.getParentMaterials(student.id);
          if (cancelled) return;
          if (list.some((m) => m.id === focusMaterialId)) {
            navigate(`${roleBase}/materials/${student.id}/${focusMaterialId}`, { replace: true });
            return;
          }
        } catch {
          // try next linked student
        }
      }
    };

    void resolveMaterial();
    return () => {
      cancelled = true;
    };
  }, [focusMaterialId, linkedStudents, materialsQ.data, effectiveStudentId, navigate, roleBase]);

  if (profileQ.isPending) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  const statCards = [
    {
      key: 'assignments',
      label: tr.materialStatAssignmentsParent,
      value: counts.assignment,
      icon: ClipboardList,
    },
    {
      key: 'resources',
      label: tr.materialStatResourcesParent,
      value: counts.course_resource,
      icon: BookOpen,
    },
    {
      key: 'submitted',
      label: tr.materialStatSubmitted,
      value: counts.submitted,
      icon: CheckCircle2,
    },
    {
      key: 'notSubmitted',
      label: tr.materialStatNotSubmitted,
      value: Math.max(counts.notSubmitted, 0),
      icon: Inbox,
    },
  ];

  return (
    <div>
      <PageHeader title={tr.materialsParentTitle} description={tr.materialsParentDescription} />

      {linkedStudents.length === 0 ? (
        <EmptyState title={tr.linkedStudentNotFound} description={tr.materialsParentNoStudentDescription} />
      ) : (
        <>
          {linkedStudents.length > 1 ? (
            <div className="mb-4 max-w-sm">
              <StudentFilterSelect
                allowAll={false}
                value={effectiveStudentId ?? ''}
                onChange={(id) => setSelectedStudentId(id || null)}
                students={linkedStudents.map((s) => ({
                  student_id: s.id,
                  student_name: s.name,
                  grade_level: s.grade_level ?? null,
                }))}
              />
            </div>
          ) : null}

          {selectedStudent ? (
            <p className="mb-4 text-sm text-[var(--color-m-text-muted)]">
              {tr.materialShowingForChild.replace('{{name}}', selectedStudent.name)}
            </p>
          ) : null}

          {materialsQ.isSuccess ? (
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 ring-1 ring-[var(--color-m-ring-subtle)]"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-m-primary)]/12 text-[var(--color-m-primary-light)]">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[var(--color-m-text-muted)]">
                        {card.label}
                      </p>
                      <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--color-m-text)]">
                        {card.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="mb-4 max-w-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr.materialSearchPlaceholder}
            />
          </div>

          <MaterialTabs
            value={tab}
            onChange={setTab}
            labels={{
              all: tr.materialTabAllCount.replace('{{count}}', String(counts.all)),
              assignment: tr.materialTabAssignmentsCount.replace(
                '{{count}}',
                String(counts.assignment)
              ),
              course_resource: tr.materialTabResourcesCount.replace(
                '{{count}}',
                String(counts.course_resource)
              ),
            }}
          />

          {materialsQ.isPending ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
            </div>
          ) : materialsQ.isError ? (
            <ErrorState title={tr.materialsLoadError} onRetry={() => void materialsQ.refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState title={tr.materialsEmptyTitle} description={tr.materialsEmptyParentDescription} />
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {filtered.map((m) => (
                <MaterialCard
                  key={m.id}
                  material={{ ...m, childName: selectedStudent?.name }}
                  role="parent"
                  studentId={effectiveStudentId ?? undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
