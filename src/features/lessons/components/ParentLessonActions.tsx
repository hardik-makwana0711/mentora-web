import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';

type Props = {
  mentorId?: string | null;
  studentId?: string | null;
  lessonId?: string | null;
  className?: string;
};

/** Parent-focused next-step CTAs with supported routes only. */
export function ParentLessonActions({ mentorId, studentId, lessonId, className }: Props) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const selfId = useAuthStore((s) => s.user?.id);

  return (
    <section
      className={
        className ??
        'rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4'
      }
    >
      <h3 className="text-sm font-semibold text-[var(--color-m-text)]">{tr.nextSteps}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {mentorId ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              if (lessonId) params.set('lessonId', lessonId);
              params.set('mentorId', mentorId);
              if (studentId) params.set('studentId', studentId);
              if (selfId) params.set('parentId', selfId);
              navigate(`${roleBase}/messages?${params}`);
            }}
          >
            <MessageCircle className="size-4" />
            {tr.messageButton}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => navigate(`${roleBase}/search`)}
        >
          {tr.requestNewLesson}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            navigate(`${roleBase}/materials${studentId ? `?studentId=${studentId}` : ''}`)
          }
        >
          {tr.viewMaterials}
        </Button>
      </div>
    </section>
  );
}
