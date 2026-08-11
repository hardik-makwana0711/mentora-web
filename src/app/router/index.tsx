import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { RequireAuth, SuspendedGate, GuardRole, RequireAdmin } from '@/routes/guards';

const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ForgotPasswordCheckDeliveryPage = lazy(
  () => import('@/features/auth/pages/ForgotPasswordCheckDeliveryPage')
);
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));

const ParentLayout = lazy(() => import('@/layouts/ParentLayout'));
const StudentLayout = lazy(() => import('@/layouts/StudentLayout'));
const MentorLayout = lazy(() => import('@/layouts/MentorLayout'));

const ParentDashboardPage = lazy(() => import('@/features/dashboard/pages/ParentDashboardPage'));
const StudentDashboardPage = lazy(() => import('@/features/dashboard/pages/StudentDashboardPage'));
const MentorDashboardPage = lazy(() => import('@/features/dashboard/pages/MentorDashboardPage'));

const LessonsHomePage = lazy(() => import('@/features/lessons/pages/LessonsHomePage'));
const LessonSessionsPage = lazy(() => import('@/features/lessons/pages/LessonSessionsPage'));
const LessonDetailPage = lazy(() => import('@/features/lessons/pages/LessonDetailPage'));
const LessonReportPage = lazy(() => import('@/features/lessons/pages/LessonReportPage'));
const QuizPreviewPage = lazy(() => import('@/features/lessons/pages/QuizPreviewPage'));
const QuizEditPage = lazy(() => import('@/features/lessons/pages/QuizEditPage'));
const StudentQuizPage = lazy(() => import('@/features/lessons/pages/StudentQuizPage'));
const QuizResultPage = lazy(() => import('@/features/lessons/pages/QuizResultPage'));
const MessagesPlaceholderPage = lazy(() => import('@/features/messages/pages/MessagesPlaceholderPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const EditProfilePage = lazy(() => import('@/features/profile/pages/EditProfilePage'));
const ParentWalletPage = lazy(() => import('@/features/wallet/pages/ParentWalletPage'));
const MentorEarningsPage = lazy(() => import('@/features/mentor/pages/MentorEarningsPage'));
const MentorWalletPage = lazy(() => import('@/features/mentor-wallet/pages/MentorWalletPage'));
const PayoutMethodsPage = lazy(() => import('@/features/mentor-wallet/pages/PayoutMethodsPage'));
const PayoutMethodFormPage = lazy(() => import('@/features/mentor-wallet/pages/PayoutMethodFormPage'));
const MentorAvailabilityPlaceholderPage = lazy(
  () => import('@/features/mentor/pages/MentorAvailabilityPlaceholderPage')
);
const MentorListingsPage = lazy(() => import('@/features/listings/pages/MentorListingsPage'));
const CreateListingPage = lazy(() => import('@/features/listings/pages/CreateListingPage'));
const EditListingPage = lazy(() => import('@/features/listings/pages/EditListingPage'));

const StudentsPage = lazy(() => import('@/features/students/pages/StudentsPage'));

const MentorMaterialsPage = lazy(() => import('@/features/materials/pages/MentorMaterialsPage'));
const CreateMaterialPage = lazy(() => import('@/features/materials/pages/CreateMaterialPage'));
const MentorMaterialDetailPage = lazy(() => import('@/features/materials/pages/MentorMaterialDetailPage'));
const EditMaterialPage = lazy(() => import('@/features/materials/pages/EditMaterialPage'));
const StudentMaterialsPage = lazy(() => import('@/features/materials/pages/StudentMaterialsPage'));
const StudentMaterialDetailPage = lazy(() => import('@/features/materials/pages/StudentMaterialDetailPage'));
const ParentMaterialsPage = lazy(() => import('@/features/materials/pages/ParentMaterialsPage'));
const ParentMaterialDetailPage = lazy(() => import('@/features/materials/pages/ParentMaterialDetailPage'));

const MentorSearchPage = lazy(() => import('@/features/search/pages/MentorSearchPage'));
const PublicListingDetailPage = lazy(() => import('@/features/search/pages/PublicListingDetailPage'));
const BookingStartPage = lazy(() => import('@/features/search/pages/BookingStartPage'));
const BookingCheckoutPage = lazy(() => import('@/features/search/pages/BookingCheckoutPage'));
const FavouritesPage = lazy(() => import('@/features/search/pages/FavouritesPage'));
const PublicMentorRoutePage = lazy(() => import('@/features/search/pages/PublicMentorRoutePage'));
const MentorDiscoveryPage = lazy(() => import('@/features/mentor-discovery/pages/MentorDiscoveryPage'));
const SavedMentorsPage = lazy(() => import('@/features/mentor-discovery/pages/SavedMentorsPage'));
const MentorDiscoveryProfilePage = lazy(
  () => import('@/features/mentor-discovery/pages/MentorDiscoveryProfilePage')
);
const MyMentorRequestsPage = lazy(() => import('@/features/mentor-discovery/pages/MyMentorRequestsPage'));
const MentorDiscoveryRedirectPage = lazy(
  () => import('@/features/mentor-discovery/pages/MentorDiscoveryRedirectPage')
);
const MentorContactRequestsPage = lazy(
  () => import('@/features/mentor/pages/MentorContactRequestsPage')
);

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const MentorVerificationsPage = lazy(() => import('@/features/admin/pages/MentorVerificationsPage'));
const MentorVerificationDetailPage = lazy(() => import('@/features/admin/pages/MentorVerificationDetailPage'));
const MentorProfilesPage = lazy(() => import('@/features/admin/pages/MentorProfilesPage'));
const MentorProfileDetailPage = lazy(() => import('@/features/admin/pages/MentorProfileDetailPage'));
const AdminListingsPage = lazy(() => import('@/features/admin/pages/AdminListingsPage'));
const AdminListingDetailPage = lazy(() => import('@/features/admin/pages/AdminListingDetailPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/AdminUserDetailPage'));
const AdminContactRequestsPage = lazy(
  () => import('@/features/admin/pages/AdminContactRequestsPage')
);
const AdminReportsPage = lazy(() => import('@/features/admin/pages/AdminReportsPage'));
const AdminMarketingCampaignsPage = lazy(
  () => import('@/features/admin/pages/AdminMarketingCampaignsPage')
);
const AdminMarketingCampaignCreatePage = lazy(
  () => import('@/features/admin/pages/AdminMarketingCampaignCreatePage')
);
const AdminMarketingCampaignDetailPage = lazy(
  () => import('@/features/admin/pages/AdminMarketingCampaignDetailPage')
);
const AdminMarketingCampaignEditPage = lazy(
  () => import('@/features/admin/pages/AdminMarketingCampaignEditPage')
);
const AdminMarketingCampaignMetricsPage = lazy(
  () => import('@/features/admin/pages/AdminMarketingCampaignMetricsPage')
);

function SuspenseLayout() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[var(--color-surface-bg)]">
          <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}

const parentAppRoutes = {
  element: <ParentLayout />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: 'dashboard', element: <ParentDashboardPage /> },
    { path: 'lessons', element: <LessonsHomePage /> },
    { path: 'lessons/:lessonId/history', element: <LessonSessionsPage /> },
    { path: 'lessons/session/:sessionId', element: <LessonDetailPage /> },
    { path: 'lessons/session/:sessionId/report', element: <LessonReportPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/preview', element: <QuizPreviewPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/edit', element: <QuizEditPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/take', element: <StudentQuizPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/result', element: <QuizResultPage /> },
    { path: 'messages', element: <MessagesPlaceholderPage /> },
    { path: 'wallet', element: <ParentWalletPage /> },
    { path: 'students', element: <StudentsPage /> },
    { path: 'materials', element: <ParentMaterialsPage /> },
    { path: 'materials/:studentId/:materialId', element: <ParentMaterialDetailPage /> },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'profile/edit', element: <EditProfilePage /> },
    { path: 'notifications', element: <NotificationsPage /> },
    { path: 'search', element: <MentorSearchPage /> },
    { path: 'mentor-discovery', element: <MentorDiscoveryPage /> },
    { path: 'mentor-discovery/saved', element: <SavedMentorsPage /> },
    { path: 'mentors/:mentorId', element: <MentorDiscoveryProfilePage /> },
    { path: 'my-mentor-requests', element: <MyMentorRequestsPage /> },
    { path: 'search/mentors/:mentorId', element: <MentorDiscoveryProfilePage /> },
    { path: 'search/listings/:listingId', element: <PublicListingDetailPage /> },
    { path: 'search/booking', element: <BookingStartPage /> },
    { path: 'search/booking/payment', element: <BookingCheckoutPage /> },
    { path: 'favourites', element: <FavouritesPage /> },
  ],
};

const studentAppRoutes = {
  element: <StudentLayout />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: 'dashboard', element: <StudentDashboardPage /> },
    { path: 'lessons', element: <LessonsHomePage /> },
    { path: 'lessons/:lessonId/history', element: <LessonSessionsPage /> },
    { path: 'lessons/session/:sessionId', element: <LessonDetailPage /> },
    { path: 'lessons/session/:sessionId/report', element: <LessonReportPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/preview', element: <QuizPreviewPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/edit', element: <QuizEditPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/take', element: <StudentQuizPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/result', element: <QuizResultPage /> },
    { path: 'messages', element: <MessagesPlaceholderPage /> },
    { path: 'materials', element: <StudentMaterialsPage /> },
    { path: 'materials/:materialId', element: <StudentMaterialDetailPage /> },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'profile/edit', element: <EditProfilePage /> },
    { path: 'notifications', element: <NotificationsPage /> },
    { path: 'search', element: <MentorSearchPage /> },
    { path: 'mentor-discovery', element: <MentorDiscoveryPage /> },
    { path: 'mentor-discovery/saved', element: <SavedMentorsPage /> },
    { path: 'mentors/:mentorId', element: <MentorDiscoveryProfilePage /> },
    { path: 'my-mentor-requests', element: <MyMentorRequestsPage /> },
    { path: 'search/mentors/:mentorId', element: <MentorDiscoveryProfilePage /> },
    { path: 'search/listings/:listingId', element: <PublicListingDetailPage /> },
    { path: 'favourites', element: <FavouritesPage /> },
  ],
};

const mentorAppRoutes = {
  element: <MentorLayout />,
  children: [
    { index: true, element: <Navigate to="dashboard" replace /> },
    { path: 'dashboard', element: <MentorDashboardPage /> },
    { path: 'lessons', element: <LessonsHomePage /> },
    { path: 'lessons/:lessonId/history', element: <LessonSessionsPage /> },
    { path: 'lessons/session/:sessionId', element: <LessonDetailPage /> },
    { path: 'lessons/session/:sessionId/report', element: <LessonReportPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/preview', element: <QuizPreviewPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/edit', element: <QuizEditPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/take', element: <StudentQuizPage /> },
    { path: 'lessons/session/:sessionId/report/quiz/result', element: <QuizResultPage /> },
    { path: 'messages', element: <MessagesPlaceholderPage /> },
    { path: 'materials', element: <MentorMaterialsPage /> },
    { path: 'materials/new', element: <CreateMaterialPage /> },
    { path: 'materials/:materialId', element: <MentorMaterialDetailPage /> },
    { path: 'materials/:materialId/edit', element: <EditMaterialPage /> },
    { path: 'availability', element: <MentorAvailabilityPlaceholderPage /> },
    { path: 'listings', element: <MentorListingsPage /> },
    { path: 'listings/create', element: <CreateListingPage /> },
    { path: 'listings/:listingId/edit', element: <EditListingPage /> },
    { path: 'earnings', element: <MentorEarningsPage /> },
    { path: 'wallet', element: <MentorWalletPage /> },
    { path: 'wallet/payout-methods', element: <PayoutMethodsPage /> },
    { path: 'wallet/payout-methods/new', element: <PayoutMethodFormPage /> },
    { path: 'wallet/payout-methods/:payoutMethodId/edit', element: <PayoutMethodFormPage /> },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'profile/edit', element: <EditProfilePage /> },
    { path: 'notifications', element: <NotificationsPage /> },
    { path: 'contact-requests', element: <MentorContactRequestsPage /> },
  ],
};

function roleBranch(role: 'parent' | 'student' | 'mentor', app: typeof parentAppRoutes) {
  return {
    element: <GuardRole role={role} />,
    children: [app],
  };
}

export const router = createBrowserRouter([
  {
    element: <SuspenseLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/forgot-password/sent', element: <ForgotPasswordCheckDeliveryPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/mentors/:mentorId', element: <PublicMentorRoutePage /> },
      { path: '/mentor-discovery', element: <MentorDiscoveryRedirectPage /> },
      { path: '/mentor-discovery/saved', element: <MentorDiscoveryRedirectPage /> },
      { path: '/my-mentor-requests', element: <MentorDiscoveryRedirectPage /> },
      {
        path: '/admin',
        element: <RequireAdmin />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'mentor-verifications', element: <MentorVerificationsPage /> },
              { path: 'mentor-verifications/:mentorId', element: <MentorVerificationDetailPage /> },
              { path: 'mentor-profiles', element: <MentorProfilesPage /> },
              { path: 'mentor-profiles/:mentorId', element: <MentorProfileDetailPage /> },
              { path: 'listings', element: <AdminListingsPage /> },
              { path: 'listings/:listingId', element: <AdminListingDetailPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'users/:userId', element: <AdminUserDetailPage /> },
              { path: 'mentor-contact-requests', element: <AdminContactRequestsPage /> },
              { path: 'reports', element: <AdminReportsPage /> },
              { path: 'marketing', element: <AdminMarketingCampaignsPage /> },
              { path: 'marketing/new', element: <AdminMarketingCampaignCreatePage /> },
              { path: 'marketing/:id', element: <AdminMarketingCampaignDetailPage /> },
              { path: 'marketing/:id/edit', element: <AdminMarketingCampaignEditPage /> },
              { path: 'marketing/:id/metrics', element: <AdminMarketingCampaignMetricsPage /> },
            ],
          },
        ],
      },
      {
        path: '/parent',
        element: <RequireAuth />,
        children: [
          {
            element: <SuspendedGate />,
            children: [roleBranch('parent', parentAppRoutes)],
          },
        ],
      },
      {
        path: '/student',
        element: <RequireAuth />,
        children: [
          {
            element: <SuspendedGate />,
            children: [roleBranch('student', studentAppRoutes)],
          },
        ],
      },
      {
        path: '/mentor',
        element: <RequireAuth />,
        children: [
          {
            element: <SuspendedGate />,
            children: [roleBranch('mentor', mentorAppRoutes)],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
