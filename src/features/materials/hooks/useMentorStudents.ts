import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLessonsList } from '@/services/lessons.service';
import { qk } from '@/constants/query-keys';

export type MentorStudentOption = {
  id: string;
  name: string;
  parentName?: string | null;
  grade?: string | null;
};

export function useMentorStudents() {
  const lessonsQ = useQuery({
    queryKey: qk.lessonsList('mentor'),
    queryFn: () => fetchLessonsList(1, 100),
  });

  const students = useMemo<MentorStudentOption[]>(() => {
    const lessons = lessonsQ.data?.lessons ?? [];
    const seen = new Set<string>();
    const options: MentorStudentOption[] = [];

    for (const lesson of lessons) {
      const id = lesson.student_id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      options.push({
        id,
        name: lesson.student_name ?? 'Student',
      });
    }

    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, [lessonsQ.data?.lessons]);

  return {
    students,
    isLoading: lessonsQ.isPending,
    isError: lessonsQ.isError,
    refetch: lessonsQ.refetch,
  };
}
