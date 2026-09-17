import { useRef, useState, type RefObject } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { PhotoCarousel } from '@/features/mentor-discovery/components/PhotoCarousel';
import { ReportMentorModal } from '@/features/mentor-discovery/components/ReportMentorModal';
import { SubmitReferenceModal } from '@/features/mentor-discovery/components/SubmitReferenceModal';
import { Badge } from '@/components/ui/Badge';
import { ProfileAboutSection } from '@/features/mentor-discovery/components/profile/ProfileAboutSection';
import { ProfileAnchorNav } from '@/features/mentor-discovery/components/profile/ProfileAnchorNav';
import { ProfileAvailabilitySection } from '@/features/mentor-discovery/components/profile/ProfileAvailabilitySection';
import { ProfileEducationSection } from '@/features/mentor-discovery/components/profile/ProfileEducationSection';
import { ProfileQuickHighlights } from '@/features/mentor-discovery/components/profile/ProfileQuickHighlights';
import { ProfileReviewsSection } from '@/features/mentor-discovery/components/profile/ProfileReviewsSection';
import { ProfileServicesSection } from '@/features/mentor-discovery/components/profile/ProfileServicesSection';
import { ProfileStickyCard } from '@/features/mentor-discovery/components/profile/ProfileStickyCard';
import { ProfileSubjectsSection } from '@/features/mentor-discovery/components/profile/ProfileSubjectsSection';
import { ProfileSuccessStoriesSection } from '@/features/mentor-discovery/components/profile/ProfileSuccessStoriesSection';
import { ProfileTeachingStyleSection } from '@/features/mentor-discovery/components/profile/ProfileTeachingStyleSection';
import { ProfileVerificationBadges } from '@/features/mentor-discovery/components/profile/ProfileVerificationBadges';
import { ProfileVideoSection } from '@/features/mentor-discovery/components/profile/ProfileVideoSection';
import { useScrollSpy } from '@/features/mentor-discovery/hooks/useScrollSpy';
import { buildMentorHeadline } from '@/features/mentor-discovery/lib/headline';
import { ratingSummary } from '@/features/mentor-discovery/lib/mentor-profile-format';
import {
  getVisibleSections,
  type ProfileSectionId,
} from '@/features/mentor-discovery/lib/mentor-profile-sections';
import { useMentorPublicProfile } from '@/features/search/hooks/useMentorPublicProfile';
import { discoveryService } from '@/services/discovery.service';
import { createLessonThread, fetchMessageThreads, sendMessage } from '@/services/messages.service';
import { profileService } from '@/services/profile.service';
import { qk } from '@/constants/query-keys';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { useStrings } from '@/constants/strings';
import { isHttpNotFound } from '@/lib/http-errors';

export default function MentorDiscoveryProfilePage() {
  const tr = useStrings();
  const { mentorId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromSearch = location.pathname.includes('/search/mentors/');
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [contacting, setContacting] = useState(false);

  const query = useQuery({
    queryKey: qk.discoveryProfile(mentorId),
    queryFn: () => discoveryService.getFullProfile(mentorId),
    enabled: Boolean(mentorId),
  });

  const listingsQuery = useMentorPublicProfile(mentorId);

  const canRequest = role === 'parent' || role === 'student';

  const sectionRefs: Record<ProfileSectionId, RefObject<HTMLElement | null>> = {
    overview: useRef<HTMLElement | null>(null),
    subjects: useRef<HTMLElement | null>(null),
    teachingStyle: useRef<HTMLElement | null>(null),
    services: useRef<HTMLElement | null>(null),
    availability: useRef<HTMLElement | null>(null),
    video: useRef<HTMLElement | null>(null),
    education: useRef<HTMLElement | null>(null),
    reviews: useRef<HTMLElement | null>(null),
    successStories: useRef<HTMLElement | null>(null),
  };

  const profile = query.data;
  const visibleSections = profile ? getVisibleSections(profile) : [];
  const activeSectionId = useScrollSpy(
    visibleSections.map(({ id }) => ({ id, ref: sectionRefs[id] }))
  );

  if (query.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (query.isError || !profile) {
    if (isHttpNotFound(query.error)) {
      return <EmptyState title={tr.mentorUnavailable} />;
    }
    return <ErrorState title={tr.mentorProfileLoadError} onRetry={() => void query.refetch()} />;
  }

  const photos = profile.photos.map((p) => p.url);
  const isSectionVisible = (id: ProfileSectionId) => visibleSections.some((s) => s.id === id);

  // The /profile (discovery) endpoint prefers a mentor-set custom display_name over
  // first+last name, while /public-profile and /mentors/search always use first+last
  // name — same inconsistency mobile works around by treating public-profile as the
  // authoritative name source. Override it here so the name matches what search shows.
  const publicName = listingsQuery.data?.mentor.name;
  const displayProfile =
    publicName && publicName !== profile.display_name
      ? { ...profile, display_name: publicName }
      : profile;

  async function handleContactMentor() {
    if (contacting || !user) return;

    if (role === 'student') {
      toast.error(tr.studentContactNote);
      return;
    }

    setContacting(true);
    try {
      const threads = await fetchMessageThreads();
      const existingThread = threads.find((t) =>
        t.participants.some((p) => p.user_id === mentorId)
      );
      if (existingThread) {
        navigate(`${roleBase}/messages?threadId=${existingThread.id}`);
        return;
      }

      const me = await profileService.getMe();
      const linkedStudents = me.parent_profile?.linked_students ?? [];
      if (linkedStudents.length === 0) {
        toast.error(tr.contactNoLinkedStudents);
        return;
      }

      const thread = await createLessonThread({
        lesson_id: crypto.randomUUID(),
        parent_id: user.id,
        student_id: linkedStudents[0]!.id,
        mentor_id: mentorId,
      });
      await sendMessage({
        thread_id: thread.id,
        receiver_id: mentorId,
        message_type: 'text',
        encrypted_payload: tr.contactMentorWelcomeMessage,
      });
      navigate(`${roleBase}/messages?threadId=${thread.id}`);
    } catch {
      toast.error(tr.requestFailed);
    } finally {
      setContacting(false);
    }
  }

  return (
    <PageContainer width="profile" className={canRequest ? 'pb-24 lg:pb-0' : undefined}>
      <div className="mb-4 flex items-center justify-between gap-2">
        {cameFromSearch ? (
          <BackLink to={`${roleBase}/search`}>{tr.backToSearch}</BackLink>
        ) : (
          <BackLink to={`${roleBase}/mentor-discovery`}>{tr.backToDiscovery}</BackLink>
        )}
        {canRequest ? (
          <button
            type="button"
            title={tr.reportProfile}
            aria-label={tr.reportProfile}
            onClick={() => setReportOpen(true)}
            className="rounded-lg p-2 text-[var(--color-m-text-muted)] hover:bg-[var(--color-m-hover-overlay)] hover:text-rose-400"
          >
            <Flag className="size-5" />
          </button>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)]">
        <PhotoCarousel photos={photos} alt={displayProfile.display_name} variant="panel" />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[var(--color-m-text)]">
            {displayProfile.display_name}
          </h1>
          {(() => {
            const headline = buildMentorHeadline(displayProfile);
            return headline ? (
              <p className="mt-1 text-sm font-medium text-[var(--color-m-primary)]">{headline}</p>
            ) : null;
          })()}

          <p className="mt-3 text-sm font-medium text-[var(--color-m-text-secondary)]">
            {ratingSummary(displayProfile.rating_average, displayProfile.review_count)}
          </p>

          <div className="mt-3">
            <ProfileVerificationBadges rawBadges={displayProfile.verification_badges} />
          </div>

          {displayProfile.subjects.length > 0 || displayProfile.grade_levels.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {displayProfile.subjects.map((s) => (
                <Badge key={`subject-${s}`} variant="primary">
                  {s}
                </Badge>
              ))}
              {displayProfile.grade_levels.map((g) => (
                <Badge key={`grade-${g}`} variant="info">
                  {g}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-4">
            <ProfileQuickHighlights profile={displayProfile} />
          </div>
        </div>
      </section>

      <div className="mt-6">
        <ProfileAnchorNav
          sections={visibleSections}
          sectionRefs={sectionRefs}
          activeId={activeSectionId}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          {isSectionVisible('overview') ? (
            <ProfileAboutSection profile={displayProfile} sectionRef={sectionRefs.overview} />
          ) : null}
          {isSectionVisible('subjects') ? (
            <ProfileSubjectsSection profile={displayProfile} sectionRef={sectionRefs.subjects} />
          ) : null}
          {isSectionVisible('teachingStyle') ? (
            <ProfileTeachingStyleSection
              profile={displayProfile}
              sectionRef={sectionRefs.teachingStyle}
            />
          ) : null}
          {isSectionVisible('services') ? (
            <ProfileServicesSection
              mentorId={mentorId}
              mentorName={displayProfile.display_name}
              listingsQuery={listingsQuery}
              sectionRef={sectionRefs.services}
            />
          ) : null}
          {isSectionVisible('availability') ? (
            <ProfileAvailabilitySection
              profile={displayProfile}
              sectionRef={sectionRefs.availability}
              onRequestLesson={handleContactMentor}
            />
          ) : null}
          {isSectionVisible('video') ? (
            <ProfileVideoSection
              video={displayProfile.intro_video}
              sectionRef={sectionRefs.video}
            />
          ) : null}
          {isSectionVisible('education') ? (
            <ProfileEducationSection profile={displayProfile} sectionRef={sectionRefs.education} />
          ) : null}
          {isSectionVisible('reviews') ? (
            <ProfileReviewsSection
              profile={displayProfile}
              sectionRef={sectionRefs.reviews}
              canReview={canRequest}
              onLeaveReview={() => setReviewOpen(true)}
            />
          ) : null}
          {isSectionVisible('successStories') ? (
            <ProfileSuccessStoriesSection
              profile={displayProfile}
              sectionRef={sectionRefs.successStories}
            />
          ) : null}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <ProfileStickyCard
            profile={displayProfile}
            canRequest={canRequest}
            isFavourited={listingsQuery.data?.mentor.is_favourited ?? false}
            onRequestLesson={handleContactMentor}
          />
        </div>
      </div>

      {canRequest ? (
        <div className="fixed inset-x-0 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-30 border-t border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-3 pb-3 shadow-[var(--shadow-m-card)] md:bottom-0 md:pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
          <button
            type="button"
            disabled={contacting}
            onClick={handleContactMentor}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-m-primary)] to-[var(--color-m-gradient-end)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-m-glow)] disabled:opacity-60"
          >
            {tr.requestLesson}
          </button>
        </div>
      ) : null}

      <ReportMentorModal
        open={reportOpen}
        mentorId={mentorId}
        onClose={() => setReportOpen(false)}
      />
      <SubmitReferenceModal
        open={reviewOpen}
        mentorId={mentorId}
        onClose={() => setReviewOpen(false)}
      />
    </PageContainer>
  );
}
