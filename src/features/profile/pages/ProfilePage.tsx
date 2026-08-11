import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { differenceInYears, parseISO, isValid } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings, tr } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { profileService } from '@/services/profile.service';
import { mentorVerificationService } from '@/services/mentor-verification.service';
import { listingsService } from '@/services/listings.service';
import { fetchParentWalletMe } from '@/services/parent-wallet.service';
import { useAuthStore } from '@/app/store/authStore';
import type { ProfileResponse } from '@/types/profile';
import {
  formatOptionalDate,
  mentorVerificationLabel,
  splitFullName,
} from '@/features/profile/lib/profile-utils';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { LogoutConfirmModal } from '@/features/profile/components/LogoutConfirmModal';
import type { AxiosError } from 'axios';
import { WalletPreviewCard } from '@/features/mentor-wallet/components/WalletPreviewCard';
import { fetchMentorWalletMe } from '@/services/mentor-wallet.service';
import { MentorEducationSections } from '@/features/education/components/MentorEducationSections';
import {
  MentorModerationBadge,
  MentorModerationNotice,
} from '@/features/profile/components/MentorModerationNotice';

function normAxios(e: unknown): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || tr.profileLoadError;
}

function roleLabel(role: ProfileResponse['role']): string {
  if (role === 'parent') return tr.roleParent;
  if (role === 'mentor') return tr.roleMentor;
  return tr.roleStudent;
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-m-card-border)] py-3 last:border-0 sm:grid-cols-[minmax(140px,190px)_1fr] sm:gap-4">
      <dt className="text-[13px] font-medium text-[var(--color-m-text-muted)]">{label}</dt>
      <dd className="break-words text-[15px] text-[var(--color-m-text)]">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-1 border-b border-[var(--color-m-card-border)] pb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
      {children}
    </h3>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="flex flex-col items-center gap-4 p-6">
        <Skeleton className="size-28 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full max-w-[200px]" />
        <Skeleton className="h-11 w-full max-w-[200px]" />
      </Card>
      <Card className="p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mb-3 h-12 w-full" />
        ))}
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const profileQuery = useQuery({
    queryKey: authUser?.id ? qk.profile(authUser.id) : [...qk.profileScope, 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(authUser?.id),
  });

  const verificationQuery = useQuery({
    queryKey: qk.mentorVerification,
    queryFn: () => mentorVerificationService.getStatus(),
    enabled: profileQuery.data?.role === 'mentor',
  });

  const walletPreviewQuery = useQuery({
    queryKey: qk.mentorWalletMe,
    queryFn: fetchMentorWalletMe,
    enabled: profileQuery.data?.role === 'mentor',
  });

  const listingsQuery = useQuery({
    queryKey: qk.mentorListings,
    queryFn: () => listingsService.fetchMyListings(),
    enabled: profileQuery.data?.role === 'mentor',
  });

  const parentWalletQuery = useQuery({
    queryKey: ['parent-wallet', 'me'],
    queryFn: fetchParentWalletMe,
    enabled: profileQuery.data?.role === 'parent',
  });

  const profile = profileQuery.data;

  const displayName =
    profile?.common_profile.full_name ||
    [authUser?.first_name, authUser?.last_name].filter(Boolean).join(' ') ||
    authUser?.name ||
    authUser?.email ||
    tr.notProvided;

  const avatarStored = profile?.common_profile.profile_photo_url ?? authUser?.avatar_url ?? null;

  const checklist = useMemo(() => {
    if (!profile || profile.role !== 'mentor') return [];
    const mp = profile.mentor_profile;
    const verified =
      verificationQuery.data?.identityVerificationStatus === 'verified';
    const education = Boolean(
      mp?.primary_university || (mp?.university && mp.university.trim())
    );
    const subjects = (mp?.subject_proficiencies?.length ?? 0) > 0;
    const bio = Boolean(profile.common_profile.short_bio?.trim());
    const listing = (listingsQuery.data?.length ?? 0) > 0;
    // TODO: Wire availability-set check when a lightweight availability status endpoint is available.
    return [
      { id: 'verified', label: tr.profileChecklistVerified, done: verified },
      { id: 'education', label: tr.profileChecklistEducation, done: education },
      { id: 'subjects', label: tr.profileChecklistSubjects, done: subjects },
      { id: 'bio', label: tr.profileChecklistBio, done: bio },
      { id: 'listing', label: tr.profileChecklistListing, done: listing },
    ];
  }, [profile, verificationQuery.data, listingsQuery.data, tr]);

  async function confirmLogout() {
    setLogoutBusy(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLogoutBusy(false);
      setLogoutOpen(false);
    }
  }

  if (profileQuery.isLoading) {
    return (
      <div>
        <PageHeader title={tr.profile} description={tr.loading} />
        <ProfileSkeleton />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div>
        <PageHeader title={tr.profile} description="" />
        <ErrorState
          title={tr.profileLoadError}
          description={normAxios(profileQuery.error)}
          onRetry={() => void profileQuery.refetch()}
        />
      </div>
    );
  }

  const { firstName, lastName } = splitFullName(profile.common_profile.full_name);
  const phoneDisplay = profile.phone_number?.trim() ? profile.phone_number : tr.noPhone;
  const emailDisplay = profile.email || tr.notProvided;
  const dob = profile.common_profile.date_of_birth;
  let ageDisplay: string = tr.notProvided;
  if (dob) {
    try {
      const d = parseISO(dob);
      if (isValid(d)) ageDisplay = String(differenceInYears(new Date(), d));
    } catch {
      ageDisplay = tr.notProvided;
    }
  }

  const isMentor = profile.role === 'mentor';
  const completion = profile.common_profile.profile_completion;
  const moderationStatus = profile.mentor_profile?.profile_moderation_status;
  const verificationLabel = verificationQuery.data
    ? mentorVerificationLabel(verificationQuery.data.identityVerificationStatus)
    : tr.notProvided;

  return (
    <div>
      <PageHeader title={tr.profile} description={roleLabel(profile.role)} />

      {isMentor && profile.mentor_profile ? (
        <MentorModerationNotice
          profileModerationStatus={profile.mentor_profile.profile_moderation_status}
          hasPendingRevision={profile.mentor_profile.has_pending_profile_revision}
        />
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,320px)_1fr]">
        <Card className="flex h-fit flex-col items-center gap-4 p-6 text-center">
          <PresignedAvatar
            key={avatarStored ?? 'none'}
            storedUrl={avatarStored}
            name={displayName}
            className="size-28 text-xl"
          />
          <div className="min-w-0 px-1">
            <p className="truncate text-lg font-semibold text-[var(--color-m-text)]">{displayName}</p>
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{roleLabel(profile.role)}</p>
          </div>

          {isMentor ? (
            <div className="w-full space-y-2 text-left text-sm">
              {typeof completion === 'number' ? (
                <p className="text-[var(--color-m-text-secondary)]">
                  {tr.profileCompletionLabel.replace('{{percent}}', String(completion))}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[var(--color-m-text-muted)]">{tr.verificationStatus}:</span>
                <Badge variant="info">{verificationLabel}</Badge>
              </div>
              {moderationStatus ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[var(--color-m-text-muted)]">{tr.profileModerationStatus}:</span>
                  <MentorModerationBadge status={moderationStatus} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-2 w-full max-w-xs space-y-2">
            {isMentor ? (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/mentors/${profile.id}`)}
              >
                {tr.viewPublicProfile}
              </Button>
            ) : null}
            <Button type="button" fullWidth onClick={() => navigate(`${roleBase}/profile/edit`)}>
              {tr.editProfile}
            </Button>
            {isMentor ? (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate(`${roleBase}/listings`)}
              >
                {tr.myPostings}
              </Button>
            ) : null}
            {profile.role === 'parent' ? (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate(`${roleBase}/students`)}
              >
                {tr.profileMenuMyStudents}
              </Button>
            ) : null}
            <Button type="button" variant="secondary" fullWidth onClick={() => setLogoutOpen(true)}>
              {tr.logout}
            </Button>
          </div>
          <p className="text-xs text-[var(--color-m-text-muted)]">{tr.profilePhotoEditHint}</p>
        </Card>

        <div className="space-y-6">
          {isMentor && checklist.length > 0 ? (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[var(--color-m-text)]">
                {tr.profileChecklistTitle}
              </h3>
              <ul className="mt-3 space-y-2">
                {checklist.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-sm text-[var(--color-m-text-secondary)]"
                  >
                    {item.done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
                    ) : (
                      <Circle className="size-4 shrink-0 text-[var(--color-m-text-muted)]" aria-hidden />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-0 sm:p-2">
            <dl className="space-y-4 px-4 py-4 sm:px-6">
              {isMentor ? (
                <>
                  <div>
                    <SectionTitle>{tr.profileSectionPersonal}</SectionTitle>
                    <DetailBlock label={tr.firstName} value={firstName || tr.notProvided} />
                    <DetailBlock label={tr.lastName} value={lastName || tr.notProvided} />
                    <DetailBlock label={tr.email} value={emailDisplay} />
                    <DetailBlock label={tr.phone} value={phoneDisplay} />
                  </div>

                  <div>
                    <SectionTitle>{tr.profileSectionPublic}</SectionTitle>
                    <DetailBlock
                      label={tr.bio}
                      value={
                        profile.common_profile.short_bio?.trim()
                          ? profile.common_profile.short_bio
                          : tr.notProvided
                      }
                    />
                    <MentorEducationSections
                      primaryUniversity={profile.mentor_profile?.primary_university}
                      legacyUniversity={profile.mentor_profile?.university}
                      subjectProficiencies={profile.mentor_profile?.subject_proficiencies}
                      examProficiencies={profile.mentor_profile?.exam_proficiencies}
                    />
                    <DetailBlock label={tr.verificationStatus} value={verificationLabel} />
                  </div>

                  <div>
                    <SectionTitle>{tr.profileSectionEarnings}</SectionTitle>
                    <div className="py-3">
                      <WalletPreviewCard
                        loading={walletPreviewQuery.isLoading}
                        error={walletPreviewQuery.isError || !walletPreviewQuery.data?.wallet}
                        availableBalance={walletPreviewQuery.data?.wallet?.availableBalance}
                        pendingBalance={walletPreviewQuery.data?.wallet?.pendingBalance}
                        currency={walletPreviewQuery.data?.wallet?.currency}
                        title={tr.earningsAndPayouts}
                        hint={tr.mentorWalletPreviewHint}
                        onPress={() => navigate(`${roleBase}/earnings`)}
                      />
                    </div>
                  </div>

                  <div>
                    <SectionTitle>{tr.profileSectionPreferences}</SectionTitle>
                    <p className="py-3 text-sm text-[var(--color-m-text-muted)]">
                      {tr.profilePrefsLanguageHint}
                    </p>
                  </div>

                  {/* TODO: Add Security section (change password / email / phone verification) when web routes exist. */}
                </>
              ) : profile.role === 'parent' ? (
                <>
                  <div>
                    <SectionTitle>{tr.profileSectionPersonal}</SectionTitle>
                    <DetailBlock label={tr.firstName} value={firstName || tr.notProvided} />
                    <DetailBlock label={tr.lastName} value={lastName || tr.notProvided} />
                    <DetailBlock label={tr.email} value={emailDisplay} />
                    <DetailBlock label={tr.phone} value={phoneDisplay} />
                    <DetailBlock
                      label={tr.dateOfBirth}
                      value={formatOptionalDate(profile.common_profile.date_of_birth)}
                    />
                    <DetailBlock label={tr.ageYears} value={ageDisplay} />
                  </div>

                  <div>
                    <SectionTitle>{tr.profileSectionLinkedStudents}</SectionTitle>
                    <div className="py-3">
                      {(profile.parent_profile?.linked_students.length ?? 0) === 0 ? (
                        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.noLinkedChild}</p>
                      ) : (
                        <div className="relative">
                          <div className="app-scroll-area max-h-[360px] overflow-y-auto pr-2">
                            <ul className="space-y-3">
                              {profile.parent_profile?.linked_students.map((s) => (
                                <li
                                  key={s.id}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] p-3"
                                >
                                  <div className="min-w-0">
                                    <p className="font-medium text-[var(--color-m-text)]">
                                      {s.name || tr.notProvided}
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
                                      {tr.childEmail}: {s.email?.trim() ? s.email : tr.notProvided}
                                    </p>
                                    {s.grade_level ? (
                                      <p className="mt-0.5 text-sm text-[var(--color-m-text-muted)]">
                                        {tr.studentsGradeLabel.replace('{{grade}}', s.grade_level)}
                                      </p>
                                    ) : null}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--color-m-card)] to-transparent" />
                        </div>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="mt-3"
                        onClick={() => navigate(`${roleBase}/students`)}
                      >
                        {tr.profileMenuMyStudents}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <SectionTitle>{tr.profileSectionWallet}</SectionTitle>
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`${roleBase}/wallet`)}
                        className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3 text-left transition hover:border-[var(--color-brand-primary)]/40"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-m-text)]">
                            {tr.walletBalance}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-m-text-muted)]">
                            {tr.parentWalletPreviewHint}
                          </p>
                        </div>
                        <p className="text-xl font-bold tabular-nums text-[var(--color-m-text)]">
                          {parentWalletQuery.isSuccess
                            ? `${
                                parentWalletQuery.data.availableCredits ??
                                parentWalletQuery.data.credit_balance ??
                                parentWalletQuery.data.balance ??
                                0
                              } ${tr.creditUnit}`
                            : '—'}
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <SectionTitle>{tr.profileSectionPreferences}</SectionTitle>
                    <p className="py-3 text-sm text-[var(--color-m-text-muted)]">
                      {tr.profilePrefsLanguageHint}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <DetailBlock label={tr.firstName} value={firstName || tr.notProvided} />
                  <DetailBlock label={tr.lastName} value={lastName || tr.notProvided} />
                  <DetailBlock label={tr.email} value={emailDisplay} />
                  <DetailBlock label={tr.phone} value={phoneDisplay} />
                  <DetailBlock label={tr.role} value={roleLabel(profile.role)} />

                  {profile.role === 'student' ? (
                    <>
                      <DetailBlock
                        label={tr.dateOfBirth}
                        value={formatOptionalDate(profile.common_profile.date_of_birth)}
                      />
                      <DetailBlock label={tr.ageYears} value={ageDisplay} />
                      <DetailBlock label={tr.parentInfo} value={tr.notProvided} />
                    </>
                  ) : null}
                </>
              )}
            </dl>
          </Card>
        </div>
      </div>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => !logoutBusy && setLogoutOpen(false)}
        onConfirm={() => void confirmLogout()}
        isLoading={logoutBusy}
      />
    </div>
  );
}
