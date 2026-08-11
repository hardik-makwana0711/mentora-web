import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** Navigation helpers for dashboard lesson cards (join handled by `LessonJoinButton`). */
export function useDashboardJoin(roleBase: string) {
  const navigate = useNavigate();

  const goSession = useCallback(
    (sessionId: string) => {
      navigate(`${roleBase}/lessons/session/${sessionId}`);
    },
    [navigate, roleBase],
  );

  return { goSession };
}
