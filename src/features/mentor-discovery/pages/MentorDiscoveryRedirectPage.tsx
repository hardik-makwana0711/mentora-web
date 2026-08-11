import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/authStore';

/** Top-level discovery URLs — redirect to role-scoped in-app routes. */
export default function MentorDiscoveryRedirectPage() {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  const base =
    user.role === 'parent' ? '/parent' : user.role === 'student' ? '/student' : null;

  if (!base) {
    return <Navigate to="/" replace />;
  }

  if (pathname.startsWith('/my-mentor-requests')) {
    return <Navigate to={`${base}/my-mentor-requests`} replace />;
  }

  if (pathname.endsWith('/saved')) {
    return <Navigate to={`${base}/mentor-discovery/saved`} replace />;
  }

  return <Navigate to={`${base}/mentor-discovery`} replace />;
}
