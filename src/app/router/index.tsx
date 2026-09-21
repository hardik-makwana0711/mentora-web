import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, SuspendedGate, GuardRole, RequireAdmin } from '@/routes/guards';
import { MentorVerificationGate } from '@/features/mentor-verification/components/MentorVerificationGate';
import { SuspenseLayout } from '@/app/router/SuspenseLayout';

const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ForgotPasswordCheckDeliveryPage = lazy(
  () => import('@/features/auth/pages/ForgotPasswordCheckDeliveryPage')
);
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const PasswordResetSuccessPage = lazy(
  () => import('@/features/auth/pages/PasswordResetSuccessPage')
);

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
const MessagesPlaceholderPage = lazy(
  () => import('@/features/messages/pages/MessagesPlaceholderPage')
);
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const EditProfilePage = lazy(() => import('@/features/profile/pages/EditProfilePage'));
const MentorMediaPage = lazy(() => import('@/features/profile/pages/MentorMediaPage'));
const ParentWalletPage = lazy(() => import('@/features/wallet/pages/ParentWalletPage'));
const MentorEarningsPage = lazy(() => import('@/features/mentor/pages/MentorEarningsPage'));
const MentorWalletPage = lazy(() => import('@/features/mentor-wallet/pages/MentorWalletPage'));
const PayoutMethodsPage = lazy(() => import('@/features/mentor-wallet/pages/PayoutMethodsPage'));
const PayoutMethodFormPage = lazy(
  () => import('@/features/mentor-wallet/pages/PayoutMethodFormPage')
);
const MentorAvailabilityPlaceholderPage = lazy(
  () => import('@/features/mentor/pages/MentorAvailabilityPlaceholderPage')
);
const MentorListingsPage = lazy(() => import('@/features/listings/pages/MentorListingsPage'));
const CreateListingPage = lazy(() => import('@/features/listings/pages/CreateListingPage'));
const EditListingPage = lazy(() => import('@/features/listings/pages/EditListingPage'));

const StudentsPage = lazy(() => import('@/features/students/pages/StudentsPage'));

const MentorMaterialsPage = lazy(() => import('@/features/materials/pages/MentorMaterialsPage'));
const CreateMaterialPage = lazy(() => import('@/features/materials/pages/CreateMaterialPage'));
const MentorMaterialDetailPage = lazy(
  () => import('@/features/materials/pages/MentorMaterialDetailPage')
);
const EditMaterialPage = lazy(() => import('@/features/materials/pages/EditMaterialPage'));
const StudentMaterialsPage = lazy(() => import('@/features/materials/pages/StudentMaterialsPage'));
const StudentMaterialDetailPage = lazy(
  () => import('@/features/materials/pages/StudentMaterialDetailPage')
);
const ParentMaterialsPage = lazy(() => import('@/features/materials/pages/ParentMaterialsPage'));
const ParentMaterialDetailPage = lazy(
  () => import('@/features/materials/pages/ParentMaterialDetailPage')
);

const MentorSearchPage = lazy(() => import('@/features/search/pages/MentorSearchPage'));
const PublicListingDetailPage = lazy(
  () => import('@/features/search/pages/PublicListingDetailPage')
);
const BookingStartPage = lazy(() => import('@/features/search/pages/BookingStartPage'));
const BookingCheckoutPage = lazy(() => import('@/features/search/pages/BookingCheckoutPage'));
const FavouritesPage = lazy(() => import('@/features/search/pages/FavouritesPage'));
const PublicMentorRoutePage = lazy(() => import('@/features/search/pages/PublicMentorRoutePage'));
const MentorDiscoveryPage = lazy(
  () => import('@/features/mentor-discovery/pages/MentorDiscoveryPage')
);
const SavedMentorsPage = lazy(() => import('@/features/mentor-discovery/pages/SavedMentorsPage'));
const MentorDiscoveryProfilePage = lazy(
  () => import('@/features/mentor-discovery/pages/MentorDiscoveryProfilePage')
);
const MyMentorRequestsPage = lazy(
  () => import('@/features/mentor-discovery/pages/MyMentorRequestsPage')
);
const MentorDiscoveryRedirectPage = lazy(
  () => import('@/features/mentor-discovery/pages/MentorDiscoveryRedirectPage')
);
const MentorContactRequestsPage = lazy(
  () => import('@/features/mentor/pages/MentorContactRequestsPage')
);
const MentorReferencesPage = lazy(() => import('@/features/mentor/pages/MentorReferencesPage'));
const VerificationOnboardingPage = lazy(
  () => import('@/features/mentor-verification/pages/VerificationOnboardingPage')
);
const IdentityVerificationPage = lazy(
  () => import('@/features/mentor-verification/pages/IdentityVerificationPage')
);
const DocumentUploadPage = lazy(
  () => import('@/features/mentor-verification/pages/DocumentUploadPage')
);
const MentorPricingPage = lazy(() => import('@/features/listings/pages/MentorPricingPage'));

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const MentorVerificationsPage = lazy(
  () => import('@/features/admin/pages/MentorVerificationsPage')
);
const MentorVerificationDetailPage = lazy(
  () => import('@/features/admin/pages/MentorVerificationDetailPage')
);
const MentorProfilesPage = lazy(() => import('@/features/admin/pages/MentorProfilesPage'));
const MentorProfileDetailPage = lazy(
  () => import('@/features/admin/pages/MentorProfileDetailPage')
);
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
    {
      path: 'dashboard',
      element: (
        <MentorVerificationGate>
          <MentorDashboardPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons',
      element: (
        <MentorVerificationGate>
          <LessonsHomePage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons/:lessonId/history',
      element: (
        <MentorVerificationGate>
          <LessonSessionsPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons/session/:sessionId',
      element: (
        <MentorVerificationGate>
          <LessonDetailPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons/session/:sessionId/report',
      element: (
        <MentorVerificationGate>
          <LessonReportPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons/session/:sessionId/report/quiz/preview',
      element: (
        <MentorVerificationGate>
          <QuizPreviewPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons/session/:sessionId/report/quiz/edit',
      element: (
        <MentorVerificationGate>
          <QuizEditPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons/session/:sessionId/report/quiz/take',
      element: (
        <MentorVerificationGate>
          <StudentQuizPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'lessons/session/:sessionId/report/quiz/result',
      element: (
        <MentorVerificationGate>
          <QuizResultPage />
        </MentorVerificationGate>
      ),
    },
    { path: 'messages', element: <MessagesPlaceholderPage /> },
    {
      path: 'materials',
      element: (
        <MentorVerificationGate>
          <MentorMaterialsPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'materials/new',
      element: (
        <MentorVerificationGate>
          <CreateMaterialPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'materials/:materialId',
      element: (
        <MentorVerificationGate>
          <MentorMaterialDetailPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'materials/:materialId/edit',
      element: (
        <MentorVerificationGate>
          <EditMaterialPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'availability',
      element: (
        <MentorVerificationGate>
          <MentorAvailabilityPlaceholderPage />
        </MentorVerificationGate>
      ),
    },
    { path: 'listings', element: <MentorListingsPage /> },
    { path: 'listings/create', element: <CreateListingPage /> },
    { path: 'listings/:listingId/edit', element: <EditListingPage /> },
    {
      path: 'pricing',
      element: (
        <MentorVerificationGate>
          <MentorPricingPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'earnings',
      element: (
        <MentorVerificationGate>
          <MentorEarningsPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'wallet',
      element: (
        <MentorVerificationGate>
          <MentorWalletPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'wallet/payout-methods',
      element: (
        <MentorVerificationGate>
          <PayoutMethodsPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'wallet/payout-methods/new',
      element: (
        <MentorVerificationGate>
          <PayoutMethodFormPage />
        </MentorVerificationGate>
      ),
    },
    {
      path: 'wallet/payout-methods/:payoutMethodId/edit',
      element: (
        <MentorVerificationGate>
          <PayoutMethodFormPage />
        </MentorVerificationGate>
      ),
    },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'profile/edit', element: <EditProfilePage /> },
    {
      path: 'media',
      element: (
        <MentorVerificationGate>
          <MentorMediaPage />
        </MentorVerificationGate>
      ),
    },
    { path: 'notifications', element: <NotificationsPage /> },
    { path: 'contact-requests', element: <MentorContactRequestsPage /> },
    {
      path: 'references',
      element: (
        <MentorVerificationGate>
          <MentorReferencesPage />
        </MentorVerificationGate>
      ),
    },
    { path: 'verification', element: <VerificationOnboardingPage /> },
    { path: 'verification/identity', element: <IdentityVerificationPage /> },
    { path: 'verification/documents', element: <DocumentUploadPage /> },
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
      { path: '/reset-password/success', element: <PasswordResetSuccessPage /> },
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
