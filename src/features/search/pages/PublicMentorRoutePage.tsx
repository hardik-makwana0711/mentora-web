import { Navigate, useParams } from 'react-router-dom';

import { useAuthStore } from '@/app/store/authStore';



/** Public share URL — redirects authenticated parent/student to in-app discovery profile. */

export default function PublicMentorRoutePage() {

  const { mentorId = '' } = useParams();

  const user = useAuthStore((s) => s.user);



  if (!mentorId) {

    return <Navigate to="/" replace />;

  }



  if (user?.role === 'parent') {

    return <Navigate to={`/parent/mentors/${mentorId}`} replace />;

  }



  if (user?.role === 'student') {

    return <Navigate to={`/student/mentors/${mentorId}`} replace />;

  }



  if (user?.role === 'admin') {

    return <Navigate to="/admin" replace />;

  }



  if (user) {

    return <Navigate to="/login" replace state={{ from: `/mentors/${mentorId}` }} />;

  }



  return <Navigate to="/login" replace state={{ from: `/mentors/${mentorId}` }} />;

}

