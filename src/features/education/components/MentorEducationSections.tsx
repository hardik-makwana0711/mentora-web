import type { ReactNode } from 'react';
import { useStrings } from '@/constants/strings';
import {
  formatExamProficiencyList,
  formatGradeList,
  getAttendanceLabel,
  getUniversityDisplayName,
} from '@/features/education/lib/format-proficiencies';
import type { ExamProficiency, PrimaryUniversity, SubjectProficiency } from '@/types/education';

type MentorEducationSectionsProps = {
  primaryUniversity?: PrimaryUniversity | null;
  legacyUniversity?: string | null;
  subjectProficiencies?: SubjectProficiency[];
  examProficiencies?: ExamProficiency[];
};

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-[var(--color-m-card-border)] py-4 last:border-0">
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-muted)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-1 text-xs font-medium text-[var(--color-m-text)]">
      {children}
    </span>
  );
}

export function MentorEducationSections({
  primaryUniversity,
  legacyUniversity,
  subjectProficiencies = [],
  examProficiencies = [],
}: MentorEducationSectionsProps) {
  const tr = useStrings();
  const universityName = getUniversityDisplayName(primaryUniversity, legacyUniversity);
  const attendance = getAttendanceLabel(primaryUniversity?.attendance_status ?? null);

  return (
    <>
      <SectionBlock title={tr.education}>
        {universityName ? (
          <div>
            <p className="text-[15px] font-medium text-[var(--color-m-text)]">{universityName}</p>
            {attendance ? (
              <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{attendance}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-m-text-muted)]">{tr.noUniversitySelected}</p>
        )}
      </SectionBlock>

      <SectionBlock title={tr.subjectsAndGrades}>
        {subjectProficiencies.length === 0 ? (
          <p className="text-sm text-[var(--color-m-text-muted)]">{tr.noSubjectsAdded}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjectProficiencies.map((p) => (
              <Chip key={p.subject_id}>
                {p.display_name} · {formatGradeList(p.grades)}
              </Chip>
            ))}
          </div>
        )}
      </SectionBlock>

      <SectionBlock title={tr.examPreparation}>
        {examProficiencies.length === 0 ? (
          <p className="text-sm text-[var(--color-m-text-muted)]">{tr.noExamSubjectsAdded}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {formatExamProficiencyList(examProficiencies).map((name) => (
              <Chip key={name}>{name}</Chip>
            ))}
          </div>
        )}
      </SectionBlock>
    </>
  );
}
