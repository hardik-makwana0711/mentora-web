import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStrings } from '@/constants/strings';
import { PastGroupCard } from '@/features/lessons/components/PastGroupCard';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import type { LessonRole, PastGroupCard as PastGroup } from '@/types/lessons';

type Props = {
  groups: PastGroup[];
  role: LessonRole;
  onGroupPress: (group: PastGroup) => void;
  onViewUpcoming?: () => void;
};

export function PastLessonsTab({ groups, role, onGroupPress, onViewUpcoming }: Props) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  if (!groups.length) {
    return (
      <EmptyState
        title={tr.noPastLessons}
        description={
          role === 'mentor' ? tr.noPastLessonsMentorDescription : tr.noPastLessonsDescription
        }
        action={
          role === 'mentor' ? (
            <Button
              type="button"
              size="sm"
              onClick={() => (onViewUpcoming ? onViewUpcoming() : navigate(`${roleBase}/lessons`))}
            >
              {tr.lessonsViewUpcoming}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {groups.map((card) => (
        <PastGroupCard
          key={`${card.lesson_id}-${'student_id' in card ? card.student_id : 'subject'}`}
          card={card}
          role={role}
          onPress={() => onGroupPress(card)}
        />
      ))}
    </div>
  );
}
