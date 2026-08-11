import type { QueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import type { LessonRole } from '@/types/lessons';

/** Refresh Meet-related data after booking checkout or link retry. */
export function invalidateMeetQueries(qc: QueryClient, role?: LessonRole | string | null) {
  void qc.invalidateQueries({ queryKey: qk.sessionsUpcoming });
  void qc.invalidateQueries({ queryKey: qk.studentDashboard });
  void qc.invalidateQueries({ queryKey: qk.parentDashboard });
  void qc.invalidateQueries({ queryKey: qk.mentorDashboard });
  if (role === 'student' || role === 'parent' || role === 'mentor') {
    void qc.invalidateQueries({ queryKey: ['lessons', 'dashboard', role] });
  } else {
    void qc.invalidateQueries({ queryKey: ['lessons', 'dashboard'] });
  }
}
